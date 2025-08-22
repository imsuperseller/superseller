import { logger } from '../utils/logger.js';

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'The provided ID is not valid'
    });
  }

  if (err.code === '23505') { // PostgreSQL unique constraint violation
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'A record with this information already exists'
    });
  }

  if (err.code === '23503') { // PostgreSQL foreign key constraint violation
    return res.status(400).json({
      error: 'Reference Error',
      message: 'Cannot delete this record as it is referenced by other records'
    });
  }

  if (err.code === '42P01') { // PostgreSQL undefined table
    return res.status(500).json({
      error: 'Database Error',
      message: 'Table not found'
    });
  }

  if (err.code === '42703') { // PostgreSQL undefined column
    return res.status(500).json({
      error: 'Database Error',
      message: 'Column not found'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

// Validation error class
export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.statusCode = 400;
    this.details = details;
    this.name = 'ValidationError';
  }
}

// Not found error class
export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

// Unauthorized error class
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.statusCode = 401;
    this.name = 'UnauthorizedError';
  }
}

// Forbidden error class
export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.statusCode = 403;
    this.name = 'ForbiddenError';
  }
}

// Conflict error class
export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message);
    this.statusCode = 409;
    this.name = 'ConflictError';
  }
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body);
      
      if (error) {
        throw new ValidationError(error.details[0].message, error.details);
      }
      
      req.validatedBody = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limit exceeded handler
export const rateLimitExceeded = (req, res) => {
  res.status(429).json({
    error: 'Rate Limit Exceeded',
    message: 'Too many requests from this IP, please try again later',
    retryAfter: req.rateLimit.resetTime
  });
};

// Not found handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};
