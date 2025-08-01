import { body, param, query } from 'express-validator';

// Common validation rules
export const textValidation = [
  body('text')
    .notEmpty()
    .withMessage('Text is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Text must be between 1 and 10,000 characters')
    .trim()
];

export const languageValidation = [
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be 2-5 characters')
];

export const emailValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters')
];

export const passwordValidation = [
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const nameValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
];

export const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('ID must be between 1 and 50 characters')
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

export const batchAnalysisValidation = [
  body('texts')
    .isArray({ min: 1, max: 100 })
    .withMessage('Texts must be an array with 1-100 items'),
  body('texts.*')
    .notEmpty()
    .withMessage('Each text item is required')
    .isLength({ max: 10000 })
    .withMessage('Each text must be less than 10,000 characters')
    .trim()
];

export const fileUploadValidation = [
  body('includeEmotions')
    .optional()
    .isBoolean()
    .withMessage('includeEmotions must be a boolean')
    .toBoolean(),
  body('batchSize')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Batch size must be between 1 and 1000')
    .toInt(),
  body('textColumn')
    .optional()
    .isString()
    .withMessage('Text column must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Text column name must be between 1 and 100 characters')
    .trim()
];

export const analyticsValidation = [
  query('timeRange')
    .optional()
    .isIn(['24h', '7d', '30d', '90d'])
    .withMessage('Time range must be one of: 24h, 7d, 30d, 90d'),
  query('sentimentFilter')
    .optional()
    .isIn(['all', 'positive', 'negative', 'neutral'])
    .withMessage('Sentiment filter must be one of: all, positive, negative, neutral')
];

// Custom validation functions
export const sanitizeText = (text) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
};

export const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Check for dummy/placeholder keys
  if (apiKey.includes('dummy') || apiKey.includes('placeholder') || apiKey.includes('your-key')) {
    return false;
  }
  
  return apiKey.length > 10; // Minimum length check
};

export const validateFileType = (mimetype) => {
  const allowedTypes = [
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain'
  ];
  
  return allowedTypes.includes(mimetype);
};

export const validateLanguageCode = (code) => {
  const supportedLanguages = [
    'auto', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'pl', 'nl'
  ];
  
  return supportedLanguages.includes(code);
};