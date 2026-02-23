import { pgTable, text, timestamp, uuid, date, decimal, time, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table (Admins and Interns)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("intern"), // 'admin', 'sadmin', 'intern'
  phone: text("phone"),
  collegeName: text("college_name"),
  rollNumber: text("roll_number"),
  address: text("address"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  teamLeadId: uuid("team_lead_id"),
  showInstructionsPopup: boolean("show_instructions_popup").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance Table
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  loginTime: text("login_time").notNull(), // Numerical millisecond string (e.g. "1740100000000")
  logoutTime: text("logout_time"),
  status: text("status"), // 'present', 'absent', 'half-day'
  date: date("date").defaultNow(),
  workingHours: decimal("working_hours", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Tasks Table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  internId: uuid("intern_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("assigned"), // 'assigned', 'in_progress', 'completed'
  dueDate: date("due_date"),
  priority: text("priority").default("medium"), // 'high', 'medium', 'low'
  todayProgress: text("today_progress"),   // Intern's daily progress notes
  submissionLink: text("submission_link"), // Link to intern's submission
  remarks: text("remarks"),               // Additional intern remarks
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Logs Table
export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  logDate: date("log_date").defaultNow(),
  workDescription: text("work_description"),
  hoursSpent: decimal("hours_spent", { precision: 5, scale: 2 }),
  course: text("course"),
  module: text("module"),       // comma-separated selected modules
  topic: text("topic"),
  keyLearnings: text("key_learnings"),
  blockers: text("blockers"),
  submissionLink: text("submission_link"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leave Requests Table
export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements Table
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message").notNull(),
  type: text("type").default("info"),
  date: date("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resources Table
export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  link: text("link"),
  type: text("type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// session_links (previously ClassSessionLinks)
export const sessionLinks = pgTable("session_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  agenda: text("agenda"),
  sessionDate: date("session_date"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  sessionUrl: text("session_url"),
  speaker: text("speaker"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Syllabus Table
export const syllabus = pgTable("syllabus", {
  id: uuid("id").primaryKey().defaultRandom(),
  course: text("course").notNull(),
  module: text("module").notNull(),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentorship Table
export const mentorship = pgTable("mentorship", {
  id: uuid("id").primaryKey().defaultRandom(),
  internId: uuid("intern_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'technical', 'hr', 'general', 'project'
  status: text("status").notNull().default("pending"), // 'pending', 'replied'
  description: text("description").notNull(),
  reply: text("reply"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Paid Internships Table
export const paidInternships = pgTable("paid_internships", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  college: text("college").notNull(),
  branch: text("branch").notNull(),
  semester: text("semester").notNull(),
  universityName: text("university_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const selectAttendanceSchema = createSelectSchema(attendance);
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);
export const insertDailyLogSchema = createInsertSchema(dailyLogs);
export const selectDailyLogSchema = createSelectSchema(dailyLogs);
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests);
export const selectLeaveRequestSchema = createSelectSchema(leaveRequests);
export const insertAnnouncementSchema = createInsertSchema(announcements);
export const selectAnnouncementSchema = createSelectSchema(announcements);
export const insertResourceSchema = createInsertSchema(resources);
export const selectResourceSchema = createSelectSchema(resources);
export const insertSessionLinkSchema = createInsertSchema(sessionLinks);
export const selectSessionLinkSchema = createSelectSchema(sessionLinks);
export const insertSyllabusSchema = createInsertSchema(syllabus);
export const selectSyllabusSchema = createSelectSchema(syllabus);
export const insertMentorshipSchema = createInsertSchema(mentorship);
export const selectMentorshipSchema = createSelectSchema(mentorship);
export const insertPaidInternshipSchema = createInsertSchema(paidInternships);
export const selectPaidInternshipSchema = createSelectSchema(paidInternships);

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Attendance = z.infer<typeof selectAttendanceSchema>;
export type NewAttendance = z.infer<typeof insertAttendanceSchema>;
export type Task = z.infer<typeof selectTaskSchema>;
export type NewTask = z.infer<typeof insertTaskSchema>;
export type DailyLog = z.infer<typeof selectDailyLogSchema>;
export type NewDailyLog = z.infer<typeof insertDailyLogSchema>;
export type LeaveRequest = z.infer<typeof selectLeaveRequestSchema>;
export type NewLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type Announcement = z.infer<typeof selectAnnouncementSchema>;
export type NewAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Resource = z.infer<typeof selectResourceSchema>;
export type NewResource = z.infer<typeof insertResourceSchema>;
export type SessionLink = z.infer<typeof selectSessionLinkSchema>;
export type NewSessionLink = z.infer<typeof insertSessionLinkSchema>;
export type Syllabus = z.infer<typeof selectSyllabusSchema>;
export type NewSyllabus = z.infer<typeof insertSyllabusSchema>;
export type Mentorship = z.infer<typeof selectMentorshipSchema>;
export type NewMentorship = z.infer<typeof insertMentorshipSchema>;
export type PaidInternship = z.infer<typeof selectPaidInternshipSchema>;
export type NewPaidInternship = z.infer<typeof insertPaidInternshipSchema>;
