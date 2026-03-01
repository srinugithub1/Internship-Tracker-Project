import { storage } from "../server/storage";
import { db } from "../server/db";
import { users, tasks } from "../shared/schema";
import { eq, isNull } from "drizzle-orm";

async function testBulkAssign() {
    console.log("--- Starting Manual Bulk Assignment Test ---");

    try {
        // 1. Setup Data
        const [intern1] = await db.insert(users).values({
            name: "Bulk Test Intern 1",
            email: `bulk1_${Date.now()}@test.com`,
            passwordHash: "hash",
            role: "intern"
        }).returning();

        const [intern2] = await db.insert(users).values({
            name: "Bulk Test Intern 2",
            email: `bulk2_${Date.now()}@test.com`,
            passwordHash: "hash",
            role: "intern"
        }).returning();

        const [taskTemplate] = await db.insert(tasks).values({
            title: "Template Task",
            description: "To be duplicated",
            internId: null,
            status: "assigned"
        }).returning();

        console.log(`Setup complete. Interns: ${intern1.id}, ${intern2.id}. Task Template: ${taskTemplate.id}`);

        // 2. Perform Bulk Assignment
        console.log("Triggering bulk assignment...");
        const assignedTasks = await storage.manualBulkAssign([taskTemplate.id], [intern1.id, intern2.id]);
        console.log(`Assigned ${assignedTasks.length} tasks.`);

        // 3. Verify Results
        const intern1Tasks = await db.select().from(tasks).where(eq(tasks.internId, intern1.id));
        const intern2Tasks = await db.select().from(tasks).where(eq(tasks.internId, intern2.id));

        const success =
            intern1Tasks.length === 1 &&
            intern1Tasks[0].title === "Template Task" &&
            intern2Tasks.length === 1 &&
            intern2Tasks[0].title === "Template Task";

        if (success) {
            console.log("✅ TEST PASSED: Tasks correctly duplicated and assigned to all selected interns.");
        } else {
            console.log("❌ TEST FAILED: Assignment logic incorrect.");
            console.log("Intern 1 Task Count:", intern1Tasks.length);
            console.log("Intern 2 Task Count:", intern2Tasks.length);
        }

        // 4. Cleanup
        console.log("Cleaning up...");
        await db.delete(tasks).where(eq(tasks.internId, intern1.id));
        await db.delete(tasks).where(eq(tasks.internId, intern2.id));
        await db.delete(tasks).where(eq(tasks.id, taskTemplate.id));
        await db.delete(users).where(eq(users.id, intern1.id));
        await db.delete(users).where(eq(users.id, intern2.id));
        console.log("Cleanup complete.");

        process.exit(success ? 0 : 1);
    } catch (err) {
        console.error("Test Error:", err);
        process.exit(1);
    }
}

testBulkAssign();
