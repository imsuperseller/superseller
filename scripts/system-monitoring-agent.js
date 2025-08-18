#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🔧 SYSTEM MONITORING AGENT
 * 
 * Features:
 * - VPS resource monitoring
 * - Performance optimization alerts
 * - Growth prediction analytics
 * - Capacity planning recommendations
 * - Automated scaling suggestions
 * - Cost optimization insights
 */

class SystemMonitoringAgent {
  constructor() {
    this.config = {
      vps: {
        url: 'http://173.254.201.134',
        sshPort: 22,
        n8nPort: 5678,
        monitoringInterval: 300000 // 5 minutes
      },
      thresholds: {
        cpu: 80, // 80% CPU usage
        memory: 85, // 85% memory usage
        disk: 90, // 90% disk usage
        network: 70, // 70% network usage
        responseTime: 2000 // 2 seconds
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1'
      }
    };
    
    this.monitoringData = {
      system: {},
      performance: {},
      growth: {},
      recommendations: []
    };
  }

  // ===== VPS RESOURCE MONITORING =====

  async monitorVPSResources() {
    console.log('🔧 MONITORING VPS RESOURCES');
    console.log('============================');
    
    try {
      const systemMetrics = await this.getSystemMetrics();
      const performanceMetrics = await this.getPerformanceMetrics();
      const networkMetrics = await this.getNetworkMetrics();
      
      const monitoringData = {
        timestamp: new Date().toISOString(),
        system: systemMetrics,
        performance: performanceMetrics,
        network: networkMetrics,
        alerts: this.generateAlerts(systemMetrics, performanceMetrics, networkMetrics)
      };
      
      // Save monitoring data
      await this.saveMonitoringData(monitoringData);
      
      // Check for critical issues
      const criticalIssues = this.checkCriticalIssues(monitoringData);
      if (criticalIssues.length > 0) {
        await this.sendCriticalAlert(criticalIssues);
      }
      
      return monitoringData;
      
    } catch (error) {
      console.error('❌ VPS monitoring failed:', error.message);
      throw error;
    }
  }

  async getSystemMetrics() {
    try {
      // In a real implementation, this would use SSH or a monitoring API
      // For now, we'll simulate the metrics
      const metrics = {
        cpu: {
          usage: Math.random() * 100,
          cores: 4,
          load: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
        },
        memory: {
          total: 8192, // 8GB
          used: Math.random() * 8192,
          available: Math.random() * 8192,
          usage: Math.random() * 100
        },
        disk: {
          total: 100000, // 100GB
          used: Math.random() * 100000,
          available: Math.random() * 100000,
          usage: Math.random() * 100
        },
        uptime: Math.floor(Math.random() * 86400 * 30), // Up to 30 days
        processes: Math.floor(Math.random() * 200) + 50
      };
      
      return metrics;
      
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      return null;
    }
  }

