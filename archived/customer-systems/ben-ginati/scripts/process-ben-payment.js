#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

class BenPaymentProcessor {
  constructor() {
    this.customerProfilePath = 'data/customers/ben-ginati/customer-profile.json';
    this.paymentAmount = 2500;
    this.paymentDate = new Date().toISOString().split('T')[0];
  }

  async processPayment() {
    try {
      console.log('💳 PROCESSING BEN GINATI PAYMENT');
      console.log(`📊 Amount: $${this.paymentAmount}`);
      console.log(`📅 Date: ${this.paymentDate}`);
      
      // Read current customer profile
      const profileData = await fs.readFile(this.customerProfilePath, 'utf8');
      const profile = JSON.parse(profileData);
      
      // Update payment status
      profile.customer.paymentStatus.firstPayment.status = 'paid';
      profile.customer.paymentStatus.firstPayment.paidDate = this.paymentDate;
      profile.customer.status = 'active';
      profile.customer.updatedAt = new Date().toISOString();
      
      // Update agent statuses
      profile.agents.forEach(agent => {
        agent.status = 'ready_for_activation';
        agent.updatedAt = new Date().toISOString();
      });
      
      // Update questions status
      profile.questions.forEach(question => {
        if (question.id === 'ben-004') {
          question.status = 'completed';
          question.completedAt = new Date().toISOString();
        }
      });
      
      // Save updated profile
      await fs.writeFile(this.customerProfilePath, JSON.stringify(profile, null, 2));
      
      console.log('✅ PAYMENT PROCESSED SUCCESSFULLY');
      console.log('🎯 CUSTOMER STATUS: ACTIVE');
      console.log('🤖 AGENTS STATUS: READY FOR ACTIVATION');
      console.log('');
      console.log('🚀 NEXT STEPS:');
      console.log('   1. Guide Ben through credential setup');
      console.log('   2. Activate all 4 agents');
      console.log('   3. Test agent functionality');
      console.log('   4. Schedule second payment reminder');
      
      return {
        success: true,
        paymentAmount: this.paymentAmount,
        paymentDate: this.paymentDate,
        customerStatus: 'active',
        agentsReady: true
      };
      
    } catch (error) {
      console.error('❌ PAYMENT PROCESSING FAILED:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generatePaymentReceipt() {
    const receipt = {
      customer: 'Ben Ginati - Tax4Us',
      paymentId: `BEN-${Date.now()}`,
      amount: this.paymentAmount,
      date: this.paymentDate,
      description: 'First payment - 4 AI Agents Setup',
      services: [
        'WordPress Content Agent',
        'WordPress Blog & Posts Agent', 
        'Podcast Complete Agent',
        'Social Media Agent'
      ],
      nextPayment: {
        amount: 2500,
        dueDate: '2025-03-20',
        description: 'Second payment - Project completion'
      }
    };
    
    const receiptPath = 'data/customers/ben-ginati/payment-receipt.json';
    await fs.writeFile(receiptPath, JSON.stringify(receipt, null, 2));
    
    console.log('📄 PAYMENT RECEIPT GENERATED');
    console.log(`📁 Location: ${receiptPath}`);
    
    return receipt;
  }
}

// Execute payment processing
const processor = new BenPaymentProcessor();

async function main() {
  console.log('🎯 BEN GINATI - PAYMENT PROCESSING');
  console.log('=====================================');
  
  const result = await processor.processPayment();
  
  if (result.success) {
    await processor.generatePaymentReceipt();
    console.log('');
    console.log('🎉 PAYMENT COMPLETE - BEN GINATI IS NOW ACTIVE!');
  } else {
    console.log('❌ PAYMENT FAILED - MANUAL INTERVENTION REQUIRED');
  }
}

main().catch(console.error);
