-- =====================================================
-- RENSTO CENTRALIZED LOGGING DATABASE SCHEMA
-- Production-Ready Workflow Monitoring System
-- =====================================================

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE rensto_logging;

-- Connect to the logging database
-- \c rensto_logging;

-- =====================================================
-- CORE LOGGING TABLES
-- =====================================================

-- 1. WORKFLOW EXECUTIONS TABLE
-- Tracks every workflow execution with key metrics
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(255),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'success', 'error', 'cancelled', 'timeout')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    error_message TEXT,
    error_type VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    triggered_by VARCHAR(100), -- webhook, schedule, manual, api
    trigger_data JSONB,
    environment VARCHAR(50) DEFAULT 'production', -- production, staging, development
    version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PAYLOAD EVENTS TABLE
-- Tracks data flow through workflows
CREATE TABLE IF NOT EXISTS payload_events (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES workflow_executions(execution_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- received, validated, processed, transformed, sent
    event_stage VARCHAR(100) NOT NULL, -- trigger, validation, processing, action, response
    payload_data JSONB,
    payload_size_bytes INTEGER,
    validation_status VARCHAR(50), -- valid, invalid, warning
    validation_errors JSONB,
    processing_status VARCHAR(50), -- pending, processing, completed, failed
    processing_errors JSONB,
    transformation_applied JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ERROR EVENTS TABLE
-- Detailed error tracking and analysis
CREATE TABLE IF NOT EXISTS error_events (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES workflow_executions(execution_id) ON DELETE CASCADE,
    error_type VARCHAR(100) NOT NULL, -- validation, processing, api, network, timeout, auth
    error_category VARCHAR(100) NOT NULL, -- critical, warning, info
    error_code VARCHAR(50),
    error_message TEXT NOT NULL,
    error_details JSONB,
    stack_trace TEXT,
    node_id VARCHAR(255),
    node_name VARCHAR(255),
    node_type VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    resolution_status VARCHAR(50) DEFAULT 'unresolved', -- unresolved, resolved, ignored, escalated
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PERFORMANCE METRICS TABLE
-- System performance and resource usage tracking
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES workflow_executions(execution_id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- execution_time, memory_usage, cpu_usage, api_calls, data_processed
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50), -- ms, bytes, percent, count, mb
    node_id VARCHAR(255),
    node_name VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 5. API CALLS TABLE
-- External API usage tracking and cost monitoring
CREATE TABLE IF NOT EXISTS api_calls (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES workflow_executions(execution_id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL, -- openai, tavily, firecrawl, airtable, etc.
    endpoint VARCHAR(255),
    method VARCHAR(10), -- GET, POST, PUT, DELETE
    status_code INTEGER,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    cost_usd DECIMAL(10,6),
    tokens_used INTEGER,
    rate_limit_remaining INTEGER,
    rate_limit_reset TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BUSINESS METRICS TABLE
-- Business-specific KPIs and success metrics
CREATE TABLE IF NOT EXISTS business_metrics (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) NOT NULL REFERENCES workflow_executions(execution_id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- leads_generated, emails_sent, documents_processed, revenue_impact
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50), -- count, usd, percent
    customer_impact VARCHAR(100), -- high, medium, low
    business_value DECIMAL(10,2), -- estimated business value in USD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Workflow executions indexes
CREATE INDEX IF NOT EXISTS idx_workflow_executions_customer_id ON workflow_executions(customer_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_environment ON workflow_executions(environment);

-- Payload events indexes
CREATE INDEX IF NOT EXISTS idx_payload_events_execution_id ON payload_events(execution_id);
CREATE INDEX IF NOT EXISTS idx_payload_events_event_type ON payload_events(event_type);
CREATE INDEX IF NOT EXISTS idx_payload_events_event_stage ON payload_events(event_stage);
CREATE INDEX IF NOT EXISTS idx_payload_events_created_at ON payload_events(created_at);

-- Error events indexes
CREATE INDEX IF NOT EXISTS idx_error_events_execution_id ON error_events(execution_id);
CREATE INDEX IF NOT EXISTS idx_error_events_error_type ON error_events(error_type);
CREATE INDEX IF NOT EXISTS idx_error_events_error_category ON error_events(error_category);
CREATE INDEX IF NOT EXISTS idx_error_events_resolution_status ON error_events(resolution_status);
CREATE INDEX IF NOT EXISTS idx_error_events_created_at ON error_events(created_at);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_execution_id ON performance_metrics(execution_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- API calls indexes
CREATE INDEX IF NOT EXISTS idx_api_calls_execution_id ON api_calls(execution_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_service_name ON api_calls(service_name);
CREATE INDEX IF NOT EXISTS idx_api_calls_status_code ON api_calls(status_code);
CREATE INDEX IF NOT EXISTS idx_api_calls_created_at ON api_calls(created_at);

-- Business metrics indexes
CREATE INDEX IF NOT EXISTS idx_business_metrics_execution_id ON business_metrics(execution_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_metric_type ON business_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_business_metrics_created_at ON business_metrics(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for workflow_executions
CREATE TRIGGER update_workflow_executions_updated_at 
    BEFORE UPDATE ON workflow_executions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- 1. EXECUTIVE DASHBOARD VIEW
CREATE OR REPLACE VIEW executive_dashboard AS
SELECT 
    DATE_TRUNC('day', started_at) as date,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_executions,
    ROUND(AVG(execution_time_ms), 2) as avg_execution_time_ms,
    ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate_percent,
    COUNT(DISTINCT customer_id) as active_customers,
    COUNT(DISTINCT workflow_id) as active_workflows
FROM workflow_executions
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', started_at)
ORDER BY date DESC;

-- 2. CUSTOMER PERFORMANCE VIEW
CREATE OR REPLACE VIEW customer_performance AS
SELECT 
    customer_id,
    customer_name,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_executions,
    ROUND(AVG(execution_time_ms), 2) as avg_execution_time_ms,
    ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate_percent,
    MAX(started_at) as last_execution,
    COUNT(DISTINCT workflow_id) as workflow_count
FROM workflow_executions
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY customer_id, customer_name
ORDER BY total_executions DESC;

-- 3. ERROR ANALYSIS VIEW
CREATE OR REPLACE VIEW error_analysis AS
SELECT 
    ee.error_type,
    ee.error_category,
    COUNT(*) as error_count,
    COUNT(DISTINCT ee.execution_id) as affected_executions,
    COUNT(DISTINCT we.customer_id) as affected_customers,
    COUNT(CASE WHEN ee.resolution_status = 'resolved' THEN 1 END) as resolved_count,
    COUNT(CASE WHEN ee.resolution_status = 'unresolved' THEN 1 END) as unresolved_count,
    ROUND(AVG(ee.retry_count), 2) as avg_retry_count,
    MAX(ee.created_at) as last_occurrence
FROM error_events ee
JOIN workflow_executions we ON ee.execution_id = we.execution_id
WHERE ee.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ee.error_type, ee.error_category
ORDER BY error_count DESC;

-- 4. API USAGE VIEW
CREATE OR REPLACE VIEW api_usage_summary AS
SELECT 
    service_name,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as successful_calls,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_calls,
    ROUND(AVG(response_time_ms), 2) as avg_response_time_ms,
    ROUND(SUM(cost_usd), 4) as total_cost_usd,
    ROUND(SUM(tokens_used), 0) as total_tokens_used,
    MAX(created_at) as last_call
FROM api_calls
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY service_name
ORDER BY total_cost_usd DESC;

-- 5. PERFORMANCE TRENDS VIEW
CREATE OR REPLACE VIEW performance_trends AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    metric_type,
    ROUND(AVG(metric_value), 2) as avg_value,
    ROUND(MAX(metric_value), 2) as max_value,
    ROUND(MIN(metric_value), 2) as min_value,
    COUNT(*) as sample_count
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', timestamp), metric_type
ORDER BY hour DESC, metric_type;

-- =====================================================
-- FUNCTIONS FOR LOGGING OPERATIONS
-- =====================================================

-- Function to log workflow execution start
CREATE OR REPLACE FUNCTION log_workflow_start(
    p_execution_id VARCHAR(255),
    p_workflow_id VARCHAR(255),
    p_workflow_name VARCHAR(255),
    p_customer_id VARCHAR(255),
    p_customer_name VARCHAR(255),
    p_triggered_by VARCHAR(100),
    p_trigger_data JSONB DEFAULT NULL,
    p_environment VARCHAR(50) DEFAULT 'production'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO workflow_executions (
        execution_id, workflow_id, workflow_name, customer_id, customer_name,
        status, triggered_by, trigger_data, environment
    ) VALUES (
        p_execution_id, p_workflow_id, p_workflow_name, p_customer_id, p_customer_name,
        'running', p_triggered_by, p_trigger_data, p_environment
    );
END;
$$ LANGUAGE plpgsql;

-- Function to log workflow execution completion
CREATE OR REPLACE FUNCTION log_workflow_completion(
    p_execution_id VARCHAR(255),
    p_status VARCHAR(50),
    p_error_message TEXT DEFAULT NULL,
    p_error_type VARCHAR(100) DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_started_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get start time
    SELECT started_at INTO v_started_at 
    FROM workflow_executions 
    WHERE execution_id = p_execution_id;
    
    -- Update execution record
    UPDATE workflow_executions 
    SET 
        status = p_status,
        completed_at = NOW(),
        execution_time_ms = EXTRACT(EPOCH FROM (NOW() - v_started_at)) * 1000,
        error_message = p_error_message,
        error_type = p_error_type,
        updated_at = NOW()
    WHERE execution_id = p_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log error event
CREATE OR REPLACE FUNCTION log_error_event(
    p_execution_id VARCHAR(255),
    p_error_type VARCHAR(100),
    p_error_category VARCHAR(100),
    p_error_message TEXT,
    p_error_details JSONB DEFAULT NULL,
    p_node_id VARCHAR(255) DEFAULT NULL,
    p_node_name VARCHAR(255) DEFAULT NULL,
    p_node_type VARCHAR(100) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO error_events (
        execution_id, error_type, error_category, error_message,
        error_details, node_id, node_name, node_type
    ) VALUES (
        p_execution_id, p_error_type, p_error_category, p_error_message,
        p_error_details, p_node_id, p_node_name, p_node_type
    );
END;
$$ LANGUAGE plpgsql;

-- Function to log API call
CREATE OR REPLACE FUNCTION log_api_call(
    p_execution_id VARCHAR(255),
    p_service_name VARCHAR(100),
    p_endpoint VARCHAR(255),
    p_method VARCHAR(10),
    p_status_code INTEGER,
    p_response_time_ms INTEGER,
    p_request_size_bytes INTEGER DEFAULT NULL,
    p_response_size_bytes INTEGER DEFAULT NULL,
    p_cost_usd DECIMAL(10,6) DEFAULT NULL,
    p_tokens_used INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO api_calls (
        execution_id, service_name, endpoint, method, status_code,
        response_time_ms, request_size_bytes, response_size_bytes,
        cost_usd, tokens_used, error_message
    ) VALUES (
        p_execution_id, p_service_name, p_endpoint, p_method, p_status_code,
        p_response_time_ms, p_request_size_bytes, p_response_size_bytes,
        p_cost_usd, p_tokens_used, p_error_message
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample workflow execution
INSERT INTO workflow_executions (
    execution_id, workflow_id, workflow_name, customer_id, customer_name,
    status, triggered_by, environment
) VALUES (
    'test-exec-001', 'wf-001', 'Lead Processing Workflow', 'customer-001', 'Ben Ginati',
    'success', 'webhook', 'production'
) ON CONFLICT (execution_id) DO NOTHING;

-- Insert sample payload event
INSERT INTO payload_events (
    execution_id, event_type, event_stage, payload_data, validation_status, processing_status
) VALUES (
    'test-exec-001', 'received', 'trigger', '{"name": "John Doe", "email": "john@example.com"}', 'valid', 'completed'
) ON CONFLICT DO NOTHING;

-- Insert sample error event
INSERT INTO error_events (
    execution_id, error_type, error_category, error_message, node_id, node_name, node_type
) VALUES (
    'test-exec-001', 'validation', 'warning', 'Email format validation warning', 'node-001', 'Email Validator', 'n8n-nodes-base.code'
) ON CONFLICT DO NOTHING;

-- Insert sample API call
INSERT INTO api_calls (
    execution_id, service_name, endpoint, method, status_code, response_time_ms, cost_usd
) VALUES (
    'test-exec-001', 'openai', '/v1/chat/completions', 'POST', 200, 1500, 0.0025
) ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Create logging user (run as superuser)
-- CREATE USER rensto_logging_user WITH PASSWORD 'secure_password_here';

-- Grant permissions
-- GRANT CONNECT ON DATABASE rensto_logging TO rensto_logging_user;
-- GRANT USAGE ON SCHEMA public TO rensto_logging_user;
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO rensto_logging_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rensto_logging_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO rensto_logging_user;

-- =====================================================
-- MAINTENANCE PROCEDURES
-- =====================================================

-- Function to clean up old logs (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_logs(retention_days INTEGER DEFAULT 90)
RETURNS VOID AS $$
BEGIN
    -- Delete old workflow executions and cascade to related tables
    DELETE FROM workflow_executions 
    WHERE started_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Log cleanup operation
    INSERT INTO workflow_executions (
        execution_id, workflow_id, workflow_name, customer_id, customer_name,
        status, triggered_by, environment
    ) VALUES (
        'cleanup-' || EXTRACT(EPOCH FROM NOW())::TEXT, 'cleanup', 'Log Cleanup', 'system', 'System',
        'success', 'schedule', 'production'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'RENSTO CENTRALIZED LOGGING DATABASE SCHEMA CREATED';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tables created: 6';
    RAISE NOTICE 'Indexes created: 20+';
    RAISE NOTICE 'Views created: 5';
    RAISE NOTICE 'Functions created: 6';
    RAISE NOTICE 'Sample data inserted for testing';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create database user and grant permissions';
    RAISE NOTICE '2. Test connections and functions';
    RAISE NOTICE '3. Implement logging middleware';
    RAISE NOTICE '4. Set up monitoring and alerting';
    RAISE NOTICE '=====================================================';
END $$;
