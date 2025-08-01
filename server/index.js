import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import sentimentRoutes from './routes/sentiment.js';
import fileRoutes from './routes/files.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
    } else {
      console.log('⚠️  MongoDB URI not provided, running without database');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit process, allow app to run without DB for demo purposes
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      huggingface: process.env.HUGGINGFACE_API_KEY ? 'configured' : 'not configured',
      googleTranslate: process.env.GOOGLE_TRANSLATE_API_KEY ? 'configured' : 'not configured',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
    }
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Sentiment Analysis API',
    version: '1.0.0',
    endpoints: {
      'POST /api/sentiment/analyze': 'Analyze text sentiment',
      'POST /api/sentiment/batch': 'Batch analyze multiple texts',
      'POST /api/files/upload': 'Upload and analyze files',
      'GET /api/analytics/dashboard': 'Get dashboard analytics',
      'POST /api/auth/register': 'Register new user',
      'POST /api/auth/login': 'User login',
      'GET /api/health': 'Health check'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: '/api/docs'
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer().catch(console.error);

export default app;

require("dotenv").config(); // this loads your .env file

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Connection failed:", err));
