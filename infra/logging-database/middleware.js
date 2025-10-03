// =====================================================
// RENSTO LOGGING MIDDLEWARE FOR N8N WORKFLOWS
// Production-Ready Workflow Monitoring Integration
// =====================================================

const { loggingDB } = require('./config');
const crypto = require('crypto');

class N8NLoggingMiddleware {
    constructor() {
        this.activeExecutions = new Map();
        this.startTimes = new Map();
    }

    // =====================================================
    // WORKFLOW EXECUTION TRACKING
    // =====================================================

    /**
     * Initialize workflow execution tracking
     */
    async initializeExecution(executionData) {
        const executionId = executionData.executionId || this.generateExecutionId();
        
        // Store execution start time
        this.startTimes.set(executionId, Date.now());
        
        // Log workflow start
        const result = await loggingDB.logWorkflowStart({
            executionId,
            workflowId: executionData.workflowId,
            workflowName: executionData.workflowName,
            customerId: executionData.customerId,
            customerName: executionData.customerName,
            triggeredBy: executionData.triggeredBy || 'manual',
            triggerData: executionData.triggerData,
            environment: executionData.environment || 'production'
        });

        if (result.success) {
            this.activeExecutions.set(executionId, {
                ...executionData,
                executionId,
                startTime: Date.now(),
                status: 'running'
            });
        }

        return { executionId, success: result.success };
    }

