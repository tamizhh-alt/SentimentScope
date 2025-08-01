import axios from "axios";

export class SentimentService {
  constructor() {
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.huggingfaceApiUrl =
      process.env.HUGGINGFACE_API_URL ||
      "https://api-inference.huggingface.co/models";
    this.sentimentModel = "cardiffnlp/twitter-roberta-base-sentiment-latest";
    this.emotionModel = "j-hartmann/emotion-english-distilroberta-base";
  }

  async analyzeSentiment(text) {
    try {
      if (!this.huggingfaceApiKey || this.huggingfaceApiKey.includes("dummy")) {
        return this.generateMockSentiment(text);
      }

      const response = await axios.post(
        `${this.huggingfaceApiUrl}/${this.sentimentModel}`,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.huggingfaceApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const results = response.data[0];
      const sentimentMap = {
        LABEL_0: "negative",
        LABEL_1: "neutral",
        LABEL_2: "positive",
      };

      const topResult = results.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );

      return {
        label: sentimentMap[topResult.label] || "neutral",
        confidence: topResult.score,
        scores: results.reduce((acc, result) => {
          acc[sentimentMap[result.label] || result.label] = result.score;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error("⚠️ Sentiment analysis error:", error.message);
      return this.generateMockSentiment(text);
    }
  }

  async analyzeEmotions(text) {
    try {
      if (!this.huggingfaceApiKey || this.huggingfaceApiKey.includes("dummy")) {
        return this.generateMockEmotions(text);
      }

      const response = await axios.post(
        `${this.huggingfaceApiUrl}/${this.emotionModel}`,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.huggingfaceApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const results = response.data[0];
      const total = results.reduce((sum, item) => sum + item.score, 0);

      return results.map((item) => ({
        label: item.label.toLowerCase(),
        percent: parseFloat(((item.score / total) * 100).toFixed(1)),
      }));
    } catch (error) {
      console.error("⚠️ Emotion analysis error:", error.message);
      return this.generateMockEmotions(text);
    }
  }

  async extractKeywords(text) {
    try {
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .filter((word) => !this.isStopWord(word));

      const wordFreq = {};
      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      return Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word, frequency]) => ({ word, frequency }));
    } catch (error) {
      console.error("⚠️ Keyword extraction error:", error.message);
      return [];
    }
  }

  generateMockSentiment(text) {
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "love",
      "perfect",
      "awesome",
      "brilliant",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "hate",
      "worst",
      "disappointing",
      "poor",
      "useless",
      "pathetic",
    ];

    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) positiveScore += 1;
    });

    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) negativeScore += 1;
    });

    let label, confidence;
    if (positiveScore > negativeScore) {
      label = "positive";
      confidence = Math.min(0.7 + positiveScore * 0.05, 0.95);
    } else if (negativeScore > positiveScore) {
      label = "negative";
      confidence = Math.min(0.7 + negativeScore * 0.05, 0.95);
    } else {
      label = "neutral";
      confidence = Math.random() * 0.3 + 0.6;
    }

    return {
      label,
      confidence,
      scores: {
        positive: label === "positive" ? confidence : Math.random() * 0.4,
        negative: label === "negative" ? confidence : Math.random() * 0.4,
        neutral: label === "neutral" ? confidence : Math.random() * 0.4,
      },
    };
  }

  generateMockEmotions(text) {
    const emotions = ["joy", "anger", "sadness", "fear", "surprise", "disgust"];
    const rawScores = emotions.map((label) => ({
      label,
      score: Math.random() * 0.8 + 0.1,
    }));

    const total = rawScores.reduce((sum, e) => sum + e.score, 0);

    return rawScores.map((e) => ({
      label: e.label,
      percent: parseFloat(((e.score / total) * 100).toFixed(1)),
    }));
  }

  isStopWord(word) {
    const stopWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "been",
      "be",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
    ];
    return stopWords.includes(word);
  }
}
