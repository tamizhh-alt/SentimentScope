import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please log in again'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    } else {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return an error, just continue without user
    next();
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};