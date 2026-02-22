import express, { type Express, type Request, type Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import paidInternshipRouter from "./api";

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: false }));
console.log("Server payload limit set to 100mb");
app.get("/api/ping", (req, res) => res.json({ status: "ok" }));

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let resSent = false;

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (res.locals.resBody) {
                logLine += ` :: ${JSON.stringify(res.locals.resBody)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            log(logLine);
        }
    });

    next();
});

(async () => {
    // Mount specialized routers first
    app.use("/api/paid-internships", paidInternshipRouter);

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
    });

    if (app.get("env") === "development") {
        await setupVite(app, server);
    } else {
        serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(Number(PORT), "0.0.0.0", () => {
        log(`serving on port ${PORT}`);
    });
})();
