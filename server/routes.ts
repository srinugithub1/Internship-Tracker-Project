import express, { type Express, NextFunction, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAttendanceSchema, insertTaskSchema, insertDailyLogSchema, insertLeaveRequestSchema, insertAnnouncementSchema, insertResourceSchema, insertSessionLinkSchema, insertSyllabusSchema, insertMentorshipSchema, insertPaidInternshipSchema } from "@shared/schema";
import bcrypt from "bcryptjs";


// Helper: wraps async route handlers so uncaught errors go to Express error middleware
const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);



export function registerRoutes(app: Express): Server {
    console.log(`[SERVER] Registering routes at ${new Date().toISOString()}`);

    // Health Check
    app.get("/api/ping", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

    // Profile Update (Intern) - v4 Final Robust Path
    app.post("/api/profile-v4-update", wrap(async (req, res) => {
        const { userId, ...data } = req.body;
        if (!userId) return res.status(400).json({ message: "User ID is required" });

        // Prevent modification of sensitive fields
        delete (data as any).email;
        delete (data as any).role;
        delete (data as any).passwordHash;
        delete (data as any).id;

        try {
            const updatedUser = await storage.updateUser(userId, data);
            res.json(updatedUser);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to update profile", error: error.message });
        }
    }));

    // Authentication
    app.post("/api/login", wrap(async (req, res) => {
        const { email, password } = req.body;
        const user = await storage.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Secure bcrypt comparison with plain-text fallback for existing users
        let isCorrect = false;
        try {
            isCorrect = await bcrypt.compare(password, user.passwordHash);
        } catch (e) {
            // If it's not a valid hash, fallback to plain text comparison
            isCorrect = user.passwordHash === password;
        }

        if (!isCorrect) {
            // Final fallback check in case compare didn't throw but failed (plain vs plain)
            if (user.passwordHash === password) {
                isCorrect = true;
            } else {
                return res.status(401).json({ message: "Invalid email or password" });
            }
        }

        res.json(user);
    }));

    app.post("/api/register", wrap(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

        const isRegistered = await storage.checkPaidInternshipEmail(email);
        if (!isRegistered) {
            return res.status(403).json({ message: "enter registered email address" });
        }

        // Validate other fields but allow passwordHash to be missing since we'll hash it now
        const parsed = insertUserSchema.omit({ passwordHash: true }).safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);

        try {
            const passwordHash = await bcrypt.hash(password, 10);
            const user = await storage.createUser({ ...parsed.data, passwordHash } as any);

            // Automatically allocate eligible tasks for the new intern
            if (user.role === "intern") {
                try {
                    console.log(`[AUTH] Automatically allocating tasks for new intern: ${user.id}`);
                    await storage.allocateTasksForIntern(user.id);
                } catch (allocError) {
                    console.error(`[AUTH] Failed to auto-allocate tasks for ${user.id}:`, allocError);
                    // Don't fail registration if allocation fails, but log it
                }
            }

            res.json(user);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to create user", error: error.message });
        }

    }));

    // Forgot Password Flow
    app.post("/api/verify-intern", wrap(async (req, res) => {
        const { email, rollNumber } = req.body;
        if (!email || !rollNumber) {
            return res.status(400).json({ message: "Email and Roll Number are required" });
        }

        const user = await storage.getUserByEmailAndRollNumber(email, rollNumber);
        if (!user) {
            return res.status(404).json({ message: "Details not found. Please check your information or contact Administration." });
        }

        // Return confirmation info (excluding sensitive data)
        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone || "N/A"
        });
    }));

    app.post("/api/reset-password", wrap(async (req, res) => {
        const { email, rollNumber, newPassword } = req.body;
        if (!email || !rollNumber || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await storage.getUserByEmailAndRollNumber(email, rollNumber);
        if (!user) {
            return res.status(403).json({ message: "Verification failed. Please restart the process." });
        }

        try {
            const passwordHash = await bcrypt.hash(newPassword, 10);
            await storage.updatePassword(user.id, passwordHash);
            res.json({ message: "Password updated successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Something went wrong. Please contact Administration.", error: error.message });
        }
    }));

    app.post("/api/intern/update-popup-preference", wrap(async (req, res) => {
        const { userId, show } = req.body;
        if (!userId || typeof show !== "boolean") {
            return res.status(400).json({ message: "User ID and preference (show) are required" });
        }

        try {
            const user = await storage.updatePopupPreference(userId, show);
            res.json(user);
        } catch (error: any) {
            res.status(500).json({ message: "Unable to save preference. Please try again.", error: error.message });
        }
    }));

    // Super Admin: User Management
    app.get("/api/admin/users", wrap(async (req, res) => {
        // In this implementation, we allow any admin to see other admins (as per user request "In Admin we want add Admin Users Tabs")
        const admins = await storage.getAllAdmins();
        res.json(admins);
    }));

    app.post("/api/admin/users", wrap(async (req, res) => {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Name, email, password and role are required" });
        }

        const existing = await storage.getUserByEmail(email);
        if (existing) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await storage.createUser({
            name,
            email,
            passwordHash,
            role: role // 'admin' or 'sadmin'
        });
        res.json(user);
    }));

    app.put("/api/admin/users/:id", wrap(async (req, res) => {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const updateData: any = { name, email, role };
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        try {
            const user = await storage.updateUser(id, updateData);
            res.json(user);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to update admin", error: error.message });
        }
    }));

    app.delete("/api/admin/users/:id", wrap(async (req, res) => {
        const { id } = req.params;
        try {
            await storage.deleteUser(id);
            res.sendStatus(204);
        } catch (error: any) {
            res.status(500).json({ message: "Failed to delete admin", error: error.message });
        }
    }));



    // Admin Metrics
    app.get("/api/admin/metrics", wrap(async (req, res) => {
        const stats = await storage.getAdminDashboardStats();
        res.json(stats);
    }));

    // Interns
    app.get("/api/interns", wrap(async (req, res) => {
        const interns = await storage.getAllInterns();
        res.json(interns);
    }));

    app.put("/api/interns/:id", wrap(async (req, res) => {
        const user = await storage.updateUser(req.params.id, req.body);
        res.json(user);
    }));

    app.delete("/api/interns/:id", wrap(async (req, res) => {
        await storage.deleteUser(req.params.id);
        res.sendStatus(204);
    }));

    // Attendance
    app.get("/api/admin/attendance/grouped", wrap(async (req, res) => {
        const records = await storage.getGroupedAttendance();
        res.json(records);
    }));

    app.get("/api/admin/attendance/details", wrap(async (req, res) => {
        const { userId, date } = req.query;
        if (!userId || !date) {
            return res.status(400).json({ message: "userId and date are required" });
        }
        const details = await storage.getAttendanceDetails(userId as string, date as string);
        res.json(details);
    }));

    app.get("/api/attendance/:userId", wrap(async (req, res) => {
        const records = await storage.getAttendance(req.params.userId);
        res.json(records);
    }));

    app.get("/api/attendance", wrap(async (req, res) => {
        const records = await storage.getAllAttendance();
        res.json(records);
    }));

    app.post("/api/attendance/login", wrap(async (req, res) => {
        try {
            const { userId, clientTime } = req.body;
            console.log(`[ROUTE] /api/attendance/login - user: ${userId}`);
            const record = await storage.recordLogin(userId, clientTime);
            res.json(record);
        } catch (err: any) {
            console.error("[ROUTE ERROR] /api/attendance/login:", err);
            res.status(500).json({
                message: "Failed to start session",
                error: err.message,
                stack: err.stack
            });
        }
    }));

    app.post("/api/attendance/logout", wrap(async (req, res) => {
        try {
            const { attendanceId, clientTime } = req.body;
            console.log(`[ROUTE] /api/attendance/logout - id: ${attendanceId}`);
            if (!attendanceId) {
                return res.status(400).json({ message: "Attendance ID is required" });
            }
            const record = await storage.recordLogout(attendanceId, clientTime);
            res.json(record);
        } catch (err: any) {
            console.error("[ROUTE ERROR] /api/attendance/logout:", err);
            res.status(500).json({
                message: "Failed to finish shift",
                error: err.message,
                stack: err.stack
            });
        }
    }));

    // Tasks
    app.get("/api/tasks", wrap(async (req, res) => {
        const tasks = await storage.getAllTasks();
        res.json(tasks);
    }));

    app.get("/api/tasks/:internId", wrap(async (req, res) => {
        const tasks = await storage.getTasks(req.params.internId);
        res.json(tasks);
    }));

    app.post("/api/tasks", wrap(async (req, res) => {
        const parsed = insertTaskSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const task = await storage.createTask(parsed.data);
        res.json(task);
    }));

    app.post("/api/tasks/bulk", wrap(async (req, res) => {
        const { task, internIds } = req.body;
        if (!task || !Array.isArray(internIds)) {
            return res.status(400).json({ message: "Invalid payload: task template and internIds array required" });
        }

        // Use a dummy internId for validation if not present, but the schema now allows NULL
        const tempTask = { ...task, internId: task.internId || internIds[0] || null };
        const parsed = insertTaskSchema.safeParse(tempTask);
        if (!parsed.success) return res.status(400).json(parsed.error);

        // If internIds is empty, we just create one unassigned task if that was the intent, 
        // but bulk usually implies multiple interns.
        if (internIds.length === 0) {
            const task = await storage.createTask(parsed.data);
            return res.json([task]);
        }

        const { internId, ...template } = parsed.data;
        const createdTasks = await storage.createBulkTasks(template as any, internIds);
        res.json(createdTasks);
    }));

    app.post("/api/tasks/allocate/:internId", wrap(async (req, res) => {
        const { internId } = req.params;
        const includeOld = req.query.includeOld === "true";
        try {
            const assignedTasks = await storage.allocateTasksForIntern(internId, includeOld);
            if (assignedTasks.length === 0) {
                return res.json({ message: "No new tasks available for assignment.", tasks: [] });
            }
            res.json({ message: `Successfully assigned ${assignedTasks.length} tasks.`, tasks: assignedTasks });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }));



    // Bulk Assignment Endpoints
    app.get("/api/admin/task-templates", wrap(async (req, res) => {
        const templates = await storage.getTaskTemplates();
        res.json(templates);
    }));


    app.get("/api/admin/interns-without-tasks", wrap(async (req, res) => {
        const interns = await storage.getInternsWithNoTasks();
        res.json(interns);
    }));

    app.post("/api/admin/tasks/bulk-assign", wrap(async (req, res) => {
        const { taskIds, internIds } = req.body;
        if (!taskIds || !internIds || !Array.isArray(taskIds) || !Array.isArray(internIds)) {
            return res.status(400).json({ message: "Invalid request body" });
        }
        try {
            const assigned = await storage.manualBulkAssign(taskIds, internIds);
            res.json({ message: `Successfully assigned ${assigned.length} tasks to ${internIds.length} interns.`, tasks: assigned });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }));


    app.patch("/api/tasks/:id/status", wrap(async (req, res) => {
        const { status } = req.body;
        const task = await storage.updateTaskStatus(req.params.id, status);
        res.json(task);
    }));

    app.patch("/api/tasks/:id/progress", wrap(async (req, res) => {
        try {
            console.log(`[TASKS] PATCH progress for task ${req.params.id}`, req.body);
            const { status, todayProgress, submissionLink, remarks } = req.body;
            const task = await storage.updateTaskProgress(req.params.id, {
                status,
                todayProgress,
                submissionLink,
                remarks,
            });
            console.log(`[TASKS] Updated task:`, task);
            res.json(task);
        } catch (err: any) {
            console.error(`[TASKS] ERROR in progress route:`, err.message, err.stack);
            res.status(500).json({ message: err.message });
        }
    }));

    app.delete("/api/tasks/:id", wrap(async (req, res) => {
        await storage.deleteTask(req.params.id);
        res.sendStatus(204);
    }));

    // Daily Logs
    app.get("/api/logs", wrap(async (req, res) => {
        const logs = await storage.getAllDailyLogs();
        res.json(logs);
    }));

    app.get("/api/logs/:userId", wrap(async (req, res) => {
        const logs = await storage.getDailyLogs(req.params.userId);
        res.json(logs);
    }));

    app.post("/api/logs", wrap(async (req, res) => {
        const parsed = insertDailyLogSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const log = await storage.createDailyLog(parsed.data);
        res.json(log);
    }));

    // Leave Requests
    app.get("/api/leaves", wrap(async (req, res) => {
        const requests = await storage.getAllLeaveRequests();
        res.json(requests);
    }));

    app.post("/api/leaves", wrap(async (req, res) => {
        const parsed = insertLeaveRequestSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const request = await storage.createLeaveRequest(parsed.data);
        res.json(request);
    }));

    app.patch("/api/leaves/:id/status", wrap(async (req, res) => {
        const { status } = req.body;
        const request = await storage.updateLeaveStatus(req.params.id, status);
        res.json(request);
    }));

    // Announcements
    app.get("/api/announcements", wrap(async (req, res) => {
        const list = await storage.getAnnouncements();
        res.json(list);
    }));

    app.post("/api/announcements", wrap(async (req, res) => {
        const parsed = insertAnnouncementSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const item = await storage.createAnnouncement(parsed.data);
        res.json(item);
    }));

    app.put("/api/announcements/:id", wrap(async (req, res) => {
        const item = await storage.updateAnnouncement(req.params.id, req.body);
        res.json(item);
    }));

    app.delete("/api/announcements/:id", wrap(async (req, res) => {
        await storage.deleteAnnouncement(req.params.id);
        res.sendStatus(204);
    }));

    // Resources
    app.get("/api/resources", wrap(async (req, res) => {
        const list = await storage.getResources();
        res.json(list);
    }));

    app.post("/api/resources", wrap(async (req, res) => {
        const parsed = insertResourceSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const item = await storage.createResource(parsed.data);
        res.json(item);
    }));

    app.put("/api/resources/:id", wrap(async (req, res) => {
        const item = await storage.updateResource(req.params.id, req.body);
        res.json(item);
    }));

    app.delete("/api/resources/:id", wrap(async (req, res) => {
        await storage.deleteResource(req.params.id);
        res.sendStatus(204);
    }));

    // Session Links
    app.get("/api/session-links", wrap(async (req, res) => {
        const links = await storage.getSessionLinks();
        res.json(links);
    }));

    app.post("/api/session-links", wrap(async (req, res) => {
        const parsed = insertSessionLinkSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const link = await storage.createSessionLink(parsed.data);
        res.json(link);
    }));

    app.put("/api/session-links/:id", wrap(async (req, res) => {
        const link = await storage.updateSessionLink(req.params.id, req.body);
        res.json(link);
    }));

    app.delete("/api/session-links/:id", wrap(async (req, res) => {
        await storage.deleteSessionLink(req.params.id);
        res.sendStatus(204);
    }));

    // Syllabus
    app.get("/api/syllabus", wrap(async (req, res) => {
        const list = await storage.getSyllabus();
        res.json(list);
    }));

    app.post("/api/syllabus", wrap(async (req, res) => {
        const parsed = insertSyllabusSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const item = await storage.createSyllabus(parsed.data);
        res.json(item);
    }));

    app.put("/api/syllabus/:id", wrap(async (req, res) => {
        const item = await storage.updateSyllabus(req.params.id, req.body);
        res.json(item);
    }));

    app.delete("/api/syllabus/:id", wrap(async (req, res) => {
        await storage.deleteSyllabus(req.params.id);
        res.sendStatus(204);
    }));

    // Mentorship
    app.get("/api/mentorship", wrap(async (req, res) => {
        const { userId } = req.query;
        const requests = await storage.getMentorshipRequests(userId as string);
        res.json(requests);
    }));

    app.post("/api/mentorship", wrap(async (req, res) => {
        const parsed = insertMentorshipSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json(parsed.error);
        const item = await storage.createMentorshipRequest(parsed.data);
        res.json(item);
    }));

    app.patch("/api/mentorship/:id/reply", wrap(async (req, res) => {
        const { reply } = req.body;
        const item = await storage.replyToMentorship(req.params.id, reply);
        res.json(item);
    }));

    app.delete("/api/mentorship/:id", wrap(async (req, res) => {
        await storage.deleteMentorship(req.params.id);
        res.sendStatus(204);
    }));



    const httpServer = createServer(app);
    return httpServer;
}
