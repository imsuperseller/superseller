/**
 * Enhanced Error Handling Templates for Rensto Logging Database
 * Production-ready error management with comprehensive recovery strategies
 */

const { LoggingDatabase } = require('./config');

class ErrorHandlingTemplates {
    constructor() {
        this.logger = new LoggingDatabase();
        this.errorCategories = {
            DATABASE: 'database',
            NETWORK: 'network',
            VALIDATION: 'validation',
            AUTHENTICATION: 'authentication',
            RATE_LIMIT: 'rate_limit',
            TIMEOUT: 'timeout',
            CONFIGURATION: 'configuration',
            EXTERNAL_API: 'external_api',
            WORKFLOW: 'workflow',
            SYSTEM: 'system'
        };
        
        this.severityLevels = {
            CRITICAL: 'critical',    // System down, data loss
            HIGH: 'high',           // Major functionality affected
            MEDIUM: 'medium',       // Some functionality affected
            LOW: 'low',            // Minor issues, warnings
            INFO: 'info'           // Informational messages
        };
        
        this.retryStrategies = {
            IMMEDIATE: 'immediate',
            EXPONENTIAL_BACKOFF: 'exponential_backoff',
            LINEAR_BACKOFF: 'linear_backoff',
            CUSTOM: 'custom'
        };
    }

