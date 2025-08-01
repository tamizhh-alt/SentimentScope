import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SentimentService } from '../services/SentimentService.js';
import { TranslationService } from '../services/TranslationService.js';
import { CacheService } from '../services/CacheService.js';
import { fileUploadValidation } from '../utils/validation.js';
import { validationResult } from 'express-validator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const sentimentService = new SentimentService();
const translationService = new TranslationService();
const cacheService = new CacheService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, JSON, Excel, and TXT files are allowed.'));
    }
  }
});

// File upload and analysis
router.post('/upload', upload.single('file'), fileUploadValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const { includeEmotions = 'true', batchSize = '100', textColumn = 'text' } = req.body;
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let texts = [];
    
    try {
      // Parse file based on type
      switch (fileExtension) {
        case '.csv':
          texts = await parseCSV(filePath, textColumn);
          break;
        case '.json':
          texts = await parseJSON(filePath, textColumn);
          break;
        case '.xlsx':
        case '.xls':
          texts = await parseExcel(filePath, textColumn);
          break;
        case '.txt':
          texts = await parseTXT(filePath);
          break;
        default:
          throw new Error('Unsupported file format');
      }

      if (texts.length === 0) {
        throw new Error('No text data found in file');
      }

      // Limit batch size
      const maxBatchSize = Math.min(parseInt(batchSize), 1000);
      if (texts.length > maxBatchSize) {
        texts = texts.slice(0, maxBatchSize);
      }

      // Process texts in batches
      const results = [];
      const processingBatchSize = 10; // Process 10 at a time
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      for (let i = 0; i < texts.length; i += processingBatchSize) {
        const batch = texts.slice(i, i + processingBatchSize);
        const batchPromises = batch.map(async (text, index) => {
          try {
            // Language detection/translation parity with single-text
            let detectedLanguage = 'en';
            if (text && typeof text === 'string') {
              detectedLanguage = await translationService.detectLanguage(text);
            }
            let textToAnalyze = text;
            if (detectedLanguage !== 'en') {
              const translation = await translationService.translate(text, detectedLanguage, 'en');
              textToAnalyze = translation.translatedText;
            }

            // Cache key per text
            const cacheKey = `sentiment:${Buffer.from(text).toString('base64')}:batch:file`;
            const cached = cacheService.get(cacheKey);
            if (cached) {
              return { ...cached, index: i + index, cached: true };
            }

            const sentimentResult = await sentimentService.analyzeSentiment(textToAnalyze);
            
            let emotions = null;
            if (includeEmotions === 'true') {
              emotions = await sentimentService.analyzeEmotions(textToAnalyze);
            }

            return {
              id: `${jobId}_${i + index}`,
              index: i + index,
              text: text.substring(0, 200) + (text.length > 200 ? '...' : ''), // Truncate for response
              sentiment: {
                label: sentimentResult.label,
                confidence: sentimentResult.confidence,
                scores: sentimentResult.scores
              },
              emotions: emotions
            };
          } catch (error) {
            return {
              index: i + index,
              text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
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

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        jobId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        timestamp: new Date().toISOString(),
        summary: {
          totalTexts: texts.length,
          processed: successful.length,
          failed: failed.length,
          sentimentDistribution: sentimentCounts
        },
        results: results
      });

    } catch (parseError) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }

  } catch (error) {
    console.error('File processing error:', error);
    next(error);
  }
});

// Helper functions for parsing different file types
async function parseCSV(filePath, textColumn) {
  return new Promise((resolve, reject) => {
    const texts = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const text = row[textColumn] || row.text || row.content || row.review || Object.values(row)[0];
        if (text && typeof text === 'string' && text.trim()) {
          texts.push(text.trim());
        }
      })
      .on('end', () => resolve(texts))
      .on('error', reject);
  });
}

async function parseJSON(filePath, textColumn) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const texts = [];
  
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (typeof item === 'string') {
        texts.push(item);
      } else if (typeof item === 'object') {
        const text = item[textColumn] || item.text || item.content || item.review;
        if (text && typeof text === 'string' && text.trim()) {
          texts.push(text.trim());
        }
      }
    });
  } else if (typeof data === 'object') {
    const text = data[textColumn] || data.text || data.content || data.review;
    if (text && typeof text === 'string' && text.trim()) {
      texts.push(text.trim());
    }
  }
  
  return texts;
}

async function parseExcel(filePath, textColumn) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  const texts = [];
  data.forEach(row => {
    const text = row[textColumn] || row.text || row.content || row.review || Object.values(row)[0];
    if (text && typeof text === 'string' && text.trim()) {
      texts.push(text.trim());
    }
  });
  
  return texts;
}

async function parseTXT(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').filter(line => line.trim()).map(line => line.trim());
}

// Get file processing status
router.get('/status/:jobId', (req, res) => {
  // In a real implementation, you'd store job status in database/cache
  res.json({
    jobId: req.params.jobId,
    status: 'completed',
    message: 'File processing completed successfully'
  });
});

export default router;