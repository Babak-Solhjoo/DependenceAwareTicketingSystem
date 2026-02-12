import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import profileRoutes from "./routes/profile";
import { HttpError } from "./utils/errors";
import { ZodError } from "zod";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "http://localhost:4000"]
      }
    }
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : "*"
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

const uploadsRoot = path.resolve(process.cwd(), "uploads");
try {
  fs.mkdirSync(uploadsRoot, { recursive: true });
} catch (error) {
  console.error("Failed to ensure uploads directory", error);
}

app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsRoot)
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", errors: err.errors });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

export default app;
