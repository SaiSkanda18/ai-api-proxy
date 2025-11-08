/*
Proxy Server for Ancient Brain AI Comparison World
- Handles ChatGPT (OpenAI) and Hugging Face requests
- Keys are stored securely as environment variables
- Returns responses in a format compatible with Ancient Brain main.js
*/

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" })); // allow all origins
app.use(express.json());

// === Environment variables for API keys ===
// Set these in Render: OPENAI_API_KEY, HF_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

// === ChatGPT endpoint ===
app.post("/openai", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "Prompt missing" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // Wrap in OpenAI-like format for Ancient Brain
    const text = data.choices?.[0]?.message?.content || "No response from ChatGPT";
    res.json({ choices: [{ message: { content: text } }] });

  } catch (err) {
    console.error("ChatGPT proxy error:", err);
    res.status(500).json({ error: "ChatGPT proxy error" });
  }
});

// === Hugging Face endpoint ===
app.post("/huggingface", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "Prompt missing" });

    // Update this URL to the exact model you want
    const HF_URL = "https://api-inference.huggingface.co/models/gpt2";

    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_KEY}`
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    // ⚠️ Add logging to debug HF response
    console.log("Raw HF response:", data);

    let text = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (data?.generated_text) {
      text = data.generated_text;
    } else {
      text = JSON.stringify(data, null, 2);
    }

    res.json([{ generated_text: text }]);

  } catch (err) {
    console.error("HF proxy error:", err);
    res.status(500).json({ error: "Hugging Face proxy error" });
  }
});

// === Start server ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

