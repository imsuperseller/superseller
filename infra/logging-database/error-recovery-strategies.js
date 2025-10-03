/**
 * Error Recovery Strategies for Rensto Logging Database
 * Production-ready recovery mechanisms with intelligent retry logic
 */

const { LoggingDatabase } = require('./config');

class ErrorRecoveryStrategies {
    constructor() {
        this.logger = new LoggingDatabase();
        this.circuitBreakerStates = new Map();
        this.retryCounters = new Map();
        this.lastFailureTimes = new Map();
    }

    /**
     * Strategy 1: Circuit Breaker Pattern
     */
    async circuitBreaker(operation, context = {}) {
        const key = context.operation || 'default';
        const state = this.circuitBreakerStates.get(key) || 'CLOSED';
        const failureCount = this.retryCounters.get(key) || 0;
        const lastFailure = this.lastFailureTimes.get(key);
        
        const config = {
            failureThreshold: 5,
            recoveryTimeout: 60000, // 1 minute
            halfOpenMaxCalls: 3
        };

        // Check if circuit should be opened
        if (state === 'CLOSED' && failureCount >= config.failureThreshold) {
            this.circuitBreakerStates.set(key, 'OPEN');
            this.lastFailureTimes.set(key, Date.now());
            
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                'circuit_breaker',
                'circuit_opened',
                `Circuit breaker opened for ${key} after ${failureCount} failures`,
                {
                    key: key,
                    failureCount: failureCount,
                    threshold: config.failureThreshold,
                    context: context
                },
                'circuit_breaker',
                'Circuit Breaker',
                'system'
            );
        }

