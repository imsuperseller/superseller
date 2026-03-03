-- CONTRACTOR DIRECTORY DATABASE SCHEMA
-- Optimized for Supabase deployment

-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contractors table (main data)
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    
    -- Quality Metrics
    total_score DECIMAL(2,1) CHECK (total_score >= 0 AND total_score <= 5),
    review_count INTEGER DEFAULT 0,
    
    -- Service Classification
    primary_service VARCHAR(100) NOT NULL,
    quality_tier VARCHAR(20) CHECK (quality_tier IN ('Premium', 'Standard', 'Basic')),
    
    -- Competitive Advantages
    offers_online_estimates BOOLEAN DEFAULT FALSE,
    pricing_transparency_score INTEGER DEFAULT 0 CHECK (pricing_transparency_score >= 0 AND pricing_transparency_score <= 100),
    verified_contact BOOLEAN DEFAULT FALSE,
    
    -- SEO and Discovery
    search_keywords TEXT[], -- For advanced search
    service_areas TEXT[], -- Geographic coverage
    
    -- Business Information
    years_in_business INTEGER,
    license_verified BOOLEAN DEFAULT FALSE,
    insurance_verified BOOLEAN DEFAULT FALSE,
    
    -- Lead Generation
    lead_count INTEGER DEFAULT 0,
    last_lead_date TIMESTAMP,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Search optimization
    search_vector tsvector
);

-- Indexes for fast searching
CREATE INDEX idx_contractors_city ON contractors(city);
CREATE INDEX idx_contractors_state ON contractors(state);
CREATE INDEX idx_contractors_primary_service ON contractors(primary_service);
CREATE INDEX idx_contractors_quality_tier ON contractors(quality_tier);
CREATE INDEX idx_contractors_total_score ON contractors(total_score);
CREATE INDEX idx_contractors_offers_estimates ON contractors(offers_online_estimates);
CREATE INDEX idx_contractors_search ON contractors USING gin(search_vector);
CREATE INDEX idx_contractors_active ON contractors(is_active) WHERE is_active = TRUE;

-- Update search vector function
CREATE OR REPLACE FUNCTION update_contractor_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.primary_service, '') || ' ' ||
        COALESCE(NEW.city, '') || ' ' ||
        COALESCE(NEW.state, '')
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector updates
CREATE TRIGGER update_contractor_search_vector_trigger
    BEFORE INSERT OR UPDATE ON contractors
    FOR EACH ROW
    EXECUTE FUNCTION update_contractor_search_vector();

-- Lead submissions table
CREATE TABLE lead_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    
    -- Project Details
    project_type VARCHAR(100),
    project_description TEXT,
    project_budget_range VARCHAR(50),
    project_timeline VARCHAR(50),
    project_location TEXT,
    
    -- Lead Quality Scoring
    lead_score INTEGER DEFAULT 0,
    lead_status VARCHAR(20) DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    
    -- Pricing
    lead_value DECIMAL(10,2) DEFAULT 100.00,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- Lead submissions indexes
CREATE INDEX idx_leads_contractor ON lead_submissions(contractor_id);
CREATE INDEX idx_leads_created_at ON lead_submissions(created_at);
CREATE INDEX idx_leads_status ON lead_submissions(lead_status);

-- Service categories lookup table
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default service categories
INSERT INTO service_categories (name, description, icon_name, sort_order) VALUES
    ('Kitchen Specialist', 'Kitchen remodeling and renovation experts', 'kitchen', 1),
    ('Bathroom Specialist', 'Bathroom renovation and remodeling professionals', 'bathroom', 2),
    ('General Contractor', 'Full-service construction and remodeling contractors', 'construction', 3),
    ('Roofing Specialist', 'Roofing installation, repair, and maintenance', 'roof', 4),
    ('HVAC Specialist', 'Heating, ventilation, and air conditioning services', 'hvac', 5);

-- Contractor reviews/ratings table (for future expansion)
CREATE TABLE contractor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
    
    customer_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    project_type VARCHAR(100),
    
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    is_published BOOLEAN DEFAULT TRUE
);

