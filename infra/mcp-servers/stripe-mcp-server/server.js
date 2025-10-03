// OBSOLETE: Stripe MCP Server
// This server is no longer used as Stripe MCP now uses Docker container
// 
// Migration: Stripe MCP server now runs via Docker container:
// docker run --rm -i mcp/stripe
//
// Configuration: Managed through Cursor MCP configuration
// File: /Users/shaifriedman/.cursor/mcp.json
//
// Last Updated: 2025-01-10
// Status: OBSOLETE - Use Docker container instead

console.log('⚠️  OBSOLETE SERVER: Stripe MCP Server');
console.log('====================================');
console.log('This server is no longer used.');
console.log('Stripe MCP now uses Docker container: docker run --rm -i mcp/stripe');
console.log('Configuration managed through Cursor MCP settings.');
process.exit(0);

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

const server = new Server(
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

// Payment Links & Checkout
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_payment_link':
        const { productId, customerEmail, successUrl, cancelUrl } = args;
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price: productId, quantity: 1 }],
          mode: 'payment',
          success_url:
            successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success`,
          cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
          customer_email: customerEmail,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(session, null, 2) }],
        };

      case 'create_subscription':
        const { customerId, priceId, metadata } = args;
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          metadata: metadata || {},
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify(subscription, null, 2) },
          ],
        };

      case 'create_customer':
        const { email, name, metadata: customerMetadata } = args;
        const customer = await stripe.customers.create({
          email,
          name,
          metadata: customerMetadata || {},
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(customer, null, 2) }],
        };

      case 'list_customers':
        const { limit = 10 } = args;
        const customers = await stripe.customers.list({ limit });
        return {
          content: [
            { type: 'text', text: JSON.stringify(customers.data, null, 2) },
          ],
        };

      case 'get_customer':
        const { customerId: getCustomerId } = args;
        const customerData = await stripe.customers.retrieve(getCustomerId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(customerData, null, 2) },
          ],
        };

      case 'update_customer':
        const { customerId: updateCustomerId, updates } = args;
        const updatedCustomer = await stripe.customers.update(
          updateCustomerId,
          updates
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(updatedCustomer, null, 2) },
          ],
        };

      case 'list_subscriptions':
        const { customerId: listSubCustomerId, status } = args;
        const subscriptions = await stripe.subscriptions.list({
          customer: listSubCustomerId,
          status,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify(subscriptions.data, null, 2) },
          ],
        };

      case 'cancel_subscription':
        const { subscriptionId } = args;
        const canceledSubscription = await stripe.subscriptions.cancel(
          subscriptionId
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(canceledSubscription, null, 2),
            },
          ],
        };

      case 'create_invoice':
        const {
          customerId: invoiceCustomerId,
          items,
          metadata: invoiceMetadata,
        } = args;
        const invoice = await stripe.invoices.create({
          customer: invoiceCustomerId,
          items,
          metadata: invoiceMetadata || {},
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(invoice, null, 2) }],
        };

      case 'list_invoices':
        const { customerId: listInvoiceCustomerId, limit: invoiceLimit = 10 } =
          args;
        const invoices = await stripe.invoices.list({
          customer: listInvoiceCustomerId,
          limit: invoiceLimit,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify(invoices.data, null, 2) },
          ],
        };

      case 'create_refund':
        const { paymentIntentId, amount, reason } = args;
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount,
          reason: reason || 'requested_by_customer',
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(refund, null, 2) }],
        };

      case 'list_products':
        const { limit: productLimit = 10, active } = args;
        const products = await stripe.products.list({
          limit: productLimit,
          active,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify(products.data, null, 2) },
          ],
        };

      case 'create_product':
        const { productName, description, metadata: productMetadata } = args;
        const product = await stripe.products.create({
          name: productName,
          description,
          metadata: productMetadata || {},
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(product, null, 2) }],
        };

      case 'list_prices':
        const { productId: priceProductId, active: priceActive } = args;
        const prices = await stripe.prices.list({
          product: priceProductId,
          active: priceActive,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify(prices.data, null, 2) },
          ],
        };

      case 'create_price':
        const {
          productId: createPriceProductId,
          unitAmount,
          currency,
          recurring,
        } = args;
        const price = await stripe.prices.create({
          product: createPriceProductId,
          unit_amount: unitAmount,
          currency: currency || 'usd',
          recurring,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(price, null, 2) }],
        };

      case 'create_customer_portal_session':
        const { customerId: portalCustomerId, returnUrl } = args;
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: portalCustomerId,
          return_url:
            returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
        return {
          content: [
            { type: 'text', text: JSON.stringify(portalSession, null, 2) },
          ],
        };

      case 'list_payment_intents':
        const { customerId: piCustomerId, limit: piLimit = 10 } = args;
        const paymentIntents = await stripe.paymentIntents.list({
          customer: piCustomerId,
          limit: piLimit,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(paymentIntents.data, null, 2),
            },
          ],
        };

      case 'get_payment_intent':
        const { paymentIntentId: getPiId } = args;
        const paymentIntent = await stripe.paymentIntents.retrieve(getPiId);
        return {
          content: [
            { type: 'text', text: JSON.stringify(paymentIntent, null, 2) },
          ],
        };

      case 'create_webhook_endpoint':
        const { url, events } = args;
        const webhook = await stripe.webhookEndpoints.create({
          url,
          enabled_events: events,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(webhook, null, 2) }],
        };

      case 'list_webhook_endpoints':
        const webhooks = await stripe.webhookEndpoints.list();
        return {
          content: [
            { type: 'text', text: JSON.stringify(webhooks.data, null, 2) },
          ],
        };

      case 'create_coupon':
        const { percentOff, duration, couponName } = args;
        const coupon = await stripe.coupons.create({
          percent_off: percentOff,
          duration,
          name: couponName,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(coupon, null, 2) }],
        };

      case 'list_coupons':
        const coupons = await stripe.coupons.list();
        return {
          content: [
            { type: 'text', text: JSON.stringify(coupons.data, null, 2) },
          ],
        };

      case 'create_tax_rate':
        const { percentage, displayName, taxDescription } = args;
        const taxRate = await stripe.taxRates.create({
          percentage,
          display_name: displayName,
          description: taxDescription,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(taxRate, null, 2) }],
        };

      case 'get_account_balance':
        const balance = await stripe.balance.retrieve();
        return {
          content: [{ type: 'text', text: JSON.stringify(balance, null, 2) }],
        };

      case 'list_transfers':
        const { limit: transferLimit = 10 } = args;
        const transfers = await stripe.transfers.list({ limit: transferLimit });
        return {
          content: [
            { type: 'text', text: JSON.stringify(transfers.data, null, 2) },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Tool definitions
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'create_payment_link',
        description: 'Create a Stripe payment link for one-time payments',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Stripe product ID' },
            customerEmail: { type: 'string', description: 'Customer email' },
            successUrl: { type: 'string', description: 'Success redirect URL' },
            cancelUrl: { type: 'string', description: 'Cancel redirect URL' },
          },
          required: ['productId'],
        },
      },
      {
        name: 'create_subscription',
        description: 'Create a recurring subscription for a customer',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
            priceId: { type: 'string', description: 'Stripe price ID' },
            metadata: { type: 'object', description: 'Additional metadata' },
          },
          required: ['customerId', 'priceId'],
        },
      },
      {
        name: 'create_customer',
        description: 'Create a new Stripe customer',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Customer email' },
            name: { type: 'string', description: 'Customer name' },
            metadata: { type: 'object', description: 'Additional metadata' },
          },
          required: ['email'],
        },
      },
      {
        name: 'list_customers',
        description: 'List all Stripe customers',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of customers to return',
            },
          },
        },
      },
      {
        name: 'get_customer',
        description: 'Get customer details by ID',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
          },
          required: ['customerId'],
        },
      },
      {
        name: 'update_customer',
        description: 'Update customer information',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
            updates: { type: 'object', description: 'Fields to update' },
          },
          required: ['customerId', 'updates'],
        },
      },
      {
        name: 'list_subscriptions',
        description: 'List customer subscriptions',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
            status: {
              type: 'string',
              description: 'Subscription status filter',
            },
          },
          required: ['customerId'],
        },
      },
      {
        name: 'cancel_subscription',
        description: 'Cancel a subscription',
        inputSchema: {
          type: 'object',
          properties: {
            subscriptionId: {
              type: 'string',
              description: 'Stripe subscription ID',
            },
          },
          required: ['subscriptionId'],
        },
      },
      {
        name: 'create_invoice',
        description: 'Create an invoice for a customer',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
            items: { type: 'array', description: 'Invoice line items' },
            metadata: { type: 'object', description: 'Additional metadata' },
          },
          required: ['customerId', 'items'],
        },
      },
      {
        name: 'list_invoices',
        description: 'List customer invoices',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
            limit: {
              type: 'number',
              description: 'Number of invoices to return',
            },
          },
          required: ['customerId'],
        },
      },
      {
        name: 'create_refund',
        description: 'Create a refund for a payment',
        inputSchema: {
          type: 'object',
          properties: {
            paymentIntentId: {
              type: 'string',
              description: 'Payment intent ID',
            },
            amount: { type: 'number', description: 'Refund amount in cents' },
            reason: { type: 'string', description: 'Refund reason' },
          },
          required: ['paymentIntentId'],
        },
      },
      {
        name: 'list_products',
        description: 'List all Stripe products',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of products to return',
            },
            active: { type: 'boolean', description: 'Filter by active status' },
          },
        },
      },
      {
        name: 'create_product',
        description: 'Create a new Stripe product',
        inputSchema: {
          type: 'object',
          properties: {
            productName: { type: 'string', description: 'Product name' },
            description: { type: 'string', description: 'Product description' },
            metadata: { type: 'object', description: 'Additional metadata' },
          },
          required: ['productName'],
        },
      },
      {
        name: 'list_prices',
        description: 'List product prices',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Stripe product ID' },
            active: { type: 'boolean', description: 'Filter by active status' },
          },
          required: ['productId'],
        },
      },
      {
        name: 'create_price',
        description: 'Create a new price for a product',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Stripe product ID' },
            unitAmount: { type: 'number', description: 'Price in cents' },
            currency: { type: 'string', description: 'Currency code' },
            recurring: {
              type: 'object',
              description: 'Recurring configuration',
            },
          },
          required: ['productId', 'unitAmount'],
        },
      },
      {
        name: 'create_customer_portal_session',
        description: 'Create a customer portal session',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
            returnUrl: {
              type: 'string',
              description: 'Return URL after portal session',
            },
          },
          required: ['customerId'],
        },
      },
      {
        name: 'list_payment_intents',
        description: 'List customer payment intents',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: { type: 'string', description: 'Stripe customer ID' },
            limit: {
              type: 'number',
              description: 'Number of payment intents to return',
            },
          },
          required: ['customerId'],
        },
      },
      {
        name: 'get_payment_intent',
        description: 'Get payment intent details',
        inputSchema: {
          type: 'object',
          properties: {
            paymentIntentId: {
              type: 'string',
              description: 'Payment intent ID',
            },
          },
          required: ['paymentIntentId'],
        },
      },
      {
        name: 'create_webhook_endpoint',
        description: 'Create a webhook endpoint',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Webhook URL' },
            events: { type: 'array', description: 'Events to listen for' },
          },
          required: ['url', 'events'],
        },
      },
      {
        name: 'list_webhook_endpoints',
        description: 'List all webhook endpoints',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_coupon',
        description: 'Create a discount coupon',
        inputSchema: {
          type: 'object',
          properties: {
            percentOff: { type: 'number', description: 'Discount percentage' },
            duration: { type: 'string', description: 'Coupon duration' },
            name: { type: 'string', description: 'Coupon name' },
          },
          required: ['percentOff', 'duration'],
        },
      },
      {
        name: 'list_coupons',
        description: 'List all coupons',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_tax_rate',
        description: 'Create a tax rate',
        inputSchema: {
          type: 'object',
          properties: {
            percentage: { type: 'number', description: 'Tax percentage' },
            displayName: { type: 'string', description: 'Display name' },
            description: { type: 'string', description: 'Tax description' },
          },
          required: ['percentage', 'displayName'],
        },
      },
      {
        name: 'get_account_balance',
        description: 'Get Stripe account balance',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_transfers',
        description: 'List account transfers',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of transfers to return',
            },
          },
        },
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.log('Stripe MCP Server running...');
