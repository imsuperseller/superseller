/**
 * n8n Model Optimizer Service
 * Monitors LLM performance benchmarks and suggests model updates for n8n nodes.
 */

interface OptimizationRecommendation {
    nodeId: string;
    nodeName: string;
    currentModel: string;
    suggestedModel: string;
    reason: string;
    improvementPct: number;
    nodeType: string;
}

export class ModelOptimizer {
    /**
     * Analyzes an n8n workflow for potential model upgrades.
     */
    public async analyzeWorkflow(workflowJson: any): Promise<OptimizationRecommendation[]> {
        const recommendations: OptimizationRecommendation[] = [];

        if (!workflowJson.nodes || !Array.isArray(workflowJson.nodes)) return [];

        for (const node of workflowJson.nodes) {
            // Detect various AI node types in n8n
            const isAiNode =
                node.type.includes('n8n-nodes-base.openAi') ||
                node.type.includes('n8n-nodes-base.googleGemini') ||
                node.type.includes('n8n-nodes-base.anthropic') ||
                node.type === 'n8n-nodes-base.aiAgent' ||
                node.type === 'n8n-nodes-base.aiChain';

            if (isAiNode) {
                const currentModel = node.parameters?.model || node.parameters?.options?.model || 'unknown';

                // Recommendation Logic: If using older/expensive models, suggest optimized ones
                if (
                    currentModel.includes('gpt-4-') && !currentModel.includes('o') || // Move to 4o
                    currentModel.includes('gpt-3.5') ||
                    currentModel.includes('gemini-1.0') ||
                    currentModel.includes('claude-3-opus') // Opus is slow/expensive, move to Sonnet 3.5
                ) {
                    let suggested = 'gemini-2.0-flash';
                    let reason = 'Superior speed and context handling at a lower cost.';
                    let improvement = 40;

                    if (currentModel.includes('gpt-4')) {
                        suggested = 'gpt-4o';
                        reason = 'Native multi-modal capabilities and significantly faster response times.';
                        improvement = 30;
                    } else if (currentModel.includes('claude')) {
                        suggested = 'claude-3-5-sonnet';
                        reason = 'Top-tier coding and reasoning performance with lower latency.';
                        improvement = 25;
                    }

                    recommendations.push({
                        nodeId: node.id,
                        nodeName: node.name,
                        currentModel,
                        suggestedModel: suggested,
                        reason,
                        improvementPct: improvement,
                        nodeType: node.type
                    });
                }
            }
        }

        return recommendations;
    }

    /**
     * Formats recommendations for a WhatsApp notification.
     */
    public formatWhatsAppMessage(customerName: string, recommendations: OptimizationRecommendation[]): string {
        if (recommendations.length === 0) return '';

        let message = `🚀 *Rensto Optimizer: Performance Report for ${customerName}*\n\n`;
        message += `We've detected *${recommendations.length} optimization(s)* to boost your workflow performance:\n\n`;

        recommendations.forEach((r, idx) => {
            message += `${idx + 1}. *${r.nodeName}*\n`;
            message += `   • Current: ${r.currentModel}\n`;
            message += `   • *Target*: ${r.suggestedModel}\n`;
            message += `   • *Impact*: +${r.improvementPct}% performance\n`;
            message += `   • _Reason: ${r.reason}_\n\n`;
        });

        message += `🔗 *Review & Apply*: https://rensto.com/portal/optimizer\n\n`;
        message += `_This audit is part of your All-Access Pass benefits._`;

        return message;
    }
}
