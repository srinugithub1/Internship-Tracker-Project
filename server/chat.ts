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

        // 2. AI Logic - Standard model names
        const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro"];
        let responseText = "";
        let lastError: any = null;

        for (const modelName of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err: any) {
                lastError = err;
                console.warn(`[CHAT] Failed with ${modelName}: ${err.message}`);
            }
        }

        if (!responseText) {
            throw lastError || new Error("All AI models returned empty or failed.");
        }

        return responseText;
    } catch (error: any) {
        console.error("[CHAT AI ERROR]:", error);

        let errorDetail = error.message || String(error);
        const keySnippet = API_KEY.substring(0, 5) + "..." + API_KEY.substring(API_KEY.length - 4);

        return `Assistant Connection Refused. 
        
        TECHNICAL DETAIL: ${errorDetail}
        SERVER KEY INFO: Using key starting with "${keySnippet}"
        
        NEXT STEPS:
        1. Access Denied! Standard Google Cloud keys often fail for AI.
        2. Go to: aistudio.google.com/app/apikey (Google AI Studio)
        3. Click "Create API key" there.
        4. Copy that NEW key into Render and click Save. 
           (AI Studio keys work instantly where Cloud keys fail!)`;
    }
}
