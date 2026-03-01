import { storage } from "../server/storage";
import { db } from "../server/db";
import { users, tasks } from "../shared/schema";
import { eq, sql } from "drizzle-orm";


async function testAllocation() {
    console.log("--- Starting Task Allocation Test ---");

    // 0. Ensure Schema changes are applied to DB
    try {
        await db.execute(sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reassignable BOOLEAN DEFAULT FALSE`);
        await db.execute(sql`ALTER TABLE tasks ALTER COLUMN intern_id DROP NOT NULL`);
        console.log("Schema verified/updated in database.");
    } catch (err) {
        console.warn("Schema update warning (might already be applied):", err);
    }

    // 1. Create a Test Intern
    const internEmail = `test_intern_${Date.now()}@example.com`;
    const testIntern = await storage.createUser({
        name: "Test Intern",
        email: internEmail,
        passwordHash: "hashed_password",
        role: "intern",
    });
    console.log(`Created Intern: ${testIntern.id} at ${testIntern.createdAt}`);

    // 2. Create Tasks
    // Task A: Created BEFORE intern signup (Should NOT be assigned)
    const taskABefore = await db.insert(tasks).values({
        title: "Task Created Before Signup",
        description: "This task should not be assigned.",
        createdAt: new Date(testIntern.createdAt!.getTime() - 10000)
    }).returning();
    console.log(`Created Task A (Before): ${taskABefore[0].id}`);

    // Task B: Created AFTER intern signup (Should BE assigned)
    const taskBAfter = await db.insert(tasks).values({
        title: "Task Created After Signup",
        description: "This task should be assigned.",
        createdAt: new Date(testIntern.createdAt!.getTime() + 10000)
    }).returning();
    console.log(`Created Task B (After): ${taskBAfter[0].id}`);

    // Task C: Already assigned to someone else (Should NOT be assigned)
    // Need another intern for this test
    const testIntern2 = await storage.createUser({
        name: "Other Intern",
        email: `other_${Date.now()}@example.com`,
        passwordHash: "pass",
        role: "intern"
    });
    const taskCAlreadyAssigned = await db.insert(tasks).values({
        title: "Task Already Assigned",
        internId: testIntern2.id,
        createdAt: new Date(testIntern.createdAt!.getTime() + 10000)
    }).returning();
    console.log(`Created Task C (Assigned): ${taskCAlreadyAssigned[0].id}`);

    // 3. Trigger Allocation (Regular - Should skip Task A)
    console.log("Triggering regular allocation...");
    const assignedRegular = await storage.allocateTasksForIntern(testIntern.id, false);
    console.log(`Regular assigned ${assignedRegular.length} tasks.`);

    // 4. Trigger Allocation (Forced - Should include Task A)
    console.log("Triggering forced allocation (includeOld=true)...");
    const assignedForced = await storage.allocateTasksForIntern(testIntern.id, true);
    console.log(`Forced assigned ${assignedForced.length} tasks.`);

    // 5. Verify Results
    const regularIds = assignedRegular.map(t => t.id);
    const forcedIds = assignedForced.map(t => t.id);

    const regularSuccess =
        !regularIds.includes(taskABefore[0].id) &&
        regularIds.includes(taskBAfter[0].id) &&
        !regularIds.includes(taskCAlreadyAssigned[0].id) &&
        regularIds.length === 1; // Only Task B should be assigned

    const forcedSuccess =
        forcedIds.includes(taskABefore[0].id) &&
        !forcedIds.includes(taskBAfter[0].id) &&
        !forcedIds.includes(taskCAlreadyAssigned[0].id) &&
        forcedIds.length === 1; // Only Task A should be assigned now (Task B already assigned)

    if (regularSuccess && forcedSuccess) {
        console.log("✅ TEST PASSED: Old task allocation logic is correct.");
    } else {
        console.log("❌ TEST FAILED: Allocation logic incorrect.");
        console.log("Regular Results:", regularIds);
        console.log("Forced Results:", forcedIds);
    }


    // Cleanup
    await db.delete(tasks).where(eq(tasks.id, taskABefore[0].id));
    await db.delete(tasks).where(eq(tasks.id, taskBAfter[0].id));
    await db.delete(tasks).where(eq(tasks.id, taskCAlreadyAssigned[0].id));
    await storage.deleteUser(testIntern.id);
    await storage.deleteUser(testIntern2.id);
    console.log("Cleanup complete.");
    process.exit(regularSuccess && forcedSuccess ? 0 : 1);
}


testAllocation().catch(err => {
    console.error("Test Error:", err);
    process.exit(1);
});
