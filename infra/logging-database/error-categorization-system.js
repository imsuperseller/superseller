/**
 * Error Categorization System for Rensto Logging Database
 * Intelligent error classification and severity assessment
 */

const { LoggingDatabase } = require('./config');

class ErrorCategorizationSystem {
    constructor() {
        this.logger = new LoggingDatabase();
        
        // Error Categories
        this.categories = {
            // Database Errors
            DATABASE_CONNECTION: 'database_connection',
            DATABASE_QUERY: 'database_query',
            DATABASE_TIMEOUT: 'database_timeout',
            DATABASE_PERMISSION: 'database_permission',
            DATABASE_CONSTRAINT: 'database_constraint',
            
            // Network Errors
            NETWORK_TIMEOUT: 'network_timeout',
            NETWORK_CONNECTION: 'network_connection',
            NETWORK_DNS: 'network_dns',
            NETWORK_SSL: 'network_ssl',
            NETWORK_RATE_LIMIT: 'network_rate_limit',
            
            // Authentication Errors
            AUTH_INVALID_CREDENTIALS: 'auth_invalid_credentials',
            AUTH_TOKEN_EXPIRED: 'auth_token_expired',
            AUTH_PERMISSION_DENIED: 'auth_permission_denied',
            AUTH_RATE_LIMIT: 'auth_rate_limit',
            
            // Validation Errors
            VALIDATION_INPUT: 'validation_input',
            VALIDATION_FORMAT: 'validation_format',
            VALIDATION_REQUIRED: 'validation_required',
            VALIDATION_RANGE: 'validation_range',
            
            // System Errors
            SYSTEM_MEMORY: 'system_memory',
            SYSTEM_CPU: 'system_cpu',
            SYSTEM_DISK: 'system_disk',
            SYSTEM_PROCESS: 'system_process',
            
            // Workflow Errors
            WORKFLOW_TIMEOUT: 'workflow_timeout',
            WORKFLOW_NODE_FAILURE: 'workflow_node_failure',
            WORKFLOW_VALIDATION: 'workflow_validation',
            WORKFLOW_DEPENDENCY: 'workflow_dependency',
            
            // External API Errors
            API_TIMEOUT: 'api_timeout',
            API_RATE_LIMIT: 'api_rate_limit',
            API_AUTHENTICATION: 'api_authentication',
            API_VALIDATION: 'api_validation',
            API_SERVER_ERROR: 'api_server_error',
            
            // Configuration Errors
            CONFIG_MISSING: 'config_missing',
            CONFIG_INVALID: 'config_invalid',
            CONFIG_PERMISSION: 'config_permission',
            
            // Business Logic Errors
            BUSINESS_RULE: 'business_rule',
            BUSINESS_VALIDATION: 'business_validation',
            BUSINESS_LIMIT: 'business_limit',
            
            // Unknown/Generic
            UNKNOWN: 'unknown',
            GENERIC: 'generic'
        };

        // Severity Levels
        this.severityLevels = {
            CRITICAL: 'critical',    // System down, data loss, security breach
            HIGH: 'high',           // Major functionality affected, user impact
            MEDIUM: 'medium',       // Some functionality affected, degraded performance
            LOW: 'low',            // Minor issues, warnings, non-critical
            INFO: 'info'           // Informational messages, debugging
        };

        // Error Patterns for Classification
        this.errorPatterns = {
            // Database Patterns
            [this.categories.DATABASE_CONNECTION]: [
                /connection.*refused/i,
                /connection.*failed/i,
                /unable to connect/i,
                /connection timeout/i,
                /database.*unavailable/i
            ],
            [this.categories.DATABASE_QUERY]: [
                /sql.*error/i,
                /query.*failed/i,
                /syntax.*error/i,
                /invalid.*query/i,
                /table.*doesn't exist/i
            ],
            [this.categories.DATABASE_TIMEOUT]: [
                /query.*timeout/i,
                /database.*timeout/i,
                /connection.*timeout/i,
                /operation.*timeout/i
            ],
            [this.categories.DATABASE_PERMISSION]: [
                /permission.*denied/i,
                /access.*denied/i,
                /insufficient.*privileges/i,
                /unauthorized.*access/i
            ],
            [this.categories.DATABASE_CONSTRAINT]: [
                /constraint.*violation/i,
                /unique.*constraint/i,
                /foreign.*key/i,
                /check.*constraint/i
            ],

            // Network Patterns
            [this.categories.NETWORK_TIMEOUT]: [
                /network.*timeout/i,
                /request.*timeout/i,
                /connection.*timeout/i,
                /etimedout/i
            ],
            [this.categories.NETWORK_CONNECTION]: [
                /connection.*refused/i,
                /connection.*failed/i,
                /econnrefused/i,
                /unable to connect/i
            ],
            [this.categories.NETWORK_DNS]: [
                /dns.*error/i,
                /hostname.*not found/i,
                /enotfound/i,
                /name resolution failed/i
            ],
            [this.categories.NETWORK_SSL]: [
                /ssl.*error/i,
                /certificate.*error/i,
                /tls.*error/i,
                /handshake.*failed/i
            ],
            [this.categories.NETWORK_RATE_LIMIT]: [
                /rate.*limit/i,
                /too many requests/i,
                /429/i,
                /throttled/i
            ],

            // Authentication Patterns
            [this.categories.AUTH_INVALID_CREDENTIALS]: [
                /invalid.*credentials/i,
                /authentication.*failed/i,
                /login.*failed/i,
                /unauthorized/i
            ],
            [this.categories.AUTH_TOKEN_EXPIRED]: [
                /token.*expired/i,
                /session.*expired/i,
                /jwt.*expired/i,
                /authentication.*expired/i
            ],
            [this.categories.AUTH_PERMISSION_DENIED]: [
                /permission.*denied/i,
                /access.*denied/i,
                /forbidden/i,
                /insufficient.*permissions/i
            ],
            [this.categories.AUTH_RATE_LIMIT]: [
                /auth.*rate.*limit/i,
                /login.*rate.*limit/i,
                /too many.*login/i
            ],

            // Validation Patterns
            [this.categories.VALIDATION_INPUT]: [
                /invalid.*input/i,
                /validation.*failed/i,
                /input.*error/i,
                /bad.*request/i
            ],
            [this.categories.VALIDATION_FORMAT]: [
                /invalid.*format/i,
                /format.*error/i,
                /parsing.*error/i,
                /malformed/i
            ],
            [this.categories.VALIDATION_REQUIRED]: [
                /required.*field/i,
                /missing.*required/i,
                /field.*required/i
            ],
            [this.categories.VALIDATION_RANGE]: [
                /out.*of.*range/i,
                /range.*error/i,
                /value.*too.*large/i,
                /value.*too.*small/i
            ],

            // System Patterns
            [this.categories.SYSTEM_MEMORY]: [
                /memory.*error/i,
                /out.*of.*memory/i,
                /memory.*allocation/i,
                /heap.*overflow/i
            ],
            [this.categories.SYSTEM_CPU]: [
                /cpu.*error/i,
                /processor.*error/i,
                /high.*cpu/i
            ],
            [this.categories.SYSTEM_DISK]: [
                /disk.*error/i,
                /storage.*error/i,
                /disk.*full/i,
                /no.*space/i
            ],
            [this.categories.SYSTEM_PROCESS]: [
                /process.*error/i,
                /fork.*failed/i,
                /process.*killed/i
            ],

            // Workflow Patterns
            [this.categories.WORKFLOW_TIMEOUT]: [
                /workflow.*timeout/i,
                /execution.*timeout/i,
                /node.*timeout/i
            ],
            [this.categories.WORKFLOW_NODE_FAILURE]: [
                /node.*failed/i,
                /workflow.*node.*error/i,
                /execution.*failed/i
            ],
            [this.categories.WORKFLOW_VALIDATION]: [
                /workflow.*validation/i,
                /node.*validation/i,
                /workflow.*invalid/i
            ],
            [this.categories.WORKFLOW_DEPENDENCY]: [
                /dependency.*failed/i,
                /prerequisite.*failed/i,
                /workflow.*dependency/i
            ],

            // API Patterns
            [this.categories.API_TIMEOUT]: [
                /api.*timeout/i,
                /request.*timeout/i,
                /service.*timeout/i
            ],
            [this.categories.API_RATE_LIMIT]: [
                /api.*rate.*limit/i,
                /quota.*exceeded/i,
                /api.*throttled/i
            ],
            [this.categories.API_AUTHENTICATION]: [
                /api.*auth.*failed/i,
                /api.*unauthorized/i,
                /api.*key.*invalid/i
            ],
            [this.categories.API_VALIDATION]: [
                /api.*validation/i,
                /api.*bad.*request/i,
                /api.*invalid.*data/i
            ],
            [this.categories.API_SERVER_ERROR]: [
                /api.*server.*error/i,
                /api.*internal.*error/i,
                /api.*5\d\d/i
            ],

            // Configuration Patterns
            [this.categories.CONFIG_MISSING]: [
                /config.*missing/i,
                /configuration.*not found/i,
                /missing.*config/i
            ],
            [this.categories.CONFIG_INVALID]: [
                /config.*invalid/i,
                /invalid.*configuration/i,
                /config.*error/i
            ],
            [this.categories.CONFIG_PERMISSION]: [
                /config.*permission/i,
                /config.*access.*denied/i
            ],

            // Business Logic Patterns
            [this.categories.BUSINESS_RULE]: [
                /business.*rule/i,
                /rule.*violation/i,
                /policy.*violation/i
            ],
            [this.categories.BUSINESS_VALIDATION]: [
                /business.*validation/i,
                /business.*rule.*failed/i
            ],
            [this.categories.BUSINESS_LIMIT]: [
                /business.*limit/i,
                /quota.*exceeded/i,
                /limit.*reached/i
            ]
        };

        // Severity Rules
        this.severityRules = {
            [this.categories.DATABASE_CONNECTION]: this.severityLevels.CRITICAL,
            [this.categories.DATABASE_QUERY]: this.severityLevels.HIGH,
            [this.categories.DATABASE_TIMEOUT]: this.severityLevels.HIGH,
            [this.categories.DATABASE_PERMISSION]: this.severityLevels.HIGH,
            [this.categories.DATABASE_CONSTRAINT]: this.severityLevels.MEDIUM,

            [this.categories.NETWORK_TIMEOUT]: this.severityLevels.HIGH,
            [this.categories.NETWORK_CONNECTION]: this.severityLevels.HIGH,
            [this.categories.NETWORK_DNS]: this.severityLevels.MEDIUM,
            [this.categories.NETWORK_SSL]: this.severityLevels.HIGH,
            [this.categories.NETWORK_RATE_LIMIT]: this.severityLevels.MEDIUM,

            [this.categories.AUTH_INVALID_CREDENTIALS]: this.severityLevels.HIGH,
            [this.categories.AUTH_TOKEN_EXPIRED]: this.severityLevels.MEDIUM,
            [this.categories.AUTH_PERMISSION_DENIED]: this.severityLevels.HIGH,
            [this.categories.AUTH_RATE_LIMIT]: this.severityLevels.MEDIUM,

            [this.categories.VALIDATION_INPUT]: this.severityLevels.MEDIUM,
            [this.categories.VALIDATION_FORMAT]: this.severityLevels.MEDIUM,
            [this.categories.VALIDATION_REQUIRED]: this.severityLevels.LOW,
            [this.categories.VALIDATION_RANGE]: this.severityLevels.LOW,

            [this.categories.SYSTEM_MEMORY]: this.severityLevels.CRITICAL,
            [this.categories.SYSTEM_CPU]: this.severityLevels.HIGH,
            [this.categories.SYSTEM_DISK]: this.severityLevels.CRITICAL,
            [this.categories.SYSTEM_PROCESS]: this.severityLevels.HIGH,

            [this.categories.WORKFLOW_TIMEOUT]: this.severityLevels.HIGH,
            [this.categories.WORKFLOW_NODE_FAILURE]: this.severityLevels.HIGH,
            [this.categories.WORKFLOW_VALIDATION]: this.severityLevels.MEDIUM,
            [this.categories.WORKFLOW_DEPENDENCY]: this.severityLevels.MEDIUM,

            [this.categories.API_TIMEOUT]: this.severityLevels.MEDIUM,
            [this.categories.API_RATE_LIMIT]: this.severityLevels.MEDIUM,
            [this.categories.API_AUTHENTICATION]: this.severityLevels.HIGH,
            [this.categories.API_VALIDATION]: this.severityLevels.MEDIUM,
            [this.categories.API_SERVER_ERROR]: this.severityLevels.HIGH,

            [this.categories.CONFIG_MISSING]: this.severityLevels.HIGH,
            [this.categories.CONFIG_INVALID]: this.severityLevels.HIGH,
            [this.categories.CONFIG_PERMISSION]: this.severityLevels.HIGH,

            [this.categories.BUSINESS_RULE]: this.severityLevels.MEDIUM,
            [this.categories.BUSINESS_VALIDATION]: this.severityLevels.MEDIUM,
            [this.categories.BUSINESS_LIMIT]: this.severityLevels.LOW,

            [this.categories.UNKNOWN]: this.severityLevels.MEDIUM,
            [this.categories.GENERIC]: this.severityLevels.LOW
        };
    }

