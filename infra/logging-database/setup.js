// =====================================================
// RENSTO LOGGING DATABASE SETUP SCRIPT
// Automated database initialization and configuration
// =====================================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class LoggingDatabaseSetup {
    constructor() {
        this.setupConfig = {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || 5432,
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'password',
            database: 'postgres' // Connect to default database first
        };
    }

    async setup() {
        console.log('🚀 Starting SuperSeller AI Logging Database Setup...\n');

        try {
            // Step 1: Create database
            await this.createDatabase();
            
            // Step 2: Create user and grant permissions
            await this.createUser();
            
            // Step 3: Run schema migration
            await this.runSchemaMigration();
            
            // Step 4: Insert sample data
            await this.insertSampleData();
            
            // Step 5: Test connection
            await this.testConnection();
            
            // Step 6: Create environment file
            await this.createEnvironmentFile();
            
            console.log('\n✅ SuperSeller AI Logging Database Setup Complete!');
            console.log('📊 Database: superseller_logging');
            console.log('👤 User: superseller_logging_user');
            console.log('🔗 Connection string: postgresql://superseller_logging_user:secure_password_here@localhost:5432/superseller_logging');
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async createDatabase() {
        console.log('📦 Creating database...');
        
        const pool = new Pool(this.setupConfig);
        
        try {
            // Check if database exists
            const result = await pool.query(
                "SELECT 1 FROM pg_database WHERE datname = 'superseller_logging'"
            );
            
            if (result.rows.length === 0) {
                await pool.query('CREATE DATABASE superseller_logging');
                console.log('✅ Database "superseller_logging" created');
            } else {
                console.log('ℹ️  Database "superseller_logging" already exists');
            }
            
        } finally {
            await pool.end();
        }
    }

    async createUser() {
        console.log('👤 Creating database user...');
        
        const pool = new Pool(this.setupConfig);
        
        try {
            // Check if user exists
            const result = await pool.query(
                "SELECT 1 FROM pg_roles WHERE rolname = 'superseller_logging_user'"
            );
            
            if (result.rows.length === 0) {
                await pool.query(`
                    CREATE USER superseller_logging_user 
                    WITH PASSWORD 'secure_password_here'
                `);
                console.log('✅ User "superseller_logging_user" created');
            } else {
                console.log('ℹ️  User "superseller_logging_user" already exists');
            }
            
            // Grant permissions
            await pool.query('GRANT CONNECT ON DATABASE superseller_logging TO superseller_logging_user');
            await pool.query('GRANT USAGE ON SCHEMA public TO superseller_logging_user');
            await pool.query('GRANT CREATE ON SCHEMA public TO superseller_logging_user');
            
            console.log('✅ Permissions granted to user');
            
        } finally {
            await pool.end();
        }
    }

    async runSchemaMigration() {
        console.log('📋 Running schema migration...');
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        let schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Replace CREATE TRIGGER with CREATE OR REPLACE TRIGGER to handle existing triggers
        schemaSQL = schemaSQL.replace(/CREATE TRIGGER/g, 'CREATE OR REPLACE TRIGGER');
        
        const pool = new Pool({
            ...this.setupConfig,
            database: 'superseller_logging'
        });
        
        try {
            await pool.query(schemaSQL);
            console.log('✅ Schema migration completed');
        } catch (error) {
            // If triggers already exist, try to drop and recreate them
            if (error.message.includes('already exists')) {
                console.log('ℹ️  Some objects already exist, attempting to recreate...');
                try {
                    await pool.query('DROP TRIGGER IF EXISTS update_workflow_executions_updated_at ON workflow_executions');
                    await pool.query('DROP TRIGGER IF EXISTS update_payload_events_updated_at ON payload_events');
                    await pool.query('DROP TRIGGER IF EXISTS update_error_events_updated_at ON error_events');
                    await pool.query('DROP TRIGGER IF EXISTS update_performance_metrics_updated_at ON performance_metrics');
                    await pool.query('DROP TRIGGER IF EXISTS update_api_calls_updated_at ON api_calls');
                    await pool.query('DROP TRIGGER IF EXISTS update_business_metrics_updated_at ON business_metrics');
                    await pool.query(schemaSQL);
                    console.log('✅ Schema migration completed after cleanup');
                } catch (retryError) {
                    console.log('⚠️  Schema migration completed with warnings:', retryError.message);
                }
            } else {
                throw error;
            }
        } finally {
            await pool.end();
        }
    }

    async insertSampleData() {
        console.log('📊 Inserting sample data...');
        
        const pool = new Pool({
            ...this.setupConfig,
            database: 'superseller_logging',
            user: 'superseller_logging_user',
            password: 'secure_password_here'
        });
        
        try {
            // Insert sample workflow executions
            const sampleExecutions = [
                {
                    execution_id: 'sample-exec-001',
                    workflow_id: 'wf-lead-processing',
                    workflow_name: 'Lead Processing Workflow',
                    customer_id: 'customer-ben-ginati',
                    customer_name: 'Ben Ginati',
                    status: 'success',
                    triggered_by: 'webhook',
                    environment: 'production'
                },
                {
                    execution_id: 'sample-exec-002',
                    workflow_id: 'wf-shelly-insurance',
                    workflow_name: 'Insurance Document Processing',
                    customer_id: 'customer-shelly-mizrahi',
                    customer_name: 'Shelly Mizrahi',
                    status: 'success',
                    triggered_by: 'schedule',
                    environment: 'production'
                },
                {
                    execution_id: 'sample-exec-003',
                    workflow_id: 'wf-wonder-care-sync',
                    workflow_name: 'Google Sheets to Monday Sync',
                    customer_id: 'customer-wonder-care',
                    customer_name: 'Wonder.care',
                    status: 'error',
                    triggered_by: 'manual',
                    environment: 'production'
                }
            ];

            for (const exec of sampleExecutions) {
                await pool.query(`
                    INSERT INTO workflow_executions (
                        execution_id, workflow_id, workflow_name, customer_id, customer_name,
                        status, triggered_by, environment, started_at, completed_at, execution_time_ms
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '1 hour', NOW(), 2500)
                    ON CONFLICT (execution_id) DO NOTHING
                `, [
                    exec.execution_id, exec.workflow_id, exec.workflow_name,
                    exec.customer_id, exec.customer_name, exec.status,
                    exec.triggered_by, exec.environment
                ]);
            }

            // Insert sample payload events
            await pool.query(`
                INSERT INTO payload_events (
                    execution_id, event_type, event_stage, payload_data, 
                    validation_status, processing_status
                ) VALUES 
                ('sample-exec-001', 'received', 'trigger', '{"name": "John Doe", "email": "john@example.com"}', 'valid', 'completed'),
                ('sample-exec-002', 'processed', 'processing', '{"document": "insurance_policy.pdf"}', 'valid', 'completed'),
                ('sample-exec-003', 'received', 'trigger', '{"data": "sync_request"}', 'valid', 'failed')
                ON CONFLICT DO NOTHING
            `);

            // Insert sample error events
            await pool.query(`
                INSERT INTO error_events (
                    execution_id, error_type, error_category, error_message, 
                    node_id, node_name, node_type
                ) VALUES 
                ('sample-exec-003', 'api', 'critical', 'Monday.com API rate limit exceeded', 'node-001', 'Monday.com API', 'n8n-nodes-base.httpRequest')
                ON CONFLICT DO NOTHING
            `);

            // Insert sample API calls
            await pool.query(`
                INSERT INTO api_calls (
                    execution_id, service_name, endpoint, method, status_code, 
                    response_time_ms, cost_usd, tokens_used
                ) VALUES 
                ('sample-exec-001', 'openai', '/v1/chat/completions', 'POST', 200, 1500, 0.0025, 150),
                ('sample-exec-002', 'airtable', '/v0/app123/Table1', 'POST', 200, 800, 0, 0),
                ('sample-exec-003', 'monday', '/v2/boards/123/items', 'POST', 429, 2000, 0, 0)
                ON CONFLICT DO NOTHING
            `);

            // Insert sample business metrics
            await pool.query(`
                INSERT INTO business_metrics (
                    execution_id, metric_type, metric_name, metric_value, 
                    metric_unit, customer_impact, business_value
                ) VALUES 
                ('sample-exec-001', 'leads_generated', 'leads_generated', 1, 'count', 'high', 50.00),
                ('sample-exec-002', 'documents_processed', 'documents_processed', 1, 'count', 'medium', 5.00),
                ('sample-exec-003', 'sync_operations', 'sync_operations', 0, 'count', 'low', 0.00)
                ON CONFLICT DO NOTHING
            `);

            console.log('✅ Sample data inserted');
            
        } finally {
            await pool.end();
        }
    }

    async testConnection() {
        console.log('🔍 Testing database connection...');
        
        const pool = new Pool({
            ...this.setupConfig,
            database: 'superseller_logging',
            user: 'superseller_logging_user',
            password: 'secure_password_here'
        });
        
        try {
            // Test basic connection
            const result = await pool.query('SELECT NOW() as current_time');
            console.log('✅ Database connection successful');
            console.log(`⏰ Current time: ${result.rows[0].current_time}`);
            
            // Test table access
            const tableCount = await pool.query(`
                SELECT COUNT(*) as table_count 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            console.log(`📊 Tables created: ${tableCount.rows[0].table_count}`);
            
            // Test sample data
            const executionCount = await pool.query('SELECT COUNT(*) as execution_count FROM workflow_executions');
            console.log(`📈 Sample executions: ${executionCount.rows[0].execution_count}`);
            
        } finally {
            await pool.end();
        }
    }

    async createEnvironmentFile() {
        console.log('📝 Creating environment configuration...');
        
        const envContent = `# SuperSeller AI Logging Database Configuration
# Generated by setup script

# Database Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=superseller_logging
POSTGRES_USER=superseller_logging_user
POSTGRES_PASSWORD=secure_password_here

# Environment
NODE_ENV=production

# Logging Configuration
LOG_LEVEL=info
LOG_RETENTION_DAYS=90

# Performance Settings
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
`;

        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Environment file created: .env');
        console.log('⚠️  Remember to update the password in production!');
    }
}

// =====================================================
// RUN SETUP
// =====================================================

if (require.main === module) {
    const setup = new LoggingDatabaseSetup();
    setup.setup().catch(console.error);
}

module.exports = LoggingDatabaseSetup;
