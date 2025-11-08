// server.js
// Secure proxy to access OpenAI and Hugging Face APIs without exposing API keys.
// Works on Render or any Node.js host.

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Read your API keys from environment variables on Render
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

// Root route (for quick testing)
app.get("/", (req, res) => {
  res.send("AI API Proxy is running 🚀");
});

// ---- Proxy for OpenAI ----
app.post("/openai", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "OpenAI proxy error" });
  }
});

// ---- Proxy for Hugging Face ----
app.post("/huggingface", async (req, res) => {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/distilbert-base-uncased", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Hugging Face error:", error);
    res.status(500).json({ error: "Hugging Face proxy error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy running on port ${PORT}`));