    /**
     * Categorize Error
     */
    async categorizeError(error, context = {}) {
        const errorMessage = error.message || error.toString();
        const errorStack = error.stack || '';
        const errorCode = error.code || error.statusCode || '';
        
        // Combine all error information for pattern matching
        const errorText = `${errorMessage} ${errorStack} ${errorCode}`.toLowerCase();

        // Find matching category
        let category = this.categories.UNKNOWN;
        let confidence = 0;

        for (const [cat, patterns] of Object.entries(this.errorPatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(errorText)) {
                    category = cat;
                    confidence = 0.9; // High confidence for pattern match
                    break;
                }
            }
            if (confidence > 0) break;
        }

        // Additional context-based categorization
        if (confidence === 0) {
            const contextCategory = this.categorizeByContext(context);
            if (contextCategory) {
                category = contextCategory;
                confidence = 0.7; // Medium confidence for context match
            }
        }

        // Determine severity
        const severity = this.severityRules[category] || this.severityLevels.MEDIUM;

        // Log categorization
        await this.logger.logErrorEvent(
            context.executionId || 'system',
            'error_categorization',
            'error_categorized',
            `Error categorized as ${category} with severity ${severity}`,
            {
                originalError: errorMessage,
                category: category,
                severity: severity,
                confidence: confidence,
                context: context,
                errorCode: errorCode
            },
            'error_categorization',
            'Error Categorization',
            'system'
        );

