// =====================================================
// RENSTO LOGGING DATABASE CONFIGURATION
// Production-Ready Database Connection Management
// =====================================================

const { Pool } = require('pg');

// Database configuration
const dbConfig = {
    // Production database connection
    production: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'superseller_logging',
        user: process.env.POSTGRES_USER || 'superseller_logging_user',
        password: process.env.POSTGRES_PASSWORD || 'secure_password_here',
        ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
    },
    
    // Development database connection
    development: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'superseller_logging_dev',
        user: process.env.POSTGRES_USER || 'superseller_logging_user',
        password: process.env.POSTGRES_PASSWORD || 'dev_password_here',
        ssl: false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },
    
    // Test database connection
    test: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'superseller_logging_test',
        user: process.env.POSTGRES_USER || 'superseller_logging_user',
        password: process.env.POSTGRES_PASSWORD || 'test_password_here',
        ssl: false,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Create database pool
let pool;

try {
    pool = new Pool(dbConfig[environment]);
    
    // Handle pool errors
    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
    
    // Test connection on startup
    pool.query('SELECT NOW()', (err, result) => {
        if (err) {
            console.error('Database connection failed:', err);
        } else {
            console.log('✅ Database connected successfully at', result.rows[0].now);
        }
    });
    
} catch (error) {
    console.error('Failed to create database pool:', error);
    process.exit(1);
}

// =====================================================
// LOGGING FUNCTIONS
// =====================================================

class LoggingDatabase {
    constructor() {
        this.pool = pool;
    }

    // =====================================================
    // WORKFLOW EXECUTION LOGGING
    // =====================================================

