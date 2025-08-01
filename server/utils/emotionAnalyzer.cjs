const axios = require("axios");

async function analyzeEmotions(text) {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching from Hugging Face API:", error.message);
    return null;
  }
}

module.exports = { analyzeEmotions };
