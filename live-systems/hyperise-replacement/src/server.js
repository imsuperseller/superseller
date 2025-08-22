#!/usr/bin/env node

/**
 * HYPERISE REPLACEMENT API SERVER
 * Custom landing page personalization system with n8n/Make.com integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import winston from 'winston';

// Import middleware and routes
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { logger } from './utils/logger.js';
import { db } from './database/connection.js';

// Import route handlers
import shortLinkRoutes from './routes/shortLinks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure logging
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
logger.level = logLevel;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://rensto.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Speed limiting
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/short-links', shortLinkRoutes); // Public access for redirects

// Public landing page rendering
app.get('/p/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { name, email, company, utm_source, utm_medium, utm_campaign } = req.query;

    // Get short link data
    const shortLink = await db.query(
      'SELECT * FROM short_links WHERE short_code = $1 AND is_active = true',
      [shortCode]
    );

    if (!shortLink.rows[0]) {
      return res.status(404).send('Page not found');
    }

    // Get campaign and template data
    const campaign = await db.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [shortLink.rows[0].campaign_id]
    );

    if (!campaign.rows[0] || campaign.rows[0].status !== 'active') {
      return res.status(404).send('Campaign not active');
    }

    const template = await db.query(
      'SELECT * FROM templates WHERE id = $1',
      [campaign.rows[0].template_id]
    );

    if (!template.rows[0]) {
      return res.status(404).send('Template not found');
    }

    // Track view event
    await db.query(
      `INSERT INTO analytics_events 
       (campaign_id, short_link_id, event_type, user_data, utm_source, utm_medium, utm_campaign, session_id, ip_address, user_agent, referrer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        campaign.rows[0].id,
        shortLink.rows[0].id,
        'view',
        JSON.stringify({ name, email, company }),
        utm_source,
        utm_medium,
        utm_campaign,
        req.sessionID || 'anonymous',
        req.ip,
        req.get('User-Agent'),
        req.get('Referrer')
      ]
    );

    // Update click count
    await db.query(
      'UPDATE short_links SET clicks = clicks + 1 WHERE id = $1',
      [shortLink.rows[0].id]
    );

    // Render personalized landing page
    const personalizedContent = personalizeContent(template.rows[0].content, {
      name: name || 'there',
      email: email || '',
      company: company || ''
    });

    res.send(generateLandingPageHTML(personalizedContent, shortLink.rows[0]));

  } catch (error) {
    logger.error('Error rendering landing page:', error);
    res.status(500).send('Internal server error');
  }
});

// Personalize content with user data
function personalizeContent(content, userData) {
  let personalized = JSON.stringify(content);

  // Replace variables with user data
  Object.keys(userData).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'gi');
    personalized = personalized.replace(regex, userData[key] || '');
  });

  return JSON.parse(personalized);
}

// Generate HTML for landing page
function generateLandingPageHTML(content, shortLink) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${shortLink.title || 'Personalized Landing Page'}</title>
    <meta name="description" content="${shortLink.description || ''}">
    <meta property="og:title" content="${shortLink.title || 'Personalized Landing Page'}">
    <meta property="og:description" content="${shortLink.description || ''}">
    <meta property="og:image" content="${shortLink.image_url || ''}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hero { text-align: center; padding: 60px 20px; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; color: #333; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; color: #666; }
        .cta-button { 
            display: inline-block; 
            padding: 15px 30px; 
            background: #fe3d51; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            transition: background 0.3s;
        }
        .cta-button:hover { background: #e03547; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>${content.title || 'Welcome!'}</h1>
            <p>${content.subtitle || 'Thank you for visiting our personalized page.'}</p>
            <a href="${shortLink.original_url}" class="cta-button" onclick="trackClick()">
                ${content.cta || 'Get Started'}
            </a>
        </div>
    </div>
    
    <script>
        function trackClick() {
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    short_link_id: '${shortLink.id}',
                    event_type: 'click',
                    user_data: ${JSON.stringify({
    name: content.name || '',
    email: content.email || '',
    company: content.company || ''
  })}
                })
            });
        }
    </script>
</body>
</html>`;
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('Database connection established');

    app.listen(PORT, () => {
      logger.info(`🚀 Hyperise Replacement API server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await db.end();
  process.exit(0);
});

// Start the server
startServer();
