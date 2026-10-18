
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors({
  origin: "https://ananyajain002255.github.io"
}));

app.use(express.json({ limit: "20kb" }));

app.use("/api/ai", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many requests. Please try again later."
  }
}));

app.get("/", (req, res) => {
  res.send("CampusFlow AI backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(openai),
    model: MODEL
  });
});

app.post("/api/ai", async (req, res) => {
  try {
    const message = typeof req.body.message === "string"
      ? req.body.message.trim()
      : "";

    if (!message) {
      return res.status(400).json({
        error: "Please enter your question."
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: "Please keep your question under 2000 characters."
      });
    }

    if (!openai) {
      return res.status(503).json({
        error: "AI is not configured yet. Please add the API key."
      });
    }

    const response = await openai.responses.create({
      model: MODEL,
      instructions:
        "You are CampusFlow AI, a friendly college study tutor. " +
        "Answer students' academic doubts clearly and accurately. " +
        "Use simple English or Hinglish based on the student's language. " +
        "Explain concepts step by step with examples when useful. " +
        "For coding questions, provide working code and explain it simply. " +
        "If you are unsure, say so instead of inventing facts.",
      input: message
    });

    res.json({
      answer: response.output_text || "Please try asking your question again."
    });
  } catch (error) {
    console.error("CampusFlow AI error:", error.message);

    res.status(500).json({
      error: "AI could not answer right now. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`CampusFlow AI running on port ${PORT}`);
});
