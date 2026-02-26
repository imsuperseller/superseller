// =====================================================
// RENSTO LOGGING DATABASE TEST SUITE
// Comprehensive testing of logging functionality
// =====================================================

const { loggingDB } = require('./config');
const { n8nLogging } = require('./middleware');

class LoggingDatabaseTest {
    constructor() {
        this.testResults = [];
        this.testExecutionId = null;
    }

    async runAllTests() {
        console.log('🧪 Starting SuperSeller AI Logging Database Tests...\n');

        try {
            // Test 1: Database Connection
            await this.testDatabaseConnection();
            
            // Test 2: Workflow Execution Logging
            await this.testWorkflowExecutionLogging();
            
            // Test 3: Payload Event Logging
            await this.testPayloadEventLogging();
            
            // Test 4: Error Event Logging
            await this.testErrorEventLogging();
            
            // Test 5: Performance Metrics Logging
            await this.testPerformanceMetricsLogging();
            
            // Test 6: API Call Logging
            await this.testApiCallLogging();
            
            // Test 7: Business Metrics Logging
            await this.testBusinessMetricsLogging();
            
            // Test 8: Analytics and Reporting
            await this.testAnalyticsAndReporting();
            
            // Test 9: N8N Middleware Integration
            await this.testN8NMiddlewareIntegration();
            
            // Test 10: Database Health
            await this.testDatabaseHealth();
            
            // Print Results
            this.printTestResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        }
    }

    async testDatabaseConnection() {
        console.log('🔍 Testing database connection...');
        
        try {
            const health = await loggingDB.getHealthStatus();
            
            if (health.success && health.health.status === 'healthy') {
                this.testResults.push({ test: 'Database Connection', status: 'PASS', details: 'Connection successful' });
                console.log('✅ Database connection test passed');
            } else {
                this.testResults.push({ test: 'Database Connection', status: 'FAIL', details: health.error });
                console.log('❌ Database connection test failed');
            }
        } catch (error) {
            this.testResults.push({ test: 'Database Connection', status: 'FAIL', details: error.message });
            console.log('❌ Database connection test failed:', error.message);
        }
    }

