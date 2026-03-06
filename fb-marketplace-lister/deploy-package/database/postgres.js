const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'marketplace_automation',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

/**
 * Queue a new listing
 */
async function queueListing(listing) {
    const query = `
        INSERT INTO fb_listings (
            unique_hash, client_id, status,
            product_name, product_type, collection, size, design, color, construction,
            price, listing_price,
            phone_number, location,
            listing_title, listing_description,
            image_url, image_url2, image_url3, video_url,
            rental_period, includes, delivery,
            scheduled_for
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24
        ) RETURNING id`;
    
    const values = [
        listing.uniqueHash || `${listing.clientId}-${Date.now()}`,
        listing.clientId,
        'queued',
        listing.productName,
        listing.productType,
        listing.collection,
        listing.size,
        listing.design,
        listing.color,
        listing.construction,
        listing.price,
        listing.listingPrice || listing.price,
        listing.phoneNumber,
        listing.location,
        listing.listingTitle,
        listing.listingDescription,
        listing.imageUrl,
        listing.imageUrl2,
        listing.imageUrl3,
        listing.videoUrl,
        listing.rentalPeriod,
        listing.includes,
        listing.delivery,
        listing.scheduledFor || new Date()
    ];
    
    try {
        const result = await pool.query(query, values);
        console.log('✅ Listing queued with ID:', result.rows[0].id);
        return result.rows[0].id;
    } catch (error) {
        console.error('❌ Error queueing listing:', error.message);
        throw error;
    }
}

/**
 * Get pending listings for processing
 */
async function getPendingListings(clientId = null, limit = 10) {
    let query = `
        SELECT * FROM fb_listings 
        WHERE status = 'queued'`;
    
    const values = [];
    if (clientId) {
        query += ' AND client_id = $1';
        values.push(clientId);
    }
    
    query += ` ORDER BY created_at ASC LIMIT ${limit}`;
    
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('❌ Error fetching pending listings:', error.message);
        return [];
    }
}

/**
 * Update listing status
 */
async function updateListingStatus(id, status, errorMessage = null) {
    const query = `
        UPDATE fb_listings 
        SET status = $2::text, 
            updated_at = CURRENT_TIMESTAMP,
            posted_at = CASE WHEN $2::text = 'posted' THEN CURRENT_TIMESTAMP ELSE posted_at END,
            error_message = $3
        WHERE id = $1
        RETURNING *`;
    
    try {
        const result = await pool.query(query, [id, status, errorMessage]);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Error updating listing status:', error.message);
        throw error;
    }
}

/**
 * Get client configuration
 */
async function getClientConfig(clientId) {
    const query = 'SELECT * FROM fb_client_configs WHERE client_id = $1';
    
    try {
        const result = await pool.query(query, [clientId]);
        if (result.rows.length > 0) {
            const config = result.rows[0];
            // Parse JSON fields
            config.phone_numbers = config.phone_numbers || [];
            config.locations = config.locations || [];
            return config;
        }
        return null;
    } catch (error) {
        console.error('❌ Error fetching client config:', error.message);
        return null;
    }
}

/**
 * Set client active status
 */
async function setClientActive(clientId, isActive) {
    const query = `
        UPDATE fb_client_configs 
        SET active = $2, updated_at = CURRENT_TIMESTAMP
        WHERE client_id = $1
        RETURNING *`;
    
    try {
        const result = await pool.query(query, [clientId, isActive]);
        if (result.rows.length > 0) {
            console.log(`✅ ${clientId} is now ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error('❌ Error updating client status:', error.message);
        return null;
    }
}

/**
 * Get active clients
 */
async function getActiveClients() {
    const query = 'SELECT * FROM fb_client_configs WHERE active = true';
    
    try {
        const result = await pool.query(query);
        return result.rows.map(config => {
            config.phone_numbers = config.phone_numbers || [];
            config.locations = config.locations || [];
            return config;
        });
    } catch (error) {
        console.error('❌ Error fetching active clients:', error.message);
        return [];
    }
}

/**
 * Log execution history
 */
async function logExecution(listingId, clientId, type, status, error = null, metadata = null) {
    const query = `
        INSERT INTO fb_execution_history (
            listing_id, client_id, execution_type, status, 
            error_message, metadata, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING id`;
    
    try {
        const result = await pool.query(query, [
            listingId, clientId, type, status, error,
            metadata ? JSON.stringify(metadata) : null
        ]);
        return result.rows[0].id;
    } catch (error) {
        console.error('❌ Error logging execution:', error.message);
        return null;
    }
}

/**
 * Get stats for a client
 */
async function getClientStats(clientId, days = 7) {
    const query = `
        SELECT 
            COUNT(CASE WHEN status = 'posted' THEN 1 END) as successful,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
            COUNT(CASE WHEN status = 'queued' THEN 1 END) as pending,
            COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today
        FROM fb_listings
        WHERE client_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'`;
    
    try {
        const result = await pool.query(query, [clientId]);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Error fetching client stats:', error.message);
        return { successful: 0, failed: 0, pending: 0, today: 0 };
    }
}

module.exports = {
    pool,
    queueListing,
    getPendingListings,
    updateListingStatus,
    getClientConfig,
    setClientActive,
    getActiveClients,
    logExecution,
    getClientStats
};