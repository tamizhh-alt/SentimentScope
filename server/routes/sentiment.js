import express from 'express';
import { body, validationResult } from 'express-validator';
import { SentimentService } from '../services/SentimentService.js';
import { TranslationService } from '../services/TranslationService.js';
import { CacheService } from '../services/CacheService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const sentimentService = new SentimentService();
const translationService = new TranslationService();
const cacheService = new CacheService();

// Validation rules
const analyzeValidation = [
  body('text').notEmpty().withMessage('Text is required').isLength({ max: 10000 }).withMessage('Text too long'),
  body('language').optional().isString().withMessage('Language must be a string'),
  body('includeEmotions').optional().isBoolean().withMessage('includeEmotions must be boolean'),
  body('detectLanguage').optional().isBoolean().withMessage('detectLanguage must be boolean')
];

const batchValidation = [
  body('texts').isArray({ min: 1, max: 100 }).withMessage('Texts must be an array with 1-100 items'),
  body('texts.*').notEmpty().withMessage('Each text item is required'),
  body('language').optional().isString(),
  body('includeEmotions').optional().isBoolean()
];

// Single text analysis
router.post('/analyze', analyzeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { text, language = 'auto', includeEmotions = true, detectLanguage = true } = req.body;
    
    // Check cache first
    const cacheKey = `sentiment:${Buffer.from(text).toString('base64')}:${language}:${includeEmotions}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        cached: true,
        processingTime: 0
      });
    }

    const startTime = Date.now();
    
    // Detect language if requested
    let detectedLanguage = language;
    if (detectLanguage && language === 'auto') {
      detectedLanguage = await translationService.detectLanguage(text);
    }

    // Translate if not English
    let textToAnalyze = text;
    let translatedFrom = null;
    if (detectedLanguage !== 'en' && detectedLanguage !== 'auto') {
      const translation = await translationService.translate(text, detectedLanguage, 'en');
      textToAnalyze = translation.translatedText;
      translatedFrom = detectedLanguage;
    }

    // Perform sentiment analysis
    const sentimentResult = await sentimentService.analyzeSentiment(textToAnalyze);
    
    // Get emotions if requested
    let emotions = null;
    if (includeEmotions) {
      emotions = await sentimentService.analyzeEmotions(textToAnalyze);
    }

    // Extract keywords
    const keywords = await sentimentService.extractKeywords(textToAnalyze);

    const result = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      text: text,
      language: {
        detected: detectedLanguage,
        requested: language,
        translatedFrom
      },
      sentiment: {
        label: sentimentResult.label,
        confidence: sentimentResult.confidence,
        scores: sentimentResult.scores
      },
      emotions: emotions,
      keywords: keywords,
      processingTime: Date.now() - startTime,
      cached: false
    };

    // Cache the result
    cacheService.set(cacheKey, result, 3600); // Cache for 1 hour

    res.json(result);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      code: 'SENTIMENT_ANALYSIS_ERROR'
    });
  }
});

// Batch analysis
router.post('/batch', batchValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { texts, language = 'auto', includeEmotions = true } = req.body;
    const startTime = Date.now();
    
    const results = [];
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Process texts in parallel with concurrency limit
    const concurrencyLimit = 5;
    for (let i = 0; i < texts.length; i += concurrencyLimit) {
      const batch = texts.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(async (text, index) => {
        try {
          // Check cache
          const cacheKey = `sentiment:${Buffer.from(text).toString('base64')}:${language}:${includeEmotions}`;
          const cached = cacheService.get(cacheKey);
          if (cached) {
            return { ...cached, index: i + index, cached: true };
          }

          // Analyze sentiment
          const sentimentResult = await sentimentService.analyzeSentiment(text);
          
          // Get emotions if requested
          let emotions = null;
          if (includeEmotions) {
            emotions = await sentimentService.analyzeEmotions(text);
          }

          const result = {
            id: `${batchId}_${i + index}`,
            index: i + index,
            text: text,
            sentiment: {
              label: sentimentResult.label,
              confidence: sentimentResult.confidence,
              scores: sentimentResult.scores
            },
            emotions: emotions,
            cached: false
          };

          // Cache individual result
          cacheService.set(cacheKey, result, 3600);
          return result;
        } catch (error) {
          return {
            index: i + index,
            text: text,
            error: error.message,
            failed: true
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    // Calculate statistics
    const successful = results.filter(r => !r.failed);
    const failed = results.filter(r => r.failed);
    const sentimentCounts = successful.reduce((acc, r) => {
      acc[r.sentiment?.label || 'unknown'] = (acc[r.sentiment?.label || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const response = {
      batchId,
      timestamp: new Date().toISOString(),
      summary: {
        total: texts.length,
        successful: successful.length,
        failed: failed.length,
        processingTime: Date.now() - startTime,
        sentimentDistribution: sentimentCounts
      },
      results: results
    };

    res.json(response);
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      error: 'Batch analysis failed',
      message: error.message,
      code: 'BATCH_ANALYSIS_ERROR'
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    supported: [
      { code: 'auto', name: 'Auto-detect' },
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'tr', name: 'Turkish' },
      { code: 'pl', name: 'Polish' },
      { code: 'nl', name: 'Dutch' }
    ]
  });
});

export default router;