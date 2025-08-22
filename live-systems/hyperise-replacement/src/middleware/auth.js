import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../database/connection.js';
import { logger } from '../utils/logger.js';

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (!user.rows[0]) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error'
    });
  }
};

// API key authentication middleware
export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = extractApiKey(req);
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'No API key provided'
      });
    }

    const user = await db.query('SELECT * FROM users WHERE api_key = $1', [apiKey]);
    
    if (!user.rows[0]) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'API key not found'
      });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error'
    });
  }
};

// Optional authentication middleware
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
      
      if (user.rows[0]) {
        req.user = user.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Extract token from request
function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.substring(7);
  }
  
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
}

// Extract API key from request
function extractApiKey(req) {
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'];
  }
  
  if (req.headers.authorization && req.headers.authorization.startsWith('ApiKey ')) {
    return req.headers.authorization.substring(8);
  }
  
  if (req.query.api_key) {
    return req.query.api_key;
  }
  
  return null;
}

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate API key
export const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `rensto_${result}`;
};

// Role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
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

// Ownership check middleware
export const requireOwnership = (resourceTable, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({
          error: 'Resource ID required'
        });
      }
      
      const resource = await db.query(
        `SELECT * FROM ${resourceTable} WHERE ${resourceIdField} = $1`,
        [resourceId]
      );
      
      if (!resource.rows[0]) {
        return res.status(404).json({
          error: 'Resource not found'
        });
      }
      
      // Check if user owns the resource or is admin
      if (resource.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this resource'
        });
      }
      
      req.resource = resource.rows[0];
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };
};
