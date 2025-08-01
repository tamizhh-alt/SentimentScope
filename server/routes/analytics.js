const express = require("express");
const router = express.Router();
const { analyzeEmotions } = require("../utils/emotionAnalyzer.cjs");
const { normalizeEmotions } = require("../utils/normalizeEmotions.cjs");

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const raw = await analyzeEmotions(text);
    const normalized = normalizeEmotions(raw);

    res.status(200).json({ emotions: normalized });
  } catch (err) {
    console.error("🔴 Error in /analyze route:", err);
    res.status(500).json({ error: "Emotion analysis failed." });
  }
});

module.exports = router;
