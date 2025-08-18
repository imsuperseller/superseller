#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * DEMO: SHINY OBJECT PREVENTION SYSTEM
 * 
 * This script demonstrates how to use the new shiny object prevention
 * features in practice, showing real-world examples and validation.
 */

class ShinyObjectPreventionDemo {
  constructor() {
    this.guidelines = {};
  }

  async runDemo() {
    console.log('🎯 SHINY OBJECT PREVENTION SYSTEM DEMO');
    console.log('=======================================\n');
    
    try {
      // Load guidelines
      await this.loadGuidelines();
      
      // Demo 1: AI Agent Validation
      console.log('🤖 DEMO 1: AI Agent Validation');
      console.log('===============================');
      await this.demoAIAgentValidation();
      
      // Demo 2: Complexity Scoring
      console.log('\n📉 DEMO 2: Complexity Scoring');
      console.log('==============================');
      await this.demoComplexityScoring();
      
      // Demo 3: ROI Calculation
      console.log('\n💰 DEMO 3: ROI Calculation');
      console.log('===========================');
      await this.demoROICalculation();
      
      // Demo 4: Proactive Automation
      console.log('\n⏰ DEMO 4: Proactive Automation');
      console.log('===============================');
      await this.demoProactiveAutomation();
      
      // Demo 5: Human-in-the-Loop
      console.log('\n👤 DEMO 5: Human-in-the-Loop');
      console.log('=============================');
      await this.demoHumanInTheLoop();
      
      console.log('\n✅ DEMO COMPLETED!');
      console.log('📚 Check docs/SHINY_OBJECT_PREVENTION_GUIDE.md for full details');
      
    } catch (error) {
      console.error('❌ Error during demo:', error.message);
    }
  }

