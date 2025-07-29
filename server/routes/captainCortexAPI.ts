// Captain Cortex API routes with role-based permissions
import type { Express } from "express";
import { AIBotEngine } from "../ai-bot-engine";
import { MinimalAIBotEngine } from "../ai-bot-engine-minimal";
import { isDemoAuthenticated } from "../demoAuth";

export function registerCaptainCortexRoutes(app: Express) {
  const aiBotEngine = new AIBotEngine();
  const minimalEngine = new MinimalAIBotEngine();

  // AI Bot query endpoint with role-based permissions
  app.post("/api/ai-bot/query", isDemoAuthenticated, async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: "Question is required and must be a string" });
      }

      // Get user context with role-based permissions
      const user = req.user as any;
      const context = {
        organizationId: user?.organizationId || 'default-org',
        userRole: user?.role || 'admin',
        userId: user?.id || 'demo-admin'
      };

      console.log(`🤖 AI Bot query from ${context.userRole}: "${question}"`);

      // Use minimal engine temporarily to debug token issue
      const response = await minimalEngine.processQuery(question);
      
      res.json({ 
        response,
        userRole: context.userRole,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("❌ AI Bot API error:", error);
      res.status(500).json({ 
        error: "Failed to process AI query",
        message: error?.message || "Unknown error"
      });
    }
  });

  // Get user role capabilities for UI
  app.get("/api/ai-bot/capabilities", isDemoAuthenticated, async (req, res) => {
    try {
      const { CAPTAIN_CORTEX_ROLES } = await import("../captainCortexRoleSystem");
      const userRole = (req.user as any)?.role || 'admin';
      const roleConfig = CAPTAIN_CORTEX_ROLES[userRole] || CAPTAIN_CORTEX_ROLES.guest;
      
      res.json({
        role: userRole,
        permissions: roleConfig.permissions,
        tone: roleConfig.tone,
        dataAccess: roleConfig.dataAccess
      });
      
    } catch (error: any) {
      console.error("❌ AI Bot capabilities error:", error);
      res.status(500).json({ 
        error: "Failed to get capabilities",
        message: error?.message || "Unknown error"
      });
    }
  });

  // Get role-based greeting for Captain Cortex
  app.get("/api/ai-bot/greeting", isDemoAuthenticated, async (req, res) => {
    try {
      const { getRoleBasedGreeting } = await import("../captainCortexRoleSystem");
      const userRole = (req.user as any)?.role || 'admin';
      const greeting = getRoleBasedGreeting(userRole);
      
      res.json({
        greeting,
        role: userRole,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("❌ AI Bot greeting error:", error);
      res.status(500).json({ 
        error: "Failed to get greeting",
        message: error?.message || "Unknown error"
      });
    }
  });

  // Debug endpoint to test AI bot directly
  app.post("/api/ai-bot/debug", async (req, res) => {
    try {
      const { question } = req.body;
      
      console.log(`🐛 Debug AI Bot query: "${question}"`);
      
      // Use fixed context for debugging
      const context = {
        organizationId: 'default-org',
        userRole: 'admin',
        userId: 'debug-user'
      };

      const response = await aiBotEngine.processQuery(question, context);
      
      res.json({ 
        response,
        debug: true,
        context,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("❌ AI Bot debug error:", error);
      res.status(500).json({ 
        error: "Debug failed",
        message: error?.message || "Unknown error",
        stack: error?.stack
      });
    }
  });
}