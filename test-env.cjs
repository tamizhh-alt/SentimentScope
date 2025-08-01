// test-env.js
require("dotenv").config();

console.log(
  "🔑 OpenAI API Key:",
  process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Not Found"
);
console.log(
  "🔑 Hugging Face API Key:",
  process.env.HF_API_KEY ? "✅ Loaded" : "❌ Not Found"
);
