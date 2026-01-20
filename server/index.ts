import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { handleAIAgentAnalysis } from "./routes/ai-agent-analysis.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // AI Agent Analysis Route
  app.post("/api/ai-agent-analysis", handleAIAgentAnalysis);

  return app;
}
