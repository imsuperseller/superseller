const { Pool } = require('pg');

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'app_db',
    password: 'a1efbcd564b928d3ef1d7cae',
    port: 5432,
});

async function setupTestData() {
    console.log('Setting up test data for Facebook marketplace bot...');
    
    try {
        // Update Miss Party job with proper image and video URLs
        await pool.query(`
            UPDATE fb_listings 
            SET 
                image_url = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
                phone_number = '+1-469-283-9855',
                status = 'queued',
                error_message = NULL
            WHERE id = 3
        `);
        
        console.log('✅ Updated Miss Party job with proper URLs');
        
        // Add a fresh UAD job with video
        await pool.query(`
            INSERT INTO fb_listings (
                unique_hash, client_id, status, product_name, size, color, price, listing_price,
                phone_number, location, listing_title, listing_description, 
                image_url, video_url, created_at, updated_at
            ) VALUES (
                'uad-test-fresh-' || EXTRACT(EPOCH FROM NOW()),
                'uad',
                'queued',
                '16x7 Classic Steel Garage Door',
                '16x7',
                'Gray',
                2500,
                2500,
                '+1-972-954-2407',
                'Dallas, Texas',
                '16x7 Classic Steel Garage Door - Professional Installation',
                'Premium Classic Steel garage door with professional installation. Clean, reliable, and built to last. Call for free quote and installation!',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
                'http://172.245.56.50/video.mp4',
                NOW(),
                NOW()
            )
        `);
        
        console.log('✅ Added fresh UAD job with video');
        
        // Add a fresh Miss Party job with video
        await pool.query(`
            INSERT INTO fb_listings (
                unique_hash, client_id, status, product_name, size, color, price, listing_price,
                phone_number, location, listing_title, listing_description, 
                image_url, video_url, created_at, updated_at
            ) VALUES (
                'missparty-test-fresh-' || EXTRACT(EPOCH FROM NOW()),
                'missparty',
                'queued',
                'White Bounce House 15x15',
                '15x15',
                'White',
                75,
                75,
                '+1-469-283-9855',
                'Dallas, Texas',
                'White Bounce House Rental - Perfect for Parties!',
                'Amazing 15x15 bounce house perfect for kids parties! Includes blower, setup, and pickup. Safe, clean, and tons of fun. Book today!',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
                'http://172.245.56.50/michal_video.mp4',
                NOW(),
                NOW()
            )
        `);
        
        console.log('✅ Added fresh Miss Party job with video');
        
        // Show current queued jobs
        const result = await pool.query(`
            SELECT client_id, listing_title, status, image_url, video_url
            FROM fb_listings 
            WHERE status = 'queued' 
            ORDER BY created_at DESC
        `);
        
        console.log('\n📋 Current queued jobs:');
        result.rows.forEach(row => {
            console.log(`  ${row.client_id}: ${row.listing_title}`);
            console.log(`    Image: ${row.image_url ? '✅ Yes' : '❌ No'}`);
            console.log(`    Video: ${row.video_url ? '✅ Yes' : '❌ No'}`);
            console.log('');
        });
        
        console.log('🎉 Test data setup complete!');
        
    } catch (error) {
        console.error('❌ Error setting up test data:', error);
    } finally {
        await pool.end();
    }
}

setupTestData();