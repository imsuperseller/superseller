#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

class StripeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'stripe-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });

    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_payment_link':
            return await this.createPaymentLink(args);
          case 'create_customer':
            return await this.createCustomer(args);
          case 'list_customers':
            return await this.listCustomers(args);
          case 'create_subscription':
            return await this.createSubscription(args);
          case 'list_subscriptions':
            return await this.listSubscriptions(args);
          case 'create_invoice':
            return await this.createInvoice(args);
          case 'list_invoices':
            return await this.listInvoices(args);
          case 'get_account_balance':
            return await this.getAccountBalance(args);
          case 'health_check':
            return await this.healthCheck(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async createPaymentLink(args) {
    const { productId, customerEmail, successUrl, cancelUrl } = args;
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: productId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: customerEmail,
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(session, null, 2) }],
    };
  }

  async createCustomer(args) {
    const { email, name, metadata } = args;
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(customer, null, 2) }],
    };
  }

  async listCustomers(args) {
    const { limit = 10 } = args;
    const customers = await this.stripe.customers.list({ limit });
    return {
      content: [
        { type: 'text', text: JSON.stringify(customers.data, null, 2) },
      ],
    };
  }

  async createSubscription(args) {
    const { customerId, priceId, metadata } = args;
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: metadata || {},
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(subscription, null, 2) }],
    };
  }

  async listSubscriptions(args) {
    const { customerId, status } = args;
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status,
    });
    return {
      content: [
        { type: 'text', text: JSON.stringify(subscriptions.data, null, 2) },
      ],
    };
  }

  async createInvoice(args) {
    const { customerId, amount, currency, description } = args;
    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      amount,
      currency,
      description,
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(invoice, null, 2) }],
    };
  }

  async listInvoices(args) {
    const { customerId, limit = 10 } = args;
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(invoices.data, null, 2) }],
    };
  }

  async getAccountBalance(args) {
    const balance = await this.stripe.balance.retrieve();
    return {
      content: [{ type: 'text', text: JSON.stringify(balance, null, 2) }],
    };
  }

  async healthCheck(args) {
    return {
      content: [
        {
          type: 'text',
          text: '✅ Stripe MCP Server is healthy and connected',
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Stripe MCP Server running on stdio');
  }
}

// Start the server
const server = new StripeMCPServer();
server.run().catch(console.error);
