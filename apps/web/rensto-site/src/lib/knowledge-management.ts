import { connectToDatabase } from './mongodb';
import { AnalyticsCache } from './redis';

// Knowledge Management System
export class KnowledgeManagement {
  private analyticsCache: AnalyticsCache;

  constructor() {
    this.analyticsCache = new AnalyticsCache();
  }

  // Store business insight in knowledge base
  async storeBusinessInsight(organizationId: string, insight: unknown) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      const knowledgeEntry = {
        organizationId,
        type: 'business_insight',
        category: insight.category || 'general',
        title: insight.title,
        description: insight.description,
        data: insight.data,
        impact: insight.impact || 'medium',
        tags: insight.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: insight.source || 'analytics',
          confidence: insight.confidence || 0.8,
          actionable: insight.actionable || true,
        },
      };

      const result = await knowledgeBase.insertOne(knowledgeEntry);

      // Cache the insight
      await this.cacheInsight(organizationId, knowledgeEntry);

      console.log(`💡 Business insight stored: ${insight.title}`);
      return result.insertedId;
    } catch (error) {
      console.error('Error storing business insight:', error);
      throw error;
    }
  }

  // Store analytics data in knowledge base
  async storeAnalyticsData(organizationId: string, analyticsData: unknown) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      const knowledgeEntry = {
        organizationId,
        type: 'analytics_data',
        category: 'performance_metrics',
        title: `Analytics Update - ${new Date().toLocaleDateString()}`,
        description: 'Performance metrics and analytics data',
        data: analyticsData,
        impact: 'high',
        tags: ['analytics', 'performance', 'metrics'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: 'facebook_scraping',
          dataType: 'performance_metrics',
          timeRange: 'recent',
        },
      };

      const result = await knowledgeBase.insertOne(knowledgeEntry);

      // Cache analytics data
      await this.analyticsCache.cacheAnalytics(organizationId, analyticsData);

      console.log(`📊 Analytics data stored for org: ${organizationId}`);
      return result.insertedId;
    } catch (error) {
      console.error('Error storing analytics data:', error);
      throw error;
    }
  }

  // Store customer interaction data
  async storeCustomerInteraction(organizationId: string, interaction: unknown) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      const knowledgeEntry = {
        organizationId,
        type: 'customer_interaction',
        category: interaction.category || 'engagement',
        title: interaction.title || 'Customer Interaction',
        description: interaction.description,
        data: interaction.data,
        impact: interaction.impact || 'medium',
        tags: ['customer', 'interaction', 'engagement'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: interaction.source || 'portal',
          customerId: interaction.customerId,
          interactionType: interaction.type,
        },
      };

      const result = await knowledgeBase.insertOne(knowledgeEntry);

      console.log(`👥 Customer interaction stored: ${interaction.title}`);
      return result.insertedId;
    } catch (error) {
      console.error('Error storing customer interaction:', error);
      throw error;
    }
  }

  // Search knowledge base
  async searchKnowledgeBase(
    organizationId: string,
    query: string,
    filters: unknown = {}
  ) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      // Create search filter
      const searchFilter = {
        organizationId,
        $text: { $search: query },
        ...filters,
      };

      // Create text index if it doesn't exist
      await knowledgeBase.createIndex({
        title: 'text',
        description: 'text',
        tags: 'text',
      });

      const results = await knowledgeBase
        .find(searchFilter)
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .toArray();

      console.log(`🔍 Knowledge search results: ${results.length} entries`);
      return results;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  // Get insights by category
  async getInsightsByCategory(organizationId: string, category: string) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      const insights = await knowledgeBase
        .find({
          organizationId,
          category,
          type: 'business_insight',
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      return insights;
    } catch (error) {
      console.error('Error getting insights by category:', error);
      return [];
    }
  }

  // Get recent insights
  async getRecentInsights(organizationId: string, limit: number = 10) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      const insights = await knowledgeBase
        .find({
          organizationId,
          type: 'business_insight',
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return insights;
    } catch (error) {
      console.error('Error getting recent insights:', error);
      return [];
    }
  }

  // Generate AI insights from historical data
  async generateAIInsights(organizationId: string) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      // Get historical analytics data
      const historicalData = await knowledgeBase
        .find({
          organizationId,
          type: 'analytics_data',
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      // Get recent customer interactions
      const customerInteractions = await knowledgeBase
        .find({
          organizationId,
          type: 'customer_interaction',
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      // Generate insights based on patterns
      const insights = await this.analyzePatterns(
        historicalData,
        customerInteractions
      );

      // Store generated insights
      for (const insight of insights) {
        await this.storeBusinessInsight(organizationId, insight);
      }

      console.log(
        `🤖 Generated ${insights.length} AI insights for org: ${organizationId}`
      );
      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [];
    }
  }

  // Analyze patterns in historical data
  private async analyzePatterns(
    historicalData: unknown[],
    customerInteractions: unknown[]
  ) {
    const insights = [];

    // Analyze performance trends
    if (historicalData.length > 0) {
      const performanceInsight = this.analyzePerformanceTrends(historicalData);
      if (performanceInsight) {
        insights.push(performanceInsight);
      }
    }

    // Analyze customer behavior
    if (customerInteractions.length > 0) {
      const behaviorInsight =
        this.analyzeCustomerBehavior(customerInteractions);
      if (behaviorInsight) {
        insights.push(behaviorInsight);
      }
    }

    // Analyze engagement patterns
    const engagementInsight = this.analyzeEngagementPatterns(
      historicalData,
      customerInteractions
    );
    if (engagementInsight) {
      insights.push(engagementInsight);
    }

    return insights;
  }

  // Analyze performance trends
  private analyzePerformanceTrends(historicalData: unknown[]) {
    if (historicalData.length < 3) return null;

    const recentData = historicalData.slice(0, 3);
    const olderData = historicalData.slice(3, 6);

    // Calculate average performance metrics
    const recentAvg = this.calculateAverageMetrics(recentData);
    const olderAvg = this.calculateAverageMetrics(olderData);

    // Detect trends
    const performanceChange = this.calculatePerformanceChange(
      recentAvg,
      olderAvg
    );

    if (Math.abs(performanceChange) > 0.1) {
      // 10% change threshold
      return {
        title:
          performanceChange > 0
            ? 'Performance Improvement Detected'
            : 'Performance Decline Detected',
        description: `Performance has ${
          performanceChange > 0 ? 'improved' : 'declined'
        } by ${Math.abs(performanceChange * 100).toFixed(1)}%`,
        category: 'performance',
        impact: Math.abs(performanceChange) > 0.2 ? 'high' : 'medium',
        actionable: true,
        data: { recentAvg, olderAvg, change: performanceChange },
        tags: ['performance', 'trends', 'analytics'],
      };
    }

    return null;
  }

  // Analyze customer behavior
  private analyzeCustomerBehavior(interactions: unknown[]) {
    if (interactions.length < 5) return null;

    // Group interactions by type
    const interactionTypes = interactions.reduce((acc, interaction) => {
      const type = interaction.metadata?.interactionType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Find most common interaction type
    const mostCommonType = Object.keys(interactionTypes).reduce((a, b) =>
      interactionTypes[a] > interactionTypes[b] ? a : b
    );

    return {
      title: 'Customer Behavior Pattern Detected',
      description: `Most common customer interaction type: ${mostCommonType}`,
      category: 'customer_behavior',
      impact: 'medium',
      actionable: true,
      data: { interactionTypes, mostCommonType },
      tags: ['customer', 'behavior', 'engagement'],
    };
  }

  // Analyze engagement patterns
  private analyzeEngagementPatterns(
    historicalData: unknown[],
    interactions: unknown[]
  ) {
    if (historicalData.length === 0) return null;

    // Calculate average engagement metrics
    const avgEngagement =
      historicalData.reduce((sum, data) => {
        return sum + (data.data?.engagementScore || 0);
      }, 0) / historicalData.length;

    if (avgEngagement < 7) {
      return {
        title: 'Low Engagement Detected',
        description: `Average engagement score is ${avgEngagement.toFixed(
          1
        )}/10. Consider improving content and targeting.`,
        category: 'engagement',
        impact: 'high',
        actionable: true,
        data: { avgEngagement },
        tags: ['engagement', 'optimization'],
      };
    }

    return null;
  }

  // Calculate average metrics
  private calculateAverageMetrics(data: unknown[]) {
    return data.reduce(
      (acc, item) => {
        const metrics = item.data || {};
        return {
          successRate: acc.successRate + (metrics.successRate || 0),
          totalLeads: acc.totalLeads + (metrics.totalLeads || 0),
          costPerLead: acc.costPerLead + (metrics.costPerLead || 0),
          roi: acc.roi + (metrics.roi || 0),
        };
      },
      { successRate: 0, totalLeads: 0, costPerLead: 0, roi: 0 }
    );
  }

  // Calculate performance change
  private calculatePerformanceChange(recent: unknown, older: unknown) {
    const recentAvg = {
      successRate: recent.successRate / 3,
      totalLeads: recent.totalLeads / 3,
      costPerLead: recent.costPerLead / 3,
      roi: recent.roi / 3,
    };

    const olderAvg = {
      successRate: older.successRate / 3,
      totalLeads: older.totalLeads / 3,
      costPerLead: older.costPerLead / 3,
      roi: older.roi / 3,
    };

    // Calculate weighted performance score
    const recentScore =
      recentAvg.successRate * 0.3 +
      recentAvg.roi * 0.4 +
      (1 / recentAvg.costPerLead) * 0.3;
    const olderScore =
      olderAvg.successRate * 0.3 +
      olderAvg.roi * 0.4 +
      (1 / olderAvg.costPerLead) * 0.3;

    return (recentScore - olderScore) / olderScore;
  }

  // Cache insight
  private async cacheInsight(organizationId: string, insight: unknown) {
    try {
      const cacheKey = `insights:${organizationId}`;
      const existingInsights =
        (await this.analyticsCache.getCachedAnalytics(cacheKey)) || [];
      existingInsights.unshift(insight);

      // Keep only last 20 insights
      const limitedInsights = existingInsights.slice(0, 20);
      await this.analyticsCache.cacheAnalytics(cacheKey, limitedInsights, 3600); // 1 hour TTL
    } catch (error) {
      console.error('Error caching insight:', error);
    }
  }

  // Get knowledge base statistics
  async getKnowledgeBaseStats(organizationId: string) {
    try {
      const db = await connectToDatabase();
      const knowledgeBase = db.collection('knowledge_base');

      const stats = await knowledgeBase
        .aggregate([
          { $match: { organizationId } },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              categories: { $addToSet: '$category' },
            },
          },
        ])
        .toArray();

      return stats;
    } catch (error) {
      console.error('Error getting knowledge base stats:', error);
      return [];
    }
  }
}

// Export singleton instance
export const knowledgeManagement = new KnowledgeManagement();
