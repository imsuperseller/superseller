/**
 * Slack Integration Helper
 * Sends notifications to Slack channels for admin alerts
 */

export interface SlackMessage {
    channel?: string;
    text: string;
    blocks?: SlackBlock[];
    attachments?: SlackAttachment[];
}

interface SlackBlock {
    type: 'section' | 'header' | 'divider' | 'actions' | 'context';
    text?: {
        type: 'mrkdwn' | 'plain_text';
        text: string;
    };
    fields?: Array<{
        type: 'mrkdwn' | 'plain_text';
        text: string;
    }>;
    accessory?: {
        type: 'button';
        text: { type: 'plain_text'; text: string };
        url?: string;
        action_id?: string;
    };
}

interface SlackAttachment {
    color?: string;
    title?: string;
    text?: string;
    fields?: Array<{ title: string; value: string; short?: boolean }>;
}

// Default channel (can be overridden per message)
const DEFAULT_CHANNEL = '#rensto-alerts';

// Webhook URL from environment
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Send a message to Slack
 */
export async function sendSlackNotification(message: SlackMessage): Promise<boolean> {
    if (!SLACK_WEBHOOK_URL) {
        console.warn('[Slack] SLACK_WEBHOOK_URL not configured, skipping notification');
        return false;
    }

    try {
        const response = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel: message.channel || DEFAULT_CHANNEL,
                text: message.text,
                blocks: message.blocks,
                attachments: message.attachments,
            }),
        });

        if (!response.ok) {
            console.error('[Slack] Failed to send:', response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Slack] Error sending notification:', error);
        return false;
    }
}

/**
 * Pre-built notification templates
 */
export const SlackTemplates = {
    newSale: (customerEmail: string, product: string, amount: number) => ({
        text: `💰 New Sale: ${product}`,
        blocks: [
            {
                type: 'header' as const,
                text: { type: 'plain_text' as const, text: '💰 New Sale!' },
            },
            {
                type: 'section' as const,
                fields: [
                    { type: 'mrkdwn' as const, text: `*Customer:*\n${customerEmail}` },
                    { type: 'mrkdwn' as const, text: `*Product:*\n${product}` },
                    { type: 'mrkdwn' as const, text: `*Amount:*\n$${amount}` },
                ],
            },
        ],
    }),

    workflowError: (workflowName: string, errorMessage: string) => ({
        text: `🚨 Workflow Error: ${workflowName}`,
        attachments: [
            {
                color: '#fe3d51',
                title: `🚨 Workflow Failed: ${workflowName}`,
                text: errorMessage,
                fields: [
                    { title: 'Time', value: new Date().toISOString(), short: true },
                ],
            },
        ],
    }),

    newLeadRequest: (email: string, niche: string) => ({
        text: `🎯 New Lead Request: ${niche}`,
        blocks: [
            {
                type: 'section' as const,
                text: { type: 'mrkdwn' as const, text: `*New Free Leads Request*\n• Email: ${email}\n• Niche: ${niche}` },
            },
        ],
    }),

    supportEscalation: (ticketId: string, summary: string) => ({
        text: `⚠️ Support Escalation: ${ticketId}`,
        attachments: [
            {
                color: '#f7931e',
                title: `⚠️ Escalated: Ticket ${ticketId}`,
                text: summary,
            },
        ],
    }),
};
