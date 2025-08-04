import axios from "axios";

export class SentimentService {
  constructor() {
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.huggingfaceApiUrl =
      process.env.HUGGINGFACE_API_URL ||
      "https://api-inference.huggingface.co/models";
    this.sentimentModel = "cardiffnlp/twitter-roberta-base-sentiment-latest";
    this.emotionModel = "j-hartmann/emotion-english-distilroberta-base";
  }

  async analyzeSentiment(text) {
    try {
      if (!this.huggingfaceApiKey || this.huggingfaceApiKey.includes("dummy")) {
        console.log("⚠️ Using mock sentiment analysis - no valid Hugging Face API key");
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
          timeout: 15000,
        }
      );

      if (!response.data || !Array.isArray(response.data) || !response.data[0]) {
        throw new Error("Invalid response format from Hugging Face API");
      }

      const results = response.data[0];
      const sentimentMap = {
        LABEL_0: "negative",
        LABEL_1: "neutral", 
        LABEL_2: "positive",
      };

      const topResult = results.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );

      const scores = results.reduce((acc, result) => {
        const sentiment = sentimentMap[result.label] || result.label.toLowerCase();
        acc[sentiment] = result.score;
        return acc;
      }, {});

      return {
        label: sentimentMap[topResult.label] || "neutral",
        confidence: topResult.score,
        scores: scores,
      };
    } catch (error) {
      console.error("⚠️ Sentiment analysis error:", error.message);
      return this.generateMockSentiment(text);
    }
  }

  async analyzeEmotions(text) {
    try {
      if (!this.huggingfaceApiKey || this.huggingfaceApiKey.includes("dummy")) {
        console.log("⚠️ Using mock emotion analysis - no valid Hugging Face API key");
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
          timeout: 15000,
        }
      );

      if (!response.data || !Array.isArray(response.data) || !response.data[0]) {
        throw new Error("Invalid response format from Hugging Face API");
      }

      const results = response.data[0];
      const total = results.reduce((sum, item) => sum + item.score, 0);

      return results.map((item) => ({
        label: item.label.toLowerCase(),
        percent: parseFloat(((item.score / total) * 100).toFixed(1)),
        score: item.score
      }));
    } catch (error) {
      console.error("⚠️ Emotion analysis error:", error.message);
      return this.generateMockEmotions(text);
    }
  }

  async extractKeywords(text) {
    try {
      // Enhanced keyword extraction with better filtering
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2)
        .filter((word) => !this.isStopWord(word))
        .filter((word) => !/^\d+$/.test(word)); // Remove pure numbers

      const wordFreq = {};
      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      return Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word, frequency]) => ({ 
          word, 
          frequency,
          relevance: this.calculateRelevance(word, frequency, words.length)
        }));
    } catch (error) {
      console.error("⚠️ Keyword extraction error:", error.message);
      return [];
    }
  }

  calculateRelevance(word, frequency, totalWords) {
    // Simple relevance score based on frequency and word characteristics
    const baseScore = frequency / totalWords;
    const lengthBonus = Math.min(word.length / 10, 0.5); // Longer words get slight bonus
    return parseFloat((baseScore + lengthBonus).toFixed(3));
  }

  async summarizeText(text) {
    try {
      if (!this.openaiApiKey || this.openaiApiKey.includes("dummy")) {
        console.log("⚠️ Using simple summarization - no valid OpenAI API key");
        return this.generateSimpleSummary(text);
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes text concisely while preserving key sentiment and meaning.'
            },
            {
              role: 'user',
              content: `Please provide a concise summary of the following text in 2-3 sentences:\n\n${text}`
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("⚠️ Text summarization error:", error.message);
      return this.generateSimpleSummary(text);
    }
  }

  generateSimpleSummary(text) {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length <= 2) return text;
    
    // Return first and last sentences as a simple summary
    return `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`;
  }

  generateMockSentiment(text) {
    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "fantastic", 
      "love", "perfect", "awesome", "brilliant", "outstanding", "superb",
      "incredible", "magnificent", "exceptional", "marvelous"
    ];
    const negativeWords = [
      "bad", "terrible", "awful", "horrible", "hate", "worst", 
      "disappointing", "poor", "useless", "pathetic", "dreadful", 
      "disgusting", "appalling", "atrocious", "abysmal"
    ];

    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach((word) => {
      const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
      positiveScore += matches;
    });

    negativeWords.forEach((word) => {
      const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
      negativeScore += matches;
    });

    let label, confidence;
    const totalWords = text.split(/\s+/).length;
    const sentimentRatio = (positiveScore + negativeScore) / totalWords;

    if (positiveScore > negativeScore) {
      label = "positive";
      confidence = Math.min(0.65 + (positiveScore * 0.1) + (sentimentRatio * 0.2), 0.95);
    } else if (negativeScore > positiveScore) {
      label = "negative";
      confidence = Math.min(0.65 + (negativeScore * 0.1) + (sentimentRatio * 0.2), 0.95);
    } else {
      label = "neutral";
      confidence = Math.random() * 0.2 + 0.7; // 0.7-0.9 for neutral
    }

    const neutralScore = 1 - confidence;
    const otherScore = Math.random() * 0.3;

    return {
      label,
      confidence,
      scores: {
        positive: label === "positive" ? confidence : otherScore,
        negative: label === "negative" ? confidence : otherScore,
        neutral: label === "neutral" ? confidence : neutralScore,
      },
    };
  }

  generateMockEmotions(text) {
    const emotions = ["joy", "anger", "sadness", "fear", "surprise", "disgust"];
    const lowerText = text.toLowerCase();
    
    // Emotion keywords for better mock analysis
    const emotionKeywords = {
      joy: ["happy", "joy", "excited", "wonderful", "amazing", "love", "great", "excellent"],
      anger: ["angry", "mad", "furious", "hate", "terrible", "awful", "disgusting"],
      sadness: ["sad", "depressed", "disappointed", "sorry", "unfortunate", "tragic"],
      fear: ["scared", "afraid", "worried", "anxious", "terrified", "nervous"],
      surprise: ["surprised", "shocked", "unexpected", "amazing", "incredible"],
      disgust: ["disgusting", "revolting", "awful", "terrible", "horrible", "gross"]
    };

    const emotionScores = emotions.map(emotion => {
      const keywords = emotionKeywords[emotion] || [];
      let score = Math.random() * 0.3 + 0.1; // Base random score
      
      // Boost score if keywords are found
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score += 0.3;
        }
      });
      
      return {
        label: emotion,
        score: Math.min(score, 1.0)
      };
    });

    const total = emotionScores.reduce((sum, e) => sum + e.score, 0);

    return emotionScores.map((e) => ({
      label: e.label,
      percent: parseFloat(((e.score / total) * 100).toFixed(1)),
      score: e.score
    }));
  }

  isStopWord(word) {
    const stopWords = [
      "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "been", "be", "have", "has", "had", "do", "does", 
      "did", "will", "would", "could", "should", "may", "might", "must", "can",
      "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
      "me", "him", "her", "us", "them", "my", "your", "his", "her", "its", "our", "their",
      "a", "an", "as", "if", "then", "than", "when", "where", "why", "how", "all", "any",
      "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
      "only", "own", "same", "so", "also", "just", "now", "very", "too", "much", "many"
    ];
    return stopWords.includes(word.toLowerCase());
  }
}