        // Check if circuit should be half-opened
        if (state === 'OPEN' && lastFailure && 
            (Date.now() - lastFailure) > config.recoveryTimeout) {
            this.circuitBreakerStates.set(key, 'HALF_OPEN');
            this.retryCounters.set(key, 0);
            
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                'circuit_breaker',
                'circuit_half_opened',
                `Circuit breaker half-opened for ${key}`,
                {
                    key: key,
                    recoveryTimeout: config.recoveryTimeout,
                    context: context
                },
                'circuit_breaker',
                'Circuit Breaker',
                'system'
            );
        }

        // Execute operation based on circuit state
        if (state === 'OPEN') {
            throw new Error(`Circuit breaker is OPEN for ${key}. Operation blocked.`);
        }

        if (state === 'HALF_OPEN') {
            const halfOpenCalls = this.retryCounters.get(`${key}_half_open`) || 0;
            if (halfOpenCalls >= config.halfOpenMaxCalls) {
                this.circuitBreakerStates.set(key, 'OPEN');
                this.lastFailureTimes.set(key, Date.now());
                throw new Error(`Circuit breaker re-opened for ${key} after half-open failures.`);
            }
            this.retryCounters.set(`${key}_half_open`, halfOpenCalls + 1);
        }

        try {
            const result = await operation();
            
            // Reset circuit breaker on success
            if (state === 'HALF_OPEN') {
                this.circuitBreakerStates.set(key, 'CLOSED');
                this.retryCounters.set(key, 0);
                this.retryCounters.set(`${key}_half_open`, 0);
                
                await this.logger.logErrorEvent(
                    context.executionId || 'system',
                    'circuit_breaker',
                    'circuit_closed',
                    `Circuit breaker closed for ${key} after successful operation`,
                    {
                        key: key,
                        context: context
                    },
                    'circuit_breaker',
                    'Circuit Breaker',
                    'system'
                );
            }
            
            return result;
            
        } catch (error) {
            // Increment failure count
            this.retryCounters.set(key, failureCount + 1);
            this.lastFailureTimes.set(key, Date.now());
            
            throw error;
        }
    }

    /**
     * Strategy 2: Exponential Backoff with Jitter
     */
    async exponentialBackoffWithJitter(operation, context = {}) {
        const key = context.operation || 'default';
        const config = {
            maxRetries: 5,
            baseDelay: 1000,
            maxDelay: 30000,
            jitter: true
        };

        let attempt = 0;
        let lastError;

        while (attempt < config.maxRetries) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                attempt++;

                if (attempt >= config.maxRetries) {
                    break;
                }

                // Calculate delay with exponential backoff
                let delay = Math.min(
                    config.baseDelay * Math.pow(2, attempt - 1),
                    config.maxDelay
                );

                // Add jitter to prevent thundering herd
                if (config.jitter) {
                    delay = delay * (0.5 + Math.random() * 0.5);
                }

                await this.logger.logErrorEvent(
                    context.executionId || 'system',
                    'exponential_backoff',
                    'retry_attempt',
                    `Retry attempt ${attempt} failed, waiting ${delay}ms before next attempt`,
                    {
                        attempt: attempt,
                        maxRetries: config.maxRetries,
                        delay: delay,
                        error: error.message,
                        context: context
                    },
                    'exponential_backoff',
                    'Exponential Backoff',
                    'system'
                );

                await this.sleep(delay);
            }
        }

        throw new Error(`Operation failed after ${attempt} attempts: ${lastError.message}`);
    }

    /**
     * Strategy 3: Bulkhead Pattern
     */
    async bulkhead(operation, context = {}) {
        const key = context.operation || 'default';
        const config = {
            maxConcurrent: 10,
            timeout: 30000
        };

        // Get or create bulkhead for this operation
        if (!this.bulkheads) {
            this.bulkheads = new Map();
        }

        let bulkhead = this.bulkheads.get(key);
        if (!bulkhead) {
            bulkhead = {
                semaphore: config.maxConcurrent,
                active: 0,
                queue: []
            };
            this.bulkheads.set(key, bulkhead);
        }

        return new Promise((resolve, reject) => {
            const executeOperation = async () => {
                if (bulkhead.active >= config.maxConcurrent) {
                    // Add to queue
                    bulkhead.queue.push({ resolve, reject, context });
                    return;
                }

                bulkhead.active++;
                
                try {
                    const timeoutPromise = new Promise((_, timeoutReject) => {
                        setTimeout(() => {
                            timeoutReject(new Error(`Bulkhead timeout for ${key}`));
                        }, config.timeout);
                    });

                    const result = await Promise.race([
                        operation(),
                        timeoutPromise
                    ]);

                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    bulkhead.active--;
                    
                    // Process next item in queue
                    if (bulkhead.queue.length > 0) {
                        const next = bulkhead.queue.shift();
                        executeOperation.call(next);
                    }
                }
            };

            executeOperation();
        });
    }

    /**
     * Strategy 4: Retry with Dead Letter Queue
     */
    async retryWithDeadLetterQueue(operation, context = {}) {
        const key = context.operation || 'default';
        const config = {
            maxRetries: 3,
            retryDelay: 5000,
            deadLetterQueue: []
        };

        let attempt = 0;
        let lastError;

        while (attempt < config.maxRetries) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                attempt++;

                if (attempt >= config.maxRetries) {
                    // Send to dead letter queue
                    const deadLetterItem = {
                        id: `${key}_${Date.now()}_${Math.random()}`,
                        operation: key,
                        context: context,
                        error: error.message,
                        timestamp: new Date().toISOString(),
                        attempts: attempt
                    };

                    config.deadLetterQueue.push(deadLetterItem);

                    await this.logger.logErrorEvent(
                        context.executionId || 'system',
                        'dead_letter_queue',
                        'item_added',
                        `Operation sent to dead letter queue after ${attempt} failed attempts`,
                        {
                            deadLetterItem: deadLetterItem,
                            context: context
                        },
                        'dead_letter_queue',
                        'Dead Letter Queue',
                        'system'
                    );

                    throw new Error(`Operation failed and sent to dead letter queue: ${error.message}`);
                }

                await this.logger.logErrorEvent(
                    context.executionId || 'system',
                    'retry_with_dlq',
                    'retry_attempt',
                    `Retry attempt ${attempt} failed, will retry in ${config.retryDelay}ms`,
                    {
                        attempt: attempt,
                        maxRetries: config.maxRetries,
                        retryDelay: config.retryDelay,
                        error: error.message,
                        context: context
                    },
                    'retry_with_dlq',
                    'Retry with DLQ',
                    'system'
                );

                await this.sleep(config.retryDelay);
            }
        }
    }

    /**
     * Strategy 5: Graceful Degradation
     */
    async gracefulDegradation(operation, fallbackOperation, context = {}) {
        const key = context.operation || 'default';
        
        try {
            return await operation();
        } catch (error) {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                'graceful_degradation',
                'fallback_triggered',
                `Primary operation failed, triggering fallback: ${error.message}`,
                {
                    primaryError: error.message,
                    fallbackOperation: fallbackOperation.name || 'anonymous',
                    context: context
                },
                'graceful_degradation',
                'Graceful Degradation',
                'system'
            );

            try {
                const fallbackResult = await fallbackOperation();
                
                await this.logger.logErrorEvent(
                    context.executionId || 'system',
                    'graceful_degradation',
                    'fallback_success',
                    `Fallback operation completed successfully`,
                    {
                        fallbackResult: fallbackResult,
                        context: context
                    },
                    'graceful_degradation',
                    'Graceful Degradation',
                    'system'
                );

                return fallbackResult;
            } catch (fallbackError) {
                await this.logger.logErrorEvent(
                    context.executionId || 'system',
                    'graceful_degradation',
                    'fallback_failed',
                    `Both primary and fallback operations failed`,
                    {
                        primaryError: error.message,
                        fallbackError: fallbackError.message,
                        context: context
                    },
                    'graceful_degradation',
                    'Graceful Degradation',
                    'system'
                );

                throw new Error(`Both primary and fallback operations failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
            }
        }
    }

    /**
     * Strategy 6: Timeout with Cancellation
     */
    async timeoutWithCancellation(operation, timeoutMs, context = {}) {
        const key = context.operation || 'default';
        
        return new Promise((resolve, reject) => {
            let isCompleted = false;
            let timeoutId;

            // Set up timeout
            timeoutId = setTimeout(() => {
                if (!isCompleted) {
                    isCompleted = true;
                    
                    this.logger.logErrorEvent(
                        context.executionId || 'system',
                        'timeout_cancellation',
                        'operation_timeout',
                        `Operation timed out after ${timeoutMs}ms`,
                        {
                            timeoutMs: timeoutMs,
                            context: context
                        },
                        'timeout_cancellation',
                        'Timeout with Cancellation',
                        'system'
                    );

                    reject(new Error(`Operation timed out after ${timeoutMs}ms`));
                }
            }, timeoutMs);

            // Execute operation
            operation()
                .then(result => {
                    if (!isCompleted) {
                        isCompleted = true;
                        clearTimeout(timeoutId);
                        resolve(result);
                    }
                })
                .catch(error => {
                    if (!isCompleted) {
                        isCompleted = true;
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                });
        });
    }

    /**
     * Strategy 7: Health Check with Auto-Recovery
     */
    async healthCheckWithAutoRecovery(operation, healthCheck, context = {}) {
        const key = context.operation || 'default';
        
        // Perform health check first
        try {
            const isHealthy = await healthCheck();
            if (!isHealthy) {
                throw new Error(`Health check failed for ${key}`);
            }
        } catch (healthError) {
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                'health_check',
                'health_check_failed',
                `Health check failed: ${healthError.message}`,
                {
                    healthError: healthError.message,
                    context: context
                },
                'health_check',
                'Health Check',
                'system'
            );

            // Attempt auto-recovery
            try {
                await this.attemptAutoRecovery(key, context);
            } catch (recoveryError) {
                throw new Error(`Health check failed and auto-recovery failed: ${recoveryError.message}`);
            }
        }

        // Execute operation
        return await operation();
    }

    /**
     * Strategy 8: Rate Limiting with Adaptive Backoff
     */
    async rateLimitWithAdaptiveBackoff(operation, context = {}) {
        const key = context.operation || 'default';
        const config = {
            maxRequestsPerMinute: 60,
            adaptiveBackoff: true
        };

        // Get or create rate limiter
        if (!this.rateLimiters) {
            this.rateLimiters = new Map();
        }

        let rateLimiter = this.rateLimiters.get(key);
        if (!rateLimiter) {
            rateLimiter = {
                requests: [],
                backoffMultiplier: 1
            };
            this.rateLimiters.set(key, rateLimiter);
        }

        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Clean old requests
        rateLimiter.requests = rateLimiter.requests.filter(time => time > oneMinuteAgo);

        // Check if we're rate limited
        if (rateLimiter.requests.length >= config.maxRequestsPerMinute) {
            const oldestRequest = Math.min(...rateLimiter.requests);
            const waitTime = oldestRequest + 60000 - now;
            
            await this.logger.logErrorEvent(
                context.executionId || 'system',
                'rate_limit',
                'rate_limited',
                `Rate limited, waiting ${waitTime}ms before retry`,
                {
                    waitTime: waitTime,
                    currentRequests: rateLimiter.requests.length,
                    maxRequests: config.maxRequestsPerMinute,
                    context: context
                },
                'rate_limit',
                'Rate Limiting',
                'system'
            );

            await this.sleep(waitTime);
        }

        // Add current request
        rateLimiter.requests.push(now);

        try {
            const result = await operation();
            
            // Reset backoff multiplier on success
            if (config.adaptiveBackoff) {
                rateLimiter.backoffMultiplier = Math.max(1, rateLimiter.backoffMultiplier * 0.9);
            }
            
            return result;
        } catch (error) {
            // Increase backoff multiplier on failure
            if (config.adaptiveBackoff && error.message.includes('rate limit')) {
                rateLimiter.backoffMultiplier = Math.min(10, rateLimiter.backoffMultiplier * 1.5);
            }
            
            throw error;
        }
    }

    /**
     * Helper Methods
     */
    async attemptAutoRecovery(key, context) {
        // Implement auto-recovery logic based on the operation type
        await this.logger.logErrorEvent(
            context.executionId || 'system',
            'auto_recovery',
            'recovery_attempted',
            `Auto-recovery attempted for ${key}`,
            {
                key: key,
                context: context
            },
            'auto_recovery',
            'Auto Recovery',
            'system'
        );
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get Circuit Breaker Status
     */
    getCircuitBreakerStatus(key) {
        return {
            state: this.circuitBreakerStates.get(key) || 'CLOSED',
            failureCount: this.retryCounters.get(key) || 0,
            lastFailure: this.lastFailureTimes.get(key)
        };
    }

    /**
     * Reset Circuit Breaker
     */
    resetCircuitBreaker(key) {
        this.circuitBreakerStates.set(key, 'CLOSED');
        this.retryCounters.set(key, 0);
        this.lastFailureTimes.delete(key);
    }
}

module.exports = ErrorRecoveryStrategies;
