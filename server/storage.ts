import { users, type User, type NewUser, attendance, type Attendance, type NewAttendance, tasks, type Task, type NewTask, dailyLogs, type DailyLog, type NewDailyLog, leaveRequests, type LeaveRequest, type NewLeaveRequest, announcements, type Announcement, type NewAnnouncement, resources, type Resource, type NewResource, sessionLinks, type SessionLink, type NewSessionLink, syllabus, type Syllabus, type NewSyllabus, mentorship, type Mentorship, type NewMentorship, paidInternships, type PaidInternship, type NewPaidInternship } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, isNull, isNotNull, sql } from "drizzle-orm";

export interface IStorage {
    // User Management
    getUser(id: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    createUser(user: NewUser): Promise<User>;
    updateUser(id: string, data: Partial<NewUser>): Promise<User>;
    deleteUser(id: string): Promise<void>;
    getAllInterns(): Promise<User[]>;

    // Attendance
    getAttendance(userId: string): Promise<Attendance[]>;
    recordLogin(userId: string, clientTime?: string): Promise<Attendance>;
    recordLogout(attendanceId: string, clientTime?: string): Promise<Attendance>;
    getAllAttendance(): Promise<Attendance[]>;

    // Daily Logs
    getDailyLogs(userId: string): Promise<DailyLog[]>;
    getAllDailyLogs(): Promise<DailyLog[]>;
    createDailyLog(log: NewDailyLog): Promise<DailyLog>;

    // Leave Requests
    getLeaveRequests(userId: string): Promise<LeaveRequest[]>;
    getAllLeaveRequests(): Promise<LeaveRequest[]>;
    createLeaveRequest(request: NewLeaveRequest): Promise<LeaveRequest>;
    updateLeaveStatus(requestId: string, status: string): Promise<LeaveRequest>;

    // Announcements
    getAnnouncements(): Promise<Announcement[]>;
    createAnnouncement(announcement: NewAnnouncement): Promise<Announcement>;
    updateAnnouncement(id: string, data: Partial<NewAnnouncement>): Promise<Announcement>;
    deleteAnnouncement(id: string): Promise<void>;

    // Resources
    getResources(): Promise<Resource[]>;
    createResource(resource: NewResource): Promise<Resource>;
    updateResource(id: string, data: Partial<NewResource>): Promise<Resource>;
    deleteResource(id: string): Promise<void>;

    // Session Links
    getSessionLinks(): Promise<SessionLink[]>;
    createSessionLink(link: NewSessionLink): Promise<SessionLink>;
    updateSessionLink(id: string, data: Partial<NewSessionLink>): Promise<SessionLink>;
    deleteSessionLink(id: string): Promise<void>;

    // Mentorship
    getMentorshipRequests(internId?: string): Promise<Mentorship[]>;
    createMentorshipRequest(request: NewMentorship): Promise<Mentorship>;
    replyToMentorship(id: string, reply: string): Promise<Mentorship>;
    deleteMentorship(id: string): Promise<void>;

    // Tasks
    getTasks(internId: string): Promise<Task[]>;
    getAllTasks(): Promise<Task[]>;
    createTask(task: NewTask): Promise<Task>;
    createBulkTasks(task: NewTask, internIds: string[]): Promise<Task[]>;
    updateTask(id: string, data: Partial<NewTask>): Promise<Task>;
    updateTaskStatus(taskId: string, status: string): Promise<Task>;
    updateTaskProgress(id: string, data: { status?: string; todayProgress?: string; submissionLink?: string; remarks?: string }): Promise<Task>;
    deleteTask(id: string): Promise<void>;

    // Syllabus
    getSyllabus(): Promise<Syllabus[]>;
    createSyllabus(item: NewSyllabus): Promise<Syllabus>;
    updateSyllabus(id: string, data: Partial<NewSyllabus>): Promise<Syllabus>;
    deleteSyllabus(id: string): Promise<void>;

    // Admin Dashboard Metrics
    getAdminDashboardStats(): Promise<any>;

    // Paid Internships
    getPaidInternships(): Promise<PaidInternship[]>;
    createPaidInternship(internship: NewPaidInternship): Promise<PaidInternship>;
    bulkCreatePaidInternships(internships: NewPaidInternship[]): Promise<PaidInternship[]>;
    checkPaidInternshipEmail(email: string): Promise<boolean>;

    // New Attendance Grouping
    getGroupedAttendance(): Promise<any[]>;
    getAttendanceDetails(userId: string, date: string): Promise<Attendance[]>;
}

export class DatabaseStorage implements IStorage {
    async getUser(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    }

