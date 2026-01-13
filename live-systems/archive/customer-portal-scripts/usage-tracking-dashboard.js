#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

/**
 * 📊 USAGE TRACKING DASHBOARD
 * 
 * This script provides comprehensive tracking and monitoring of AI usage
 * across all customers and use cases with cost analysis and alerts.
 */

class UsageTrackingDashboard {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'data', 'usage-tracking.json');
    this.usageData = {
      customers: {},
      rensto: {},
      alerts: [],
      summary: {
        totalCost: 0,
        totalRequests: 0,
        activeCustomers: 0,
        lastUpdated: null
      }
    };
  }

  async initialize() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      this.usageData = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, start with empty data
      console.log('📊 Initializing new usage tracking data...');
    }
  }

  async trackUsage(event) {
    const {
      customerId,
      useCase,
      model,
      estimatedCost,
      success,
      timestamp = new Date().toISOString()
    } = event;

    // Determine tracking category
    const category = customerId ? 'customers' : 'rensto';
    const id = customerId || 'rensto';

    // Initialize tracking for this entity if it doesn't exist
    if (!this.usageData[category][id]) {
      this.usageData[category][id] = {
        totalCost: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        useCases: {},
        models: {},
        dailyUsage: {},
        monthlyUsage: {},
        lastActivity: null
      };
    }

    const entity = this.usageData[category][id];
    const date = new Date(timestamp);
    const dayKey = date.toISOString().split('T')[0];
    const monthKey = date.toISOString().substring(0, 7);

    // Update basic stats
    entity.totalRequests++;
    entity.totalCost += estimatedCost;
    entity.lastActivity = timestamp;

    if (success) {
      entity.successfulRequests++;
    } else {
      entity.failedRequests++;
    }

    // Track by use case
    if (!entity.useCases[useCase]) {
      entity.useCases[useCase] = {
        count: 0,
        cost: 0,
        lastUsed: null
      };
    }
    entity.useCases[useCase].count++;
    entity.useCases[useCase].cost += estimatedCost;
    entity.useCases[useCase].lastUsed = timestamp;

    // Track by model
    if (!entity.models[model]) {
      entity.models[model] = {
        count: 0,
        cost: 0,
        lastUsed: null
      };
    }
    entity.models[model].count++;
    entity.models[model].cost += estimatedCost;
    entity.models[model].lastUsed = timestamp;

    // Track daily usage
    if (!entity.dailyUsage[dayKey]) {
      entity.dailyUsage[dayKey] = {
        requests: 0,
        cost: 0,
        useCases: {}
      };
    }
    entity.dailyUsage[dayKey].requests++;
    entity.dailyUsage[dayKey].cost += estimatedCost;

    if (!entity.dailyUsage[dayKey].useCases[useCase]) {
      entity.dailyUsage[dayKey].useCases[useCase] = 0;
    }
    entity.dailyUsage[dayKey].useCases[useCase]++;

    // Track monthly usage
    if (!entity.monthlyUsage[monthKey]) {
      entity.monthlyUsage[monthKey] = {
        requests: 0,
        cost: 0,
        useCases: {}
      };
    }
    entity.monthlyUsage[monthKey].requests++;
    entity.monthlyUsage[monthKey].cost += estimatedCost;

    if (!entity.monthlyUsage[monthKey].useCases[useCase]) {
      entity.monthlyUsage[monthKey].useCases[useCase] = 0;
    }
    entity.monthlyUsage[monthKey].useCases[useCase]++;

    // Update summary
    this.updateSummary();

    // Check for alerts
    await this.checkAlerts(category, id, event);

    // Save data
    await this.saveData();
  }

  updateSummary() {
    const summary = {
      totalCost: 0,
      totalRequests: 0,
      activeCustomers: 0,
      lastUpdated: new Date().toISOString()
    };

    // Calculate Rensto totals
    Object.values(this.usageData.rensto).forEach(entity => {
      summary.totalCost += entity.totalCost;
      summary.totalRequests += entity.totalRequests;
    });

    // Calculate customer totals
    Object.values(this.usageData.customers).forEach(entity => {
      summary.totalCost += entity.totalCost;
      summary.totalRequests += entity.totalRequests;
      summary.activeCustomers++;
    });

    this.usageData.summary = summary;
  }

  async checkAlerts(category, id, event) {
    const entity = this.usageData[category][id];
    const alerts = [];

    // High cost alert
    if (event.estimatedCost > 0.50) {
      alerts.push({
        type: 'high_cost',
        severity: 'warning',
        message: `High cost request: $${event.estimatedCost.toFixed(4)} for ${id}`,
        timestamp: new Date().toISOString(),
        details: event
      });
    }

    // High daily usage alert
    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = entity.dailyUsage[today];
    if (dailyUsage && dailyUsage.cost > 5.00) {
      alerts.push({
        type: 'high_daily_usage',
        severity: 'warning',
        message: `High daily usage: $${dailyUsage.cost.toFixed(2)} for ${id}`,
        timestamp: new Date().toISOString(),
        details: { dailyCost: dailyUsage.cost, dailyRequests: dailyUsage.requests }
      });
    }

    // High failure rate alert
    const failureRate = entity.failedRequests / entity.totalRequests;
    if (failureRate > 0.1) { // 10% failure rate
      alerts.push({
        type: 'high_failure_rate',
        severity: 'error',
        message: `High failure rate: ${(failureRate * 100).toFixed(1)}% for ${id}`,
        timestamp: new Date().toISOString(),
        details: { failureRate, totalRequests: entity.totalRequests, failedRequests: entity.failedRequests }
      });
    }

    // Add alerts to tracking data
    this.usageData.alerts.push(...alerts);
  }

  async saveData() {
    try {
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
      await fs.writeFile(this.dataFile, JSON.stringify(this.usageData, null, 2));
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  }

  // ===== REPORTING METHODS =====

  generateCustomerReport(customerId) {
    const customer = this.usageData.customers[customerId];
    if (!customer) {
      return { error: 'Customer not found' };
    }

    return {
      customerId,
      summary: {
        totalCost: customer.totalCost,
        totalRequests: customer.totalRequests,
        successRate: customer.successfulRequests / customer.totalRequests,
        lastActivity: customer.lastActivity
      },
      useCases: customer.useCases,
      models: customer.models,
      recentActivity: this.getRecentActivity(customer.dailyUsage, 7)
    };
  }

  generateSystemReport() {
    return {
      rensto: {
        summary: {
          totalCost: this.usageData.summary.totalCost,
          totalRequests: this.usageData.summary.totalRequests
        },
        useCases: this.usageData.rensto.rensto?.useCases || {},
        models: this.usageData.rensto.rensto?.models || {}
      },
      customers: {
        active: this.usageData.summary.activeCustomers,
        list: Object.keys(this.usageData.customers)
      },
      alerts: this.usageData.alerts.slice(-10) // Last 10 alerts
    };
  }

  generateCostAnalysis() {
    const analysis = {
      totalCost: this.usageData.summary.totalCost,
      costBreakdown: {
        rensto: 0,
        customers: {}
      },
      topUseCases: {},
      topModels: {},
      dailyTrends: {}
    };

    // Calculate Rensto costs
    Object.values(this.usageData.rensto).forEach(entity => {
      analysis.costBreakdown.rensto += entity.totalCost;
    });

    // Calculate customer costs
    Object.entries(this.usageData.customers).forEach(([customerId, entity]) => {
      analysis.costBreakdown.customers[customerId] = entity.totalCost;
    });

    // Aggregate use cases and models
    const allEntities = { ...this.usageData.rensto, ...this.usageData.customers };
    Object.values(allEntities).forEach(entity => {
      Object.entries(entity.useCases).forEach(([useCase, data]) => {
        if (!analysis.topUseCases[useCase]) {
          analysis.topUseCases[useCase] = { count: 0, cost: 0 };
        }
        analysis.topUseCases[useCase].count += data.count;
        analysis.topUseCases[useCase].cost += data.cost;
      });

      Object.entries(entity.models).forEach(([model, data]) => {
        if (!analysis.topModels[model]) {
          analysis.topModels[model] = { count: 0, cost: 0 };
        }
        analysis.topModels[model].count += data.count;
        analysis.topModels[model].cost += data.cost;
      });
    });

    return analysis;
  }

  getRecentActivity(dailyUsage, days = 7) {
    const recent = {};
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      
      if (dailyUsage[dayKey]) {
        recent[dayKey] = dailyUsage[dayKey];
      }
    }
    
    return recent;
  }

  // ===== ALERT MANAGEMENT =====

  getActiveAlerts(severity = null) {
    let alerts = this.usageData.alerts;
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    return alerts.slice(-20); // Last 20 alerts
  }

  clearAlerts(olderThan = null) {
    if (olderThan) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - olderThan);
      
      this.usageData.alerts = this.usageData.alerts.filter(alert => 
        new Date(alert.timestamp) > cutoff
      );
    } else {
      this.usageData.alerts = [];
    }
    
    this.saveData();
  }
}

