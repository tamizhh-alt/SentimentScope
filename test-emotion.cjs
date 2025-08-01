require("dotenv").config();
const { analyzeEmotions } = require("./server/utils/emotionAnalyzer.cjs");
const { normalizeEmotions } = require("./server/utils/normalizeEmotions.cjs");

(async () => {
  const text = "I'm terrified this app will leak my private data.";
  const raw = await analyzeEmotions(text);

  console.log("🔍 RAW HF OUTPUT:", JSON.stringify(raw, null, 2)); // 👈 this is key

  const cleaned = normalizeEmotions(raw);
  console.log("✅ Normalized Output:", cleaned);
})();