    async createUser(newUser: NewUser): Promise<User> {
        const [user] = await db.insert(users).values(newUser).returning();
        return user;
    }

    async getAllInterns(): Promise<User[]> {
        return await db.select().from(users).where(eq(users.role, "intern"));
    }

    async getAllAdmins(): Promise<User[]> {
        return await db.select().from(users).where(
            or(eq(users.role, "admin"), eq(users.role, "sadmin"))
        );
    }

    async updateUser(id: string, data: Partial<NewUser>): Promise<User> {
        const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
        return user;
    }

    async deleteUser(id: string): Promise<void> {
        await db.delete(users).where(eq(users.id, id));
    }

    async getAttendance(userId: string): Promise<Attendance[]> {
        const results = await db.select().from(attendance)
            .where(eq(attendance.userId, userId))
            .orderBy(desc(attendance.createdAt));

        if (results.length > 0) {
            console.log(`[STORAGE] getAttendance for ${userId} - First record:`, JSON.stringify(results[0]));
        }

        return results;
    }

    async recordLogin(userId: string, clientTime?: string): Promise<Attendance> {
        console.log(`[ATTENDANCE] recordLogin START - user: ${userId}`);

        // 1. Auto-close any existing active sessions to prevent duplicates
        try {
            const activeSessions = await db.select().from(attendance)
                .where(and(eq(attendance.userId, userId), isNull(attendance.logoutTime)));

            if (activeSessions.length > 0) {
                console.log(`[ATTENDANCE] recordLogin - Found ${activeSessions.length} lingering sessions. Auto-closing...`);
                const nowStr = Date.now().toString();
                for (const sess of activeSessions) {
                    await this.recordLogout(sess.id, nowStr);
                }
            }
        } catch (err) {
            console.error("[ATTENDANCE] recordLogin - Cleanup Error (ignoring):", err);
        }

        const loginTime = clientTime || Date.now().toString();
        const [record] = await db.insert(attendance)
            .values({
                userId,
                status: "present",
                loginTime
            })
            .returning();

        console.log(`[ATTENDANCE] recordLogin SUCCESS - id: ${record.id}, loginTime: ${record.loginTime}`);
        return record;
    }

    async recordLogout(attendanceId: string, clientTime?: string): Promise<Attendance> {
        console.log(`[ATTENDANCE] recordLogout START - id: ${attendanceId}`);
        const [session] = await db.select().from(attendance).where(eq(attendance.id, attendanceId));
        if (!session) {
            console.error(`[ATTENDANCE] recordLogout FAILED - session not found: ${attendanceId}`);
            throw new Error("Attendance session not found");
        }

        // Already closed?
        if (session.logoutTime) {
            console.log(`[ATTENDANCE] recordLogout ALREADY CLOSED - id: ${attendanceId}`);
            return session;
        }

        const logoutTime = clientTime || Date.now().toString();

        let startTime: number;
        const loginStr = session.loginTime;
        if (!loginStr || loginStr === "0" || loginStr === "null") {
            console.warn(`[ATTENDANCE] recordLogout WARN - Missing loginTime for ${attendanceId}, using fallback`);
            startTime = session.createdAt ? session.createdAt.getTime() : Date.now();
        } else {
            startTime = isNaN(Number(loginStr))
                ? new Date(loginStr).getTime()
                : Number(loginStr);
        }

        const endTime = isNaN(Number(logoutTime))
            ? new Date(logoutTime).getTime()
            : Number(logoutTime);

        console.log(`[ATTENDANCE] recordLogout - startTime: ${startTime}, endTime: ${endTime}`);
        const durationMs = Math.max(0, endTime - startTime);
        const workingHours = (durationMs / (1000 * 60 * 60)).toFixed(2);
        console.log(`[ATTENDANCE] recordLogout - calculated hours: ${workingHours}`);

        // Determine status based on hours worked
        const hoursNum = parseFloat(workingHours);
        const resolvedStatus = hoursNum >= 4 ? "present" : (hoursNum > 0 ? "half-day" : "present");

        const [record] = await db.update(attendance)
            .set({
                logoutTime: logoutTime,
                workingHours: workingHours,
                status: resolvedStatus
            })
            .where(eq(attendance.id, attendanceId))
            .returning();

        console.log(`[ATTENDANCE] recordLogout SUCCESS - id: ${record.id}`);
        return record;
    }

