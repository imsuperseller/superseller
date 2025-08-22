import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/connection.js';
import { logger } from '../utils/logger.js';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import QRCode from 'qrcode';

const router = express.Router();

// Generate short code utility
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create short link
router.post('/create', [
  body('original_url').isURL().withMessage('Valid URL is required'),
  body('campaign_id').optional().isInt().withMessage('Campaign ID must be a number'),
  body('title').optional().isString().trim().isLength({ max: 255 }),
  body('description').optional().isString().trim(),
  body('custom_domain').optional().isString().trim(),
  body('expires_at').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const {
    original_url,
    campaign_id,
    title,
    description,
    custom_domain,
    expires_at
  } = req.body;

  // Generate unique short code
  let shortCode;
  let attempts = 0;
  const maxAttempts = 10;
  let existing;

  do {
    shortCode = generateShortCode();
    existing = await db.query('SELECT id FROM short_links WHERE short_code = $1', [shortCode]);
    attempts++;

    if (attempts > maxAttempts) {
      throw new Error('Unable to generate unique short code');
    }
  } while (existing.rows.length > 0);

  // Create short link
  const shortLink = await db.query(
    `INSERT INTO short_links 
     (original_url, short_code, campaign_id, title, description, custom_domain, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [original_url, shortCode, campaign_id, title, description, custom_domain, expires_at]
  );

  // Generate QR code
  const qrCodeDataURL = await QRCode.toDataURL(`${process.env.BASE_URL || 'http://localhost:3000'}/p/${shortCode}`);

  logger.info('Short link created:', { shortCode, original_url });

  res.status(201).json({
    success: true,
    data: {
      ...shortLink.rows[0],
      qr_code: qrCodeDataURL,
      short_url: `${process.env.BASE_URL || 'http://localhost:3000'}/p/${shortCode}`
    }
  });
}));

// Get short link by code
router.get('/:shortCode', asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const shortLink = await db.query(
    'SELECT * FROM short_links WHERE short_code = $1 AND is_active = true',
    [shortCode]
  );

  if (!shortLink.rows[0]) {
    throw new NotFoundError('Short link not found');
  }

  // Check if expired
  if (shortLink.rows[0].expires_at && new Date() > new Date(shortLink.rows[0].expires_at)) {
    throw new NotFoundError('Short link has expired');
  }

  res.json({
    success: true,
    data: {
      ...shortLink.rows[0],
      short_url: `${process.env.BASE_URL || 'http://localhost:3000'}/p/${shortCode}`
    }
  });
}));

// Get short link analytics
router.get('/:shortCode/analytics', asyncHandler(async (req, res) => {
  const { shortCode } = req.params;
  const { period = '7d' } = req.query;

  const shortLink = await db.query(
    'SELECT * FROM short_links WHERE short_code = $1',
    [shortCode]
  );

  if (!shortLink.rows[0]) {
    throw new NotFoundError('Short link not found');
  }

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get analytics data
  const analytics = await db.query(
    `SELECT 
       event_type,
       COUNT(*) as count,
       DATE(timestamp) as date
     FROM analytics_events 
     WHERE short_link_id = $1 
       AND timestamp >= $2
     GROUP BY event_type, DATE(timestamp)
     ORDER BY date DESC, event_type`,
    [shortLink.rows[0].id, startDate]
  );

  // Get top referrers
  const referrers = await db.query(
    `SELECT 
       referrer,
       COUNT(*) as count
     FROM analytics_events 
     WHERE short_link_id = $1 
       AND timestamp >= $2
       AND referrer IS NOT NULL
     GROUP BY referrer
     ORDER BY count DESC
     LIMIT 10`,
    [shortLink.rows[0].id, startDate]
  );

  // Get UTM data
  const utmData = await db.query(
    `SELECT 
       utm_source,
       utm_medium,
       utm_campaign,
       COUNT(*) as count
     FROM analytics_events 
     WHERE short_link_id = $1 
       AND timestamp >= $2
       AND (utm_source IS NOT NULL OR utm_medium IS NOT NULL OR utm_campaign IS NOT NULL)
     GROUP BY utm_source, utm_medium, utm_campaign
     ORDER BY count DESC`,
    [shortLink.rows[0].id, startDate]
  );

  res.json({
    success: true,
    data: {
      short_link: shortLink.rows[0],
      analytics: analytics.rows,
      referrers: referrers.rows,
      utm_data: utmData.rows,
      period,
      total_clicks: shortLink.rows[0].clicks,
      total_conversions: shortLink.rows[0].conversions
    }
  });
}));

// Update short link
router.put('/:shortCode', [
  body('title').optional().isString().trim().isLength({ max: 255 }),
  body('description').optional().isString().trim(),
  body('is_active').optional().isBoolean(),
  body('expires_at').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { shortCode } = req.params;
  const updateData = req.body;

  const shortLink = await db.query(
    'SELECT * FROM short_links WHERE short_code = $1',
    [shortCode]
  );

  if (!shortLink.rows[0]) {
    throw new NotFoundError('Short link not found');
  }

  // Update short link
  const updatedShortLink = await db.query(
    `UPDATE short_links 
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         is_active = COALESCE($3, is_active),
         expires_at = COALESCE($4, expires_at),
         updated_at = NOW()
     WHERE short_code = $5
     RETURNING *`,
    [
      updateData.title,
      updateData.description,
      updateData.is_active,
      updateData.expires_at,
      shortCode
    ]
  );

  logger.info('Short link updated:', { shortCode, updates: updateData });

  res.json({
    success: true,
    data: updatedShortLink.rows[0]
  });
}));

// Delete short link
router.delete('/:shortCode', asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const result = await db.query(
    'DELETE FROM short_links WHERE short_code = $1 RETURNING id',
    [shortCode]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Short link not found');
  }

  logger.info('Short link deleted:', { shortCode });

  res.json({
    success: true,
    message: 'Short link deleted successfully'
  });
}));

// Bulk create short links
router.post('/bulk', [
  body('links').isArray({ min: 1, max: 100 }).withMessage('Links array is required with 1-100 items'),
  body('links.*.original_url').isURL().withMessage('Valid URL is required for each link'),
  body('links.*.title').optional().isString().trim().isLength({ max: 255 }),
  body('links.*.description').optional().isString().trim(),
  body('campaign_id').optional().isInt().withMessage('Campaign ID must be a number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { links, campaign_id } = req.body;
  const createdLinks = [];

  for (const link of links) {
    // Generate unique short code
    let shortCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = generateShortCode();
      const existing = await db.query('SELECT id FROM short_links WHERE short_code = $1', [shortCode]);
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique short code');
      }
    } while (existing.rows.length > 0);

    // Create short link
    const shortLink = await db.query(
      `INSERT INTO short_links 
       (original_url, short_code, campaign_id, title, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [link.original_url, shortCode, campaign_id, link.title, link.description]
    );

    createdLinks.push({
      ...shortLink.rows[0],
      short_url: `${process.env.BASE_URL || 'http://localhost:3000'}/p/${shortCode}`
    });
  }

  logger.info('Bulk short links created:', { count: createdLinks.length });

  res.status(201).json({
    success: true,
    data: createdLinks
  });
}));

// Get QR code for short link
router.get('/:shortCode/qr', asyncHandler(async (req, res) => {
  const { shortCode } = req.params;
  const { size = 200, format = 'png' } = req.query;

  const shortLink = await db.query(
    'SELECT * FROM short_links WHERE short_code = $1 AND is_active = true',
    [shortCode]
  );

  if (!shortLink.rows[0]) {
    throw new NotFoundError('Short link not found');
  }

  const url = `${process.env.BASE_URL || 'http://localhost:3000'}/p/${shortCode}`;

  let qrCode;
  if (format === 'svg') {
    qrCode = await QRCode.toString(url, {
      type: 'svg',
      width: parseInt(size),
      margin: 2
    });
    res.setHeader('Content-Type', 'image/svg+xml');
  } else {
    qrCode = await QRCode.toBuffer(url, {
      width: parseInt(size),
      margin: 2
    });
    res.setHeader('Content-Type', 'image/png');
  }

  res.send(qrCode);
}));

export default router;