    /**
     * Template 1: Database Connection Error Handling
     */
    async handleDatabaseConnectionError(error, context = {}) {
        const errorTemplate = {
            errorType: this.errorCategories.DATABASE,
            errorCategory: 'connection_failure',
            severity: this.severityLevels.CRITICAL,
            context: {
                operation: context.operation || 'database_connection',
                timestamp: new Date().toISOString(),
                ...context
            },
            recovery: {
                strategy: this.retryStrategies.EXPONENTIAL_BACKOFF,
                maxRetries: 5,
                baseDelay: 1000,
                maxDelay: 30000
            },
            notification: {
                channels: ['slack', 'email', 'dashboard'],
                recipients: ['dev-team', 'ops-team'],
                escalation: {
                    critical: 300, // 5 minutes
                    high: 900     // 15 minutes
                }
            }
        };

        try {
            // Log the error with full context
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                errorTemplate.errorType,
                errorTemplate.errorCategory,
                `Database connection failed: ${error.message}`,
                {
                    error: error.message,
                    stack: error.stack,
                    template: errorTemplate,
                    context: context
                },
                'database_connection',
                'Database Connection',
                'postgresql'
            );

            // Attempt recovery
            return await this.executeRecoveryStrategy(errorTemplate, error, context);
            
        } catch (recoveryError) {
            // If recovery fails, escalate
            await this.escalateError(errorTemplate, recoveryError, context);
            throw recoveryError;
        }
    }

    /**
     * Template 2: Network/API Error Handling
     */
    async handleNetworkError(error, context = {}) {
        const errorTemplate = {
            errorType: this.errorCategories.NETWORK,
            errorCategory: this.categorizeNetworkError(error),
            severity: this.determineNetworkSeverity(error),
            context: {
                operation: context.operation || 'api_call',
                endpoint: context.endpoint,
                method: context.method,
                timestamp: new Date().toISOString(),
                ...context
            },
            recovery: {
                strategy: this.retryStrategies.EXPONENTIAL_BACKOFF,
                maxRetries: 3,
                baseDelay: 2000,
                maxDelay: 60000
            },
            notification: {
                channels: ['slack', 'dashboard'],
                recipients: ['dev-team'],
                escalation: {
                    critical: 600,  // 10 minutes
                    high: 1800     // 30 minutes
                }
            }
        };

        try {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                errorTemplate.errorType,
                errorTemplate.errorCategory,
                `Network error: ${error.message}`,
                {
                    error: error.message,
                    statusCode: error.statusCode,
                    response: error.response,
                    template: errorTemplate,
                    context: context
                },
                context.nodeId || 'network_node',
                context.nodeName || 'Network Request',
                context.nodeType || 'http_request'
            );

            return await this.executeRecoveryStrategy(errorTemplate, error, context);
            
        } catch (recoveryError) {
            await this.escalateError(errorTemplate, recoveryError, context);
            throw recoveryError;
        }
    }

    /**
     * Template 3: Validation Error Handling
     */
    async handleValidationError(error, context = {}) {
        const errorTemplate = {
            errorType: this.errorCategories.VALIDATION,
            errorCategory: 'data_validation_failure',
            severity: this.severityLevels.MEDIUM,
            context: {
                operation: context.operation || 'data_validation',
                field: context.field,
                value: context.value,
                rules: context.rules,
                timestamp: new Date().toISOString(),
                ...context
            },
            recovery: {
                strategy: this.retryStrategies.IMMEDIATE,
                maxRetries: 1,
                baseDelay: 0
            },
            notification: {
                channels: ['dashboard'],
                recipients: ['dev-team'],
                escalation: {
                    medium: 3600  // 1 hour
                }
            }
        };

        try {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                errorTemplate.errorType,
                errorTemplate.errorCategory,
                `Validation error: ${error.message}`,
                {
                    error: error.message,
                    validationErrors: error.validationErrors,
                    template: errorTemplate,
                    context: context
                },
                context.nodeId || 'validation_node',
                context.nodeName || 'Data Validation',
                context.nodeType || 'validation'
            );

            // For validation errors, we usually don't retry
            return {
                success: false,
                error: error.message,
                recovery: 'validation_failed',
                nextAction: 'fix_data_and_retry'
            };
            
        } catch (loggingError) {
            console.error('Failed to log validation error:', loggingError);
            throw error; // Re-throw original validation error
        }
    }

    /**
     * Template 4: Authentication Error Handling
     */
    async handleAuthenticationError(error, context = {}) {
        const errorTemplate = {
            errorType: this.errorCategories.AUTHENTICATION,
            errorCategory: 'auth_failure',
            severity: this.severityLevels.HIGH,
            context: {
                operation: context.operation || 'authentication',
                service: context.service,
                credentials: context.credentials ? 'provided' : 'missing',
                timestamp: new Date().toISOString(),
                ...context
            },
            recovery: {
                strategy: this.retryStrategies.LINEAR_BACKOFF,
                maxRetries: 2,
                baseDelay: 5000,
                maxDelay: 15000
            },
            notification: {
                channels: ['slack', 'email'],
                recipients: ['dev-team', 'ops-team'],
                escalation: {
                    high: 300,  // 5 minutes
                    critical: 900  // 15 minutes
                }
            }
        };

        try {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                errorTemplate.errorType,
                errorTemplate.errorCategory,
                `Authentication error: ${error.message}`,
                {
                    error: error.message,
                    service: context.service,
                    template: errorTemplate,
                    context: context
                },
                context.nodeId || 'auth_node',
                context.nodeName || 'Authentication',
                context.nodeType || 'authentication'
            );

            return await this.executeRecoveryStrategy(errorTemplate, error, context);
            
        } catch (recoveryError) {
            await this.escalateError(errorTemplate, recoveryError, context);
            throw recoveryError;
        }
    }

    /**
     * Template 5: Rate Limit Error Handling
     */
    async handleRateLimitError(error, context = {}) {
        const errorTemplate = {
            errorType: this.errorCategories.RATE_LIMIT,
            errorCategory: 'rate_limit_exceeded',
            severity: this.severityLevels.MEDIUM,
            context: {
                operation: context.operation || 'api_call',
                service: context.service,
                limit: context.limit,
                remaining: context.remaining,
                resetTime: context.resetTime,
                timestamp: new Date().toISOString(),
                ...context
            },
            recovery: {
                strategy: this.retryStrategies.CUSTOM,
                maxRetries: 1,
                customDelay: context.resetTime ? 
                    Math.max(0, new Date(context.resetTime).getTime() - Date.now()) : 
                    60000
            },
            notification: {
                channels: ['dashboard'],
                recipients: ['dev-team'],
                escalation: {
                    medium: 1800  // 30 minutes
                }
            }
        };

        try {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                errorTemplate.errorType,
                errorTemplate.errorCategory,
                `Rate limit exceeded: ${error.message}`,
                {
                    error: error.message,
                    limit: context.limit,
                    remaining: context.remaining,
                    resetTime: context.resetTime,
                    template: errorTemplate,
                    context: context
                },
                context.nodeId || 'rate_limit_node',
                context.nodeName || 'Rate Limited Request',
                context.nodeType || 'http_request'
            );

            return await this.executeRecoveryStrategy(errorTemplate, error, context);
            
        } catch (recoveryError) {
            await this.escalateError(errorTemplate, recoveryError, context);
            throw recoveryError;
        }
    }

    /**
     * Template 6: Workflow Execution Error Handling
     */
    async handleWorkflowError(error, context = {}) {
        const errorTemplate = {
            errorType: this.errorCategories.WORKFLOW,
            errorCategory: this.categorizeWorkflowError(error),
            severity: this.determineWorkflowSeverity(error),
            context: {
                operation: context.operation || 'workflow_execution',
                workflowId: context.workflowId,
                nodeId: context.nodeId,
                executionId: context.executionId,
                timestamp: new Date().toISOString(),
                ...context
            },
            recovery: {
                strategy: this.retryStrategies.EXPONENTIAL_BACKOFF,
                maxRetries: 3,
                baseDelay: 1000,
                maxDelay: 30000
            },
            notification: {
                channels: ['slack', 'email', 'dashboard'],
                recipients: ['dev-team', 'ops-team'],
                escalation: {
                    critical: 300,  // 5 minutes
                    high: 900,     // 15 minutes
                    medium: 1800   // 30 minutes
                }
            }
        };

        try {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                errorTemplate.errorType,
                errorTemplate.errorCategory,
                `Workflow error: ${error.message}`,
                {
                    error: error.message,
                    workflowId: context.workflowId,
                    nodeId: context.nodeId,
                    template: errorTemplate,
                    context: context
                },
                context.nodeId || 'workflow_node',
                context.nodeName || 'Workflow Execution',
                context.nodeType || 'workflow'
            );

            return await this.executeRecoveryStrategy(errorTemplate, error, context);
            
        } catch (recoveryError) {
            await this.escalateError(errorTemplate, recoveryError, context);
            throw recoveryError;
        }
    }

    /**
     * Template 7: System Resource Error Handling
     */
    async handleSystemResourceError(error, context = {}) {
        const errorTemplate = {
            errorType: this.errorCategories.SYSTEM,
            errorCategory: 'resource_exhaustion',
            severity: this.severityLevels.HIGH,
            context: {
                operation: context.operation || 'system_operation',
                resource: context.resource,
                usage: context.usage,
                limit: context.limit,
                timestamp: new Date().toISOString(),
                ...context
            },
            recovery: {
                strategy: this.retryStrategies.LINEAR_BACKOFF,
                maxRetries: 2,
                baseDelay: 10000,
                maxDelay: 30000
            },
            notification: {
                channels: ['slack', 'email'],
                recipients: ['ops-team', 'dev-team'],
                escalation: {
                    high: 300,  // 5 minutes
                    critical: 900  // 15 minutes
                }
            }
        };

        try {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                errorTemplate.errorType,
                errorTemplate.errorCategory,
                `System resource error: ${error.message}`,
                {
                    error: error.message,
                    resource: context.resource,
                    usage: context.usage,
                    limit: context.limit,
                    template: errorTemplate,
                    context: context
                },
                context.nodeId || 'system_node',
                context.nodeName || 'System Resource',
                context.nodeType || 'system'
            );

            return await this.executeRecoveryStrategy(errorTemplate, error, context);
            
        } catch (recoveryError) {
            await this.escalateError(errorTemplate, recoveryError, context);
            throw recoveryError;
        }
    }

    /**
     * Execute Recovery Strategy
     */
    async executeRecoveryStrategy(template, error, context) {
        const { recovery } = template;
        let attempt = 0;
        let delay = recovery.baseDelay || 1000;

        while (attempt < recovery.maxRetries) {
            try {
                // Wait before retry (except for immediate strategy)
                if (recovery.strategy !== this.retryStrategies.IMMEDIATE && attempt > 0) {
                    if (recovery.strategy === this.retryStrategies.CUSTOM) {
                        delay = recovery.customDelay || delay;
                    } else if (recovery.strategy === this.retryStrategies.EXPONENTIAL_BACKOFF) {
                        delay = Math.min(delay * 2, recovery.maxDelay || 30000);
                    } else if (recovery.strategy === this.retryStrategies.LINEAR_BACKOFF) {
                        delay = Math.min(delay + recovery.baseDelay, recovery.maxDelay || 30000);
                    }

                    await this.sleep(delay);
                }

                // Attempt the operation
                const result = await this.retryOperation(context, attempt);
                
                // Log successful recovery
                await this.logger.logErrorEvent(
                    context.executionId || 'system',
                    template.errorType,
                    'recovery_success',
                    `Recovery successful after ${attempt + 1} attempts`,
                    {
                        originalError: error.message,
                        attempts: attempt + 1,
                        delay: delay,
                        template: template
                    },
                    context.nodeId || 'recovery_node',
                    context.nodeName || 'Error Recovery',
                    context.nodeType || 'recovery'
                );

                return {
                    success: true,
                    result: result,
                    recovery: {
                        attempts: attempt + 1,
                        delay: delay,
                        strategy: recovery.strategy
                    }
                };

            } catch (retryError) {
                attempt++;
                
                // Log retry attempt
                await this.logger.logErrorEvent(
                    context.executionId || 'system',
                    template.errorType,
                    'recovery_attempt',
                    `Recovery attempt ${attempt} failed: ${retryError.message}`,
                    {
                        originalError: error.message,
                        retryError: retryError.message,
                        attempt: attempt,
                        maxRetries: recovery.maxRetries,
                        template: template
                    },
                    context.nodeId || 'recovery_node',
                    context.nodeName || 'Error Recovery',
                    context.nodeType || 'recovery'
                );

                if (attempt >= recovery.maxRetries) {
                    throw new Error(`Recovery failed after ${attempt} attempts: ${retryError.message}`);
                }
            }
        }
    }

    /**
     * Escalate Error
     */
    async escalateError(template, error, context) {
        const { notification } = template;
        const severity = template.severity;

        try {
            // Log escalation
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                template.errorType,
                'error_escalation',
                `Error escalated: ${error.message}`,
                {
                    originalError: error.message,
                    severity: severity,
                    escalationTime: new Date().toISOString(),
                    template: template,
                    context: context
                },
                context.nodeId || 'escalation_node',
                context.nodeName || 'Error Escalation',
                context.nodeType || 'escalation'
            );

            // Send notifications based on severity
            if (severity === this.severityLevels.CRITICAL) {
                await this.sendCriticalAlert(template, error, context);
            } else if (severity === this.severityLevels.HIGH) {
                await this.sendHighPriorityAlert(template, error, context);
            } else {
                await this.sendStandardAlert(template, error, context);
            }

        } catch (escalationError) {
            console.error('Failed to escalate error:', escalationError);
            // Fallback to console logging
            console.error('CRITICAL: Error escalation failed:', {
                originalError: error.message,
                escalationError: escalationError.message,
                template: template,
                context: context
            });
        }
    }

    /**
     * Helper Methods
     */
    categorizeNetworkError(error) {
        if (error.code === 'ECONNREFUSED') return 'connection_refused';
        if (error.code === 'ETIMEDOUT') return 'timeout';
        if (error.code === 'ENOTFOUND') return 'dns_resolution_failed';
        if (error.statusCode >= 500) return 'server_error';
        if (error.statusCode >= 400) return 'client_error';
        return 'unknown_network_error';
    }

    determineNetworkSeverity(error) {
        if (error.statusCode >= 500) return this.severityLevels.HIGH;
        if (error.statusCode >= 400) return this.severityLevels.MEDIUM;
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') return this.severityLevels.HIGH;
        return this.severityLevels.MEDIUM;
    }

    categorizeWorkflowError(error) {
        if (error.message.includes('timeout')) return 'workflow_timeout';
        if (error.message.includes('memory')) return 'memory_exhaustion';
        if (error.message.includes('permission')) return 'permission_denied';
        if (error.message.includes('validation')) return 'workflow_validation';
        return 'workflow_execution_error';
    }

    determineWorkflowSeverity(error) {
        if (error.message.includes('timeout') || error.message.includes('memory')) {
            return this.severityLevels.HIGH;
        }
        if (error.message.includes('permission')) {
            return this.severityLevels.CRITICAL;
        }
        return this.severityLevels.MEDIUM;
    }

    async retryOperation(context, attempt) {
        // This should be implemented based on the specific operation
        // For now, we'll throw an error to indicate it needs implementation
        throw new Error(`Retry operation not implemented for context: ${JSON.stringify(context)}`);
    }

    async sendCriticalAlert(template, error, context) {
        // Implement critical alert sending (Slack, email, SMS)
        console.log('🚨 CRITICAL ALERT:', {
            template: template,
            error: error.message,
            context: context
        });
    }

    async sendHighPriorityAlert(template, error, context) {
        // Implement high priority alert sending
        console.log('⚠️ HIGH PRIORITY ALERT:', {
            template: template,
            error: error.message,
            context: context
        });
    }

    async sendStandardAlert(template, error, context) {
        // Implement standard alert sending
        console.log('ℹ️ STANDARD ALERT:', {
            template: template,
            error: error.message,
            context: context
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = ErrorHandlingTemplates;
