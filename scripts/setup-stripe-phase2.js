#!/usr/bin/env node

/**
 * STRIPE PHASE 2 SETUP
 * Creates products for all 4 service types
 *
 * Strategy: Archive old products, create fresh structure
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================
// STRIPE PRODUCT CATALOG
// ============================================

const STRIPE_PRODUCTS = {
  // ============================================
  // SERVICE TYPE 1: MARKETPLACE
  // ============================================
  marketplace: [
    {
      name: 'Simple Workflow Template',
      description: 'Single-app workflow templates with installation guide and 14 days support',
      price: 2900, // $29.00
      type: 'one_time',
      metadata: {
        service_type: 'marketplace',
        complexity: 'simple',
        support_days: '14',
        updates_months: '6'
      },
      features: [
        'Single-app workflow',
        'Installation guide',
        '14 days support',
        '6 months free updates'
      ]
    },
    {
      name: 'Advanced Workflow Template',
      description: 'Multi-app integration templates with video walkthrough and 30 days priority support',
      price: 9700, // $97.00
      type: 'one_time',
      metadata: {
        service_type: 'marketplace',
        complexity: 'advanced',
        support_days: '30',
        updates_months: '12',
        video_included: 'true'
      },
      features: [
        'Multi-app integrations',
        'Video installation walkthrough',
        '30 days priority support',
        '1 year free updates',
        '1:1 setup call option'
      ]
    },
    {
      name: 'Complete System Template',
      description: 'Multi-workflow system with custom configuration guide, 90 days support, and lifetime updates',
      price: 19700, // $197.00
      type: 'one_time',
      metadata: {
        service_type: 'marketplace',
        complexity: 'system',
        support_days: '90',
        updates: 'lifetime',
        setup_call: 'included'
      },
      features: [
        'Multi-workflow system',
        'Custom configuration guide',
        '90 days priority support',
        'Lifetime updates',
        '1:1 setup call included'
      ]
    },
    {
      name: 'Template + Full-Service Installation',
      description: 'Any template with complete installation, configuration, testing, and 30-minute training',
      price: 79700, // $797.00
      type: 'one_time',
      metadata: {
        service_type: 'marketplace',
        includes_install: 'true',
        includes_training: 'true',
        support_days: '90'
      },
      features: [
        'Template of your choice',
        'Complete installation & setup',
        'Custom configuration',
        'Testing & validation',
        '30-minute training session',
        '90 days support'
      ]
    },
    {
      name: 'System + Full-Service Installation',
      description: 'Complete workflow system with full installation, modifications, and 2-hour training',
      price: 199700, // $1,997.00
      type: 'one_time',
      metadata: {
        service_type: 'marketplace',
        includes_install: 'true',
        includes_modifications: 'true',
        support_months: '6'
      },
      features: [
        'Complete workflow system',
        'Full installation & setup',
        'Custom modifications',
        'Integration with your tools',
        '2-hour training session',
        '6 months priority support'
      ]
    }
  ],

  // ============================================
  // SERVICE TYPE 2: CUSTOM SOLUTIONS
  // ============================================
  customSolutions: [
    {
      name: 'Custom Solution - Consultation Deposit',
      description: 'Refundable deposit for Voice AI consultation and technical plan generation',
      price: 0, // FREE consultation
      type: 'one_time',
      metadata: {
        service_type: 'custom',
        payment_type: 'consultation',
        refundable: 'true'
      },
      features: [
        'FREE Voice AI consultation',
        'Business requirements capture',
        'Technical plan (within 48 hours)',
        'Timeline & investment breakdown',
        'No commitment required'
      ]
    },
    {
      name: 'Custom Solution - Simple Build',
      description: 'Custom automation for straightforward workflows (2-4 week timeline)',
      price: 350000, // $3,500.00
      type: 'one_time',
      metadata: {
        service_type: 'custom',
        complexity: 'simple',
        timeline_weeks: '2-4',
        support_months: '3'
      },
      features: [
        'Custom workflow development',
        'Up to 5 integrations',
        'Basic testing & deployment',
        '1-hour training',
        '90 days support'
      ]
    },
    {
      name: 'Custom Solution - Standard Build',
      description: 'Most common custom automation projects (4-6 week timeline)',
      price: 550000, // $5,500.00
      type: 'one_time',
      metadata: {
        service_type: 'custom',
        complexity: 'standard',
        timeline_weeks: '4-6',
        support_months: '6'
      },
      features: [
        'Custom workflow development',
        'Up to 10 integrations',
        'Advanced logic & error handling',
        'Comprehensive testing',
        '2-hour training',
        '6 months support'
      ]
    },
    {
      name: 'Custom Solution - Complex Build',
      description: 'Enterprise-grade custom automation (6-8+ week timeline)',
      price: 800000, // $8,000.00+
      type: 'one_time',
      metadata: {
        service_type: 'custom',
        complexity: 'complex',
        timeline_weeks: '6-8+',
        support_months: '12'
      },
      features: [
        'Custom workflow development',
        'Unlimited integrations',
        'Custom API development',
        'Enterprise testing & deployment',
        '4-hour training',
        '1 year support',
        'Dedicated success manager'
      ]
    }
  ],

  // ============================================
  // SERVICE TYPE 3: SUBSCRIPTIONS
  // ============================================
  subscriptions: {
    // Subscription Type 1: Lead Generation
    leadGeneration: [
      {
        name: 'Enhanced Leads - Starter',
        description: '100 verified leads per month from LinkedIn, Google Maps, Facebook, Apify',
        price: 29900, // $299.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'lead_generation',
          tier: 'starter',
          quota: '100',
          cost_per_lead: '2.99'
        },
        features: [
          '100 verified leads/month',
          'Industry + geo targeting',
          'Email & phone included',
          'CSV export',
          '14-day free trial',
          'Cancel anytime'
        ]
      },
      {
        name: 'Enhanced Leads - Pro',
        description: '500 verified leads per month with priority delivery and CRM integration',
        price: 59900, // $599.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'lead_generation',
          tier: 'pro',
          quota: '500',
          cost_per_lead: '1.20'
        },
        features: [
          '500 verified leads/month',
          'Priority delivery',
          'CRM auto-import',
          'Lead scoring',
          'Quality guarantee',
          '14-day free trial'
        ]
      },
      {
        name: 'Enhanced Leads - Enterprise',
        description: '2,000+ verified leads per month with dedicated account manager',
        price: 149900, // $1,499.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'lead_generation',
          tier: 'enterprise',
          quota: '2000+',
          cost_per_lead: '0.75'
        },
        features: [
          '2,000+ verified leads/month',
          'Dedicated account manager',
          'Custom targeting',
          'API access',
          'Weekly batches',
          '14-day free trial'
        ]
      }
    ],

    // Subscription Type 2: CRM Management
    crmManagement: [
      {
        name: 'CRM Management - Starter',
        description: 'Automated contact enrichment and deduplication for up to 500 contacts',
        price: 29900, // $299.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'crm_management',
          tier: 'starter',
          quota: '500'
        },
        features: [
          '500 contacts managed',
          'Daily deduplication',
          'Contact enrichment',
          'Lead scoring',
          'Basic follow-up sequences',
          '14-day free trial'
        ]
      },
      {
        name: 'CRM Management - Pro',
        description: 'Advanced CRM automation for up to 2,500 contacts with AI scoring',
        price: 59900, // $599.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'crm_management',
          tier: 'pro',
          quota: '2500'
        },
        features: [
          '2,500 contacts managed',
          'AI-powered lead scoring',
          'Advanced segmentation',
          'Custom follow-up sequences',
          'Integration monitoring',
          '14-day free trial'
        ]
      },
      {
        name: 'CRM Management - Enterprise',
        description: 'Enterprise CRM automation for 10,000+ contacts with dedicated support',
        price: 149900, // $1,499.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'crm_management',
          tier: 'enterprise',
          quota: '10000+'
        },
        features: [
          '10,000+ contacts managed',
          'Multi-CRM sync',
          'Custom automation rules',
          'Dedicated success manager',
          'Priority support',
          '14-day free trial'
        ]
      }
    ],

    // Subscription Type 3: Social Media Automation
    socialMedia: [
      {
        name: 'Social Media Automation - Starter',
        description: '30 automated posts per month across 1 social account',
        price: 29900, // $299.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'social_media',
          tier: 'starter',
          quota: '30',
          accounts: '1'
        },
        features: [
          '30 posts/month',
          '1 social account',
          'AI content generation',
          'Post scheduling',
          'Basic analytics',
          '14-day free trial'
        ]
      },
      {
        name: 'Social Media Automation - Pro',
        description: '90 automated posts per month across 3 social accounts with engagement tracking',
        price: 59900, // $599.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'social_media',
          tier: 'pro',
          quota: '90',
          accounts: '3'
        },
        features: [
          '90 posts/month',
          '3 social accounts',
          'AI content generation',
          'Engagement tracking',
          'Advanced analytics',
          '14-day free trial'
        ]
      },
      {
        name: 'Social Media Automation - Enterprise',
        description: '300+ automated posts per month across unlimited accounts with custom branding',
        price: 149900, // $1,499.00/month
        type: 'recurring',
        interval: 'month',
        metadata: {
          service_type: 'subscriptions',
          sub_type: 'social_media',
          tier: 'enterprise',
          quota: '300+',
          accounts: 'unlimited'
        },
        features: [
          '300+ posts/month',
          'Unlimited accounts',
          'Custom AI training',
          'Brand voice optimization',
          'Dedicated content strategist',
          '14-day free trial'
        ]
      }
    ]
  },

  // ============================================
  // SERVICE TYPE 4: READY SOLUTIONS
  // ============================================
  readySolutions: [
    {
      name: 'Industry Package - Single Solution',
      description: 'Pick one automation solution from your industry package',
      price: 89000, // $890.00
      type: 'one_time',
      metadata: {
        service_type: 'ready_solutions',
        package_type: 'single',
        solutions_included: '1'
      },
      features: [
        '1 industry solution',
        'Installation guide',
        'Email support',
        '48-hour setup promise',
        '30-day money-back guarantee'
      ]
    },
    {
      name: 'Industry Package - Complete',
      description: 'All 5 automation solutions for your industry',
      price: 299000, // $2,990.00
      type: 'one_time',
      metadata: {
        service_type: 'ready_solutions',
        package_type: 'complete',
        solutions_included: '5',
        savings: '1460'
      },
      features: [
        'All 5 industry solutions',
        'Comprehensive training',
        'Priority support',
        '48-hour setup promise',
        '30-day money-back guarantee',
        'Save $1,460 vs individual'
      ]
    },
    {
      name: 'Industry Package - Full-Service Installation',
      description: 'Add professional installation and setup to any package',
      price: 79700, // $797.00
      type: 'one_time',
      metadata: {
        service_type: 'ready_solutions',
        addon: 'true',
        includes_install: 'true',
        includes_training: 'true'
      },
      features: [
        'Full installation & setup',
        'Custom configuration',
        'Integration testing',
        '1-hour training session',
        '90 days priority support'
      ]
    }
  ]
};

// ============================================
// PRODUCT CREATION FUNCTIONS
// ============================================

async function archiveOldProducts() {
  console.log('\n🗄️  ARCHIVING OLD PRODUCTS...\n');

  try {
    const products = await stripe.products.list({ limit: 100 });

    for (const product of products.data) {
      // Archive products with old pricing ($25/$50/$100)
      if (product.metadata?.legacy === 'true' ||
          product.name.includes('Starter') && product.metadata?.price === '2500') {
        await stripe.products.update(product.id, {
          active: false,
          metadata: { ...product.metadata, archived_date: new Date().toISOString() }
        });
        console.log(`✅ Archived: ${product.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error archiving products:', error.message);
  }
}

async function createProduct(productData) {
  try {
    // Create product
    const product = await stripe.products.create({
      name: productData.name,
      description: productData.description,
      metadata: productData.metadata,
      active: true
    });

    console.log(`✅ Created product: ${product.name} (${product.id})`);

    // Create price
    const priceData = {
      product: product.id,
      unit_amount: productData.price,
      currency: 'usd',
      metadata: productData.metadata
    };

    if (productData.type === 'recurring') {
      priceData.recurring = { interval: productData.interval };
    }

    const price = await stripe.prices.create(priceData);

    console.log(`   💰 Price: $${(productData.price / 100).toFixed(2)}${productData.type === 'recurring' ? '/' + productData.interval : ''} (${price.id})`);

    return { product, price };
  } catch (error) {
    console.error(`❌ Error creating ${productData.name}:`, error.message);
    return null;
  }
}

async function createAllProducts() {
  console.log('\n🚀 CREATING NEW STRIPE PRODUCTS...\n');

  const results = {
    marketplace: [],
    customSolutions: [],
    subscriptions: {
      leadGeneration: [],
      crmManagement: [],
      socialMedia: []
    },
    readySolutions: []
  };

  // Create Marketplace products
  console.log('\n📦 MARKETPLACE PRODUCTS\n');
  for (const productData of STRIPE_PRODUCTS.marketplace) {
    const result = await createProduct(productData);
    if (result) results.marketplace.push(result);
  }

  // Create Custom Solutions products
  console.log('\n🛠️  CUSTOM SOLUTIONS PRODUCTS\n');
  for (const productData of STRIPE_PRODUCTS.customSolutions) {
    const result = await createProduct(productData);
    if (result) results.customSolutions.push(result);
  }

  // Create Subscription products
  console.log('\n📅 SUBSCRIPTION PRODUCTS - LEAD GENERATION\n');
  for (const productData of STRIPE_PRODUCTS.subscriptions.leadGeneration) {
    const result = await createProduct(productData);
    if (result) results.subscriptions.leadGeneration.push(result);
  }

  console.log('\n📅 SUBSCRIPTION PRODUCTS - CRM MANAGEMENT\n');
  for (const productData of STRIPE_PRODUCTS.subscriptions.crmManagement) {
    const result = await createProduct(productData);
    if (result) results.subscriptions.crmManagement.push(result);
  }

  console.log('\n📅 SUBSCRIPTION PRODUCTS - SOCIAL MEDIA\n');
  for (const productData of STRIPE_PRODUCTS.subscriptions.socialMedia) {
    const result = await createProduct(productData);
    if (result) results.subscriptions.socialMedia.push(result);
  }

  // Create Ready Solutions products
  console.log('\n🏭 READY SOLUTIONS PRODUCTS\n');
  for (const productData of STRIPE_PRODUCTS.readySolutions) {
    const result = await createProduct(productData);
    if (result) results.readySolutions.push(result);
  }

  return results;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                  STRIPE PHASE 2 SETUP SCRIPT                          ║
║                  4 Service Types Product Catalog                      ║
╚═══════════════════════════════════════════════════════════════════════╝

📊 PRODUCTS TO CREATE:

  MARKETPLACE:
    ✓ Simple Template ($29)
    ✓ Advanced Template ($97)
    ✓ Complete System ($197)
    ✓ Template + Install ($797)
    ✓ System + Install ($1,997)

  CUSTOM SOLUTIONS:
    ✓ Consultation (FREE)
    ✓ Simple Build ($3,500)
    ✓ Standard Build ($5,500)
    ✓ Complex Build ($8,000+)

  SUBSCRIPTIONS:
    Lead Generation:
      ✓ Starter ($299/mo)
      ✓ Pro ($599/mo)
      ✓ Enterprise ($1,499/mo)

    CRM Management:
      ✓ Starter ($299/mo)
      ✓ Pro ($599/mo)
      ✓ Enterprise ($1,499/mo)

    Social Media:
      ✓ Starter ($299/mo)
      ✓ Pro ($599/mo)
      ✓ Enterprise ($1,499/mo)

  READY SOLUTIONS:
    ✓ Single Solution ($890)
    ✓ Complete Package ($2,990)
    ✓ Full-Service Add-On ($797)

  TOTAL: 22 products
`);

  // Archive old products
  await archiveOldProducts();

  // Create new products
  const results = await createAllProducts();

  // Summary
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                         SETUP COMPLETE                                ║
╚═══════════════════════════════════════════════════════════════════════╝

✅ Products created:
   • Marketplace: ${results.marketplace.length}
   • Custom Solutions: ${results.customSolutions.length}
   • Lead Generation: ${results.subscriptions.leadGeneration.length}
   • CRM Management: ${results.subscriptions.crmManagement.length}
   • Social Media: ${results.subscriptions.socialMedia.length}
   • Ready Solutions: ${results.readySolutions.length}

📋 NEXT STEPS:
  1. Update Webflow pages with Stripe Checkout links
  2. Create n8n workflows for payment processing
  3. Test checkout flows for each product
  4. Configure webhooks in Stripe dashboard
  5. Build Typeforms with payment integration

🔗 Stripe Dashboard: https://dashboard.stripe.com/products
  `);

  // Save product IDs for n8n workflows
  const productMap = {
    marketplace: results.marketplace.map(r => ({
      name: r.product.name,
      product_id: r.product.id,
      price_id: r.price.id,
      amount: r.price.unit_amount
    })),
    customSolutions: results.customSolutions.map(r => ({
      name: r.product.name,
      product_id: r.product.id,
      price_id: r.price.id,
      amount: r.price.unit_amount
    })),
    subscriptions: {
      leadGeneration: results.subscriptions.leadGeneration.map(r => ({
        name: r.product.name,
        product_id: r.product.id,
        price_id: r.price.id,
        amount: r.price.unit_amount
      })),
      crmManagement: results.subscriptions.crmManagement.map(r => ({
        name: r.product.name,
        product_id: r.product.id,
        price_id: r.price.id,
        amount: r.price.unit_amount
      })),
      socialMedia: results.subscriptions.socialMedia.map(r => ({
        name: r.product.name,
        product_id: r.product.id,
        price_id: r.price.id,
        amount: r.price.unit_amount
      }))
    },
    readySolutions: results.readySolutions.map(r => ({
      name: r.product.name,
      product_id: r.product.id,
      price_id: r.price.id,
      amount: r.price.unit_amount
    }))
  };

  // Write to file for n8n
  const fs = await import('fs/promises');
  await fs.writeFile(
    './STRIPE_PRODUCT_IDS.json',
    JSON.stringify(productMap, null, 2)
  );

  console.log('\n💾 Product IDs saved to: STRIPE_PRODUCT_IDS.json\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { STRIPE_PRODUCTS, createProduct, archiveOldProducts, createAllProducts };