-- Admin users table (for directory management)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Analytics table (for tracking performance)
CREATE TABLE directory_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    
    -- Traffic metrics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    contractor_profile_views INTEGER DEFAULT 0,
    
    -- Lead metrics
    leads_generated INTEGER DEFAULT 0,
    lead_conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Revenue metrics
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index on date
CREATE UNIQUE INDEX idx_analytics_date ON directory_analytics(date);

-- Views for common queries

-- Active premium contractors view
CREATE VIEW premium_contractors AS
SELECT 
    id, title, website, phone, city, state, 
    total_score, review_count, primary_service,
    offers_online_estimates, pricing_transparency_score
FROM contractors 
WHERE is_active = TRUE AND quality_tier = 'Premium'
ORDER BY total_score DESC, review_count DESC;

-- Lead generation summary view
CREATE VIEW lead_summary AS
SELECT 
    c.id,
    c.title,
    c.primary_service,
    c.city,
    c.state,
    COUNT(l.id) as total_leads,
    COUNT(CASE WHEN l.lead_status = 'converted' THEN 1 END) as converted_leads,
    SUM(l.lead_value) as total_lead_value
FROM contractors c
LEFT JOIN lead_submissions l ON c.id = l.contractor_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.title, c.primary_service, c.city, c.state;

-- Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;

-- Public can read active contractors
CREATE POLICY "Public contractors are viewable" ON contractors
    FOR SELECT USING (is_active = TRUE);

-- Only authenticated users can submit leads
CREATE POLICY "Authenticated users can submit leads" ON lead_submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admins can do everything
CREATE POLICY "Admins can manage contractors" ON contractors
    FOR ALL USING (auth.role() = 'admin');

-- Functions for business logic

-- Function to increment lead count
CREATE OR REPLACE FUNCTION increment_lead_count(contractor_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE contractors 
    SET 
        lead_count = lead_count + 1,
        last_lead_date = NOW()
    WHERE id = contractor_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate pricing transparency score
CREATE OR REPLACE FUNCTION calculate_transparency_score(contractor_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    contractor_record contractors%ROWTYPE;
BEGIN
    SELECT * INTO contractor_record FROM contractors WHERE id = contractor_uuid;
    
    -- Base score for online estimates
    IF contractor_record.offers_online_estimates THEN
        score := score + 40;
    END IF;
    
    -- Score for verified contact info
    IF contractor_record.verified_contact THEN
        score := score + 20;
    END IF;
    
    -- Score for license verification
    IF contractor_record.license_verified THEN
        score := score + 20;
    END IF;
    
    -- Score for insurance verification
    IF contractor_record.insurance_verified THEN
        score := score + 20;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Sample data loading (uncomment to load test data)
/*
INSERT INTO contractors (
    title, website, phone, address, city, state, postal_code,
    total_score, review_count, primary_service, quality_tier,
    offers_online_estimates, verified_contact
) VALUES
    ('Teamwork Home Designs', 'https://teamworkhomedesigns.com/', '(512) 757-3760', 
     '8101 Cameron Rd #210', 'Austin', 'TX', '78754', 
     5.0, 165, 'Kitchen Specialist', 'Premium', TRUE, TRUE),
    
    ('ATX Construction & Remodeling', 'https://atxconstructions.com/', '(737) 510-4833',
     '7600 Chevy Chase Dr Bldg. 2, Suite 300', 'Austin', 'TX', '78752',
     5.0, 81, 'Kitchen Specialist', 'Premium', FALSE, TRUE);
*/

-- Create initial admin user (password should be hashed in real implementation)
-- INSERT INTO admin_users (email, password_hash, name) VALUES 
--     ('admin@contractordirectory.com', '$2b$12$...', 'Directory Admin');

COMMENT ON TABLE contractors IS 'Main contractor directory listings';
COMMENT ON TABLE lead_submissions IS 'Customer leads submitted to contractors';
COMMENT ON TABLE service_categories IS 'Available service categories for classification';
COMMENT ON TABLE directory_analytics IS 'Daily analytics and performance metrics';