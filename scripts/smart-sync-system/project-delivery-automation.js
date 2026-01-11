#!/usr/bin/env node

/**
 * 🚀 PROJECT DELIVERY AUTOMATION
 * 
 * Automated project lifecycle management with milestone-based billing
 * and intelligent client notifications.
 */

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class ProjectDeliveryAutomation {
  constructor() {
    this.config = {
      airtable: {
        apiKey: process.env.AIRTABLE_API_KEY,
        baseUrl: 'https://api.airtable.com/v0',
        projectBaseId: 'app4nJpP1ytGukXQT',
        projectTableId: 'tblJ4C2HFSBlPkyP6'
      },
      quickbooks: {
        clientId: process.env.QUICKBOOKS_CLIENT_ID,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
        accessToken: process.env.QUICKBOOKS_ACCESS_TOKEN
      },
      stripe: {
        apiKey: process.env.STRIPE_SECRET_KEY
      },
      n8n: {
        apiUrl: process.env.N8N_API_URL || 'http://172.245.56.50:5678',
        apiKey: process.env.N8N_API_KEY
      }
    };
    
    // Project milestones configuration
    this.milestones = {
      initiation: { 
        percentage: 0, 
        billing: 0, 
        name: 'Project Initiation',
        description: 'Project setup and requirements gathering'
      },
      planning: { 
        percentage: 20, 
        billing: 0, 
        name: 'Planning Phase',
        description: 'Project planning and architecture design'
      },
      development: { 
        percentage: 50, 
        billing: 30, 
        name: 'Development Phase',
        description: 'Core development and implementation'
      },
      testing: { 
        percentage: 80, 
        billing: 50, 
        name: 'Testing Phase',
        description: 'Testing, debugging, and quality assurance'
      },
      delivery: { 
        percentage: 100, 
        billing: 100, 
        name: 'Project Delivery',
        description: 'Final delivery and handoff'
      }
    };
    
    // Notification templates
    this.notificationTemplates = {
      milestone_completion: {
        subject: '🎯 Project Milestone Completed: {projectName}',
        body: `
          <h2>Milestone Completed: {milestoneName}</h2>
          <p>Great news! We've completed the <strong>{milestoneName}</strong> phase of your project <strong>{projectName}</strong>.</p>
          
          <h3>What's Been Accomplished:</h3>
          <p>{milestoneDescription}</p>
          
          <h3>Project Progress:</h3>
          <div style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
            <div style="background: #4CAF50; height: 20px; width: {progressPercentage}%; border-radius: 3px;"></div>
            <p style="margin: 5px 0 0 0; font-weight: bold;">{progressPercentage}% Complete</p>
          </div>
          
          <h3>Next Steps:</h3>
          <p>{nextSteps}</p>
          
          <p>Thank you for your continued partnership!</p>
          <p>Best regards,<br>The Rensto Team</p>
        `
      },
      billing_trigger: {
        subject: '💰 Invoice Generated: {projectName} - {milestoneName}',
        body: `
          <h2>Invoice Generated</h2>
          <p>An invoice has been generated for the completion of <strong>{milestoneName}</strong> for your project <strong>{projectName}</strong>.</p>
          
          <h3>Invoice Details:</h3>
          <ul>
            <li><strong>Invoice Number:</strong> {invoiceNumber}</li>
            <li><strong>Amount:</strong> ${invoiceAmount}</li>
            <li><strong>Due Date:</strong> {dueDate}</li>
            <li><strong>Description:</strong> {milestoneDescription}</li>
          </ul>
          
          <p>Please review and process payment at your earliest convenience.</p>
          
          <p>Thank you for your business!</p>
          <p>Best regards,<br>The Rensto Team</p>
        `
      },
      project_delivery: {
        subject: '🎉 Project Delivered: {projectName}',
        body: `
          <h2>Project Successfully Delivered!</h2>
          <p>Congratulations! Your project <strong>{projectName}</strong> has been successfully completed and delivered.</p>
          
          <h3>Delivery Summary:</h3>
          <ul>
            <li><strong>Project Duration:</strong> {projectDuration}</li>
            <li><strong>Final Deliverables:</strong> {deliverables}</li>
            <li><strong>Project Value:</strong> ${projectValue}</li>
          </ul>
          
          <h3>What's Included:</h3>
          <p>{deliveryDetails}</p>
          
          <h3>Next Steps:</h3>
          <p>{nextSteps}</p>
          
          <p>Thank you for choosing Rensto for your project needs!</p>
          <p>Best regards,<br>The Rensto Team</p>
        `
      }
    };
  }

  // ===== MAIN AUTOMATION ENGINE =====

  async startProjectAutomation() {
    console.log('🚀 Starting Project Delivery Automation...');
    
    // Initialize automation
    await this.initializeAutomation();
    
    // Start monitoring
    this.startProjectMonitoring();
    
    console.log('✅ Project Delivery Automation started successfully');
  }

  async initializeAutomation() {
    console.log('📊 Initializing project automation...');
    
    // Get all active projects
    const activeProjects = await this.getActiveProjects();
    
    // Set up monitoring for each project
    for (const project of activeProjects) {
      await this.setupProjectMonitoring(project);
    }
    
    console.log(`📋 Monitoring ${activeProjects.length} active projects`);
  }

  startProjectMonitoring() {
    console.log('⏰ Starting project monitoring...');
    
    // Check for milestone completions every 5 minutes
    setInterval(async () => {
      await this.checkMilestoneCompletions();
    }, 300000); // 5 minutes
    
    // Check for project deliveries every 10 minutes
    setInterval(async () => {
      await this.checkProjectDeliveries();
    }, 600000); // 10 minutes
    
    // Daily project health check
    setInterval(async () => {
      await this.dailyProjectHealthCheck();
    }, 86400000); // 24 hours
  }

  // ===== PROJECT MONITORING =====

  async checkMilestoneCompletions() {
    try {
      console.log('🎯 Checking milestone completions...');
      
      const activeProjects = await this.getActiveProjects();
      
      for (const project of activeProjects) {
        const currentProgress = await this.calculateProjectProgress(project);
        const completedMilestones = this.getCompletedMilestones(currentProgress, project);
        
        for (const milestone of completedMilestones) {
          if (!project.completedMilestones?.includes(milestone.name)) {
            await this.handleMilestoneCompletion(project, milestone);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking milestone completions:', error);
    }
  }

  async checkProjectDeliveries() {
    try {
      console.log('🎉 Checking project deliveries...');
      
      const activeProjects = await this.getActiveProjects();
      
      for (const project of activeProjects) {
        const currentProgress = await this.calculateProjectProgress(project);
        
        if (currentProgress >= 100 && project.status !== 'delivered') {
          await this.handleProjectDelivery(project);
        }
      }
      
    } catch (error) {
      console.error('❌ Error checking project deliveries:', error);
    }
  }

  async dailyProjectHealthCheck() {
    try {
      console.log('🏥 Running daily project health check...');
      
      const allProjects = await this.getAllProjects();
      const healthReport = await this.generateProjectHealthReport(allProjects);
      
      // Send health report to admin dashboard
      await this.sendHealthReport(healthReport);
      
      // Alert on critical issues
      if (healthReport.criticalIssues.length > 0) {
        await this.sendCriticalAlerts(healthReport.criticalIssues);
      }
      
    } catch (error) {
      console.error('❌ Error in daily project health check:', error);
    }
  }

  // ===== MILESTONE HANDLING =====

  async handleMilestoneCompletion(project, milestone) {
    console.log(`🎯 Handling milestone completion: ${milestone.name} for project ${project.name}`);
    
    try {
      // Update project record
      await this.updateProjectMilestone(project, milestone);
      
      // Trigger billing if applicable
      if (milestone.billing > 0) {
        await this.triggerMilestoneBilling(project, milestone);
      }
      
      // Send notifications
      await this.sendMilestoneNotifications(project, milestone);
      
      // Update admin dashboard
      await this.updateAdminDashboard('milestone-completion', {
        project: project.name,
        milestone: milestone.name,
        progress: milestone.percentage,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Milestone completion handled successfully: ${milestone.name}`);
      
    } catch (error) {
      console.error(`❌ Error handling milestone completion: ${error.message}`);
      await this.logError('milestone_completion', project, milestone, error);
    }
  }

  async updateProjectMilestone(project, milestone) {
    const updateData = {
      'Progress Percentage': milestone.percentage,
      'Last Milestone': milestone.name,
      'Last Updated': new Date().toISOString(),
      'Completed Milestones': project.completedMilestones 
        ? [...project.completedMilestones, milestone.name]
        : [milestone.name]
    };
    
    // Update in Airtable
    await this.updateAirtableRecord(
      this.config.airtable.projectBaseId,
      this.config.airtable.projectTableId,
      project.id,
      updateData
    );
  }

  async triggerMilestoneBilling(project, milestone) {
    console.log(`💰 Triggering billing for milestone: ${milestone.name}`);
    
    try {
      // Create invoice in QuickBooks
      const invoice = await this.createQuickBooksInvoice(project, milestone);
      
      // Update project with invoice information
      await this.updateProjectInvoice(project, invoice);
      
      // Send billing notification
      await this.sendBillingNotification(project, milestone, invoice);
      
      console.log(`✅ Billing triggered successfully: Invoice ${invoice.id}`);
      
    } catch (error) {
      console.error(`❌ Error triggering billing: ${error.message}`);
      await this.logError('billing_trigger', project, milestone, error);
    }
  }

  async createQuickBooksInvoice(project, milestone) {
    const invoiceData = {
      CustomerRef: {
        value: project.customerId
      },
      Line: [{
        DetailType: 'SalesItemLineDetail',
        Amount: milestone.billing,
        SalesItemLineDetail: {
          ItemRef: {
            value: '1' // Service item
          }
        }
      }],
      DocNumber: `INV-${project.id}-${milestone.name.toUpperCase()}`,
      TxnDate: new Date().toISOString().split('T')[0],
      DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      PrivateNote: `Milestone completion: ${milestone.name} - ${milestone.description}`
    };
    
    // Create invoice via QuickBooks API
    const response = await axios.post(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${this.config.quickbooks.companyId}/invoice`,
      invoiceData,
      {
        headers: {
          'Authorization': `Bearer ${this.config.quickbooks.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.QueryResponse.Invoice[0];
  }

  // ===== NOTIFICATION SYSTEM =====

  async sendMilestoneNotifications(project, milestone) {
    console.log(`📧 Sending milestone notifications for: ${milestone.name}`);
    
    try {
      // Send to client
      if (project.clientEmail) {
        await this.sendClientNotification(project, milestone, 'milestone_completion');
      }
      
      // Send to team
      await this.sendTeamNotification(project, milestone);
      
      // Send to admin dashboard
      await this.updateAdminDashboard('milestone-notification', {
        project: project.name,
        milestone: milestone.name,
        clientNotified: !!project.clientEmail,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Error sending milestone notifications: ${error.message}`);
    }
  }

  async sendClientNotification(project, milestone, notificationType) {
    const template = this.notificationTemplates[notificationType];
    const subject = template.subject
      .replace('{projectName}', project.name)
      .replace('{milestoneName}', milestone.name);
    
    const body = template.body
      .replace('{projectName}', project.name)
      .replace('{milestoneName}', milestone.name)
      .replace('{milestoneDescription}', milestone.description)
      .replace('{progressPercentage}', milestone.percentage)
      .replace('{nextSteps}', this.getNextSteps(milestone));
    
    // Send email via n8n workflow
    await this.triggerN8NWorkflow('send-client-notification', {
      to: project.clientEmail,
      subject,
      body,
      project: project.name,
      milestone: milestone.name
    });
  }

  async sendBillingNotification(project, milestone, invoice) {
    const template = this.notificationTemplates.billing_trigger;
    const subject = template.subject
      .replace('{projectName}', project.name)
      .replace('{milestoneName}', milestone.name);
    
    const body = template.body
      .replace('{projectName}', project.name)
      .replace('{milestoneName}', milestone.name)
      .replace('{invoiceNumber}', invoice.DocNumber)
      .replace('{invoiceAmount}', milestone.billing)
      .replace('{dueDate}', invoice.DueDate)
      .replace('{milestoneDescription}', milestone.description);
    
    // Send billing notification
    await this.triggerN8NWorkflow('send-billing-notification', {
      to: project.clientEmail,
      subject,
      body,
      invoice: invoice.DocNumber,
      amount: milestone.billing
    });
  }

  // ===== PROJECT DELIVERY =====

  async handleProjectDelivery(project) {
    console.log(`🎉 Handling project delivery: ${project.name}`);
    
    try {
      // Update project status
      await this.updateProjectStatus(project, 'delivered');
      
      // Generate final invoice if needed
      const finalInvoice = await this.generateFinalInvoice(project);
      
      // Send delivery notifications
      await this.sendDeliveryNotifications(project, finalInvoice);
      
      // Archive project
      await this.archiveProject(project);
      
      // Update admin dashboard
      await this.updateAdminDashboard('project-delivery', {
        project: project.name,
        status: 'delivered',
        finalValue: project.totalValue,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Project delivery handled successfully: ${project.name}`);
      
    } catch (error) {
      console.error(`❌ Error handling project delivery: ${error.message}`);
      await this.logError('project_delivery', project, null, error);
    }
  }

  // ===== UTILITY METHODS =====

  async getActiveProjects() {
    // Implementation to get active projects from Airtable
    return [];
  }

  async getAllProjects() {
    // Implementation to get all projects from Airtable
    return [];
  }

  async calculateProjectProgress(project) {
    // Implementation to calculate project progress
    return 0;
  }

  getCompletedMilestones(progress, project) {
    const completed = [];
    
    for (const [key, milestone] of Object.entries(this.milestones)) {
      if (progress >= milestone.percentage && 
          !project.completedMilestones?.includes(milestone.name)) {
        completed.push(milestone);
      }
    }
    
    return completed;
  }

  getNextSteps(milestone) {
    const nextMilestone = Object.values(this.milestones)
      .find(m => m.percentage > milestone.percentage);
    
    return nextMilestone 
      ? `Next up: ${nextMilestone.name} (${nextMilestone.description})`
      : 'Project completion and delivery';
  }

  async updateAirtableRecord(baseId, tableId, recordId, data) {
    // Implementation to update Airtable record
  }

  async triggerN8NWorkflow(workflowName, data) {
    // Implementation to trigger n8n workflow
  }

  async updateAdminDashboard(section, data) {
    // Implementation to update admin dashboard
  }

  async logError(errorType, project, milestone, error) {
    // Implementation to log errors
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const projectAutomation = new ProjectDeliveryAutomation();
  
  try {
    await projectAutomation.startProjectAutomation();
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('🛑 Shutting down Project Delivery Automation...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start Project Delivery Automation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ProjectDeliveryAutomation;
