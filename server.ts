import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load env vars
dotenv.config();
const DEFAULT_GOOGLE_MAPS_API_KEY = "AIzaSyDZpn9e3Xww8FMMW7U49bMNEbg_TiuEmOw";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/config", (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || DEFAULT_GOOGLE_MAPS_API_KEY;
    res.json({ apiKey: apiKey || null });
  });

  app.post("/api/config", (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "API Key is required" });
    }

    // 1. Update process.env for current session
    process.env.GOOGLE_MAPS_API_KEY = apiKey;

    // 2. Write to .env file for persistence
    const envPath = path.resolve(process.cwd(), ".env");
    
    try {
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }

      // Check if key exists
      const keyRegex = /^GOOGLE_MAPS_API_KEY=.*$/m;
      if (keyRegex.test(envContent)) {
        // Replace
        envContent = envContent.replace(keyRegex, `GOOGLE_MAPS_API_KEY="${apiKey}"`);
      } else {
        // Append
        envContent += `\nGOOGLE_MAPS_API_KEY="${apiKey}"\n`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log("Updated .env file with new API key");
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to write to .env file:", error);
      res.status(500).json({ error: "Failed to save API key" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist in production
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Handle SPA routing: serve index.html for all non-API routes
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