        return {
            category: category,
            severity: severity,
            confidence: confidence,
            errorType: this.getErrorType(category),
            errorCategory: category,
            classification: {
                method: confidence > 0.8 ? 'pattern_match' : 'context_match',
                patterns: this.errorPatterns[category] || [],
                rules: this.severityRules[category]
            }
        };
    }

    /**
     * Categorize by Context
     */
    categorizeByContext(context) {
        const { operation, nodeType, service, endpoint } = context;

        // Database operations
        if (operation && operation.includes('database')) {
            return this.categories.DATABASE_QUERY;
        }

        // Network operations
        if (nodeType === 'http_request' || service === 'api') {
            return this.categories.API_SERVER_ERROR;
        }

        // Authentication operations
        if (operation && operation.includes('auth')) {
            return this.categories.AUTH_INVALID_CREDENTIALS;
        }

        // Validation operations
        if (operation && operation.includes('validation')) {
            return this.categories.VALIDATION_INPUT;
        }

        // Workflow operations
        if (nodeType === 'workflow' || operation && operation.includes('workflow')) {
            return this.categories.WORKFLOW_NODE_FAILURE;
        }

        return null;
    }

    /**
     * Get Error Type
     */
    getErrorType(category) {
        const typeMapping = {
            [this.categories.DATABASE_CONNECTION]: 'database',
            [this.categories.DATABASE_QUERY]: 'database',
            [this.categories.DATABASE_TIMEOUT]: 'database',
            [this.categories.DATABASE_PERMISSION]: 'database',
            [this.categories.DATABASE_CONSTRAINT]: 'database',

            [this.categories.NETWORK_TIMEOUT]: 'network',
            [this.categories.NETWORK_CONNECTION]: 'network',
            [this.categories.NETWORK_DNS]: 'network',
            [this.categories.NETWORK_SSL]: 'network',
            [this.categories.NETWORK_RATE_LIMIT]: 'network',

            [this.categories.AUTH_INVALID_CREDENTIALS]: 'authentication',
            [this.categories.AUTH_TOKEN_EXPIRED]: 'authentication',
            [this.categories.AUTH_PERMISSION_DENIED]: 'authentication',
            [this.categories.AUTH_RATE_LIMIT]: 'authentication',

            [this.categories.VALIDATION_INPUT]: 'validation',
            [this.categories.VALIDATION_FORMAT]: 'validation',
            [this.categories.VALIDATION_REQUIRED]: 'validation',
            [this.categories.VALIDATION_RANGE]: 'validation',

            [this.categories.SYSTEM_MEMORY]: 'system',
            [this.categories.SYSTEM_CPU]: 'system',
            [this.categories.SYSTEM_DISK]: 'system',
            [this.categories.SYSTEM_PROCESS]: 'system',

            [this.categories.WORKFLOW_TIMEOUT]: 'workflow',
            [this.categories.WORKFLOW_NODE_FAILURE]: 'workflow',
            [this.categories.WORKFLOW_VALIDATION]: 'workflow',
            [this.categories.WORKFLOW_DEPENDENCY]: 'workflow',

            [this.categories.API_TIMEOUT]: 'external_api',
            [this.categories.API_RATE_LIMIT]: 'external_api',
            [this.categories.API_AUTHENTICATION]: 'external_api',
            [this.categories.API_VALIDATION]: 'external_api',
            [this.categories.API_SERVER_ERROR]: 'external_api',

            [this.categories.CONFIG_MISSING]: 'configuration',
            [this.categories.CONFIG_INVALID]: 'configuration',
            [this.categories.CONFIG_PERMISSION]: 'configuration',

            [this.categories.BUSINESS_RULE]: 'business_logic',
            [this.categories.BUSINESS_VALIDATION]: 'business_logic',
            [this.categories.BUSINESS_LIMIT]: 'business_logic',

            [this.categories.UNKNOWN]: 'unknown',
            [this.categories.GENERIC]: 'generic'
        };

        return typeMapping[category] || 'unknown';
    }

    /**
     * Get Category Statistics
     */
    async getCategoryStatistics(timeframe = '24h') {
        try {
            const query = `
                SELECT 
                    error_category,
                    error_type,
                    COUNT(*) as error_count,
                    COUNT(DISTINCT execution_id) as affected_executions,
                    COUNT(DISTINCT customer_id) as affected_customers,
                    AVG(CASE WHEN resolution_status = 'resolved' THEN 1 ELSE 0 END) as resolution_rate,
                    MAX(created_at) as last_occurrence
                FROM error_events 
                WHERE created_at >= NOW() - INTERVAL '${timeframe}'
                GROUP BY error_category, error_type
                ORDER BY error_count DESC
            `;

            const result = await this.logger.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Failed to get category statistics:', error);
            return [];
        }
    }

    /**
     * Get Severity Distribution
     */
    async getSeverityDistribution(timeframe = '24h') {
        try {
            const query = `
                SELECT 
                    error_type,
                    COUNT(*) as error_count,
                    COUNT(CASE WHEN error_type = 'critical' THEN 1 END) as critical_count,
                    COUNT(CASE WHEN error_type = 'high' THEN 1 END) as high_count,
                    COUNT(CASE WHEN error_type = 'medium' THEN 1 END) as medium_count,
                    COUNT(CASE WHEN error_type = 'low' THEN 1 END) as low_count,
                    COUNT(CASE WHEN error_type = 'info' THEN 1 END) as info_count
                FROM error_events 
                WHERE created_at >= NOW() - INTERVAL '${timeframe}'
                GROUP BY error_type
                ORDER BY error_count DESC
            `;

            const result = await this.logger.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Failed to get severity distribution:', error);
            return [];
        }
    }

    /**
     * Add Custom Error Pattern
     */
    addCustomPattern(category, pattern, severity = this.severityLevels.MEDIUM) {
        if (!this.errorPatterns[category]) {
            this.errorPatterns[category] = [];
        }
        
        this.errorPatterns[category].push(new RegExp(pattern, 'i'));
        this.severityRules[category] = severity;
        
        console.log(`Added custom error pattern for category: ${category}`);
    }

    /**
     * Get All Categories
     */
    getAllCategories() {
        return {
            categories: this.categories,
            severityLevels: this.severityLevels,
            patterns: this.errorPatterns,
            rules: this.severityRules
        };
    }
}

module.exports = ErrorCategorizationSystem;
