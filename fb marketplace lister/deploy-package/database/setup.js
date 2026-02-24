#!/usr/bin/env node
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function setupDatabase() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    });

    try {
        console.log('🔗 Connecting to PostgreSQL...');
        await client.connect();
        
        console.log('📋 Running database initialization...');
        const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        
        await client.query(sql);
        
        console.log('✅ Database tables created successfully!');
        
        // Check if tables exist
        const checkQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'fb_%'
            ORDER BY table_name;
        `;
        
        const result = await client.query(checkQuery);
        console.log('\n📊 Created tables:');
        result.rows.forEach(row => {
            console.log(`   • ${row.table_name}`);
        });
        
        // Check client configs
        const configCheck = await client.query('SELECT client_id, name, active FROM fb_client_configs');
        console.log('\n👥 Client configurations:');
        configCheck.rows.forEach(row => {
            console.log(`   • ${row.name} (${row.client_id}): ${row.active ? '✅ Active' : '⏸️ Inactive'}`);
        });
        
    } catch (error) {
        console.error('❌ Database setup error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✨ Database setup complete!');
    }
}

setupDatabase();