  async getPerformanceMetrics() {
    try {
      // Test n8n performance
      const startTime = Date.now();
      const response = await axios.get(`${this.config.vps.url}:${this.config.vps.n8nPort}/api/v1/health`, {
        timeout: 5000
      });
      const responseTime = Date.now() - startTime;
      
      return {
        n8n: {
          status: response.status === 200 ? 'healthy' : 'unhealthy',
          responseTime,
          uptime: response.data?.uptime || 0,
          version: response.data?.version || 'unknown'
        },
        database: {
          status: 'healthy', // Would check actual database
          connections: Math.floor(Math.random() * 20) + 5,
          queryTime: Math.random() * 100
        },
        api: {
          status: 'healthy',
          responseTime: Math.random() * 500,
          requestsPerMinute: Math.floor(Math.random() * 100) + 10
        }
      };
      
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        n8n: { status: 'unhealthy', responseTime: 0, uptime: 0, version: 'unknown' },
        database: { status: 'unknown', connections: 0, queryTime: 0 },
        api: { status: 'unknown', responseTime: 0, requestsPerMinute: 0 }
      };
    }
  }

  async getNetworkMetrics() {
    try {
      // Simulate network metrics
      return {
        bandwidth: {
          incoming: Math.random() * 100, // MB/s
          outgoing: Math.random() * 50, // MB/s
          total: Math.random() * 150
        },
        connections: {
          active: Math.floor(Math.random() * 100) + 10,
          established: Math.floor(Math.random() * 50) + 5,
          listening: Math.floor(Math.random() * 20) + 2
        },
        latency: {
          average: Math.random() * 50 + 10, // ms
          min: Math.random() * 20 + 5,
          max: Math.random() * 100 + 50
        }
      };
      
    } catch (error) {
      console.error('Failed to get network metrics:', error);
      return null;
    }
  }

  // ===== PERFORMANCE OPTIMIZATION =====

  async analyzePerformanceOptimization() {
    console.log('⚡ ANALYZING PERFORMANCE OPTIMIZATION');
    console.log('=====================================');
    
    try {
      const monitoringData = await this.loadLatestMonitoringData();
      const optimizationRecommendations = [];
      
      // CPU optimization
      if (monitoringData.system.cpu.usage > this.config.thresholds.cpu) {
        optimizationRecommendations.push({
          type: 'cpu_optimization',
          priority: 'high',
          title: 'CPU Usage Optimization',
          description: `CPU usage is at ${monitoringData.system.cpu.usage.toFixed(1)}%`,
          recommendations: [
            'Consider upgrading CPU or adding more cores',
            'Optimize running processes and services',
            'Implement load balancing for better distribution',
            'Review and optimize n8n workflows'
          ],
          estimatedImpact: '20-30% performance improvement',
          cost: 100 // Estimated cost for optimization
        });
      }
      
      // Memory optimization
      if (monitoringData.system.memory.usage > this.config.thresholds.memory) {
        optimizationRecommendations.push({
          type: 'memory_optimization',
          priority: 'high',
          title: 'Memory Usage Optimization',
          description: `Memory usage is at ${monitoringData.system.memory.usage.toFixed(1)}%`,
          recommendations: [
            'Consider upgrading RAM',
            'Optimize memory-intensive applications',
            'Implement memory caching strategies',
            'Review and close unnecessary processes'
          ],
          estimatedImpact: '15-25% performance improvement',
          cost: 150
        });
      }
      
      // Disk optimization
      if (monitoringData.system.disk.usage > this.config.thresholds.disk) {
        optimizationRecommendations.push({
          type: 'disk_optimization',
          priority: 'critical',
          title: 'Disk Space Optimization',
          description: `Disk usage is at ${monitoringData.system.disk.usage.toFixed(1)}%`,
          recommendations: [
            'Clean up unnecessary files and logs',
            'Implement log rotation and archiving',
            'Consider upgrading storage capacity',
            'Move large files to external storage'
          ],
          estimatedImpact: 'Prevent system crashes',
          cost: 200
        });
      }
      
      // Network optimization
      if (monitoringData.network.bandwidth.total > this.config.thresholds.network) {
        optimizationRecommendations.push({
          type: 'network_optimization',
          priority: 'medium',
          title: 'Network Bandwidth Optimization',
          description: `Network usage is high`,
          recommendations: [
            'Implement bandwidth throttling',
            'Optimize data transfer protocols',
            'Consider upgrading network connection',
            'Implement CDN for static content'
          ],
          estimatedImpact: '10-20% performance improvement',
          cost: 75
        });
      }
      
      return {
        recommendations: optimizationRecommendations,
        totalRecommendations: optimizationRecommendations.length,
        estimatedTotalCost: optimizationRecommendations.reduce((sum, rec) => sum + rec.cost, 0),
        priorityBreakdown: this.getPriorityBreakdown(optimizationRecommendations)
      };
      
    } catch (error) {
      console.error('❌ Performance optimization analysis failed:', error.message);
      throw error;
    }
  }

  // ===== GROWTH PREDICTION ANALYTICS =====

  async analyzeGrowthPrediction() {
    console.log('📈 ANALYZING GROWTH PREDICTION');
    console.log('==============================');
    
    try {
      const historicalData = await this.loadHistoricalData();
      const currentMetrics = await this.loadLatestMonitoringData();
      const customerGrowth = await this.analyzeCustomerGrowth();
      
      const growthPrediction = {
        timeframe: '6 months',
        predictions: {
          cpu: this.predictResourceGrowth(historicalData.cpu, currentMetrics.system.cpu.usage),
          memory: this.predictResourceGrowth(historicalData.memory, currentMetrics.system.memory.usage),
          disk: this.predictResourceGrowth(historicalData.disk, currentMetrics.system.disk.usage),
          network: this.predictResourceGrowth(historicalData.network, currentMetrics.network.bandwidth.total)
        },
        customerGrowth: customerGrowth,
        scalingRecommendations: this.generateScalingRecommendations(customerGrowth),
        capacityPlanning: this.generateCapacityPlanning(customerGrowth)
      };
      
      return growthPrediction;
      
    } catch (error) {
      console.error('❌ Growth prediction analysis failed:', error.message);
      throw error;
    }
  }

  predictResourceGrowth(historicalData, currentUsage) {
    // Simple linear prediction based on current usage and growth rate
    const growthRate = 0.15; // 15% monthly growth
    const months = 6;
    
    const predictedUsage = currentUsage * Math.pow(1 + growthRate, months);
    
    return {
      current: currentUsage,
      predicted: predictedUsage,
      growthRate: growthRate,
      monthsToThreshold: this.calculateMonthsToThreshold(currentUsage, growthRate),
      recommendation: predictedUsage > 90 ? 'Upgrade needed' : 'Monitor closely'
    };
  }

  async analyzeCustomerGrowth() {
    try {
      // Analyze customer data for growth patterns
      const customersDir = path.join(process.cwd(), 'data', 'customers');
      const customerFolders = await fs.readdir(customersDir);
      
      const customerData = [];
      for (const folder of customerFolders) {
        try {
          const profilePath = path.join(customersDir, folder, 'customer-profile.json');
          const profileData = await fs.readFile(profilePath, 'utf-8');
          const profile = JSON.parse(profileData);
          
          customerData.push({
            id: folder,
            createdAt: profile.createdAt || new Date().toISOString(),
            agents: profile.agents?.length || 0,
            status: profile.status || 'active'
          });
        } catch (error) {
          console.log(`Skipping customer ${folder}: ${error.message}`);
        }
      }
      
      const activeCustomers = customerData.filter(c => c.status === 'active');
      const totalAgents = activeCustomers.reduce((sum, c) => sum + c.agents, 0);
      
      return {
        totalCustomers: customerData.length,
        activeCustomers: activeCustomers.length,
        totalAgents: totalAgents,
        averageAgentsPerCustomer: totalAgents / activeCustomers.length,
        growthRate: this.calculateCustomerGrowthRate(customerData),
        projectedGrowth: this.projectCustomerGrowth(activeCustomers.length, totalAgents)
      };
      
    } catch (error) {
      console.error('Failed to analyze customer growth:', error);
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        totalAgents: 0,
        averageAgentsPerCustomer: 0,
        growthRate: 0,
        projectedGrowth: { customers: 0, agents: 0 }
      };
    }
  }

  generateScalingRecommendations(customerGrowth) {
    const recommendations = [];
    
    if (customerGrowth.projectedGrowth.customers > 50) {
      recommendations.push({
        type: 'horizontal_scaling',
        priority: 'high',
        title: 'Horizontal Scaling Required',
        description: 'Projected customer growth requires additional servers',
        recommendations: [
          'Add load balancer for traffic distribution',
          'Deploy additional n8n instances',
          'Implement database clustering',
          'Set up auto-scaling groups'
        ],
        estimatedCost: 500,
        timeframe: '3 months'
      });
    }
    
    if (customerGrowth.projectedGrowth.agents > 200) {
      recommendations.push({
        type: 'vertical_scaling',
        priority: 'medium',
        title: 'Vertical Scaling Recommended',
        description: 'High agent count requires more resources per server',
        recommendations: [
          'Upgrade server specifications',
          'Increase memory allocation',
          'Optimize agent execution',
          'Implement resource quotas'
        ],
        estimatedCost: 300,
        timeframe: '1 month'
      });
    }
    
    return recommendations;
  }

  generateCapacityPlanning(customerGrowth) {
    return {
      currentCapacity: {
        customers: 100,
        agents: 500,
        storage: '100GB',
        bandwidth: '1TB/month'
      },
      projectedNeeds: {
        customers: customerGrowth.projectedGrowth.customers,
        agents: customerGrowth.projectedGrowth.agents,
        storage: `${Math.ceil(customerGrowth.projectedGrowth.agents * 0.5)}GB`,
        bandwidth: `${Math.ceil(customerGrowth.projectedGrowth.agents * 2)}TB/month`
      },
      scalingPlan: {
        phase1: 'Optimize current infrastructure (1 month)',
        phase2: 'Add additional servers (2-3 months)',
        phase3: 'Implement auto-scaling (3-6 months)'
      }
    };
  }

  // ===== COST OPTIMIZATION =====

  async analyzeCostOptimization() {
    console.log('💰 ANALYZING COST OPTIMIZATION');
    console.log('==============================');
    
    try {
      const currentCosts = await this.calculateCurrentCosts();
      const optimizationOpportunities = await this.identifyCostOptimizations();
      
      return {
        currentCosts,
        optimizationOpportunities,
        potentialSavings: optimizationOpportunities.reduce((sum, opp) => sum + opp.savings, 0),
        recommendations: this.generateCostRecommendations(optimizationOpportunities)
      };
      
    } catch (error) {
      console.error('❌ Cost optimization analysis failed:', error.message);
      throw error;
    }
  }

  async calculateCurrentCosts() {
    // Simulate cost calculation
    return {
      server: 100, // Monthly server cost
      bandwidth: 50, // Monthly bandwidth cost
      storage: 25, // Monthly storage cost
      monitoring: 15, // Monthly monitoring cost
      total: 190
    };
  }

  async identifyCostOptimizations() {
    const opportunities = [];
    
    // Check for unused resources
    const monitoringData = await this.loadLatestMonitoringData();
    
    if (monitoringData.system.cpu.usage < 30) {
      opportunities.push({
        type: 'resource_optimization',
        title: 'Reduce CPU Resources',
        description: 'Low CPU usage indicates over-provisioning',
        savings: 25,
        implementation: 'Downgrade to smaller instance type',
        risk: 'low'
      });
    }
    
    if (monitoringData.system.memory.usage < 40) {
      opportunities.push({
        type: 'resource_optimization',
        title: 'Reduce Memory Resources',
        description: 'Low memory usage indicates over-provisioning',
        savings: 20,
        implementation: 'Reduce memory allocation',
        risk: 'low'
      });
    }
    
    if (monitoringData.system.disk.usage < 50) {
      opportunities.push({
        type: 'storage_optimization',
        title: 'Optimize Storage',
        description: 'Low disk usage indicates over-provisioning',
        savings: 15,
        implementation: 'Reduce storage allocation',
        risk: 'low'
      });
    }
    
    return opportunities;
  }

  // ===== ALERT SYSTEM =====

  generateAlerts(systemMetrics, performanceMetrics, networkMetrics) {
    const alerts = [];
    
    // System alerts
    if (systemMetrics.cpu.usage > this.config.thresholds.cpu) {
      alerts.push({
        type: 'warning',
        severity: 'high',
        title: 'High CPU Usage',
        description: `CPU usage is at ${systemMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (systemMetrics.memory.usage > this.config.thresholds.memory) {
      alerts.push({
        type: 'warning',
        severity: 'high',
        title: 'High Memory Usage',
        description: `Memory usage is at ${systemMetrics.memory.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (systemMetrics.disk.usage > this.config.thresholds.disk) {
      alerts.push({
        type: 'critical',
        severity: 'critical',
        title: 'Critical Disk Usage',
        description: `Disk usage is at ${systemMetrics.disk.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Performance alerts
    if (performanceMetrics.n8n.responseTime > this.config.thresholds.responseTime) {
      alerts.push({
        type: 'warning',
        severity: 'medium',
        title: 'Slow n8n Response',
        description: `n8n response time is ${performanceMetrics.n8n.responseTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  }

  checkCriticalIssues(monitoringData) {
    return monitoringData.alerts.filter(alert => alert.severity === 'critical');
  }

  async sendCriticalAlert(criticalIssues) {
    console.log('🚨 CRITICAL ALERTS DETECTED:');
    criticalIssues.forEach(issue => {
      console.log(`- ${issue.title}: ${issue.description}`);
    });
    
    // In production, this would send notifications via email, Slack, etc.
  }

  // ===== UTILITY FUNCTIONS =====

  calculateMonthsToThreshold(currentUsage, growthRate) {
    const threshold = 90; // 90% threshold
    if (currentUsage >= threshold) return 0;
    
    let months = 0;
    let usage = currentUsage;
    
    while (usage < threshold && months < 12) {
      usage *= (1 + growthRate);
      months++;
    }
    
    return months;
  }

  calculateCustomerGrowthRate(customerData) {
    if (customerData.length < 2) return 0;
    
    const sortedData = customerData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstMonth = new Date(sortedData[0].createdAt).getMonth();
    const lastMonth = new Date(sortedData[sortedData.length - 1].createdAt).getMonth();
    const monthsDiff = lastMonth - firstMonth || 1;
    
    return (customerData.length - 1) / monthsDiff;
  }

  projectCustomerGrowth(currentCustomers, currentAgents) {
    const growthRate = 0.2; // 20% monthly growth
    const months = 6;
    
    return {
      customers: Math.ceil(currentCustomers * Math.pow(1 + growthRate, months)),
      agents: Math.ceil(currentAgents * Math.pow(1 + growthRate, months))
    };
  }

  getPriorityBreakdown(recommendations) {
    const breakdown = { high: 0, medium: 0, low: 0 };
    recommendations.forEach(rec => {
      breakdown[rec.priority]++;
    });
    return breakdown;
  }

  generateCostRecommendations(optimizationOpportunities) {
    return optimizationOpportunities.map(opp => ({
      title: opp.title,
      description: opp.description,
      savings: opp.savings,
      implementation: opp.implementation,
      risk: opp.risk
    }));
  }

  // ===== FILE OPERATIONS =====

  async saveMonitoringData(data) {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'system-monitoring', 'monitoring-data.json');
      await fs.mkdir(path.dirname(dataPath), { recursive: true });
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
      console.log('✅ Monitoring data saved');
    } catch (error) {
      console.error('❌ Failed to save monitoring data:', error.message);
    }
  }

  async loadLatestMonitoringData() {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'system-monitoring', 'monitoring-data.json');
      const data = await fs.readFile(dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No monitoring data found, using default');
      return {
        system: { cpu: { usage: 50 }, memory: { usage: 60 }, disk: { usage: 70 } },
        network: { bandwidth: { total: 50 } }
      };
    }
  }

  async loadHistoricalData() {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'system-monitoring', 'historical-data.json');
      const data = await fs.readFile(dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No historical data found, using default');
      return {
        cpu: [50, 55, 60, 65, 70],
        memory: [60, 65, 70, 75, 80],
        disk: [70, 75, 80, 85, 90],
        network: [50, 55, 60, 65, 70]
      };
    }
  }

  // ===== MAIN EXECUTION =====

  async runSystemMonitoring() {
    console.log('🔧 RUNNING SYSTEM MONITORING');
    console.log('============================');
    
    try {
      const monitoringData = await this.monitorVPSResources();
      const optimizationAnalysis = await this.analyzePerformanceOptimization();
      const growthPrediction = await this.analyzeGrowthPrediction();
      const costOptimization = await this.analyzeCostOptimization();
      
      const result = {
        timestamp: new Date().toISOString(),
        monitoring: monitoringData,
        optimization: optimizationAnalysis,
        growth: growthPrediction,
        cost: costOptimization,
        summary: this.generateSummary(monitoringData, optimizationAnalysis, growthPrediction, costOptimization)
      };
      
      console.log('✅ System monitoring completed');
      console.log(`🚨 Alerts: ${monitoringData.alerts.length}`);
      console.log(`⚡ Optimization recommendations: ${optimizationAnalysis.totalRecommendations}`);
      console.log(`💰 Potential savings: $${costOptimization.potentialSavings}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ System monitoring failed:', error.message);
      throw error;
    }
  }

  generateSummary(monitoring, optimization, growth, cost) {
    return {
      systemHealth: monitoring.alerts.length === 0 ? 'healthy' : 'needs_attention',
      optimizationNeeded: optimization.totalRecommendations > 0,
      scalingRequired: growth.scalingRecommendations.length > 0,
      costOptimizationAvailable: cost.potentialSavings > 0,
      overallStatus: this.calculateOverallStatus(monitoring, optimization, growth, cost)
    };
  }

  calculateOverallStatus(monitoring, optimization, growth, cost) {
    const criticalAlerts = monitoring.alerts.filter(a => a.severity === 'critical').length;
    const highPriorityOptimizations = optimization.recommendations.filter(r => r.priority === 'high').length;
    
    if (criticalAlerts > 0) return 'critical';
    if (highPriorityOptimizations > 0) return 'warning';
    return 'healthy';
  }
}

// Export the class
export default SystemMonitoringAgent;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new SystemMonitoringAgent();
  
  agent.runSystemMonitoring()
    .then(result => {
      console.log('🎉 System monitoring completed!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('❌ System monitoring failed:', error.message);
      process.exit(1);
    });
}
