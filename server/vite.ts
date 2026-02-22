import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export async function setupVite(app: Express, server: Server) {
    const vite = await createViteServer({
        ...viteConfig,
        configFile: false,
        customLogger: viteLogger,
        server: {
            middlewareMode: true,
            hmr: { server },
        },
        appType: "custom",
    });

    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
        const url = req.originalUrl;

        // Never serve HTML for API routes — if control reaches here it's a missing route
        if (url.startsWith("/api")) {
            return res.status(404).json({ message: `API not found: ${req.method} ${url}` });
        }

        try {
            const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
            const template = await fs.promises.readFile(clientTemplate, "utf-8");
            const page = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
        } catch (e) {
            vite.ssrFixStacktrace(e as Error);
            next(e);
        }
    });
}

export function serveStatic(app: Express) {
    const distPath = path.resolve(__dirname, "..", "dist", "public");

    if (!fs.existsSync(distPath)) {
        throw new Error(
            `Could not find the build directory: ${distPath}. Make sure to build the client first.`
        );
    }

    app.use(express.static(distPath));

    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}

export function log(message: string, source: string = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`[${formattedTime}] ${source}: ${message}`);
}
