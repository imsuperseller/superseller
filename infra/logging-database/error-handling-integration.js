/**
 * Error Handling Integration for SuperSeller AI Logging Database
 * Main integration point for all error handling components
 */

const { LoggingDatabase } = require('./config');
const ErrorHandlingTemplates = require('./error-handling-templates');
const ErrorRecoveryStrategies = require('./error-recovery-strategies');
const ErrorNotificationSystem = require('./error-notification-system');
const ErrorCategorizationSystem = require('./error-categorization-system');

class ErrorHandlingIntegration {
    constructor() {
        this.logger = new LoggingDatabase();
        this.templates = new ErrorHandlingTemplates();
        this.recovery = new ErrorRecoveryStrategies();
        this.notifications = new ErrorNotificationSystem();
        this.categorization = new ErrorCategorizationSystem();
        
        this.errorHandlers = new Map();
        this.recoveryStrategies = new Map();
        this.notificationRules = new Map();
        
        this.initializeDefaultHandlers();
    }

    /**
     * Initialize Default Error Handlers
     */
    initializeDefaultHandlers() {
        // Database Error Handler
        this.errorHandlers.set('database', {
            template: this.templates.handleDatabaseConnectionError.bind(this.templates),
            recovery: this.recovery.circuitBreaker.bind(this.recovery),
            notification: true,
            escalation: { critical: 300, high: 900 }
        });

        // Network Error Handler
        this.errorHandlers.set('network', {
            template: this.templates.handleNetworkError.bind(this.templates),
            recovery: this.recovery.exponentialBackoffWithJitter.bind(this.recovery),
            notification: true,
            escalation: { critical: 600, high: 1800 }
        });

        // Validation Error Handler
        this.errorHandlers.set('validation', {
            template: this.templates.handleValidationError.bind(this.templates),
            recovery: this.recovery.retryWithDeadLetterQueue.bind(this.recovery),
            notification: false,
            escalation: { medium: 3600 }
        });

        // Authentication Error Handler
        this.errorHandlers.set('authentication', {
            template: this.templates.handleAuthenticationError.bind(this.templates),
            recovery: this.recovery.circuitBreaker.bind(this.recovery),
            notification: true,
            escalation: { high: 300, critical: 900 }
        });

        // Rate Limit Error Handler
        this.errorHandlers.set('rate_limit', {
            template: this.templates.handleRateLimitError.bind(this.templates),
            recovery: this.recovery.rateLimitWithAdaptiveBackoff.bind(this.recovery),
            notification: false,
            escalation: { medium: 1800 }
        });

        // Workflow Error Handler
        this.errorHandlers.set('workflow', {
            template: this.templates.handleWorkflowError.bind(this.templates),
            recovery: this.recovery.gracefulDegradation.bind(this.recovery),
            notification: true,
            escalation: { critical: 300, high: 900, medium: 1800 }
        });

        // System Resource Error Handler
        this.errorHandlers.set('system', {
            template: this.templates.handleSystemResourceError.bind(this.templates),
            recovery: this.recovery.healthCheckWithAutoRecovery.bind(this.recovery),
            notification: true,
            escalation: { high: 300, critical: 900 }
        });
    }