    async testWorkflowExecutionLogging() {
        console.log('📊 Testing workflow execution logging...');
        
        try {
            const executionId = `test-exec-${Date.now()}`;
            
            // Test workflow start
            const startResult = await loggingDB.logWorkflowStart({
                executionId,
                workflowId: 'test-workflow',
                workflowName: 'Test Workflow',
                customerId: 'test-customer',
                customerName: 'Test Customer',
                triggeredBy: 'test',
                environment: 'test'
            });
            
            if (!startResult.success) {
                throw new Error('Failed to log workflow start');
            }
            
            // Test workflow completion
            const completionResult = await loggingDB.logWorkflowCompletion(
                executionId, 'success', null, null
            );
            
            if (!completionResult.success) {
                throw new Error('Failed to log workflow completion');
            }
            
            this.testResults.push({ test: 'Workflow Execution Logging', status: 'PASS', details: 'Start and completion logged successfully' });
            console.log('✅ Workflow execution logging test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'Workflow Execution Logging', status: 'FAIL', details: error.message });
            console.log('❌ Workflow execution logging test failed:', error.message);
        }
    }

    async testPayloadEventLogging() {
        console.log('📦 Testing payload event logging...');
        
        try {
            const executionId = `test-payload-${Date.now()}`;
            
            // Initialize execution
            await loggingDB.logWorkflowStart({
                executionId,
                workflowId: 'test-payload-workflow',
                workflowName: 'Test Payload Workflow',
                customerId: 'test-customer',
                customerName: 'Test Customer'
            });
            
            // Test payload received
            const receivedResult = await loggingDB.logPayloadEvent({
                executionId,
                eventType: 'received',
                eventStage: 'trigger',
                payloadData: { test: 'data' },
                payloadSizeBytes: 20,
                processingStatus: 'pending'
            });
            
            if (!receivedResult.success) {
                throw new Error('Failed to log payload received');
            }
            
            // Test payload validation
            const validationResult = await loggingDB.logPayloadEvent({
                executionId,
                eventType: 'validated',
                eventStage: 'validation',
                validationStatus: 'valid',
                processingStatus: 'pending'
            });
            
            if (!validationResult.success) {
                throw new Error('Failed to log payload validation');
            }
            
            this.testResults.push({ test: 'Payload Event Logging', status: 'PASS', details: 'All payload events logged successfully' });
            console.log('✅ Payload event logging test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'Payload Event Logging', status: 'FAIL', details: error.message });
            console.log('❌ Payload event logging test failed:', error.message);
        }
    }

    async testErrorEventLogging() {
        console.log('🚨 Testing error event logging...');
        
        try {
            const executionId = `test-error-${Date.now()}`;
            
            // Initialize execution
            await loggingDB.logWorkflowStart({
                executionId,
                workflowId: 'test-error-workflow',
                workflowName: 'Test Error Workflow',
                customerId: 'test-customer',
                customerName: 'Test Customer'
            });
            
            // Test error logging
            const errorResult = await loggingDB.logErrorEvent({
                executionId,
                errorType: 'validation',
                errorCategory: 'warning',
                errorMessage: 'Test validation error',
                errorDetails: { field: 'email', issue: 'invalid format' },
                nodeId: 'test-node',
                nodeName: 'Test Node',
                nodeType: 'n8n-nodes-base.code'
            });
            
            if (!errorResult.success) {
                throw new Error('Failed to log error event');
            }
            
            this.testResults.push({ test: 'Error Event Logging', status: 'PASS', details: 'Error event logged successfully' });
            console.log('✅ Error event logging test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'Error Event Logging', status: 'FAIL', details: error.message });
            console.log('❌ Error event logging test failed:', error.message);
        }
    }

    async testPerformanceMetricsLogging() {
        console.log('⚡ Testing performance metrics logging...');
        
        try {
            const executionId = `test-performance-${Date.now()}`;
            
            // Initialize execution
            await loggingDB.logWorkflowStart({
                executionId,
                workflowId: 'test-performance-workflow',
                workflowName: 'Test Performance Workflow',
                customerId: 'test-customer',
                customerName: 'Test Customer'
            });
            
            // Test performance metric logging
            const metricResult = await loggingDB.logPerformanceMetric({
                executionId,
                metricType: 'execution_time',
                metricName: 'node_execution_time',
                metricValue: 1500,
                metricUnit: 'ms',
                nodeId: 'test-node',
                nodeName: 'Test Node',
                metadata: { test: true }
            });
            
            if (!metricResult.success) {
                throw new Error('Failed to log performance metric');
            }
            
            this.testResults.push({ test: 'Performance Metrics Logging', status: 'PASS', details: 'Performance metric logged successfully' });
            console.log('✅ Performance metrics logging test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'Performance Metrics Logging', status: 'FAIL', details: error.message });
            console.log('❌ Performance metrics logging test failed:', error.message);
        }
    }

    async testApiCallLogging() {
        console.log('🌐 Testing API call logging...');
        
        try {
            const executionId = `test-api-${Date.now()}`;
            
            // Initialize execution
            await loggingDB.logWorkflowStart({
                executionId,
                workflowId: 'test-api-workflow',
                workflowName: 'Test API Workflow',
                customerId: 'test-customer',
                customerName: 'Test Customer'
            });
            
            // Test API call logging
            const apiResult = await loggingDB.logApiCall({
                executionId,
                serviceName: 'test-api',
                endpoint: '/test/endpoint',
                method: 'POST',
                statusCode: 200,
                responseTimeMs: 800,
                requestSizeBytes: 100,
                responseSizeBytes: 200,
                costUsd: 0.001,
                tokensUsed: 50
            });
            
            if (!apiResult.success) {
                throw new Error('Failed to log API call');
            }
            
            this.testResults.push({ test: 'API Call Logging', status: 'PASS', details: 'API call logged successfully' });
            console.log('✅ API call logging test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'API Call Logging', status: 'FAIL', details: error.message });
            console.log('❌ API call logging test failed:', error.message);
        }
    }

    async testBusinessMetricsLogging() {
        console.log('💼 Testing business metrics logging...');
        
        try {
            const executionId = `test-business-${Date.now()}`;
            
            // Initialize execution
            await loggingDB.logWorkflowStart({
                executionId,
                workflowId: 'test-business-workflow',
                workflowName: 'Test Business Workflow',
                customerId: 'test-customer',
                customerName: 'Test Customer'
            });
            
            // Test business metric logging
            const businessResult = await loggingDB.logBusinessMetric({
                executionId,
                metricType: 'leads_generated',
                metricName: 'leads_generated',
                metricValue: 5,
                metricUnit: 'count',
                customerImpact: 'high',
                businessValue: 250.00
            });
            
            if (!businessResult.success) {
                throw new Error('Failed to log business metric');
            }
            
            this.testResults.push({ test: 'Business Metrics Logging', status: 'PASS', details: 'Business metric logged successfully' });
            console.log('✅ Business metrics logging test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'Business Metrics Logging', status: 'FAIL', details: error.message });
            console.log('❌ Business metrics logging test failed:', error.message);
        }
    }

    async testAnalyticsAndReporting() {
        console.log('📈 Testing analytics and reporting...');
        
        try {
            // Test executive dashboard
            const dashboardResult = await loggingDB.getExecutiveDashboard(7);
            if (!dashboardResult.success) {
                throw new Error('Failed to get executive dashboard');
            }
            
            // Test customer performance
            const customerResult = await loggingDB.getCustomerPerformance(7);
            if (!customerResult.success) {
                throw new Error('Failed to get customer performance');
            }
            
            // Test error analysis
            const errorResult = await loggingDB.getErrorAnalysis(7);
            if (!errorResult.success) {
                throw new Error('Failed to get error analysis');
            }
            
            // Test API usage summary
            const apiResult = await loggingDB.getApiUsageSummary(7);
            if (!apiResult.success) {
                throw new Error('Failed to get API usage summary');
            }
            
            this.testResults.push({ test: 'Analytics and Reporting', status: 'PASS', details: 'All analytics queries successful' });
            console.log('✅ Analytics and reporting test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'Analytics and Reporting', status: 'FAIL', details: error.message });
            console.log('❌ Analytics and reporting test failed:', error.message);
        }
    }

    async testN8NMiddlewareIntegration() {
        console.log('🔧 Testing N8N middleware integration...');
        
        try {
            const executionId = `test-middleware-${Date.now()}`;
            
            // Test workflow initialization
            const initResult = await n8nLogging.initializeExecution({
                executionId,
                workflowId: 'test-middleware-workflow',
                workflowName: 'Test Middleware Workflow',
                customerId: 'test-customer',
                customerName: 'Test Customer',
                triggeredBy: 'test'
            });
            
            if (!initResult.success) {
                throw new Error('Failed to initialize execution');
            }
            
            // Test payload tracking
            const payloadResult = await n8nLogging.trackPayloadReceived(
                executionId, 
                { test: 'payload' }, 
                'test'
            );
            
            if (!payloadResult.success) {
                throw new Error('Failed to track payload');
            }
            
            // Test error tracking
            const errorResult = await n8nLogging.trackError(
                executionId,
                new Error('Test error'),
                { nodeId: 'test-node', nodeName: 'Test Node', nodeType: 'test' }
            );
            
            if (!errorResult.success) {
                throw new Error('Failed to track error');
            }
            
            // Test completion
            const completionResult = await n8nLogging.completeExecution(
                executionId, 'success'
            );
            
            if (!completionResult.success) {
                throw new Error('Failed to complete execution');
            }
            
            this.testResults.push({ test: 'N8N Middleware Integration', status: 'PASS', details: 'All middleware functions working' });
            console.log('✅ N8N middleware integration test passed');
            
        } catch (error) {
            this.testResults.push({ test: 'N8N Middleware Integration', status: 'FAIL', details: error.message });
            console.log('❌ N8N middleware integration test failed:', error.message);
        }
    }

    async testDatabaseHealth() {
        console.log('🏥 Testing database health...');
        
        try {
            const health = await loggingDB.getHealthStatus();
            
            if (health.success && health.health.status === 'healthy') {
                this.testResults.push({ 
                    test: 'Database Health', 
                    status: 'PASS', 
                    details: `Healthy - ${health.health.totalExecutions} executions, ${health.health.errorsLast24h} errors, ${health.health.apiCallsLast24h} API calls` 
                });
                console.log('✅ Database health test passed');
            } else {
                this.testResults.push({ test: 'Database Health', status: 'FAIL', details: health.error });
                console.log('❌ Database health test failed');
            }
            
        } catch (error) {
            this.testResults.push({ test: 'Database Health', status: 'FAIL', details: error.message });
            console.log('❌ Database health test failed:', error.message);
        }
    }

    printTestResults() {
        console.log('\n📊 TEST RESULTS SUMMARY');
        console.log('=====================================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        console.log('\n📋 DETAILED RESULTS:');
        console.log('=====================================');
        
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.details}`);
        });
        
        if (failed > 0) {
            console.log('\n⚠️  Some tests failed. Please check the database setup and configuration.');
            process.exit(1);
        } else {
            console.log('\n🎉 All tests passed! The logging database is ready for production use.');
        }
    }
}

// =====================================================
// RUN TESTS
// =====================================================

if (require.main === module) {
    const testSuite = new LoggingDatabaseTest();
    testSuite.runAllTests().catch(console.error);
}

module.exports = LoggingDatabaseTest;
