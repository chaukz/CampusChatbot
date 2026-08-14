import express from "express";
import cors from "cors";
import { callModel } from "./model.js";
import { buildSystemPrompt } from "./prompt.js";

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM = buildSystemPrompt();
const PORT = process.env.PORT || 3001;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, provider: process.env.PROVIDER || "anthropic" });
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Send { messages: [...] }" });
  }

  try {
    // Keep the last 10 turns so the prompt stays small and fast.
    const reply = await callModel(SYSTEM, messages.slice(-10));
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "The assistant could not reach the model. Check the server logs.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
  console.log(`Provider: ${process.env.PROVIDER || "anthropic"}`);
});
