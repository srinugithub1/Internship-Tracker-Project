import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";

const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(API_KEY);

export async function getChatResponse(userId: string, userMessage: string, isAdmin: boolean = false) {
    if (!API_KEY) {
        return "The AI Assistant is currently in maintenance mode (Waiting for API Key). Please try again later.";
    }

    try {
        // 1. Fetch Context
        const user = await storage.getUser(userId);
        let context = `User Name: ${user?.name || 'User'}\nRole: ${isAdmin ? 'Administrator' : 'Intern'}\nProgram: Bharat Unnati AI Fellowship\n`;

        if (isAdmin) {
            const stats = await storage.getAdminDashboardStats();
            context += `\nSystem Stats:\n- Total Registered Interns: ${stats.totalInterns}\n- Task Status Breakdown: ${JSON.stringify(stats.taskStats)}`;
        } else {
            const attendance = await storage.getAttendance(userId);
            const tasks = await storage.getTasks(userId);
            const totalHours = attendance.reduce((acc, curr) => acc + parseFloat(curr.workingHours || "0"), 0);
            const pendingTasks = tasks.filter(t => t.status !== 'completed');

            context += `\nIntern Stats:\n- Your Total Working Hours: ${totalHours.toFixed(2)}h\n- Your Pending Tasks: ${pendingTasks.length}\n- Latest Assigned Tasks: ${tasks.slice(0, 3).map(t => t.title).join(', ')}`;
        }

        const prompt = `You are a helpful AI Assistant for the Bharat Unnati Internship Portal. 
    You are speaking to a ${isAdmin ? 'Portal Administrator' : 'Intern'}.
    
    CRITICAL CONTEXT (Current User Data):
    ${context}
    
    USER QUERY: "${userMessage}"
    
    INSTRUCTIONS:
    - Answer professionally, kindly, and concisely.
    - If the user asks about their attendance or tasks, use the data in the "CRITICAL CONTEXT" above.
    - If the user asks for actions you cannot perform (like deleting a user or changing a password), kindly explain they should contact support at support@learnersbyte.com.
    - Never mention technical terms like "Database", "Context", or "API" to the user.
    - Keep responses under 3-4 sentences if possible.`;

        // 2. AI Logic - Use the most stable configuration possible
        const modelNames = ["gemini-1.5-flash", "gemini-pro"];
        let responseText = "";
        let lastError: any = null;

        for (const modelName of modelNames) {
            try {
                // Try without explicit version first (let SDK use v1beta or v1 as needed)
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err: any) {
                lastError = err;
                console.warn(`[CHAT] Failed ${modelName} default: ${err.message}`);
            }
        }

        if (!responseText) {
            throw lastError || new Error("Connection failed to return data.");
        }

        return responseText;
    } catch (error: any) {
        console.error("[CHAT AI ERROR]:", error);

        const errorDetail = error.message || String(error);
        const lastFour = API_KEY.length >= 4 ? API_KEY.substring(API_KEY.length - 4) : "****";

        return `Assistant Connection Refused. 
        
        🚨 SERVER KEY ENDS IN: "...${lastFour}"
        
        KEY MISMATCH WARNING:
        - Your project "Internship Chat bot" (from your earlier screenshot) had a key ending in "...H4o".
        - Your Render dashboard is currently using a key ending in "...${lastFour}".
        
        If you are still seeing "NOT FOUND" errors, the key ending in "...${lastFour}" is either inactive or restricted in your region.
        
        FINAL INSTRUCTIONS:
        1. Go to: aistudio.google.com/app/apikey.
        2. Create a BRAND NEW key.
        3. Copy it and UPDATE it in Render -> Settings -> Env Vars.
        4. Click **"Save Changes"**.
        5. Click **"Manual Deploy"** -> **"Clear cache and deploy"**.
        
        TECHNICAL DETAIL: ${errorDetail}`;
    }
}
