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

        // 2. AI Logic - Ultra-Resilience Loop
        const configurations = [
            { name: "gemini-1.5-flash-latest", version: "v1" },
            { name: "gemini-1.5-flash-latest", version: "v1beta" },
            { name: "gemini-1.5-flash", version: "v1" },
            { name: "gemini-1.5-flash-8b-latest", version: "v1beta" },
            { name: "gemini-1.5-flash-8b", version: "v1beta" },
            { name: "gemini-pro", version: "v1" },
            { name: "gemini-1.5-pro", version: "v1" }
        ];

        let responseText = "";
        let diagnosticLog = "";

        for (const config of configurations) {
            try {
                // Try with and without 'models/' prefix automatically
                const model = genAI.getGenerativeModel({ model: config.name }, { apiVersion: config.version });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err: any) {
                diagnosticLog += `[${config.name} @ ${config.version}]: ${err.message}\n`;
                console.warn(`[CHAT] Failed: ${config.name} (${config.version})`);
            }
        }

        // 3. FINAL FALLBACK: Manual Model Discovery (If all standard names fail)
        if (!responseText) {
            try {
                // This URL usually returns the list of models this key is allowed to use
                const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
                const listResp = await fetch(listUrl);
                const listData = await listResp.json();

                if (listData.models && listData.models.length > 0) {
                    const modelList = listData.models.map((m: any) => m.name.split('/').pop()).join(", ");
                    throw new Error(`AUTHORIZED MODELS FOR THIS KEY: ${modelList}\n\nLOG:\n${diagnosticLog}`);
                } else {
                    throw new Error(`API KEY IS NOT AUTHORIZED FOR ANY MODELS.\nERROR: ${JSON.stringify(listData)}\n\nLOG:\n${diagnosticLog}`);
                }
            } catch (e: any) {
                throw new Error(`Connectivity failed. All models returned 404 (Not Found).\nDIAGNOSTIC: ${e.message}\n\nLOG:\n${diagnosticLog}`);
            }
        }

        return responseText;
    } catch (error: any) {
        console.error("[CHAT AI ERROR]:", error);

        const errorDetail = error.message || String(error);
        const lastFour = API_KEY.length >= 4 ? API_KEY.substring(API_KEY.length - 4) : "****";

        return `Assistant Connection Refused. 
        
        🚨 SERVER KEY ENDS IN: "...${lastFour}"
        
        CRITICAL ISSUE: API DISABLED (404 Not Found)
        This error happens when the "Generative Language API" is not enabled in your Google Cloud Project.
        
        REQUIRED FIX (Follow Carefully):
        1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
        2. Select project "Internship Chat Bot API" (or your main project) in the top blue bar.
        3. Click the blue **"ENABLE"** button.
        4. Wait 1 minute, then refresh your dashboard and try again.
        
        Wait, also double confirm you are using an **AI Studio key** (...lkVo) and NOT a Cloud Console key.`;
    }
}
