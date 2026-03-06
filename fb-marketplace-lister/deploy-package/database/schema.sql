-- Facebook Marketplace Automation Database Schema
-- Using PostgreSQL instead of Firebase

CREATE DATABASE IF NOT EXISTS marketplace_automation;
USE marketplace_automation;

-- Main listings table
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    unique_hash VARCHAR(255) UNIQUE NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'queued',
    
    -- Product details
    product_name VARCHAR(255),
    product_type VARCHAR(100),
    collection VARCHAR(100),
    size VARCHAR(50),
    design VARCHAR(100),
    color VARCHAR(50),
    construction VARCHAR(255),
    
    -- Pricing (NUMERIC for decimal support, e.g. $49.99)
    price NUMERIC(10,2) DEFAULT 0,
    listing_price NUMERIC(10,2) DEFAULT 0,
    
    -- Location & Contact
    phone_number VARCHAR(20),
    location VARCHAR(100),
    
    -- Content
    listing_title VARCHAR(255),
    listing_description TEXT,
    
    -- Media URLs
    image_url TEXT,
    image_url2 TEXT,
    image_url3 TEXT,
    video_url TEXT,
    
    -- Miss Party specific
    rental_period VARCHAR(50),
    includes TEXT,
    delivery TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    scheduled_for TIMESTAMP,
    posted_at TIMESTAMP,
    error_message TEXT,
    
    INDEX idx_client_status (client_id, status),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);

-- Client configuration table
CREATE TABLE client_configs (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    profile_id VARCHAR(100),
    strategy VARCHAR(50),
    engine_type VARCHAR(50),
    
    -- Settings
    post_limit INTEGER DEFAULT 5,
    cooldown_minutes INTEGER DEFAULT 20,
    stealth_level VARCHAR(20) DEFAULT 'moderate',
    
    -- API endpoints
    get_jobs_url TEXT,
    update_status_url TEXT,
    
    -- Credentials (encrypted in production)
    fb_email VARCHAR(255),
    fb_pass VARCHAR(255),
    gologin_token TEXT,
    
    -- JSON fields for arrays
    phone_numbers JSON,
    locations JSON,
    
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Execution history table
CREATE TABLE execution_history (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id),
    client_id VARCHAR(50),
    execution_type VARCHAR(50),
    status VARCHAR(50),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    metadata JSON,
    
    INDEX idx_listing (listing_id),
    INDEX idx_client_exec (client_id, started_at)
);

-- Insert default client configurations
INSERT INTO client_configs (client_id, name, profile_id, strategy, engine_type, phone_numbers, locations, active)
VALUES 
    ('uad', 'Up & Down Garage Doors', '694b5e53fcacf3fe4b4ff79c', 'professional', 'kie_ai',
     '["<bunk>", "<bunk>", "<bunk>", "<bunk>"]',
     '["Dallas", "Fort Worth", "Plano", "Arlington", "Garland", "Frisco"]', FALSE),
    
    ('missparty', 'Miss Party Rentals', '6949a854f4994b150d430f37', 'fun_event', 'high_stealth',
     '["<bunk>"]',
     '["Dallas", "Richardson", "Garland", "Irving"]', FALSE);