import { Client } from '@notionhq/client';

async function populateNotionDatabases() {
  try {
    console.log('🚀 COMPREHENSIVE NOTION DATABASE POPULATION');
    console.log('='.repeat(60));
    
    const notion = new Client({
      auth: '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',
      notionVersion: '2025-09-03'
    });
    
    // Database IDs
    const businessReferencesDbId = '6f3c687f-91b4-46fc-a54e-193b0951d1a5';
    const businessOperationsDbId = '553892df-d665-42cb-a3c6-d68f55fe02fd';
    
    console.log('\n📊 1. POPULATING BUSINESS REFERENCES DATABASE');
    console.log('-'.repeat(50));
    
    // Get current records in Business References
    const businessRefDb = await notion.databases.retrieve({
      database_id: businessReferencesDbId
    });
    
    const businessRefDataSourceId = businessRefDb.data_sources[0].id;
    const existingBusinessRefs = await notion.dataSources.query({
      data_source_id: businessRefDataSourceId
    });
    
    console.log(`✅ Current Business References: ${existingBusinessRefs.results.length} records`);
    
    // Business References to add
    const businessReferences = [
      {
        name: 'BMAD Admin Dashboard Implementation',
        description: 'Complete implementation of micro-SaaS admin dashboard with universal customer management, revenue analytics, system monitoring, and role-based access control. Core components: Dashboard overview, customer metrics, revenue analytics, system health monitoring, admin sidebar, header, and provider system.',
        type: 'Technical Reference',
        customer: 'Universal',
        status: 'Completed',
        priority: 'High',
        platform: 'Next.js',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_ADMIN_DASHBOARD_20250116_001'
      },
      {
        name: 'BMAD Customer App Architecture Design',
        description: 'Complete architecture design for universal customer app with self-service onboarding, subscription management, template library, usage tracking, workflow management, and support system. Technical stack: Next.js 14+, Tailwind CSS, shadcn/ui, Zustand, Stripe, Airtable integration.',
        type: 'Technical Reference',
        customer: 'Universal',
        status: 'Completed',
        priority: 'High',
        platform: 'Next.js',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_CUSTOMER_APP_ARCHITECTURE_20250116_001'
      },
      {
        name: 'Rensto Micro-SaaS Business Model',
        description: 'Complete business model transformation from agency to micro-SaaS with subscription tiers, pricing strategy, and scalable revenue model. Includes Starter ($97/month), Professional ($297/month), Enterprise ($997/month) tiers with usage-based billing.',
        type: 'Business Reference',
        customer: 'Universal',
        status: 'Active',
        priority: 'High',
        platform: 'Business Model',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_MICROSAAS_MODEL_20250116_001'
      },
      {
        name: 'N8N Workflow Architecture',
        description: 'Comprehensive N8N workflow architecture for automation platform including customer onboarding, lead generation, content distribution, business operations, and customer success workflows. 9 operational MCP servers, 269 AI tools.',
        type: 'Technical Reference',
        customer: 'Universal',
        status: 'Active',
        priority: 'High',
        platform: 'N8N',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_N8N_ARCHITECTURE_20250116_001'
      },
      {
        name: 'Airtable Data Architecture',
        description: 'Complete Airtable data architecture with 15+ tables including Companies, Contacts, Projects, Tasks, Business References, Technical References, Progress Tracking, and component management tables.',
        type: 'Technical Reference',
        customer: 'Universal',
        status: 'Active',
        priority: 'High',
        platform: 'Airtable',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_AIRTABLE_ARCHITECTURE_20250116_001'
      },
      {
        name: 'Website Transformation Strategy',
        description: 'Complete website transformation strategy from agency model to micro-SaaS platform including new content, pricing pages, features, authentication, and integration with admin dashboard and customer app.',
        type: 'Business Reference',
        customer: 'Universal',
        status: 'In Progress',
        priority: 'High',
        platform: 'Next.js',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_WEBSITE_TRANSFORMATION_20250116_001'
      }
    ];
    
    // Check which records already exist
    const existingNames = existingBusinessRefs.results.map(record => 
      record.properties?.Name?.title?.[0]?.text?.content || ''
    );
    
    const newBusinessRefs = businessReferences.filter(ref => 
      !existingNames.includes(ref.name)
    );
    
    console.log(`📝 Adding ${newBusinessRefs.length} new Business References...`);
    
    for (const ref of newBusinessRefs) {
      try {
        console.log(`➕ Adding: ${ref.name}`);
        
        const response = await notion.pages.create({
          parent: {
            database_id: businessReferencesDbId
          },
          properties: {
            'Name': {
              title: [
                {
                  text: {
                    content: ref.name
                  }
                }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: ref.description
                    }
                  }
                ]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: `Type: ${ref.type} | Customer: ${ref.customer} | Status: ${ref.status} | Priority: ${ref.priority} | Platform: ${ref.platform} | RGID: ${ref.rgid}`
                    }
                  }
                ]
              }
            }
          ]
        });
        
        console.log(`✅ Successfully added: ${ref.name} (ID: ${response.id})`);
        
      } catch (error) {
        console.error(`❌ Error adding ${ref.name}:`, error.message);
      }
    }
    
    console.log('\n📊 2. POPULATING BUSINESS OPERATIONS DATABASE');
    console.log('-'.repeat(50));
    
    // Get current records in Business Operations
    const businessOpsDb = await notion.databases.retrieve({
      database_id: businessOperationsDbId
    });
    
    const businessOpsDataSourceId = businessOpsDb.data_sources[0].id;
    const existingBusinessOps = await notion.dataSources.query({
      data_source_id: businessOpsDataSourceId
    });
    
    console.log(`✅ Current Business Operations: ${existingBusinessOps.results.length} records`);
    
    // Business Operations to add
    const businessOperations = [
      {
        name: 'Customer Onboarding Process',
        description: 'Complete customer onboarding process including account setup, subscription selection, initial configuration, and first workflow deployment. Self-service onboarding with guided tutorials and support.',
        type: 'Process',
        status: 'Active',
        priority: 'High',
        department: 'Customer Success',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_ONBOARDING_PROCESS_20250116_001'
      },
      {
        name: 'Subscription Management System',
        description: 'Automated subscription management system with Stripe integration, usage tracking, billing automation, and customer lifecycle management. Includes upgrade/downgrade flows and payment processing.',
        type: 'System',
        status: 'Active',
        priority: 'High',
        department: 'Operations',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_SUBSCRIPTION_SYSTEM_20250116_001'
      },
      {
        name: 'Workflow Template Library',
        description: 'Comprehensive library of pre-built workflow templates for different industries and use cases. Includes lead generation, content distribution, business operations, and customer success templates.',
        type: 'Resource',
        status: 'Active',
        priority: 'High',
        department: 'Product',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_TEMPLATE_LIBRARY_20250116_001'
      },
      {
        name: 'Customer Support System',
        description: 'Multi-channel customer support system with ticketing, knowledge base, live chat, and automated responses. Integration with customer app and admin dashboard for seamless support experience.',
        type: 'System',
        status: 'Active',
        priority: 'High',
        department: 'Support',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_SUPPORT_SYSTEM_20250116_001'
      },
      {
        name: 'Analytics and Reporting',
        description: 'Comprehensive analytics and reporting system for customer usage, revenue tracking, system performance, and business metrics. Real-time dashboards and automated reports.',
        type: 'System',
        status: 'Active',
        priority: 'High',
        department: 'Analytics',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_ANALYTICS_SYSTEM_20250116_001'
      },
      {
        name: 'Security and Compliance',
        description: 'Security framework and compliance procedures including data protection, access controls, audit logging, and regulatory compliance (GDPR, CCPA, SOC 2).',
        type: 'Framework',
        status: 'Active',
        priority: 'High',
        department: 'Security',
        lastUpdated: '2025-01-16',
        createdBy: 'AI Assistant',
        rgid: 'RGID_SECURITY_FRAMEWORK_20250116_001'
      }
    ];
    
    // Check which records already exist
    const existingOpsNames = existingBusinessOps.results.map(record => 
      record.properties?.Name?.title?.[0]?.text?.content || ''
    );
    
    const newBusinessOps = businessOperations.filter(op => 
      !existingOpsNames.includes(op.name)
    );
    
    console.log(`📝 Adding ${newBusinessOps.length} new Business Operations...`);
    
    for (const op of newBusinessOps) {
      try {
        console.log(`➕ Adding: ${op.name}`);
        
        const response = await notion.pages.create({
          parent: {
            database_id: businessOperationsDbId
          },
          properties: {
            'Name': {
              title: [
                {
                  text: {
                    content: op.name
                  }
                }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: op.description
                    }
                  }
                ]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: `Type: ${op.type} | Status: ${op.status} | Priority: ${op.priority} | Department: ${op.department} | RGID: ${op.rgid}`
                    }
                  }
                ]
              }
            }
          ]
        });
        
        console.log(`✅ Successfully added: ${op.name} (ID: ${response.id})`);
        
      } catch (error) {
        console.error(`❌ Error adding ${op.name}:`, error.message);
      }
    }
    
    // Final verification
    console.log('\n🔍 3. FINAL VERIFICATION');
    console.log('-'.repeat(50));
    
    const finalBusinessRefs = await notion.dataSources.query({
      data_source_id: businessRefDataSourceId
    });
    
    const finalBusinessOps = await notion.dataSources.query({
      data_source_id: businessOpsDataSourceId
    });
    
    console.log(`✅ Business References: ${finalBusinessRefs.results.length} total records`);
    console.log(`✅ Business Operations: ${finalBusinessOps.results.length} total records`);
    
    console.log('\n📋 BUSINESS REFERENCES RECORDS:');
    finalBusinessRefs.results.forEach((record, index) => {
      const name = record.properties?.Name?.title?.[0]?.text?.content || 'No name';
      console.log(`   ${index + 1}. ${name}`);
    });
    
    console.log('\n📋 BUSINESS OPERATIONS RECORDS:');
    finalBusinessOps.results.forEach((record, index) => {
      const name = record.properties?.Name?.title?.[0]?.text?.content || 'No name';
      console.log(`   ${index + 1}. ${name}`);
    });
    
    console.log('\n🎉 NOTION DATABASE POPULATION COMPLETE!');
    console.log(`📊 Total Records Added: ${newBusinessRefs.length + newBusinessOps.length}`);
    console.log(`📊 Total Records in System: ${finalBusinessRefs.results.length + finalBusinessOps.results.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the population
populateNotionDatabases();
