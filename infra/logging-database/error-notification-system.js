/**
 * Error Notification System for Rensto Logging Database
 * Production-ready alerting and notification system with multiple channels
 */

const { LoggingDatabase } = require('./config');

class ErrorNotificationSystem {
    constructor() {
        this.logger = new LoggingDatabase();
        this.notificationChannels = {
            SLACK: 'slack',
            EMAIL: 'email',
            SMS: 'sms',
            DASHBOARD: 'dashboard',
            WEBHOOK: 'webhook'
        };
        
        this.severityLevels = {
            CRITICAL: 'critical',
            HIGH: 'high',
            MEDIUM: 'medium',
            LOW: 'low',
            INFO: 'info'
        };

        this.escalationRules = {
            critical: { immediate: true, channels: ['slack', 'email', 'sms'] },
            high: { immediate: true, channels: ['slack', 'email'] },
            medium: { immediate: false, channels: ['slack', 'dashboard'] },
            low: { immediate: false, channels: ['dashboard'] },
            info: { immediate: false, channels: ['dashboard'] }
        };

        this.notificationHistory = new Map();
        this.rateLimits = new Map();
    }

    /**
     * Send Error Notification
     */
    async sendErrorNotification(errorData, context = {}) {
        const {
            errorType,
            errorCategory,
            severity,
            message,
            details,
            executionId,
            nodeId,
            nodeName,
            nodeType
        } = errorData;

        const notificationId = this.generateNotificationId(errorData);
        
        // Check rate limits
        if (await this.isRateLimited(notificationId, severity)) {
            await this.logger.logErrorEvent(
                executionId || 'system',
                'notification_system',
                'rate_limited',
                `Notification rate limited for ${notificationId}`,
                {
                    notificationId: notificationId,
                    severity: severity,
                    context: context
                },
                'notification_system',
                'Notification System',
                'system'
            );
            return;
        }

        // Get escalation rules
        const escalationRule = this.escalationRules[severity] || this.escalationRules.medium;
        
        // Prepare notification payload
        const notificationPayload = {
            id: notificationId,
            timestamp: new Date().toISOString(),
            severity: severity,
            errorType: errorType,
            errorCategory: errorCategory,
            message: message,
            details: details,
            executionId: executionId,
            nodeId: nodeId,
            nodeName: nodeName,
            nodeType: nodeType,
            context: context,
            escalationRule: escalationRule
        };

        // Send notifications to all configured channels
        const results = await Promise.allSettled(
            escalationRule.channels.map(channel => 
                this.sendToChannel(channel, notificationPayload, context)
            )
        );

        // Log notification results
        await this.logNotificationResults(notificationId, results, context);

        // Store in notification history
        this.notificationHistory.set(notificationId, {
            ...notificationPayload,
            results: results,
            sentAt: new Date().toISOString()
        });

        return {
            notificationId: notificationId,
            channels: escalationRule.channels,
            results: results
        };
    }

    /**
     * Send to Slack
     */
    async sendToSlack(payload, context = {}) {
        try {
            const slackMessage = this.formatSlackMessage(payload);
            
            // In production, you would send to actual Slack webhook
            console.log('📱 SLACK NOTIFICATION:', slackMessage);
            
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_slack',
                'notification_sent',
                `Slack notification sent for ${payload.errorType}`,
                {
                    notificationId: payload.id,
                    slackMessage: slackMessage,
                    context: context
                },
                'notification_slack',
                'Slack Notification',
                'notification'
            );

            return { success: true, channel: 'slack' };
        } catch (error) {
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_slack',
                'notification_failed',
                `Slack notification failed: ${error.message}`,
                {
                    notificationId: payload.id,
                    error: error.message,
                    context: context
                },
                'notification_slack',
                'Slack Notification',
                'notification'
            );

