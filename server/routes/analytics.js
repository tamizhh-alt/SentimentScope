import express from 'express';
import { SentimentService } from '../services/SentimentService.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import { analyticsValidation } from '../utils/validation.js';

const router = express.Router();
const sentimentService = new SentimentService();

// Get dashboard analytics
router.get('/dashboard', optionalAuth, analyticsValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { timeRange = '7d', sentimentFilter = 'all' } = req.query;

    // Mock analytics data - in production, this would come from your database
    const analytics = {
      totalAnalyses: 1247,
      sentimentDistribution: {
        positive: 45.2,
        negative: 23.8,
        neutral: 31.0
      },
      averageConfidence: 0.847,
      trendData: generateTrendData(timeRange as string),
      topKeywords: [
        { word: 'excellent', frequency: 156, sentiment: 'positive' },
        { word: 'terrible', frequency: 89, sentiment: 'negative' },
        { word: 'good', frequency: 134, sentiment: 'positive' },
        { word: 'bad', frequency: 67, sentiment: 'negative' },
        { word: 'amazing', frequency: 98, sentiment: 'positive' }
      ],
      emotionDistribution: {
        joy: 28.5,
        anger: 15.2,
        sadness: 12.8,
        fear: 8.9,
        surprise: 18.3,
        disgust: 16.3
      }
    };

    res.json({
      timeRange,
      sentimentFilter,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    next(error);
  }
});

// Analyze emotions endpoint
router.post('/emotions', [
  body('text').notEmpty().withMessage('Text is required').isLength({ max: 10000 }).withMessage('Text too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { text } = req.body;
    const emotions = await sentimentService.analyzeEmotions(text);

    res.json({
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      emotions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Emotion analysis error:', error);
    res.status(500).json({
      error: 'Emotion analysis failed',
      message: error.message
    });
  }
});

function generateTrendData(timeRange) {
  const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    if (timeRange === '24h') {
      date.setHours(date.getHours() - (days - 1 - i));
    } else {
      date.setDate(date.getDate() - (days - 1 - i));
    }
    
    data.push({
      date: date.toISOString(),
      positive: Math.random() * 40 + 40,
      negative: Math.random() * 30 + 10,
      neutral: Math.random() * 30 + 20
    });
  }
  
  return data;
}

export default router;