// Export singleton instance
export const usageTrackingDashboard = new UsageTrackingDashboard();

// Example usage and testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = new UsageTrackingDashboard();
  
  async function testDashboard() {
    await dashboard.initialize();
    
    console.log('📊 Testing Usage Tracking Dashboard...');
    
    // Simulate some usage events
    await dashboard.trackUsage({
      customerId: 'ben',
      useCase: 'wordpress',
      model: 'gpt-4',
      estimatedCost: 0.15,
      success: true
    });
    
    await dashboard.trackUsage({
      customerId: 'shelly',
      useCase: 'excel',
      model: 'gpt-3.5-turbo',
      estimatedCost: 0.05,
      success: true
    });
    
    await dashboard.trackUsage({
      customerId: null, // Rensto system usage
      useCase: 'admin',
      model: 'gpt-3.5-turbo',
      estimatedCost: 0.02,
      success: true
    });
    
    // Generate reports
    console.log('\n📈 Customer Report (Ben):');
    console.log(JSON.stringify(dashboard.generateCustomerReport('ben'), null, 2));
    
    console.log('\n📊 System Report:');
    console.log(JSON.stringify(dashboard.generateSystemReport(), null, 2));
    
    console.log('\n💰 Cost Analysis:');
    console.log(JSON.stringify(dashboard.generateCostAnalysis(), null, 2));
    
    console.log('\n🚨 Active Alerts:');
    console.log(JSON.stringify(dashboard.getActiveAlerts(), null, 2));
  }
  
  testDashboard().catch(console.error);
}