    /**
     * Handle Error with Full Integration
     */
    async handleError(error, context = {}) {
        try {
            // Step 1: Categorize the error
            const categorization = await this.categorization.categorizeError(error, context);
            
            // Step 2: Get appropriate handler
            const handler = this.getErrorHandler(categorization.errorType);
            
            // Step 3: Execute error template
            const templateResult = await handler.template(error, {
                ...context,
                categorization: categorization
            });

            // Step 4: Execute recovery strategy if needed
            let recoveryResult = null;
            if (templateResult && templateResult.recovery && templateResult.recovery.strategy !== 'validation_failed') {
                try {
                    recoveryResult = await this.executeRecoveryStrategy(
                        handler.recovery,
                        error,
                        context,
                        categorization
                    );
                } catch (recoveryError) {
                    console.error('Recovery strategy failed:', recoveryError);
                }
            }

            // Step 5: Send notifications if configured
            if (handler.notification && categorization.severity !== 'info') {
                await this.sendErrorNotification(error, context, categorization, templateResult, recoveryResult);
            }

            // Step 6: Return comprehensive result
            return {
                success: recoveryResult ? recoveryResult.success : false,
                categorization: categorization,
                template: templateResult,
                recovery: recoveryResult,
                notification: handler.notification,
                timestamp: new Date().toISOString()
            };

        } catch (handlingError) {
            // If error handling itself fails, log it and escalate
            console.error('Error handling failed:', handlingError);
            
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                'error_handling',
                'handling_failed',
                `Error handling failed: ${handlingError.message}`,
                {
                    originalError: error.message,
                    handlingError: handlingError.message,
                    context: context
                },
                'error_handling',
                'Error Handling',
                'system'
            );

            // Send critical alert for error handling failure
            await this.sendCriticalAlert(error, handlingError, context);
            
            throw handlingError;
        }
    }

    /**
     * Get Error Handler
     */
    getErrorHandler(errorType) {
        return this.errorHandlers.get(errorType) || this.errorHandlers.get('generic') || {
            template: this.templates.handleWorkflowError.bind(this.templates),
            recovery: this.recovery.exponentialBackoffWithJitter.bind(this.recovery),
            notification: true,
            escalation: { medium: 1800 }
        };
    }

    /**
     * Execute Recovery Strategy
     */
    async executeRecoveryStrategy(recoveryFunction, error, context, categorization) {
        try {
            // Wrap the operation in a timeout
            const operation = async () => {
                // This would be the actual operation that failed
                // For now, we'll simulate a retry
                throw new Error(`Simulated retry failure: ${error.message}`);
            };

            const result = await recoveryFunction(operation, context);
            return result;
        } catch (recoveryError) {
            return {
                success: false,
                error: recoveryError.message,
                strategy: 'recovery_failed'
            };
        }
    }

    /**
     * Send Error Notification
     */
    async sendErrorNotification(error, context, categorization, templateResult, recoveryResult) {
        try {
            const notificationData = {
                errorType: categorization.errorType,
                errorCategory: categorization.errorCategory,
                severity: categorization.severity,
                message: error.message,
                details: {
                    originalError: error.message,
                    stack: error.stack,
                    categorization: categorization,
                    template: templateResult,
                    recovery: recoveryResult,
                    context: context
                },
                executionId: context.executionId,
                nodeId: context.nodeId,
                nodeName: context.nodeName,
                nodeType: context.nodeType
            };

            return await this.notifications.sendErrorNotification(notificationData, context);
        } catch (notificationError) {
            console.error('Failed to send error notification:', notificationError);
        }
    }

    /**
     * Send Critical Alert
     */
    async sendCriticalAlert(originalError, handlingError, context) {
        try {
            const criticalData = {
                errorType: 'error_handling',
                errorCategory: 'handling_failure',
                severity: 'critical',
                message: `Error handling system failed: ${handlingError.message}`,
                details: {
                    originalError: originalError.message,
                    handlingError: handlingError.message,
                    context: context
                },
                executionId: context.executionId || 'system',
                nodeId: 'error_handling',
                nodeName: 'Error Handling System',
                nodeType: 'system'
            };

            return await this.notifications.sendErrorNotification(criticalData, context);
        } catch (alertError) {
            console.error('Failed to send critical alert:', alertError);
        }
    }

    /**
     * Register Custom Error Handler
     */
    registerErrorHandler(errorType, handler) {
        this.errorHandlers.set(errorType, {
            template: handler.template,
            recovery: handler.recovery,
            notification: handler.notification || true,
            escalation: handler.escalation || { medium: 1800 }
        });
    }

    /**
     * Register Custom Recovery Strategy
     */
    registerRecoveryStrategy(strategyName, strategyFunction) {
        this.recoveryStrategies.set(strategyName, strategyFunction);
    }

    /**
     * Register Custom Notification Rule
     */
    registerNotificationRule(ruleName, rule) {
        this.notificationRules.set(ruleName, rule);
    }

    /**
     * Get Error Handling Statistics
     */
    async getErrorHandlingStatistics(timeframe = '24h') {
        try {
            const stats = {
                totalErrors: 0,
                byCategory: {},
                bySeverity: {},
                recoverySuccess: 0,
                recoveryFailure: 0,
                notificationsSent: 0,
                averageResolutionTime: 0
            };

            // Get error statistics from database
            const errorStats = await this.categorization.getCategoryStatistics(timeframe);
            const severityStats = await this.categorization.getSeverityDistribution(timeframe);
            const notificationStats = this.notifications.getNotificationStats();

            // Process error statistics
            errorStats.forEach(stat => {
                stats.totalErrors += parseInt(stat.error_count);
                stats.byCategory[stat.error_category] = {
                    count: parseInt(stat.error_count),
                    executions: parseInt(stat.affected_executions),
                    customers: parseInt(stat.affected_customers),
                    resolutionRate: parseFloat(stat.resolution_rate)
                };
            });

            // Process severity statistics
            severityStats.forEach(stat => {
                stats.bySeverity[stat.error_type] = parseInt(stat.error_count);
            });

            // Process notification statistics
            stats.notificationsSent = notificationStats.total;
            stats.notificationSuccessRate = notificationStats.successRate;

            return stats;
        } catch (error) {
            console.error('Failed to get error handling statistics:', error);
            return null;
        }
    }

    /**
     * Get System Health Status
     */
    async getSystemHealthStatus() {
        try {
            const health = {
                database: 'healthy',
                errorHandling: 'healthy',
                notifications: 'healthy',
                recovery: 'healthy',
                categorization: 'healthy',
                overall: 'healthy'
            };

            // Check database health
            try {
                await this.logger.pool.query('SELECT 1');
            } catch (error) {
                health.database = 'unhealthy';
                health.overall = 'degraded';
            }

            // Check error handling system
            try {
                const testError = new Error('Health check test');
                await this.categorization.categorizeError(testError, { operation: 'health_check' });
            } catch (error) {
                health.errorHandling = 'unhealthy';
                health.overall = 'degraded';
            }

            // Check notification system
            try {
                const notificationStats = this.notifications.getNotificationStats();
                if (notificationStats.successRate < 90) {
                    health.notifications = 'degraded';
                    health.overall = 'degraded';
                }
            } catch (error) {
                health.notifications = 'unhealthy';
                health.overall = 'degraded';
            }

            // Check recovery strategies
            try {
                const circuitBreakerStatus = this.recovery.getCircuitBreakerStatus('health_check');
                if (circuitBreakerStatus.state === 'OPEN') {
                    health.recovery = 'degraded';
                    health.overall = 'degraded';
                }
            } catch (error) {
                health.recovery = 'unhealthy';
                health.overall = 'degraded';
            }

            return health;
        } catch (error) {
            console.error('Failed to get system health status:', error);
            return {
                database: 'unknown',
                errorHandling: 'unknown',
                notifications: 'unknown',
                recovery: 'unknown',
                categorization: 'unknown',
                overall: 'unhealthy'
            };
        }
    }

    /**
     * Reset Error Handling System
     */
    async resetErrorHandlingSystem() {
        try {
            // Reset circuit breakers
            this.recovery.resetCircuitBreaker('database');
            this.recovery.resetCircuitBreaker('network');
            this.recovery.resetCircuitBreaker('authentication');
            this.recovery.resetCircuitBreaker('workflow');
            this.recovery.resetCircuitBreaker('system');

            // Clear notification history
            this.notifications.notificationHistory.clear();
            this.notifications.rateLimits.clear();

            // Log reset
            await this.logger.logErrorEvent(
                'system',
                'error_handling',
                'system_reset',
                'Error handling system reset completed',
                {
                    resetTime: new Date().toISOString(),
                    components: ['circuit_breakers', 'notifications', 'rate_limits']
                },
                'error_handling',
                'Error Handling System',
                'system'
            );

            return { success: true, message: 'Error handling system reset completed' };
        } catch (error) {
            console.error('Failed to reset error handling system:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Export Error Handling Configuration
     */
    exportConfiguration() {
        return {
            handlers: Array.from(this.errorHandlers.entries()),
            recoveryStrategies: Array.from(this.recoveryStrategies.entries()),
            notificationRules: Array.from(this.notificationRules.entries()),
            categories: this.categorization.getAllCategories(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import Error Handling Configuration
     */
    async importConfiguration(config) {
        try {
            // Import handlers
            if (config.handlers) {
                config.handlers.forEach(([errorType, handler]) => {
                    this.errorHandlers.set(errorType, handler);
                });
            }

            // Import recovery strategies
            if (config.recoveryStrategies) {
                config.recoveryStrategies.forEach(([name, strategy]) => {
                    this.recoveryStrategies.set(name, strategy);
                });
            }

            // Import notification rules
            if (config.notificationRules) {
                config.notificationRules.forEach(([name, rule]) => {
                    this.notificationRules.set(name, rule);
                });
            }

            // Log import
            await this.logger.logErrorEvent(
                'system',
                'error_handling',
                'configuration_imported',
                'Error handling configuration imported successfully',
                {
                    config: config,
                    timestamp: new Date().toISOString()
                },
                'error_handling',
                'Error Handling System',
                'system'
            );

            return { success: true, message: 'Configuration imported successfully' };
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = ErrorHandlingIntegration;
