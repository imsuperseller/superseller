#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🎯 CUSTOMER SUCCESS AGENT
 * 
 * Features:
 * - Opportunity detection for upsells
 * - Maintenance plan recommendations
 * - Usage analytics and insights
 * - Proactive customer engagement
 * - Success metric tracking
 * - Real-time status updates
 */

class CustomerSuccessAgent {
  constructor() {
    this.config = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1'
      },
      n8n: {
        url: 'http://173.254.201.134:5678',
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE'
      }
    };
    
    this.opportunityTypes = {
      maintenance: 'maintenance_plan',
      upgrade: 'service_upgrade',
      expansion: 'service_expansion',
      optimization: 'performance_optimization',
      training: 'training_and_support'
    };
    
    this.successMetrics = {
      usage: 'agent_usage_frequency',
      performance: 'agent_success_rate',
      engagement: 'customer_engagement_level',
      satisfaction: 'customer_satisfaction_score',
      retention: 'customer_retention_rate'
    };
  }

  // ===== OPPORTUNITY DETECTION =====

  async detectOpportunities(customerId) {
    console.log('🔍 DETECTING CUSTOMER SUCCESS OPPORTUNITIES');
    console.log('============================================');
    
    try {
      const customerProfile = await this.loadCustomerProfile(customerId);
      const agentUsage = await this.analyzeAgentUsage(customerId);
      const customerBehavior = await this.analyzeCustomerBehavior(customerId);
      
      const opportunities = [];
      
      // Check for maintenance plan opportunities
      const maintenanceOpportunity = await this.checkMaintenanceOpportunity(customerProfile, agentUsage);
      if (maintenanceOpportunity) {
        opportunities.push(maintenanceOpportunity);
      }
      
      // Check for upgrade opportunities
      const upgradeOpportunity = await this.checkUpgradeOpportunity(customerProfile, agentUsage);
      if (upgradeOpportunity) {
        opportunities.push(upgradeOpportunity);
      }
      
      // Check for expansion opportunities
      const expansionOpportunity = await this.checkExpansionOpportunity(customerProfile, customerBehavior);
      if (expansionOpportunity) {
        opportunities.push(expansionOpportunity);
      }
      
      // Check for optimization opportunities
      const optimizationOpportunity = await this.checkOptimizationOpportunity(agentUsage);
      if (optimizationOpportunity) {
        opportunities.push(optimizationOpportunity);
      }
      
      return {
        customerId,
        opportunities,
        totalOpportunities: opportunities.length,
        estimatedValue: this.calculateOpportunityValue(opportunities),
        recommendations: await this.generateRecommendations(opportunities)
      };
      
    } catch (error) {
      console.error('❌ Opportunity detection failed:', error.message);
      throw error;
    }
  }

  async checkMaintenanceOpportunity(customerProfile, agentUsage) {
    const hasMaintenancePlan = customerProfile.customer.maintenancePlan || false;
    const activeAgents = agentUsage.filter(agent => agent.status === 'active');
    
    if (!hasMaintenancePlan && activeAgents.length > 0) {
      const totalValue = activeAgents.reduce((sum, agent) => sum + agent.cost, 0);
      const maintenanceValue = totalValue * 0.15; // 15% of agent costs
      
      return {
        type: this.opportunityTypes.maintenance,
        title: 'Maintenance Plan Opportunity',
        description: 'Customer has active agents but no maintenance plan',
        priority: 'high',
        estimatedValue: maintenanceValue,
        reasoning: `Customer has ${activeAgents.length} active agents worth $${totalValue}/month but no maintenance plan`,
        recommendation: 'Offer comprehensive maintenance plan with priority support and regular optimization',
        urgency: 'medium',
        confidence: 0.85
      };
    }
    
    return null;
  }

  async checkUpgradeOpportunity(customerProfile, agentUsage) {
    const inactiveAgents = agentUsage.filter(agent => agent.status === 'inactive');
    const lowPerformanceAgents = agentUsage.filter(agent => agent.successRate < 80);
    
    if (inactiveAgents.length > 0 || lowPerformanceAgents.length > 0) {
      const upgradeValue = (inactiveAgents.length * 199) + (lowPerformanceAgents.length * 99);
      
      return {
        type: this.opportunityTypes.upgrade,
        title: 'Service Upgrade Opportunity',
        description: 'Customer has inactive or underperforming agents',
        priority: 'medium',
        estimatedValue: upgradeValue,
        reasoning: `${inactiveAgents.length} inactive agents and ${lowPerformanceAgents.length} underperforming agents`,
        recommendation: 'Offer agent optimization and reactivation services',
        urgency: 'low',
        confidence: 0.75
      };
    }
    
    return null;
  }

  async checkExpansionOpportunity(customerProfile, customerBehavior) {
    const highEngagement = customerBehavior.engagementLevel === 'high';
    const frequentUsage = customerBehavior.usageFrequency === 'daily';
    const positiveFeedback = customerBehavior.satisfactionScore > 8;
    
    if (highEngagement && frequentUsage && positiveFeedback) {
      const expansionValue = 500; // Estimated value for new services
      
      return {
        type: this.opportunityTypes.expansion,
        title: 'Service Expansion Opportunity',
        description: 'High-engagement customer ready for additional services',
        priority: 'high',
        estimatedValue: expansionValue,
        reasoning: 'Customer shows high engagement, frequent usage, and positive feedback',
        recommendation: 'Offer additional automation services and premium features',
        urgency: 'low',
        confidence: 0.90
      };
    }
    
    return null;
  }

  async checkOptimizationOpportunity(agentUsage) {
    const slowAgents = agentUsage.filter(agent => agent.averageExecutionTime > 300); // 5+ minutes
    const errorProneAgents = agentUsage.filter(agent => agent.successRate < 70);
    
    if (slowAgents.length > 0 || errorProneAgents.length > 0) {
      const optimizationValue = (slowAgents.length * 150) + (errorProneAgents.length * 200);
      
      return {
        type: this.opportunityTypes.optimization,
        title: 'Performance Optimization Opportunity',
        description: 'Agents need performance optimization',
        priority: 'medium',
        estimatedValue: optimizationValue,
        reasoning: `${slowAgents.length} slow agents and ${errorProneAgents.length} error-prone agents`,
        recommendation: 'Offer performance optimization and error resolution services',
        urgency: 'medium',
        confidence: 0.80
      };
    }
    
    return null;
  }

  // ===== USAGE ANALYTICS =====

  async analyzeAgentUsage(customerId) {
    try {
      const usageData = await this.loadAgentUsageData(customerId);
      
      return usageData.map(agent => ({
        _id: agent._id,
        name: agent.name,
        status: agent.status,
        successRate: agent.successRate || 0,
        totalRuns: agent.totalRuns || 0,
        averageExecutionTime: agent.averageExecutionTime || 0,
        cost: agent.cost || 0,
        lastRun: agent.lastRun,
        nextRun: agent.nextRun,
        usageTrend: this.calculateUsageTrend(agent),
        performanceScore: this.calculatePerformanceScore(agent)
      }));
      
    } catch (error) {
      console.error('Failed to analyze agent usage:', error);
      return [];
    }
  }

  async analyzeCustomerBehavior(customerId) {
    try {
      const behaviorData = await this.loadCustomerBehaviorData(customerId);
      
      return {
        engagementLevel: this.calculateEngagementLevel(behaviorData),
        usageFrequency: this.calculateUsageFrequency(behaviorData),
        satisfactionScore: this.calculateSatisfactionScore(behaviorData),
        supportTickets: behaviorData.supportTickets || 0,
        featureRequests: behaviorData.featureRequests || 0,
        lastActivity: behaviorData.lastActivity,
        preferredContactMethod: behaviorData.preferredContactMethod || 'email'
      };
      
    } catch (error) {
      console.error('Failed to analyze customer behavior:', error);
      return {
        engagementLevel: 'unknown',
        usageFrequency: 'unknown',
        satisfactionScore: 0,
        supportTickets: 0,
        featureRequests: 0,
        lastActivity: null,
        preferredContactMethod: 'email'
      };
    }
  }

  // ===== SUCCESS METRICS TRACKING =====

  async trackSuccessMetrics(customerId) {
    console.log('📊 TRACKING CUSTOMER SUCCESS METRICS');
    console.log('====================================');
    
    try {
      const agentUsage = await this.analyzeAgentUsage(customerId);
      const customerBehavior = await this.analyzeCustomerBehavior(customerId);
      
      const metrics = {
        customerId,
        timestamp: new Date().toISOString(),
        usage: {
          totalAgents: agentUsage.length,
          activeAgents: agentUsage.filter(a => a.status === 'active').length,
          totalRuns: agentUsage.reduce((sum, agent) => sum + agent.totalRuns, 0),
          averageSuccessRate: this.calculateAverageSuccessRate(agentUsage)
        },
        performance: {
          averageExecutionTime: this.calculateAverageExecutionTime(agentUsage),
          errorRate: this.calculateErrorRate(agentUsage),
          uptime: this.calculateUptime(agentUsage)
        },
        engagement: {
          level: customerBehavior.engagementLevel,
          frequency: customerBehavior.usageFrequency,
          satisfaction: customerBehavior.satisfactionScore,
          supportTickets: customerBehavior.supportTickets
        },
        business: {
          totalValue: agentUsage.reduce((sum, agent) => sum + agent.cost, 0),
          retentionRisk: this.calculateRetentionRisk(customerBehavior),
          growthPotential: this.calculateGrowthPotential(agentUsage, customerBehavior)
        }
      };
      
      // Save metrics
      await this.saveSuccessMetrics(customerId, metrics);
      
      return metrics;
      
    } catch (error) {
      console.error('❌ Failed to track success metrics:', error.message);
      throw error;
    }
  }

  // ===== PROACTIVE ENGAGEMENT =====

  async generateProactiveEngagement(customerId) {
    console.log('🎯 GENERATING PROACTIVE ENGAGEMENT');
    console.log('==================================');
    
    try {
      const opportunities = await this.detectOpportunities(customerId);
      const metrics = await this.trackSuccessMetrics(customerId);
      
      const engagementActions = [];
      
      // High-priority opportunities
      const highPriorityOpportunities = opportunities.opportunities.filter(opp => opp.priority === 'high');
      if (highPriorityOpportunities.length > 0) {
        engagementActions.push({
          type: 'opportunity_alert',
          priority: 'high',
          title: 'High-Value Opportunities Available',
          description: `${highPriorityOpportunities.length} high-priority opportunities detected`,
          actions: highPriorityOpportunities.map(opp => ({
            title: opp.title,
            value: opp.estimatedValue,
            recommendation: opp.recommendation
          }))
        });
      }
      
      // Performance issues
      if (metrics.performance.errorRate > 0.1) {
        engagementActions.push({
          type: 'performance_alert',
          priority: 'medium',
          title: 'Performance Issues Detected',
          description: `Error rate of ${(metrics.performance.errorRate * 100).toFixed(1)}% detected`,
          actions: [{
            title: 'Schedule Performance Review',
            value: 0,
            recommendation: 'Review and optimize underperforming agents'
          }]
        });
      }
      
      // Low engagement
      if (metrics.engagement.level === 'low') {
        engagementActions.push({
          type: 'engagement_alert',
          priority: 'medium',
          title: 'Low Engagement Detected',
          description: 'Customer shows low engagement levels',
          actions: [{
            title: 'Reach Out for Feedback',
            value: 0,
            recommendation: 'Contact customer to understand their needs and concerns'
          }]
        });
      }
      
      // Success celebrations
      if (metrics.usage.averageSuccessRate > 0.95) {
        engagementActions.push({
          type: 'success_celebration',
          priority: 'low',
          title: 'Excellent Performance!',
          description: `Success rate of ${(metrics.usage.averageSuccessRate * 100).toFixed(1)}%`,
          actions: [{
            title: 'Send Congratulations',
            value: 0,
            recommendation: 'Acknowledge customer success and offer additional services'
          }]
        });
      }
      
      return {
        customerId,
        engagementActions,
        totalActions: engagementActions.length,
        nextSteps: this.generateNextSteps(engagementActions)
      };
      
    } catch (error) {
      console.error('❌ Failed to generate proactive engagement:', error.message);
      throw error;
    }
  }

  // ===== AI-POWERED INSIGHTS =====

  async generateAIInsights(customerId) {
    try {
      const opportunities = await this.detectOpportunities(customerId);
      const metrics = await this.trackSuccessMetrics(customerId);
      const engagement = await this.generateProactiveEngagement(customerId);
      
      const insights = await this.callAI('generate_insights', {
        customerId,
        opportunities,
        metrics,
        engagement
      });
      
      return insights;
      
    } catch (error) {
      console.error('❌ Failed to generate AI insights:', error.message);
      return this.generateBasicInsights(customerId);
    }
  }

  async callAI(task, data) {
    try {
      const prompt = this.buildPrompt(task, data);
      
      const response = await axios.post(`${this.config.openai.baseURL}/chat/completions`, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(task)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = response.data.choices[0].message.content;
      return JSON.parse(result);
      
    } catch (error) {
      console.error('❌ AI call failed:', error.message);
      throw error;
    }
  }

  buildPrompt(task, data) {
    const prompts = {
      generate_insights: `
        Analyze this customer success data and generate actionable insights:
        
        Customer ID: ${data.customerId}
        Opportunities: ${JSON.stringify(data.opportunities, null, 2)}
        Metrics: ${JSON.stringify(data.metrics, null, 2)}
        Engagement: ${JSON.stringify(data.engagement, null, 2)}
        
        Generate insights in JSON format with:
        - keyInsights (array of main insights)
        - recommendations (array of specific recommendations)
        - riskFactors (array of potential risks)
        - growthOpportunities (array of growth opportunities)
        - nextActions (array of immediate next actions)
      `
    };
    
    return prompts[task] || 'Please analyze this data.';
  }

  getSystemPrompt(task) {
    const systemPrompts = {
      generate_insights: 'You are an expert customer success analyst. Analyze customer data to identify insights, opportunities, and recommendations for improving customer success and driving business growth.'
    };
    
    return systemPrompts[task] || 'You are an AI assistant helping with customer success analysis.';
  }

  // ===== UTILITY FUNCTIONS =====

  calculateOpportunityValue(opportunities) {
    return opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
  }

  calculateUsageTrend(agent) {
    // Simple trend calculation based on recent usage
    return agent.totalRuns > 10 ? 'increasing' : 'stable';
  }

  calculatePerformanceScore(agent) {
    const successWeight = 0.6;
    const speedWeight = 0.4;
    
    const successScore = agent.successRate / 100;
    const speedScore = Math.max(0, 1 - (agent.averageExecutionTime / 600)); // 10 minutes max
    
    return (successScore * successWeight) + (speedScore * speedWeight);
  }

  calculateEngagementLevel(behaviorData) {
    // Logic to determine engagement level
    if (behaviorData.usageFrequency === 'daily') return 'high';
    if (behaviorData.usageFrequency === 'weekly') return 'medium';
    return 'low';
  }

  calculateUsageFrequency(behaviorData) {
    // Logic to determine usage frequency
    return behaviorData.usageFrequency || 'unknown';
  }

  calculateSatisfactionScore(behaviorData) {
    return behaviorData.satisfactionScore || 0;
  }

  calculateAverageSuccessRate(agentUsage) {
    if (agentUsage.length === 0) return 0;
    const totalSuccessRate = agentUsage.reduce((sum, agent) => sum + agent.successRate, 0);
    return totalSuccessRate / agentUsage.length;
  }

  calculateAverageExecutionTime(agentUsage) {
    if (agentUsage.length === 0) return 0;
    const totalTime = agentUsage.reduce((sum, agent) => sum + agent.averageExecutionTime, 0);
    return totalTime / agentUsage.length;
  }

  calculateErrorRate(agentUsage) {
    if (agentUsage.length === 0) return 0;
    const totalErrors = agentUsage.reduce((sum, agent) => sum + (100 - agent.successRate), 0);
    return totalErrors / (agentUsage.length * 100);
  }

  calculateUptime(agentUsage) {
    const activeAgents = agentUsage.filter(agent => agent.status === 'active');
    return activeAgents.length / agentUsage.length;
  }

  calculateRetentionRisk(behaviorData) {
    if (behaviorData.engagementLevel === 'low') return 'high';
    if (behaviorData.satisfactionScore < 7) return 'medium';
    return 'low';
  }

  calculateGrowthPotential(agentUsage, behaviorData) {
    const highEngagement = behaviorData.engagementLevel === 'high';
    const highSatisfaction = behaviorData.satisfactionScore > 8;
    const roomForGrowth = agentUsage.length < 5;
    
    if (highEngagement && highSatisfaction && roomForGrowth) return 'high';
    if (highEngagement || highSatisfaction) return 'medium';
    return 'low';
  }

  generateRecommendations(opportunities) {
    return opportunities.map(opp => ({
      title: opp.title,
      description: opp.recommendation,
      priority: opp.priority,
      estimatedValue: opp.estimatedValue
    }));
  }

  generateNextSteps(engagementActions) {
    const steps = [];
    
    engagementActions.forEach(action => {
      if (action.priority === 'high') {
        steps.push(`Immediate: ${action.title}`);
      } else if (action.priority === 'medium') {
        steps.push(`This week: ${action.title}`);
      } else {
        steps.push(`This month: ${action.title}`);
      }
    });
    
    return steps;
  }

  generateBasicInsights(customerId) {
    return {
      keyInsights: ['Customer data analysis completed'],
      recommendations: ['Continue monitoring customer engagement'],
      riskFactors: ['Limited data available for analysis'],
      growthOpportunities: ['Focus on increasing agent usage'],
      nextActions: ['Schedule customer success review']
    };
  }

  // ===== FILE OPERATIONS =====

  async loadCustomerProfile(customerId) {
    try {
      const profilePath = path.join(process.cwd(), 'data', 'customers', customerId, 'customer-profile.json');
      const profileData = await fs.readFile(profilePath, 'utf-8');
      return JSON.parse(profileData);
    } catch (error) {
      throw new Error(`Failed to load customer profile: ${error.message}`);
    }
  }

  async loadAgentUsageData(customerId) {
    try {
      const usagePath = path.join(process.cwd(), 'data', 'customers', customerId, 'agent-usage.json');
      const usageData = await fs.readFile(usagePath, 'utf-8');
      return JSON.parse(usageData);
    } catch (error) {
      console.log('No agent usage data found, using default');
      return [];
    }
  }

  async loadCustomerBehaviorData(customerId) {
    try {
      const behaviorPath = path.join(process.cwd(), 'data', 'customers', customerId, 'customer-behavior.json');
      const behaviorData = await fs.readFile(behaviorPath, 'utf-8');
      return JSON.parse(behaviorData);
    } catch (error) {
      console.log('No customer behavior data found, using default');
      return {};
    }
  }

  async saveSuccessMetrics(customerId, metrics) {
    try {
      const metricsPath = path.join(process.cwd(), 'data', 'customers', customerId, 'success-metrics.json');
      await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
      console.log(`✅ Success metrics saved for ${customerId}`);
    } catch (error) {
      console.error('❌ Failed to save success metrics:', error.message);
    }
  }

  // ===== MAIN EXECUTION =====

  async runCustomerSuccessAnalysis(customerId) {
    console.log(`🎯 RUNNING CUSTOMER SUCCESS ANALYSIS FOR ${customerId}`);
    console.log('==================================================');
    
    try {
      const opportunities = await this.detectOpportunities(customerId);
      const metrics = await this.trackSuccessMetrics(customerId);
      const engagement = await this.generateProactiveEngagement(customerId);
      const insights = await this.generateAIInsights(customerId);
      
      const result = {
        customerId,
        opportunities,
        metrics,
        engagement,
        insights,
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ Customer success analysis completed');
      console.log(`📊 Opportunities detected: ${opportunities.totalOpportunities}`);
      console.log(`💰 Estimated value: $${opportunities.estimatedValue}`);
      console.log(`📈 Engagement actions: ${engagement.totalActions}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Customer success analysis failed:', error.message);
      throw error;
    }
  }
}

// Export the class
export default CustomerSuccessAgent;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new CustomerSuccessAgent();
  
  const customerId = process.argv[2];
  if (!customerId) {
    console.log('Usage: node customer-success-agent.js <customer-id>');
    process.exit(1);
  }
  
  agent.runCustomerSuccessAnalysis(customerId)
    .then(result => {
      console.log('🎉 Customer success analysis completed!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('❌ Customer success analysis failed:', error.message);
      process.exit(1);
    });
}
