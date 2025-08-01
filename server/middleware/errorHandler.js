export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Error',
      message: `${field} already exists`,
      field: field
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Authentication token is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Authentication token has expired'
    });
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File Too Large',
      message: 'File size exceeds the maximum limit',
      maxSize: process.env.MAX_FILE_SIZE || '10MB'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid File',
      message: 'Unexpected file field or too many files'
    });
  }

  // Rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: err.retryAfter
    });
  }

  // API timeout errors
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      error: 'Service Timeout',
      message: 'External service request timed out. Please try again.',
      service: err.config?.url || 'unknown'
    });
  }

  // Network errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'External service is currently unavailable',
      service: err.config?.url || 'unknown'
    });
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Server Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};