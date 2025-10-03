import { Customer } from '../models/Customer';
import { Subscription } from '../models/Subscription';
import { Usage } from '../models/Usage';
import mongoose from 'mongoose';

export class AnalyticsService {
  /**
   * Get comprehensive analytics for a customer
   */
  async getCustomerAnalytics(customerId: string, period: '7d' | '30d' | '90d' | '1y' = '30d') {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const dateRange = this.getDateRange(period);
      
      // Get usage data
      const usageData = await this.getUsageData(customerId, dateRange);
      
      // Get subscription data
      const subscription = await Subscription.findOne({ 
        customerId: customerId, 
        status: 'active' 
      });

      // Calculate metrics
      const metrics = await this.calculateMetrics(usageData, subscription, period);
      
      // Get trends
      const trends = await this.calculateTrends(usageData, period);
      
      // Get recommendations
      const recommendations = await this.generateRecommendations(metrics, subscription);

      return {
        success: true,
        customer: {
          id: customer._id,
          name: customer.name,
          company: customer.company,
          subdomain: customer.tenant.subdomain
        },
        period,
        dateRange,
        metrics,
        trends,
        recommendations,
        usage: usageData,
        subscription: subscription ? {
          planType: subscription.planType,
          status: subscription.status,
          features: subscription.features
        } : null
      };

    } catch (error) {
      console.error('Error getting customer analytics:', error);
      throw error;
    }
  }

  /**
   * Get system-wide analytics
   */
  async getSystemAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    try {
      const dateRange = this.getDateRange(period);
      
      // Get all customers
      const customers = await Customer.find({ isActive: true });
      
      // Get system-wide usage
      const systemUsage = await this.getSystemUsageData(dateRange);
      
      // Calculate system metrics
      const systemMetrics = await this.calculateSystemMetrics(systemUsage, customers.length);
      
      // Get top customers by usage
      const topCustomers = await this.getTopCustomersByUsage(dateRange);
      
      // Get revenue analytics
      const revenueAnalytics = await this.getRevenueAnalytics(dateRange);
      
      // Get churn analytics
      const churnAnalytics = await this.getChurnAnalytics(dateRange);

      return {
        success: true,
        period,
        dateRange,
        systemMetrics,
        topCustomers,
        revenueAnalytics,
        churnAnalytics,
        usage: systemUsage
      };

    } catch (error) {
      console.error('Error getting system analytics:', error);
      throw error;
    }
  }

  /**
   * Get usage data for a customer
   */
  private async getUsageData(customerId: string, dateRange: { start: Date; end: Date }) {
    const usageData = await Usage.find({
      customerId: customerId,
      timestamp: { $gte: dateRange.start, $lte: dateRange.end }
    }).sort({ timestamp: 1 });

    // Aggregate by day
    const dailyUsage = this.aggregateUsageByDay(usageData);
    
    // Aggregate by type
    const usageByType = this.aggregateUsageByType(usageData);

    return {
      raw: usageData,
      daily: dailyUsage,
      byType: usageByType,
      total: {
        interactions: usageByType.interactions || 0,
        apiCalls: usageByType.apiCalls || 0,
        dataProcessing: usageByType.dataProcessing || 0,
        storage: usageByType.storage || 0,
        customIntegrations: usageByType.customIntegrations || 0
      }
    };
  }

  /**
   * Get system-wide usage data
   */
  private async getSystemUsageData(dateRange: { start: Date; end: Date }) {
    const usageData = await Usage.find({
      timestamp: { $gte: dateRange.start, $lte: dateRange.end }
    }).sort({ timestamp: 1 });

    // Aggregate by day
    const dailyUsage = this.aggregateUsageByDay(usageData);
    
    // Aggregate by customer
    const usageByCustomer = this.aggregateUsageByCustomer(usageData);

    return {
      raw: usageData,
      daily: dailyUsage,
      byCustomer: usageByCustomer,
      total: {
        interactions: usageData.filter(u => u.usageType === 'interactions').reduce((sum, u) => sum + u.amount, 0),
        apiCalls: usageData.filter(u => u.usageType === 'apiCalls').reduce((sum, u) => sum + u.amount, 0),
        dataProcessing: usageData.filter(u => u.usageType === 'dataProcessing').reduce((sum, u) => sum + u.amount, 0),
        storage: usageData.filter(u => u.usageType === 'storage').reduce((sum, u) => sum + u.amount, 0),
        customIntegrations: usageData.filter(u => u.usageType === 'customIntegrations').reduce((sum, u) => sum + u.amount, 0)
      }
    };
  }

  /**
   * Calculate customer metrics
   */
  private async calculateMetrics(usageData: any, subscription: any, period: string) {
    const totalUsage = usageData.total;
    const planLimits = subscription?.features || {};
    
    // Calculate utilization rates
    const utilization = {
      interactions: planLimits.interactions > 0 ? (totalUsage.interactions / planLimits.interactions) * 100 : 0,
      apiCalls: planLimits.apiCalls > 0 ? (totalUsage.apiCalls / planLimits.apiCalls) * 100 : 0,
      storage: planLimits.storage > 0 ? (totalUsage.storage / planLimits.storage) * 100 : 0
    };

    // Calculate overages
    const overages = {
      interactions: Math.max(0, totalUsage.interactions - (planLimits.interactions || 0)),
      apiCalls: Math.max(0, totalUsage.apiCalls - (planLimits.apiCalls || 0)),
      storage: Math.max(0, totalUsage.storage - (planLimits.storage || 0))
    };

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(usageData, subscription);

    // Calculate cost analysis
    const costAnalysis = this.calculateCostAnalysis(totalUsage, subscription);

    return {
      utilization,
      overages,
      efficiencyScore,
      costAnalysis,
      totalUsage,
      planLimits
    };
  }

  /**
   * Calculate system metrics
   */
  private async calculateSystemMetrics(systemUsage: any, totalCustomers: number) {
    const totalUsage = systemUsage.total;
    
    // Calculate average usage per customer
    const avgUsagePerCustomer = {
      interactions: totalUsage.interactions / totalCustomers,
      apiCalls: totalUsage.apiCalls / totalCustomers,
      dataProcessing: totalUsage.dataProcessing / totalCustomers,
      storage: totalUsage.storage / totalCustomers
    };

    // Calculate growth rates
    const growthRates = this.calculateGrowthRates(systemUsage.daily);

    // Calculate system health
    const systemHealth = this.calculateSystemHealth(systemUsage, totalCustomers);

    return {
      totalCustomers,
      avgUsagePerCustomer,
      growthRates,
      systemHealth,
      totalUsage
    };
  }

  /**
   * Calculate trends
   */
  private async calculateTrends(usageData: any, period: string) {
    const dailyData = usageData.daily;
    const dates = Object.keys(dailyData).sort();
    
    if (dates.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const firstHalf = dates.slice(0, Math.floor(dates.length / 2));
    const secondHalf = dates.slice(Math.floor(dates.length / 2));

    const firstHalfAvg = this.calculateAverageUsage(dailyData, firstHalf);
    const secondHalfAvg = this.calculateAverageUsage(dailyData, secondHalf);

    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    let trend = 'stable';
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';

    return {
      trend,
      change: Math.round(change * 100) / 100,
      firstHalfAvg,
      secondHalfAvg
    };
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(metrics: any, subscription: any) {
    const recommendations = [];

    // Check for high utilization
    if (metrics.utilization.interactions > 80) {
      recommendations.push({
        type: 'upgrade',
        priority: 'high',
        title: 'High Interaction Usage',
        description: `You're using ${Math.round(metrics.utilization.interactions)}% of your interaction limit. Consider upgrading your plan.`,
        action: 'upgrade_plan'
      });
    }

    if (metrics.utilization.apiCalls > 80) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'High API Usage',
        description: `You're using ${Math.round(metrics.utilization.apiCalls)}% of your API call limit. Consider optimizing your API usage.`,
        action: 'optimize_api'
      });
    }

    if (metrics.utilization.storage > 80) {
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        title: 'High Storage Usage',
        description: `You're using ${Math.round(metrics.utilization.storage)}% of your storage limit. Consider cleaning up old data.`,
        action: 'cleanup_storage'
      });
    }

    // Check for overages
    if (metrics.overages.interactions > 0 || metrics.overages.apiCalls > 0 || metrics.overages.storage > 0) {
      recommendations.push({
        type: 'billing',
        priority: 'high',
        title: 'Usage Overages Detected',
        description: 'You have usage overages that will result in additional charges.',
        action: 'review_billing'
      });
    }

    // Check efficiency score
    if (metrics.efficiencyScore < 70) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Low Efficiency Score',
        description: 'Your usage efficiency is below optimal. Consider reviewing your workflows.',
        action: 'optimize_workflows'
      });
    }

    return recommendations;
  }

  /**
   * Get top customers by usage
   */
  private async getTopCustomersByUsage(dateRange: { start: Date; end: Date }, limit: number = 10) {
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$customerId',
          totalUsage: { $sum: '$amount' },
          interactions: { $sum: { $cond: [{ $eq: ['$usageType', 'interactions'] }, '$amount', 0] } },
          apiCalls: { $sum: { $cond: [{ $eq: ['$usageType', 'apiCalls'] }, '$amount', 0] } },
          dataProcessing: { $sum: { $cond: [{ $eq: ['$usageType', 'dataProcessing'] }, '$amount', 0] } }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $sort: { totalUsage: -1 }
      },
      {
        $limit: limit
      }
    ];

    const result = await Usage.aggregate(pipeline);
    
    return result.map(item => ({
      customerId: item._id,
      customerName: item.customer.name,
      company: item.customer.company,
      totalUsage: item.totalUsage,
      breakdown: {
        interactions: item.interactions,
        apiCalls: item.apiCalls,
        dataProcessing: item.dataProcessing
      }
    }));
  }

  /**
   * Get revenue analytics
   */
  private async getRevenueAnalytics(dateRange: { start: Date; end: Date }) {
    const customers = await Customer.find({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    const subscriptions = await Subscription.find({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    const revenueByPlan = subscriptions.reduce((acc, sub) => {
      if (!acc[sub.planType]) {
        acc[sub.planType] = { count: 0, revenue: 0 };
      }
      acc[sub.planType].count++;
      acc[sub.planType].revenue += this.getPlanPrice(sub.planType);
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return {
      totalCustomers: customers.length,
      totalRevenue: Object.values(revenueByPlan).reduce((sum, plan) => sum + plan.revenue, 0),
      revenueByPlan,
      averageRevenuePerCustomer: customers.length > 0 ? 
        Object.values(revenueByPlan).reduce((sum, plan) => sum + plan.revenue, 0) / customers.length : 0
    };
  }

  /**
   * Get churn analytics
   */
  private async getChurnAnalytics(dateRange: { start: Date; end: Date }) {
    const churnedCustomers = await Customer.find({
      'subscription.status': 'canceled',
      updatedAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    const totalCustomers = await Customer.countDocuments();
    const churnRate = totalCustomers > 0 ? (churnedCustomers.length / totalCustomers) * 100 : 0;

    return {
      churnedCustomers: churnedCustomers.length,
      churnRate: Math.round(churnRate * 100) / 100,
      churnedCustomersList: churnedCustomers.map(customer => ({
        id: customer._id,
        name: customer.name,
        company: customer.company,
        churnedAt: customer.updatedAt
      }))
    };
  }

  /**
   * Helper methods
   */
  private getDateRange(period: string) {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  }

  private aggregateUsageByDay(usageData: any[]) {
    return usageData.reduce((acc, usage) => {
      const date = usage.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          interactions: 0,
          apiCalls: 0,
          dataProcessing: 0,
          storage: 0,
          customIntegrations: 0
        };
      }
      acc[date][usage.usageType] += usage.amount;
      return acc;
    }, {} as Record<string, any>);
  }

  private aggregateUsageByType(usageData: any[]) {
    return usageData.reduce((acc, usage) => {
      if (!acc[usage.usageType]) {
        acc[usage.usageType] = 0;
      }
      acc[usage.usageType] += usage.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private aggregateUsageByCustomer(usageData: any[]) {
    return usageData.reduce((acc, usage) => {
      if (!acc[usage.customerId]) {
        acc[usage.customerId] = {
          interactions: 0,
          apiCalls: 0,
          dataProcessing: 0,
          storage: 0,
          customIntegrations: 0
        };
      }
      acc[usage.customerId][usage.usageType] += usage.amount;
      return acc;
    }, {} as Record<string, any>);
  }

  private calculateEfficiencyScore(usageData: any, subscription: any) {
    // Simple efficiency calculation based on usage patterns
    const totalUsage = usageData.total;
    const planLimits = subscription?.features || {};
    
    let efficiency = 100;
    
    // Penalize for overages
    if (totalUsage.interactions > (planLimits.interactions || 0)) {
      efficiency -= 20;
    }
    if (totalUsage.apiCalls > (planLimits.apiCalls || 0)) {
      efficiency -= 20;
    }
    if (totalUsage.storage > (planLimits.storage || 0)) {
      efficiency -= 20;
    }
    
    // Reward for good utilization (not too low, not too high)
    const interactionUtilization = planLimits.interactions > 0 ? 
      (totalUsage.interactions / planLimits.interactions) * 100 : 0;
    
    if (interactionUtilization > 0 && interactionUtilization < 50) {
      efficiency -= 10; // Too low utilization
    }
    
    return Math.max(0, Math.min(100, efficiency));
  }

  private calculateCostAnalysis(totalUsage: any, subscription: any) {
    const planPrice = this.getPlanPrice(subscription?.planType || 'basic');
    const overageCost = this.calculateOverageCost(totalUsage, subscription);
    
    return {
      planPrice,
      overageCost,
      totalCost: planPrice + overageCost,
      costPerInteraction: totalUsage.interactions > 0 ? (planPrice + overageCost) / totalUsage.interactions : 0,
      costPerApiCall: totalUsage.apiCalls > 0 ? (planPrice + overageCost) / totalUsage.apiCalls : 0
    };
  }

  private calculateOverageCost(totalUsage: any, subscription: any) {
    const planLimits = subscription?.features || {};
    const overages = {
      interactions: Math.max(0, totalUsage.interactions - (planLimits.interactions || 0)),
      apiCalls: Math.max(0, totalUsage.apiCalls - (planLimits.apiCalls || 0)),
      storage: Math.max(0, totalUsage.storage - (planLimits.storage || 0))
    };
    
    return (overages.interactions * 0.01) + (overages.apiCalls * 0.01) + (overages.storage * 0.05);
  }

  private getPlanPrice(planType: string) {
    const prices = {
      basic: 97,
      professional: 197,
      enterprise: 497
    };
    return prices[planType as keyof typeof prices] || 0;
  }

  private calculateGrowthRates(dailyUsage: any) {
    const dates = Object.keys(dailyUsage).sort();
    if (dates.length < 2) return { interactions: 0, apiCalls: 0, dataProcessing: 0, storage: 0 };
    
    const firstHalf = dates.slice(0, Math.floor(dates.length / 2));
    const secondHalf = dates.slice(Math.floor(dates.length / 2));
    
    const firstHalfAvg = this.calculateAverageUsage(dailyUsage, firstHalf);
    const secondHalfAvg = this.calculateAverageUsage(dailyUsage, secondHalf);
    
    return {
      interactions: this.calculateGrowthRate(firstHalfAvg.interactions, secondHalfAvg.interactions),
      apiCalls: this.calculateGrowthRate(firstHalfAvg.apiCalls, secondHalfAvg.apiCalls),
      dataProcessing: this.calculateGrowthRate(firstHalfAvg.dataProcessing, secondHalfAvg.dataProcessing),
      storage: this.calculateGrowthRate(firstHalfAvg.storage, secondHalfAvg.storage)
    };
  }

  private calculateAverageUsage(dailyUsage: any, dates: string[]) {
    const totals = dates.reduce((acc, date) => {
      const dayData = dailyUsage[date] || { interactions: 0, apiCalls: 0, dataProcessing: 0, storage: 0, customIntegrations: 0 };
      return {
        interactions: acc.interactions + dayData.interactions,
        apiCalls: acc.apiCalls + dayData.apiCalls,
        dataProcessing: acc.dataProcessing + dayData.dataProcessing,
        storage: acc.storage + dayData.storage,
        customIntegrations: acc.customIntegrations + dayData.customIntegrations
      };
    }, { interactions: 0, apiCalls: 0, dataProcessing: 0, storage: 0, customIntegrations: 0 });
    
    const count = dates.length;
    return {
      interactions: totals.interactions / count,
      apiCalls: totals.apiCalls / count,
      dataProcessing: totals.dataProcessing / count,
      storage: totals.storage / count,
      customIntegrations: totals.customIntegrations / count
    };
  }

  private calculateGrowthRate(first: number, second: number) {
    if (first === 0) return second > 0 ? 100 : 0;
    return ((second - first) / first) * 100;
  }

  private calculateSystemHealth(systemUsage: any, totalCustomers: number) {
    const avgUsage = systemUsage.total;
    const healthScore = Math.min(100, (avgUsage.interactions / totalCustomers) * 10);
    
    let status = 'healthy';
    if (healthScore < 30) status = 'low_activity';
    else if (healthScore > 80) status = 'high_activity';
    
    return {
      score: Math.round(healthScore),
      status,
      recommendations: this.getSystemHealthRecommendations(healthScore, systemUsage)
    };
  }

  private getSystemHealthRecommendations(healthScore: number, systemUsage: any) {
    const recommendations = [];
    
    if (healthScore < 30) {
      recommendations.push('Consider implementing user engagement strategies');
    }
    
    if (systemUsage.total.apiCalls > systemUsage.total.interactions * 10) {
      recommendations.push('High API usage detected - consider optimization');
    }
    
    return recommendations;
  }
}