    async getAllAttendance(): Promise<Attendance[]> {
        return await db.select().from(attendance).orderBy(desc(attendance.loginTime));
    }

    async getGroupedAttendance(): Promise<any[]> {
        // We fetch all records and group them in memory for consistency with the existing logic
        // (Summing Clock Out - Clock IN durations as per Student Portal logic)
        const records = await db.select().from(attendance).orderBy(desc(attendance.loginTime));

        const groupedMap = new Map<string, any>();

        for (const record of records) {
            if (!record.date) continue;
            const key = `${record.userId}_${record.date}`;

            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    userId: record.userId,
                    date: record.date,
                    totalHours: 0,
                    status: "present" // Default
                });
            }

            const group = groupedMap.get(key);
            if (record.workingHours) {
                group.totalHours += parseFloat(record.workingHours);
            }
        }

        const result = Array.from(groupedMap.values()).map(group => {
            // Recalculate status based on total hours per day
            // Logic: >= 4h: present, 0 < x < 4: half-day
            const hours = group.totalHours;
            group.status = hours >= 4 ? "present" : (hours > 0 ? "half-day" : "present");
            group.totalHours = group.totalHours.toFixed(2);
            return group;
        });

        return result;
    }

    async getAttendanceDetails(userId: string, date: string): Promise<Attendance[]> {
        return await db.select().from(attendance)
            .where(and(eq(attendance.userId, userId), eq(attendance.date, date)))
            .orderBy(attendance.loginTime);
    }

    async getTasks(internId: string): Promise<Task[]> {
        return await db.select().from(tasks).where(eq(tasks.internId, internId));
    }

    async getAllTasks(): Promise<Task[]> {
        return await db.select().from(tasks);
    }

    async createTask(newTask: NewTask): Promise<Task> {
        const [task] = await db.insert(tasks).values(newTask).returning();
        return task;
    }

    async createBulkTasks(newTaskTemplate: NewTask, internIds: string[]): Promise<Task[]> {
        const values = internIds.map(internId => ({
            ...newTaskTemplate,
            internId
        }));
        return await db.insert(tasks).values(values).returning();
    }

    async updateTask(id: string, data: Partial<NewTask>): Promise<Task> {
        const [task] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
        return task;
    }

    async updateTaskProgress(id: string, data: {
        status?: string;
        todayProgress?: string;
        submissionLink?: string;
        remarks?: string;
    }): Promise<Task> {
        console.log(`[STORAGE] updateTaskProgress id=${id}`, data);
        // Use Drizzle ORM set with explicit column mapping to avoid type errors
        const updatePayload: any = {};
        if (data.status !== undefined) updatePayload.status = data.status;
        if (data.todayProgress !== undefined) updatePayload.todayProgress = data.todayProgress;
        if (data.submissionLink !== undefined) updatePayload.submissionLink = data.submissionLink;
        if (data.remarks !== undefined) updatePayload.remarks = data.remarks;

        if (Object.keys(updatePayload).length === 0) {
            const [existing] = await db.select().from(tasks).where(eq(tasks.id, id));
            return existing;
        }

        const [task] = await db.update(tasks).set(updatePayload).where(eq(tasks.id, id)).returning();
        console.log(`[STORAGE] updateTaskProgress result:`, task);
        return task;
    }

    async updateTaskStatus(taskId: string, status: string): Promise<Task> {
        const [task] = await db.update(tasks).set({ status }).where(eq(tasks.id, taskId)).returning();
        return task;
    }

    async deleteTask(id: string): Promise<void> {
        await db.delete(tasks).where(eq(tasks.id, id));
    }

    async getDailyLogs(userId: string): Promise<DailyLog[]> {
        return await db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.logDate));
    }

    async getAllDailyLogs(): Promise<DailyLog[]> {
        return await db.select().from(dailyLogs).orderBy(desc(dailyLogs.logDate));
    }

    async createDailyLog(newLog: NewDailyLog): Promise<DailyLog> {
        const [log] = await db.insert(dailyLogs).values(newLog).returning();
        return log;
    }

    async getLeaveRequests(userId: string): Promise<LeaveRequest[]> {
        return await db.select().from(leaveRequests).where(eq(leaveRequests.userId, userId));
    }

    async getAllLeaveRequests(): Promise<LeaveRequest[]> {
        return await db.select().from(leaveRequests);
    }

    async createLeaveRequest(newRequest: NewLeaveRequest): Promise<LeaveRequest> {
        const [request] = await db.insert(leaveRequests).values(newRequest).returning();
        return request;
    }

    async updateLeaveStatus(requestId: string, status: string): Promise<LeaveRequest> {
        const [request] = await db.update(leaveRequests).set({ status }).where(eq(leaveRequests.id, requestId)).returning();
        return request;
    }

    async getAnnouncements(): Promise<Announcement[]> {
        return await db.select().from(announcements).orderBy(desc(announcements.date));
    }

    async createAnnouncement(newAnnouncement: NewAnnouncement): Promise<Announcement> {
        const [announcement] = await db.insert(announcements).values(newAnnouncement).returning();
        return announcement;
    }

    async updateAnnouncement(id: string, data: Partial<NewAnnouncement>): Promise<Announcement> {
        const [item] = await db.update(announcements).set(data).where(eq(announcements.id, id)).returning();
        return item;
    }

    async deleteAnnouncement(id: string): Promise<void> {
        await db.delete(announcements).where(eq(announcements.id, id));
    }

    async getResources(): Promise<Resource[]> {
        return await db.select().from(resources);
    }

    async createResource(newResource: NewResource): Promise<Resource> {
        const [resource] = await db.insert(resources).values(newResource).returning();
        return resource;
    }

    async updateResource(id: string, data: Partial<NewResource>): Promise<Resource> {
        const [item] = await db.update(resources).set(data).where(eq(resources.id, id)).returning();
        return item;
    }

    async deleteResource(id: string): Promise<void> {
        await db.delete(resources).where(eq(resources.id, id));
    }

    async getSessionLinks(): Promise<SessionLink[]> {
        return await db.select().from(sessionLinks).orderBy(desc(sessionLinks.sessionDate));
    }

    async createSessionLink(newLink: NewSessionLink): Promise<SessionLink> {
        const [link] = await db.insert(sessionLinks).values(newLink).returning();
        return link;
    }

    async updateSessionLink(id: string, data: Partial<NewSessionLink>): Promise<SessionLink> {
        const [link] = await db.update(sessionLinks).set(data).where(eq(sessionLinks.id, id)).returning();
        return link;
    }

    async deleteSessionLink(id: string): Promise<void> {
        await db.delete(sessionLinks).where(eq(sessionLinks.id, id));
    }

    async getSyllabus(): Promise<Syllabus[]> {
        return await db.select().from(syllabus).orderBy(desc(syllabus.createdAt));
    }

    async createSyllabus(item: NewSyllabus): Promise<Syllabus> {
        const [newItem] = await db.insert(syllabus).values(item).returning();
        return newItem;
    }

    async updateSyllabus(id: string, data: Partial<NewSyllabus>): Promise<Syllabus> {
        const [item] = await db.update(syllabus).set(data).where(eq(syllabus.id, id)).returning();
        return item;
    }

    async deleteSyllabus(id: string): Promise<void> {
        await db.delete(syllabus).where(eq(syllabus.id, id));
    }

    async getMentorshipRequests(internId?: string): Promise<Mentorship[]> {
        if (internId) {
            return await db.select().from(mentorship).where(eq(mentorship.internId, internId)).orderBy(desc(mentorship.createdAt));
        }
        return await db.select().from(mentorship).orderBy(desc(mentorship.createdAt));
    }

    async createMentorshipRequest(request: NewMentorship): Promise<Mentorship> {
        const [newRequest] = await db.insert(mentorship).values(request).returning();
        return newRequest;
    }

    async replyToMentorship(id: string, reply: string): Promise<Mentorship> {
        const [updated] = await db.update(mentorship).set({ reply, status: "replied" }).where(eq(mentorship.id, id)).returning();
        return updated;
    }

    async deleteMentorship(id: string): Promise<void> {
        await db.delete(mentorship).where(eq(mentorship.id, id));
    }

    async getAdminDashboardStats(): Promise<any> {
        const totalInterns = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "intern"));
        const taskStats = await db.select({ status: tasks.status, count: sql<number>`count(*)` }).from(tasks).groupBy(tasks.status);
        const priorityStats = await db.select({ priority: tasks.priority, count: sql<number>`count(*)` }).from(tasks).groupBy(tasks.priority);

        const topInterns = await db.execute(sql`
            SELECT u.id, u.name, COUNT(t.id) as completed_tasks
            FROM users u
            JOIN tasks t ON u.id = t.intern_id
            WHERE t.status = 'completed'
            GROUP BY u.id, u.name
            ORDER BY completed_tasks DESC
            LIMIT 5
        `);

        return {
            totalInterns: totalInterns[0].count,
            taskStats: taskStats.reduce((acc: any, curr) => ({ ...acc, [curr.status]: curr.count }), {}),
            priorityStats: priorityStats.reduce((acc: any, curr) => ({ ...acc, [curr.priority || 'medium']: curr.count }), {}),
            topInterns: topInterns.rows
        };
    }

    async getPaidInternships(): Promise<PaidInternship[]> {
        return await db.select().from(paidInternships).orderBy(desc(paidInternships.createdAt));
    }

    async createPaidInternship(internship: NewPaidInternship): Promise<PaidInternship> {
        const [result] = await db.insert(paidInternships).values(internship).returning();
        return result;
    }

    async bulkCreatePaidInternships(internships: NewPaidInternship[]): Promise<PaidInternship[]> {
        return await db.insert(paidInternships).values(internships).returning();
    }

    async checkPaidInternshipEmail(email: string): Promise<boolean> {
        if (!email) {
            console.log("[DB-QUERY] REJECTED: Email is null or undefined");
            return false;
        }
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[DB-QUERY] START check for pre-registered email: "${normalizedEmail}"`);

        try {
            // Use sql fragment for case-insensitive check and be VERY explicit
            const results = await db.select().from(paidInternships).where(sql`LOWER(TRIM(${paidInternships.email})) = ${normalizedEmail}`);

            const isRegistered = results.length > 0;
            console.log(`[DB-QUERY] FINISHED check for "${normalizedEmail}". Results count: ${results.length}. Registered: ${isRegistered}`);

            if (isRegistered) {
                console.log(`[DB-QUERY] MATCH DETAILS: Found name "${results[0].name}" for email "${results[0].email}"`);
            } else {
                console.log(`[DB-QUERY] NO MATCH: Email "${normalizedEmail}" is NOT in the paid_internships table.`);
            }

            return isRegistered;
        } catch (error: any) {
            console.log(`[DB-QUERY] CRITICAL DATABASE ERROR checking email "${normalizedEmail}":`, error);
            return false;
        }
    }
}

export const storage = new DatabaseStorage();