    /**
     * Log workflow execution start
     */
    async logWorkflowStart(executionData) {
        const {
            executionId,
            workflowId,
            workflowName,
            customerId,
            customerName,
            triggeredBy = 'manual',
            triggerData = null,
            environment = 'production'
        } = executionData;

        try {
            const query = `
                SELECT log_workflow_start($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            await this.pool.query(query, [
                executionId, workflowId, workflowName, customerId,
                customerName, triggeredBy, triggerData, environment
            ]);
            
            console.log(`✅ Workflow execution started: ${executionId}`);
            return { success: true, executionId };
            
        } catch (error) {
            console.error('❌ Failed to log workflow start:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Log workflow execution completion
     */
    async logWorkflowCompletion(executionId, status, errorMessage = null, errorType = null) {
        try {
            const query = `
                SELECT log_workflow_completion($1, $2, $3, $4)
            `;
            
            await this.pool.query(query, [executionId, status, errorMessage, errorType]);
            
            console.log(`✅ Workflow execution completed: ${executionId} - ${status}`);
            return { success: true, executionId, status };
            
        } catch (error) {
            console.error('❌ Failed to log workflow completion:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // PAYLOAD EVENT LOGGING
    // =====================================================

    /**
     * Log payload event
     */
    async logPayloadEvent(eventData) {
        const {
            executionId,
            eventType,
            eventStage,
            payloadData = null,
            payloadSizeBytes = null,
            validationStatus = null,
            validationErrors = null,
            processingStatus = null,
            processingErrors = null,
            transformationApplied = null
        } = eventData;

        try {
            const query = `
                INSERT INTO payload_events (
                    execution_id, event_type, event_stage, payload_data,
                    payload_size_bytes, validation_status, validation_errors,
                    processing_status, processing_errors, transformation_applied
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `;
            
            const result = await this.pool.query(query, [
                executionId, eventType, eventStage, payloadData,
                payloadSizeBytes, validationStatus, validationErrors,
                processingStatus, processingErrors, transformationApplied
            ]);
            
            console.log(`✅ Payload event logged: ${eventType} - ${eventStage}`);
            return { success: true, eventId: result.rows[0].id };
            
        } catch (error) {
            console.error('❌ Failed to log payload event:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // ERROR EVENT LOGGING
    // =====================================================

    /**
     * Log error event
     */
    async logErrorEvent(errorData) {
        const {
            executionId,
            errorType,
            errorCategory,
            errorMessage,
            errorDetails = null,
            stackTrace = null,
            nodeId = null,
            nodeName = null,
            nodeType = null,
            retryCount = 0
        } = errorData;

        try {
            const query = `
                SELECT log_error_event($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            await this.pool.query(query, [
                executionId, errorType, errorCategory, errorMessage,
                errorDetails, nodeId, nodeName, nodeType
            ]);
            
            console.log(`✅ Error event logged: ${errorType} - ${errorCategory}`);
            return { success: true };
            
        } catch (error) {
            console.error('❌ Failed to log error event:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // PERFORMANCE METRICS LOGGING
    // =====================================================

    /**
     * Log performance metric
     */
    async logPerformanceMetric(metricData) {
        const {
            executionId,
            metricType,
            metricName,
            metricValue,
            metricUnit = null,
            nodeId = null,
            nodeName = null,
            metadata = null
        } = metricData;

        try {
            const query = `
                INSERT INTO performance_metrics (
                    execution_id, metric_type, metric_name, metric_value,
                    metric_unit, node_id, node_name, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `;
            
            const result = await this.pool.query(query, [
                executionId, metricType, metricName, metricValue,
                metricUnit, nodeId, nodeName, metadata
            ]);
            
            return { success: true, metricId: result.rows[0].id };
            
        } catch (error) {
            console.error('❌ Failed to log performance metric:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // API CALL LOGGING
    // =====================================================

    /**
     * Log API call
     */
    async logApiCall(apiData) {
        const {
            executionId,
            serviceName,
            endpoint,
            method,
            statusCode,
            responseTimeMs,
            requestSizeBytes = null,
            responseSizeBytes = null,
            costUsd = null,
            tokensUsed = null,
            rateLimitRemaining = null,
            rateLimitReset = null,
            errorMessage = null
        } = apiData;

        try {
            const query = `
                SELECT log_api_call($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            
            await this.pool.query(query, [
                executionId, serviceName, endpoint, method, statusCode,
                responseTimeMs, requestSizeBytes, responseSizeBytes,
                costUsd, tokensUsed, errorMessage
            ]);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Failed to log API call:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // BUSINESS METRICS LOGGING
    // =====================================================

    /**
     * Log business metric
     */
    async logBusinessMetric(businessData) {
        const {
            executionId,
            metricType,
            metricName,
            metricValue,
            metricUnit = null,
            customerImpact = null,
            businessValue = null
        } = businessData;

        try {
            const query = `
                INSERT INTO business_metrics (
                    execution_id, metric_type, metric_name, metric_value,
                    metric_unit, customer_impact, business_value
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `;
            
            const result = await this.pool.query(query, [
                executionId, metricType, metricName, metricValue,
                metricUnit, customerImpact, businessValue
            ]);
            
            return { success: true, metricId: result.rows[0].id };
            
        } catch (error) {
            console.error('❌ Failed to log business metric:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // ANALYTICS AND REPORTING
    // =====================================================

    /**
     * Get executive dashboard data
     */
    async getExecutiveDashboard(days = 30) {
        try {
            const query = `
                SELECT * FROM executive_dashboard 
                WHERE date >= NOW() - INTERVAL '${days} days'
                ORDER BY date DESC
            `;
            
            const result = await this.pool.query(query);
            return { success: true, data: result.rows };
            
        } catch (error) {
            console.error('❌ Failed to get executive dashboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get customer performance data
     */
    async getCustomerPerformance(days = 30) {
        try {
            const query = `
                SELECT * FROM customer_performance 
                WHERE last_execution >= NOW() - INTERVAL '${days} days'
                ORDER BY total_executions DESC
            `;
            
            const result = await this.pool.query(query);
            return { success: true, data: result.rows };
            
        } catch (error) {
            console.error('❌ Failed to get customer performance:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get error analysis data
     */
    async getErrorAnalysis(days = 30) {
        try {
            const query = `
                SELECT * FROM error_analysis 
                WHERE last_occurrence >= NOW() - INTERVAL '${days} days'
                ORDER BY error_count DESC
            `;
            
            const result = await this.pool.query(query);
            return { success: true, data: result.rows };
            
        } catch (error) {
            console.error('❌ Failed to get error analysis:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get API usage summary
     */
    async getApiUsageSummary(days = 30) {
        try {
            const query = `
                SELECT * FROM api_usage_summary 
                WHERE last_call >= NOW() - INTERVAL '${days} days'
                ORDER BY total_cost_usd DESC
            `;
            
            const result = await this.pool.query(query);
            return { success: true, data: result.rows };
            
        } catch (error) {
            console.error('❌ Failed to get API usage summary:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // MAINTENANCE FUNCTIONS
    // =====================================================

    /**
     * Clean up old logs
     */
    async cleanupOldLogs(retentionDays = 90) {
        try {
            const query = `SELECT cleanup_old_logs($1)`;
            await this.pool.query(query, [retentionDays]);
            
            console.log(`✅ Cleaned up logs older than ${retentionDays} days`);
            return { success: true };
            
        } catch (error) {
            console.error('❌ Failed to cleanup old logs:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get database health status
     */
    async getHealthStatus() {
        try {
            const queries = [
                'SELECT COUNT(*) as total_executions FROM workflow_executions',
                'SELECT COUNT(*) as total_errors FROM error_events WHERE created_at >= NOW() - INTERVAL \'24 hours\'',
                'SELECT COUNT(*) as total_api_calls FROM api_calls WHERE created_at >= NOW() - INTERVAL \'24 hours\'',
                'SELECT NOW() as current_time'
            ];
            
            const results = await Promise.all(queries.map(query => this.pool.query(query)));
            
            return {
                success: true,
                health: {
                    totalExecutions: parseInt(results[0].rows[0].total_executions),
                    errorsLast24h: parseInt(results[1].rows[0].total_errors),
                    apiCallsLast24h: parseInt(results[2].rows[0].total_api_calls),
                    currentTime: results[3].rows[0].current_time,
                    status: 'healthy'
                }
            };
            
        } catch (error) {
            console.error('❌ Failed to get health status:', error);
            return { success: false, error: error.message, health: { status: 'unhealthy' } };
        }
    }

    // =====================================================
    // CONNECTION MANAGEMENT
    // =====================================================

    /**
     * Close database connection
     */
    async close() {
        try {
            await this.pool.end();
            console.log('✅ Database connection closed');
        } catch (error) {
            console.error('❌ Error closing database connection:', error);
        }
    }
}

// =====================================================
// EXPORT SINGLETON INSTANCE
// =====================================================

const loggingDB = new LoggingDatabase();

module.exports = {
    LoggingDatabase,
    loggingDB,
    pool
};