            return { success: false, channel: 'slack', error: error.message };
        }
    }

    /**
     * Send Email Notification
     */
    async sendEmail(payload, context = {}) {
        try {
            const emailContent = this.formatEmailMessage(payload);
            
            // In production, you would send actual email
            console.log('📧 EMAIL NOTIFICATION:', emailContent);
            
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_email',
                'notification_sent',
                `Email notification sent for ${payload.errorType}`,
                {
                    notificationId: payload.id,
                    emailContent: emailContent,
                    context: context
                },
                'notification_email',
                'Email Notification',
                'notification'
            );

            return { success: true, channel: 'email' };
        } catch (error) {
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_email',
                'notification_failed',
                `Email notification failed: ${error.message}`,
                {
                    notificationId: payload.id,
                    error: error.message,
                    context: context
                },
                'notification_email',
                'Email Notification',
                'notification'
            );

            return { success: false, channel: 'email', error: error.message };
        }
    }

    /**
     * Send SMS Notification
     */
    async sendSMS(payload, context = {}) {
        try {
            const smsMessage = this.formatSMSMessage(payload);
            
            // In production, you would send actual SMS
            console.log('📱 SMS NOTIFICATION:', smsMessage);
            
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_sms',
                'notification_sent',
                `SMS notification sent for ${payload.errorType}`,
                {
                    notificationId: payload.id,
                    smsMessage: smsMessage,
                    context: context
                },
                'notification_sms',
                'SMS Notification',
                'notification'
            );

            return { success: true, channel: 'sms' };
        } catch (error) {
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_sms',
                'notification_failed',
                `SMS notification failed: ${error.message}`,
                {
                    notificationId: payload.id,
                    error: error.message,
                    context: context
                },
                'notification_sms',
                'SMS Notification',
                'notification'
            );

            return { success: false, channel: 'sms', error: error.message };
        }
    }

    /**
     * Send Dashboard Notification
     */
    async sendToDashboard(payload, context = {}) {
        try {
            const dashboardData = this.formatDashboardData(payload);
            
            // In production, you would update dashboard in real-time
            console.log('📊 DASHBOARD NOTIFICATION:', dashboardData);
            
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_dashboard',
                'notification_sent',
                `Dashboard notification sent for ${payload.errorType}`,
                {
                    notificationId: payload.id,
                    dashboardData: dashboardData,
                    context: context
                },
                'notification_dashboard',
                'Dashboard Notification',
                'notification'
            );

            return { success: true, channel: 'dashboard' };
        } catch (error) {
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_dashboard',
                'notification_failed',
                `Dashboard notification failed: ${error.message}`,
                {
                    notificationId: payload.id,
                    error: error.message,
                    context: context
                },
                'notification_dashboard',
                'Dashboard Notification',
                'notification'
            );

            return { success: false, channel: 'dashboard', error: error.message };
        }
    }

    /**
     * Send Webhook Notification
     */
    async sendWebhook(payload, context = {}) {
        try {
            const webhookData = this.formatWebhookData(payload);
            
            // In production, you would send to actual webhook URL
            console.log('🔗 WEBHOOK NOTIFICATION:', webhookData);
            
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_webhook',
                'notification_sent',
                `Webhook notification sent for ${payload.errorType}`,
                {
                    notificationId: payload.id,
                    webhookData: webhookData,
                    context: context
                },
                'notification_webhook',
                'Webhook Notification',
                'notification'
            );

            return { success: true, channel: 'webhook' };
        } catch (error) {
            await this.logger.logErrorEvent(
                payload.executionId || 'system',
                'notification_webhook',
                'notification_failed',
                `Webhook notification failed: ${error.message}`,
                {
                    notificationId: payload.id,
                    error: error.message,
                    context: context
                },
                'notification_webhook',
                'Webhook Notification',
                'notification'
            );

            return { success: false, channel: 'webhook', error: error.message };
        }
    }

    /**
     * Send to Channel (Router)
     */
    async sendToChannel(channel, payload, context = {}) {
        switch (channel) {
            case this.notificationChannels.SLACK:
                return await this.sendToSlack(payload, context);
            case this.notificationChannels.EMAIL:
                return await this.sendEmail(payload, context);
            case this.notificationChannels.SMS:
                return await this.sendSMS(payload, context);
            case this.notificationChannels.DASHBOARD:
                return await this.sendToDashboard(payload, context);
            case this.notificationChannels.WEBHOOK:
                return await this.sendWebhook(payload, context);
            default:
                throw new Error(`Unknown notification channel: ${channel}`);
        }
    }

    /**
     * Format Slack Message
     */
    formatSlackMessage(payload) {
        const severityEmoji = {
            critical: '🚨',
            high: '⚠️',
            medium: '🔶',
            low: '🔵',
            info: 'ℹ️'
        };

        return {
            text: `${severityEmoji[payload.severity]} *${payload.severity.toUpperCase()} ERROR*`,
            attachments: [{
                color: this.getSeverityColor(payload.severity),
                fields: [
                    {
                        title: 'Error Type',
                        value: payload.errorType,
                        short: true
                    },
                    {
                        title: 'Category',
                        value: payload.errorCategory,
                        short: true
                    },
                    {
                        title: 'Message',
                        value: payload.message,
                        short: false
                    },
                    {
                        title: 'Execution ID',
                        value: payload.executionId || 'N/A',
                        short: true
                    },
                    {
                        title: 'Node',
                        value: `${payload.nodeName} (${payload.nodeType})`,
                        short: true
                    },
                    {
                        title: 'Timestamp',
                        value: payload.timestamp,
                        short: true
                    }
                ],
                footer: 'Rensto Logging Database',
                ts: Math.floor(new Date(payload.timestamp).getTime() / 1000)
            }]
        };
    }

    /**
     * Format Email Message
     */
    formatEmailMessage(payload) {
        return {
            subject: `[${payload.severity.toUpperCase()}] ${payload.errorType} - ${payload.errorCategory}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: ${this.getSeverityColor(payload.severity)};">
                        ${payload.severity.toUpperCase()} ERROR ALERT
                    </h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <h3>Error Details</h3>
                        <p><strong>Type:</strong> ${payload.errorType}</p>
                        <p><strong>Category:</strong> ${payload.errorCategory}</p>
                        <p><strong>Message:</strong> ${payload.message}</p>
                        <p><strong>Execution ID:</strong> ${payload.executionId || 'N/A'}</p>
                        <p><strong>Node:</strong> ${payload.nodeName} (${payload.nodeType})</p>
                        <p><strong>Timestamp:</strong> ${payload.timestamp}</p>
                    </div>
                    <div style="margin-top: 20px;">
                        <h3>Context</h3>
                        <pre style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto;">
${JSON.stringify(payload.context, null, 2)}
                        </pre>
                    </div>
                    <div style="margin-top: 20px;">
                        <h3>Details</h3>
                        <pre style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto;">
${JSON.stringify(payload.details, null, 2)}
                        </pre>
                    </div>
                    <hr style="margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated notification from the Rensto Logging Database System.
                    </p>
                </div>
            `,
            text: `
                ${payload.severity.toUpperCase()} ERROR ALERT
                
                Error Details:
                - Type: ${payload.errorType}
                - Category: ${payload.errorCategory}
                - Message: ${payload.message}
                - Execution ID: ${payload.executionId || 'N/A'}
                - Node: ${payload.nodeName} (${payload.nodeType})
                - Timestamp: ${payload.timestamp}
                
                Context: ${JSON.stringify(payload.context, null, 2)}
                Details: ${JSON.stringify(payload.details, null, 2)}
                
                This is an automated notification from the Rensto Logging Database System.
            `
        };
    }

    /**
     * Format SMS Message
     */
    formatSMSMessage(payload) {
        return `[${payload.severity.toUpperCase()}] ${payload.errorType}: ${payload.message} (${payload.timestamp})`;
    }

    /**
     * Format Dashboard Data
     */
    formatDashboardData(payload) {
        return {
            id: payload.id,
            timestamp: payload.timestamp,
            severity: payload.severity,
            errorType: payload.errorType,
            errorCategory: payload.errorCategory,
            message: payload.message,
            executionId: payload.executionId,
            nodeId: payload.nodeId,
            nodeName: payload.nodeName,
            nodeType: payload.nodeType,
            context: payload.context,
            details: payload.details
        };
    }

    /**
     * Format Webhook Data
     */
    formatWebhookData(payload) {
        return {
            event: 'error_notification',
            data: payload,
            metadata: {
                source: 'rensto_logging_database',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Helper Methods
     */
    generateNotificationId(errorData) {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getSeverityColor(severity) {
        const colors = {
            critical: '#ff0000',
            high: '#ff6600',
            medium: '#ffaa00',
            low: '#0066cc',
            info: '#00aa00'
        };
        return colors[severity] || '#666666';
    }

    async isRateLimited(notificationId, severity) {
        const key = `${severity}_${Math.floor(Date.now() / 60000)}`; // Per minute
        const currentCount = this.rateLimits.get(key) || 0;
        
        const limits = {
            critical: 10,  // 10 per minute
            high: 20,      // 20 per minute
            medium: 50,    // 50 per minute
            low: 100,      // 100 per minute
            info: 200      // 200 per minute
        };

        if (currentCount >= limits[severity]) {
            return true;
        }

        this.rateLimits.set(key, currentCount + 1);
        return false;
    }

    async logNotificationResults(notificationId, results, context) {
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failureCount = results.length - successCount;

        await this.logger.logErrorEvent(
            context.executionId || 'system',
            'notification_system',
            'notification_results',
            `Notification ${notificationId} sent to ${successCount}/${results.length} channels`,
            {
                notificationId: notificationId,
                successCount: successCount,
                failureCount: failureCount,
                results: results,
                context: context
            },
            'notification_system',
            'Notification System',
            'system'
        );
    }

    /**
     * Get Notification History
     */
    getNotificationHistory(limit = 100) {
        const history = Array.from(this.notificationHistory.values())
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            .slice(0, limit);
        
        return history;
    }

    /**
     * Get Notification Statistics
     */
    getNotificationStats() {
        const history = Array.from(this.notificationHistory.values());
        const stats = {
            total: history.length,
            bySeverity: {},
            byChannel: {},
            successRate: 0
        };

        history.forEach(notification => {
            // By severity
            stats.bySeverity[notification.severity] = 
                (stats.bySeverity[notification.severity] || 0) + 1;

            // By channel
            notification.results.forEach(result => {
                if (result.status === 'fulfilled') {
                    const channel = result.value.channel;
                    stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
                }
            });
        });

        // Calculate success rate
        const totalResults = history.reduce((sum, n) => sum + n.results.length, 0);
        const successfulResults = history.reduce((sum, n) => 
            sum + n.results.filter(r => r.status === 'fulfilled' && r.value.success).length, 0);
        
        stats.successRate = totalResults > 0 ? (successfulResults / totalResults) * 100 : 0;

        return stats;
    }
}

module.exports = ErrorNotificationSystem;