  async loadGuidelines() {
    const guidelinesDir = 'docs/shiny-object-prevention';
    
    try {
      const files = await fs.readdir(guidelinesDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(guidelinesDir, file), 'utf8');
        const guideline = JSON.parse(content);
        this.guidelines[guideline.title] = guideline;
      }
      
      console.log(`📚 Loaded ${Object.keys(this.guidelines).length} guideline sets`);
      
    } catch (error) {
      console.log('⚠️  Could not load guidelines, using demo data');
      this.guidelines = this.getDemoGuidelines();
    }
  }

  async demoAIAgentValidation() {
    const useCases = [
      {
        name: 'Simple File Routing',
        description: 'Route PDF files to PDF processor, images to image processor',
        expected: false
      },
      {
        name: 'Dynamic Chatbot',
        description: 'Handle dynamic conversation flow with infinite possibilities',
        expected: true
      },
      {
        name: 'Basic Scheduling',
        description: 'Schedule daily report generation at 9 AM',
        expected: false
      },
      {
        name: 'Content Analysis',
        description: 'Analyze content sentiment and generate contextual responses',
        expected: true
      }
    ];
    
    for (const useCase of useCases) {
      const result = this.shouldUseAIAgent(useCase.description);
      const status = result.shouldUse === useCase.expected ? '✅' : '❌';
      
      console.log(`\n${status} ${useCase.name}`);
      console.log(`   Description: ${useCase.description}`);
      console.log(`   Should Use AI: ${result.shouldUse}`);
      console.log(`   Reason: ${result.reason}`);
      if (result.alternative) {
        console.log(`   Alternative: ${result.alternative}`);
      }
    }
  }

  async demoComplexityScoring() {
    const workflows = [
      {
        name: 'Simple Data Processing',
        nodes: [
          { type: 'trigger' },
          { type: 'http' },
          { type: 'transform' },
          { type: 'output' }
        ],
        expected: 'low'
      },
      {
        name: 'Medium Complexity Workflow',
        nodes: [
          { type: 'trigger' },
          { type: 'if' },
          { type: 'http' },
          { type: 'http' },
          { type: 'transform' },
          { type: 'if' },
          { type: 'transform' },
          { type: 'http' },
          { type: 'output' }
        ],
        expected: 'medium'
      },
      {
        name: 'Complex Multi-System Integration',
        nodes: Array.from({ length: 30 }, (_, i) => ({
          type: i % 5 === 0 ? 'if' : i % 3 === 0 ? 'http' : 'transform'
        })),
        expected: 'high'
      }
    ];
    
    for (const workflow of workflows) {
      const result = this.calculateComplexityScore(workflow);
      const status = result.level === workflow.expected ? '✅' : '❌';
      
      console.log(`\n${status} ${workflow.name}`);
      console.log(`   Nodes: ${workflow.nodes.length}`);
      console.log(`   Complexity Score: ${result.score}`);
      console.log(`   Level: ${result.level}`);
      console.log(`   Recommendations: ${result.recommendations.length} items`);
    }
  }

  async demoROICalculation() {
    const projects = [
      {
        name: 'High ROI Project',
        hoursSaved: 10,
        moneySaved: 500,
        frequency: 4, // per month
        developmentHours: 20,
        expected: true
      },
      {
        name: 'Low ROI Project',
        hoursSaved: 2,
        moneySaved: 50,
        frequency: 2, // per month
        developmentHours: 40,
        expected: false
      },
      {
        name: 'Break-even Project',
        hoursSaved: 5,
        moneySaved: 200,
        frequency: 3, // per month
        developmentHours: 30,
        expected: true
      }
    ];
    
    for (const project of projects) {
      const result = this.calculateROI(project);
      const status = result.shouldProceed === project.expected ? '✅' : '❌';
      
      console.log(`\n${status} ${project.name}`);
      console.log(`   Time ROI: ${result.timeROI.toFixed(2)}x`);
      console.log(`   Money ROI: $${result.moneyROI.toFixed(2)}`);
      console.log(`   Payback Period: ${result.paybackPeriod.toFixed(1)} days`);
      console.log(`   Should Proceed: ${result.shouldProceed}`);
    }
  }

  async demoProactiveAutomation() {
    const patterns = [
      {
        name: '❌ Reactive Pattern',
        description: 'Manual Telegram command to scrape leads',
        pattern: 'reactive',
        recommendation: 'Replace with daily scheduler'
      },
      {
        name: '✅ Proactive Pattern',
        description: 'Daily scheduler for lead scraping',
        pattern: 'proactive',
        recommendation: 'Good - no human dependency'
      },
      {
        name: '❌ Manual Approval',
        description: 'Human approval for every content post',
        pattern: 'reactive',
        recommendation: 'Use approval queue with auto-publish'
      },
      {
        name: '✅ Automated Processing',
        description: 'Automatic data processing on file upload',
        pattern: 'proactive',
        recommendation: 'Good - triggers automatically'
      }
    ];
    
    for (const pattern of patterns) {
      console.log(`\n${pattern.name}`);
      console.log(`   Description: ${pattern.description}`);
      console.log(`   Pattern: ${pattern.pattern}`);
      console.log(`   Recommendation: ${pattern.recommendation}`);
    }
  }

  async demoHumanInTheLoop() {
    const scenarios = [
      {
        name: 'Content Publishing',
        description: 'AI generates content, human reviews before publishing',
        critical: true,
        template: 'content_generation_workflow'
      },
      {
        name: 'Data Analysis',
        description: 'AI analyzes data, human reviews insights before decisions',
        critical: true,
        template: 'data_analysis_workflow'
      },
      {
        name: 'Customer Communication',
        description: 'AI drafts responses, human approves before sending',
        critical: true,
        template: 'customer_communication_workflow'
      },
      {
        name: 'File Processing',
        description: 'Automatic file processing without human review',
        critical: false,
        template: 'automatic_processing'
      }
    ];
    
    for (const scenario of scenarios) {
      const icon = scenario.critical ? '👤' : '🤖';
      console.log(`\n${icon} ${scenario.name}`);
      console.log(`   Description: ${scenario.description}`);
      console.log(`   Critical Decision: ${scenario.critical ? 'Yes' : 'No'}`);
      console.log(`   Template: ${scenario.template}`);
    }
  }

  shouldUseAIAgent(description) {
    const simpleLogicPatterns = [
      'if/else', 'switch', 'routing', 'filtering', 'scheduling'
    ];
    
    const complexPatterns = [
      'reasoning', 'analysis', 'conversation', 'dynamic_decision',
      'infinite_possibilities', 'context_aware', 'sentiment'
    ];
    
    const hasSimpleLogic = simpleLogicPatterns.some(pattern => 
      description.toLowerCase().includes(pattern)
    );
    
    const hasComplexLogic = complexPatterns.some(pattern => 
      description.toLowerCase().includes(pattern)
    );
    
    if (hasSimpleLogic && !hasComplexLogic) {
      return {
        shouldUse: false,
        reason: 'Simple logic detected - use standard n8n nodes',
        alternative: 'Replace with switch, filter, or router nodes'
      };
    }
    
    if (hasComplexLogic) {
      return {
        shouldUse: true,
        reason: 'Complex reasoning required - AI agent appropriate',
        recommendation: 'Ensure proper error handling and fallbacks'
      };
    }
    
    return {
      shouldUse: false,
      reason: 'No clear complex reasoning requirement',
      recommendation: 'Start with simple nodes, add AI only if needed'
    };
  }

  calculateComplexityScore(workflow) {
    let score = 0;
    
    // Node count (30% weight)
    const nodeCount = workflow.nodes.length;
    if (nodeCount > 25) score += 30;
    else if (nodeCount > 10) score += 15;
    
    // Conditional branches (25% weight)
    const branches = workflow.nodes.filter(n => n.type === 'if').length;
    if (branches > 7) score += 25;
    else if (branches > 3) score += 12;
    
    // External integrations (20% weight)
    const integrations = workflow.nodes.filter(n => 
      n.type.includes('http') || n.type.includes('api')
    ).length;
    if (integrations > 5) score += 20;
    else if (integrations > 3) score += 10;
    
    // Error handling (15% weight)
    const errorNodes = workflow.nodes.filter(n => 
      n.type.includes('error') || n.type.includes('catch')
    ).length;
    if (errorNodes > 3) score += 15;
    else if (errorNodes > 1) score += 7;
    
    // Data transformations (10% weight)
    const transformNodes = workflow.nodes.filter(n => 
      n.type.includes('transform') || n.type.includes('function')
    ).length;
    if (transformNodes > 7) score += 10;
    else if (transformNodes > 3) score += 5;
    
    const recommendations = [];
    if (score > 70) {
      recommendations.push('Break down into smaller workflows');
      recommendations.push('Use subworkflows for common functionality');
      recommendations.push('Simplify conditional logic');
    } else if (score > 40) {
      recommendations.push('Consider simplifying complex sections');
      recommendations.push('Review for redundant nodes');
    }
    
    return {
      score: score,
      level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
      recommendations: recommendations
    };
  }

  calculateROI(project) {
    const timeSavings = project.hoursSaved * project.frequency;
    const moneySavings = project.moneySaved * project.frequency;
    const developmentTime = project.developmentHours;
    const hourlyRate = 100; // Example hourly rate
    
    const timeROI = timeSavings / developmentTime;
    const moneyROI = moneySavings / (developmentTime * hourlyRate);
    const paybackPeriod = developmentTime / (timeSavings / 160); // 160 hours per month
    
    return {
      timeROI: timeROI,
      moneyROI: moneyROI,
      paybackPeriod: paybackPeriod,
      shouldProceed: timeROI >= 2.0 && paybackPeriod <= 30
    };
  }

  getDemoGuidelines() {
    return {
      'AI Agent Usage Guidelines': {
        title: 'AI Agent Usage Guidelines',
        rules: [
          {
            rule: 'DONT_USE_FOR_SIMPLE_LOGIC',
            description: 'Don\'t use AI agents for simple if/else or switch statements'
          }
        ]
      }
    };
  }
}

async function main() {
  const demo = new ShinyObjectPreventionDemo();
  await demo.runDemo();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
