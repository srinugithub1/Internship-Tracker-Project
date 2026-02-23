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

        // 2. AI Logic - Nuclear Resilience Loop
        const configurations = [
            { name: "gemini-1.5-flash", version: "v1" },
            { name: "models/gemini-1.5-flash", version: "v1" },
            { name: "gemini-1.5-flash", version: "v1beta" },
            { name: "gemini-1.5-pro", version: "v1" },
            { name: "gemini-pro", version: "v1" }
        ];

        let responseText = "";
        let diagnosticLog = "";

        for (const config of configurations) {
            try {
                const model = genAI.getGenerativeModel({ model: config.name }, { apiVersion: config.version });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err: any) {
                diagnosticLog += `[${config.name} @ ${config.version}]: ${err.message}\n`;
                console.warn(`[CHAT] Failed: ${config.name} (${config.version})`);
            }
        }

        // 3. IF ALL FAILED - NUCLEAR DIAGNOSTIC (List Available Models)
        let availableModels = "Not listed";
        if (!responseText) {
            try {
                const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
                const listResponse = await fetch(listUrl);
                const listData = await listResponse.json();
                if (listData.models) {
                    availableModels = listData.models.slice(0, 8).map((m: any) => m.name.replace('models/', '')).join(", ");
                } else {
                    availableModels = "API Error: " + JSON.stringify(listData);
                }
            } catch (e: any) {
                availableModels = "List Failed: " + e.message;
            }
            throw new Error(`Connectivity failed. \nMODELS FOUND FOR KEY: ${availableModels}\nLOG:\n${diagnosticLog}`);
        }

        return responseText;
    } catch (error: any) {
        console.error("[CHAT AI ERROR]:", error);

        const errorDetail = error.message || String(error);
        const lastFour = API_KEY.length >= 4 ? API_KEY.substring(API_KEY.length - 4) : "****";

        return `Assistant Connection Refused. 
        
        🚨 SERVER KEY ENDS IN: "...${lastFour}"
        
        IS THE API ENABLED?
        - If "MODELS FOUND FOR KEY" above is empty or shows an error, your API key is NOT correctly set up in Google AI Studio.
        - Go to: aistudio.google.com/app/apikey.
        - Ensure you have a key for the "Internship Chat Bot" project.
        
        TECHNICAL LOG:
        ${errorDetail}`;
    }
}
