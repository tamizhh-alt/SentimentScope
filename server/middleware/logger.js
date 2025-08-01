export const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const logBody = { ...req.body };
    // Remove sensitive fields
    delete logBody.password;
    delete logBody.token;
    delete logBody.apiKey;
    
    if (Object.keys(logBody).length > 0) {
      console.log(`Request Body:`, JSON.stringify(logBody, null, 2));
    }
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    
    // Log response
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Log error responses
    if (res.statusCode >= 400) {
      console.error(`Error Response:`, JSON.stringify(data, null, 2));
    }
    
    return originalJson.call(this, data);
  };

  next();
};

export const requestId = (req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
};

export const responseTime = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
  });
  
  next();
};