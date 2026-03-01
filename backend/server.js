import express from "express";
import { initDB } from "./config/db.js";
import { seedData } from "./config/seed.js";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/org.routes.js";
import oppRoutes from "./routes/opp.routes.js";
import appRoutes from "./routes/app.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  initDB();
  await seedData();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // ✅ SIMPLE + BULLETPROOF CORS
  app.use(
    cors({
      origin: true,          // reflect requesting origin automatically
      credentials: true,     // allow cookies if needed
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ Ensure preflight requests always succeed
  app.options("*", cors());

  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", limiter);

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/organizations", orgRoutes);
  app.use("/api/opportunities", oppRoutes);
  app.use("/api/applications", appRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === "production") {
    const buildPath = path.resolve(__dirname, "dist");
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 VolunteerHub Server is ready!`);
    console.log(`📡 Port: ${PORT}`);
  });
}

startServer();