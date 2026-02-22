import express from "express";
import { storage } from "./storage";
import { insertPaidInternshipSchema } from "@shared/schema";

const router = express.Router();

// Helper: wraps async route handlers so uncaught errors go to Express error middleware
const wrap = (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", wrap(async (req: any, res: any) => {
    console.log("[PAID-API] GET /api/paid-internships");
    const list = await storage.getPaidInternships();
    res.json(list);
}));

router.post("/bulk", wrap(async (req: any, res: any) => {
    const internships = req.body;
    console.log(`[PAID-API] POST /api/paid-internships/bulk - Items: ${Array.isArray(internships) ? internships.length : 0}`);

    if (!Array.isArray(internships)) {
        return res.status(400).json({ message: "Body must be an array" });
    }

    const validInternships = [];
    for (const item of internships) {
        const parsed = insertPaidInternshipSchema.safeParse(item);
        if (!parsed.success) {
            return res.status(400).json({ message: "Validation error", error: parsed.error });
        }
        validInternships.push(parsed.data);
    }

    const results = await storage.bulkCreatePaidInternships(validInternships);
    res.json(results);
}));

export default router;
