import express from "express";
import { initDB } from "./config/db.js";
import { seedData } from "./config/seed.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/org.routes.js";
import oppRoutes from "./routes/opp.routes.js";
import appRoutes from "./routes/app.routes.js";

dotenv.config();

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

  // ✅ BULLETPROOF CORS
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 VolunteerHub Server is ready!`);
    console.log(`📡 Port: http://localhost:${PORT}`);
  });
}

startServer();