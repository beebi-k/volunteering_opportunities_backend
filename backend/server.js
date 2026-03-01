// server.js
import express from "express";
import { initDB } from "./config/db.js";
import { seedData } from "./config/seed.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/org.routes.js";
import oppRoutes from "./routes/opp.routes.js";
import appRoutes from "./routes/app.routes.js";

dotenv.config();

async function startServer() {
  // =======================
  // Database initialization and seed
  // =======================
  try {
    await initDB();
    await seedData();
  } catch (err) {
    console.error("❌ Failed to initialize DB or seed data:", err);
    process.exit(1); // Stop if DB fails
  }

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.set("trust proxy", 1); // For rate limiting behind proxies

  // =======================
  // Security and Middleware
  // =======================
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", limiter);

  // =======================
  // GEMINI CHATBOT INTEGRATION
  // =======================
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in .env file");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ reply: "Invalid messages format." });
      }

      const model = genAI.getGenerativeModel({
        model: "models/gemini-1.0-pro",
      });

      const chatHistory = messages
        .map(
          (msg) =>
            `${msg.role === "assistant" ? "AI" : "User"}: ${msg.content}`
        )
        .join("\n");

      const prompt = `
You are a helpful assistant for "VolunteerHub India".

Your goal:
- Suggest Indian NGOs like Goonj, CRY, Teach For India.
- Help users find volunteering opportunities.
- Be polite, warm, and culturally relatable.
- Keep answers concise and formatted in markdown.

Conversation so far:
${chatHistory}

AI:
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      res.json({ reply: text });
    } catch (error) {
      console.error("🔥 Chatbot error:", error);

      res.status(500).json({
        reply:
          "Namaste! I'm having trouble connecting right now. Please try again in a moment.",
      });
    }
  });

  // =======================
  // ROUTES (UNCHANGED)
  // =======================
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/organizations", orgRoutes);
  app.use("/api/opportunities", oppRoutes);
  app.use("/api/applications", appRoutes);

  // =======================
  // Health Check
  // =======================
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // =======================
  // Catch-all 404 for undefined routes
  // =======================
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  // =======================
  // Start server
  // =======================
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 VolunteerHub Server is ready!`);
    console.log(`📡 Port: http://localhost:${PORT}`);
  });
}

startServer();