    /**
     * Complete workflow execution tracking
     */
    async completeExecution(executionId, status, errorMessage = null, errorType = null) {
        try {
            // Log completion
            const result = await loggingDB.logWorkflowCompletion(executionId, status, errorMessage, errorType);
            
            // Clean up tracking
            this.activeExecutions.delete(executionId);
            this.startTimes.delete(executionId);
            
            return result;
        } catch (error) {
            console.error('❌ Failed to complete execution tracking:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // PAYLOAD EVENT TRACKING
    // =====================================================

    /**
     * Track payload received
     */
    async trackPayloadReceived(executionId, payload, source = 'webhook') {
        const payloadSize = JSON.stringify(payload).length;
        
        return await loggingDB.logPayloadEvent({
            executionId,
            eventType: 'received',
            eventStage: 'trigger',
            payloadData: payload,
            payloadSizeBytes: payloadSize,
            processingStatus: 'pending'
        });
    }

    /**
     * Track payload validation
     */
    async trackPayloadValidation(executionId, validationResult) {
        return await loggingDB.logPayloadEvent({
            executionId,
            eventType: 'validated',
            eventStage: 'validation',
            validationStatus: validationResult.isValid ? 'valid' : 'invalid',
            validationErrors: validationResult.errors || null,
            processingStatus: validationResult.isValid ? 'pending' : 'failed'
        });
    }

    /**
     * Track payload processing
     */
    async trackPayloadProcessing(executionId, processingResult) {
        return await loggingDB.logPayloadEvent({
            executionId,
            eventType: 'processed',
            eventStage: 'processing',
            processingStatus: processingResult.success ? 'completed' : 'failed',
            processingErrors: processingResult.errors || null,
            transformationApplied: processingResult.transformation || null
        });
    }

    /**
     * Track payload sent
     */
    async trackPayloadSent(executionId, payload, destination) {
        const payloadSize = JSON.stringify(payload).length;
        
        return await loggingDB.logPayloadEvent({
            executionId,
            eventType: 'sent',
            eventStage: 'action',
            payloadData: payload,
            payloadSizeBytes: payloadSize,
            processingStatus: 'completed'
        });
    }

    // =====================================================
    // ERROR TRACKING
    // =====================================================

    /**
     * Track error with automatic categorization
     */
    async trackError(executionId, error, nodeInfo = {}) {
        const errorCategory = this.categorizeError(error);
        const errorType = this.determineErrorType(error);
        
        return await loggingDB.logErrorEvent({
            executionId,
            errorType,
            errorCategory,
            errorMessage: error.message || error.toString(),
            errorDetails: {
                name: error.name,
                code: error.code,
                stack: error.stack,
                ...error
            },
            stackTrace: error.stack,
            nodeId: nodeInfo.nodeId,
            nodeName: nodeInfo.nodeName,
            nodeType: nodeInfo.nodeType
        });
    }

    /**
     * Categorize error by severity
     */
    categorizeError(error) {
        if (error.name === 'ValidationError' || error.message?.includes('validation')) {
            return 'warning';
        }
        if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
            return 'critical';
        }
        if (error.name === 'NetworkError' || error.message?.includes('network')) {
            return 'critical';
        }
        if (error.name === 'AuthenticationError' || error.message?.includes('auth')) {
            return 'critical';
        }
        return 'warning';
    }

    /**
     * Determine error type
     */
    determineErrorType(error) {
        if (error.name === 'ValidationError') return 'validation';
        if (error.name === 'TimeoutError') return 'timeout';
        if (error.name === 'NetworkError') return 'network';
        if (error.name === 'AuthenticationError') return 'auth';
        if (error.message?.includes('API')) return 'api';
        if (error.message?.includes('processing')) return 'processing';
        return 'unknown';
    }

    // =====================================================
    // PERFORMANCE TRACKING
    // =====================================================

    /**
     * Track node execution time
     */
    async trackNodePerformance(executionId, nodeInfo, startTime, endTime) {
        const executionTime = endTime - startTime;
        
        return await loggingDB.logPerformanceMetric({
            executionId,
            metricType: 'execution_time',
            metricName: 'node_execution_time',
            metricValue: executionTime,
            metricUnit: 'ms',
            nodeId: nodeInfo.nodeId,
            nodeName: nodeInfo.nodeName,
            metadata: {
                nodeType: nodeInfo.nodeType,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track memory usage
     */
    async trackMemoryUsage(executionId, memoryUsage) {
        return await loggingDB.logPerformanceMetric({
            executionId,
            metricType: 'memory_usage',
            metricName: 'workflow_memory_usage',
            metricValue: memoryUsage.used,
            metricUnit: 'bytes',
            metadata: {
                total: memoryUsage.total,
                free: memoryUsage.free,
                percentage: (memoryUsage.used / memoryUsage.total) * 100
            }
        });
    }

    /**
     * Track data processing metrics
     */
    async trackDataProcessing(executionId, dataSize, processingTime) {
        return await loggingDB.logPerformanceMetric({
            executionId,
            metricType: 'data_processed',
            metricName: 'data_processing_throughput',
            metricValue: dataSize / processingTime,
            metricUnit: 'bytes_per_ms',
            metadata: {
                dataSize,
                processingTime,
                timestamp: new Date().toISOString()
            }
        });
    }

    // =====================================================
    // API CALL TRACKING
    // =====================================================

    /**
     * Track API call with timing
     */
    async trackApiCall(executionId, apiCallData) {
        const startTime = Date.now();
        
        try {
            // Make the API call
            const response = await this.makeApiCall(apiCallData);
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            // Log successful API call
            await loggingDB.logApiCall({
                executionId,
                serviceName: apiCallData.serviceName,
                endpoint: apiCallData.endpoint,
                method: apiCallData.method,
                statusCode: response.status,
                responseTimeMs: responseTime,
                requestSizeBytes: JSON.stringify(apiCallData.body || {}).length,
                responseSizeBytes: JSON.stringify(response.data || {}).length,
                costUsd: this.calculateApiCost(apiCallData.serviceName, response),
                tokensUsed: this.extractTokenUsage(apiCallData.serviceName, response)
            });
            
            return response;
            
        } catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            // Log failed API call
            await loggingDB.logApiCall({
                executionId,
                serviceName: apiCallData.serviceName,
                endpoint: apiCallData.endpoint,
                method: apiCallData.method,
                statusCode: error.response?.status || 500,
                responseTimeMs: responseTime,
                errorMessage: error.message
            });
            
            throw error;
        }
    }

    /**
     * Make API call (placeholder - implement based on your HTTP client)
     */
    async makeApiCall(apiCallData) {
        // This is a placeholder - implement with your preferred HTTP client
        // (axios, fetch, etc.)
        throw new Error('API call implementation needed');
    }

    /**
     * Calculate API cost based on service and response
     */
    calculateApiCost(serviceName, response) {
        // Implement cost calculation based on your API pricing
        const costMap = {
            'openai': 0.002, // per 1K tokens
            'tavily': 0.001, // per search
            'firecrawl': 0.005, // per page
            'airtable': 0, // free tier
            'webflow': 0 // free tier
        };
        
        return costMap[serviceName] || 0;
    }

    /**
     * Extract token usage from API response
     */
    extractTokenUsage(serviceName, response) {
        if (serviceName === 'openai' && response.data?.usage) {
            return response.data.usage.total_tokens;
        }
        return null;
    }

    // =====================================================
    // BUSINESS METRICS TRACKING
    // =====================================================

    /**
     * Track business metric
     */
    async trackBusinessMetric(executionId, metricType, value, unit = 'count') {
        const businessValue = this.calculateBusinessValue(metricType, value);
        const customerImpact = this.assessCustomerImpact(metricType, value);
        
        return await loggingDB.logBusinessMetric({
            executionId,
            metricType,
            metricName: metricType,
            metricValue: value,
            metricUnit: unit,
            customerImpact,
            businessValue
        });
    }

    /**
     * Calculate business value for metric
     */
    calculateBusinessValue(metricType, value) {
        const valueMap = {
            'leads_generated': value * 50, // $50 per lead
            'emails_sent': value * 0.1, // $0.10 per email
            'documents_processed': value * 5, // $5 per document
            'revenue_impact': value, // direct revenue
            'time_saved_hours': value * 25 // $25 per hour saved
        };
        
        return valueMap[metricType] || 0;
    }

    /**
     * Assess customer impact level
     */
    assessCustomerImpact(metricType, value) {
        if (metricType === 'leads_generated' && value > 10) return 'high';
        if (metricType === 'revenue_impact' && value > 1000) return 'high';
        if (metricType === 'time_saved_hours' && value > 8) return 'high';
        if (value > 5) return 'medium';
        return 'low';
    }

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    /**
     * Generate unique execution ID
     */
    generateExecutionId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex');
        return `exec_${timestamp}_${random}`;
    }

    /**
     * Get current execution info
     */
    getExecutionInfo(executionId) {
        return this.activeExecutions.get(executionId);
    }

    /**
     * Get all active executions
     */
    getActiveExecutions() {
        return Array.from(this.activeExecutions.values());
    }

    /**
     * Clean up completed executions
     */
    cleanupCompletedExecutions() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        for (const [executionId, execution] of this.activeExecutions.entries()) {
            if (now - execution.startTime > maxAge) {
                this.activeExecutions.delete(executionId);
                this.startTimes.delete(executionId);
            }
        }
    }

    // =====================================================
    // N8N INTEGRATION HELPERS
    // =====================================================

    /**
     * Create n8n workflow logging wrapper
     */
    createWorkflowWrapper(workflowFunction) {
        return async (executionData) => {
            const { executionId } = await this.initializeExecution(executionData);
            
            try {
                // Track payload received
                if (executionData.payload) {
                    await this.trackPayloadReceived(executionId, executionData.payload);
                }
                
                // Execute workflow
                const result = await workflowFunction(executionData);
                
                // Track success
                await this.completeExecution(executionId, 'success');
                
                return result;
                
            } catch (error) {
                // Track error
                await this.trackError(executionId, error);
                await this.completeExecution(executionId, 'error', error.message, error.name);
                
                throw error;
            }
        };
    }

    /**
     * Create n8n node logging wrapper
     */
    createNodeWrapper(nodeFunction, nodeInfo) {
        return async (inputData, executionId) => {
            const startTime = Date.now();
            
            try {
                // Execute node
                const result = await nodeFunction(inputData);
                
                // Track performance
                await this.trackNodePerformance(executionId, nodeInfo, startTime, Date.now());
                
                return result;
                
            } catch (error) {
                // Track error
                await this.trackError(executionId, error, nodeInfo);
                throw error;
            }
        };
    }
}

// =====================================================
// EXPORT SINGLETON INSTANCE
// =====================================================

const n8nLogging = new N8NLoggingMiddleware();

module.exports = {
    N8NLoggingMiddleware,
    n8nLogging
};
