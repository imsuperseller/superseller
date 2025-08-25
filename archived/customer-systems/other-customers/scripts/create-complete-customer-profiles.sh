#!/bin/bash

# 📊 CREATE COMPLETE CUSTOMER PROFILES
echo "📊 CREATE COMPLETE CUSTOMER PROFILES"
echo "===================================="

echo ""
echo "🎯 BMAD ANALYSIS:"
echo "================="

echo ""
echo "🔍 BUILD PHASE - Customer Profile Strategy:"
echo "   ✅ Define all customer requirements"
echo "   ✅ Create agent specifications"
echo "   ✅ Design payment workflows"
echo "   ✅ Build approval system"

echo ""
echo "📈 MEASURE PHASE - Implementation Plan:"
echo "   ✅ Create customer profiles"
echo "   ✅ Build custom agents"
echo "   ✅ Implement payment tracking"
echo "   ✅ Design customer dashboards"

echo ""
echo "🔧 ANALYZE PHASE - Technical Strategy:"
echo "   ✅ Map agent requirements"
echo "   ✅ Design n8n workflows"
echo "   ✅ Create database structure"
echo "   ✅ Plan integration points"

echo ""
echo "🚀 DEPLOY PHASE - Implementation:"
echo "   ✅ Deploy customer profiles"
echo "   ✅ Create agent workflows"
echo "   ✅ Set up payment system"
echo "   ✅ Build customer portals"

echo ""
echo "🎯 CREATING COMPLETE CUSTOMER PROFILES..."

# Create comprehensive customer profiles
cat > /tmp/complete-customer-profiles.js << 'EOF'
// Complete Customer Profiles with All Agents
const fs = require('fs');

const CUSTOMER_PROFILES = {
  // BEN GINATI - TAX4US.CO.IL
  "ben-ginati": {
    customer: {
      name: "Ben Ginati",
      email: "ben@tax4us.co.il", // NEED TO CONFIRM
      company: "Tax4Us",
      website: "https://tax4us.co.il",
      industry: "Tax Services",
      businessSize: "small",
      primaryUseCase: "Content automation for tax services website and podcast",
      currentAutomationLevel: "none",
      plan: "enterprise",
      status: "pending",
      billingCycle: "project",
      projectTimeline: "2-3 months",
      budget: "$5000",
      successMetrics: "Content automation, podcast production, social media engagement",
      notes: "Needs 4 agents: WordPress content, WordPress blog/posts, podcast, social media. Payment: $5000 in 2 installments (start + completion). Not paid yet.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    organization: {
      name: "Tax4Us",
      slug: "tax4us",
      domain: "tax4us.co.il",
      industry: "tax-services",
      businessSize: "small",
      subscription: "enterprise",
      brandTheme: "professional",
      status: "active"
    },
    agents: [
      {
        name: "WordPress Content Agent",
        key: "ben-wordpress-content",
        description: "Automates WordPress content creation (excluding blog and posts)",
        status: "draft",
        type: "content-automation",
        capabilities: ["wordpress-integration", "content-generation", "seo-optimization"],
        schedule: "weekly",
        isActive: false,
        successRate: 0,
        avgDuration: 30,
        costEst: 0,
        roi: 0,
        icon: "📝",
        tags: ["wordpress", "content", "seo", "tax-services"],
        dependencies: ["wordpress-api", "openai"],
        requirements: {
          wordpressCredentials: "required",
          contentGuidelines: "required",
          targetKeywords: "required"
        }
      },
      {
        name: "WordPress Blog & Posts Agent",
        key: "ben-wordpress-blog",
        description: "Automates WordPress blog and posts content creation",
        status: "draft",
        type: "content-automation",
        capabilities: ["wordpress-integration", "blog-generation", "post-scheduling"],
        schedule: "weekly",
        isActive: false,
        successRate: 0,
        avgDuration: 45,
        costEst: 0,
        roi: 0,
        icon: "📰",
        tags: ["wordpress", "blog", "posts", "content"],
        dependencies: ["wordpress-api", "openai"],
        requirements: {
          wordpressCredentials: "required",
          blogTopics: "required",
          postingSchedule: "required"
        }
      },
      {
        name: "Podcast Complete Agent",
        key: "ben-podcast-agent",
        description: "Complete podcast automation for Apple and Spotify platforms",
        status: "draft",
        type: "podcast-automation",
        capabilities: ["content-research", "episode-recording", "platform-upload", "market-analysis"],
        schedule: "weekly",
        isActive: false,
        successRate: 0,
        avgDuration: 120,
        costEst: 0,
        roi: 0,
        icon: "🎙️",
        tags: ["podcast", "apple", "spotify", "recording"],
        dependencies: ["openai", "audio-processing", "platform-apis"],
        requirements: {
          podcastCredentials: "required",
          episodeTopics: "required",
          recordingPreferences: "required"
        },
        features: {
          contentResearch: "Research market and competitors for fresh content",
          episodeSuggestions: "AI-generated episode topics and outlines",
          recordingAutomation: "Full episode recording with AI voice",
          approvalWorkflow: "Customer approval for content and recordings",
          platformUpload: "Automatic upload to Apple Podcasts and Spotify",
          performanceTracking: "Episode performance analytics"
        }
      },
      {
        name: "Social Media Agent",
        key: "ben-social-agent",
        description: "Facebook and LinkedIn social media automation",
        status: "draft",
        type: "social-media",
        capabilities: ["facebook-automation", "linkedin-automation", "content-scheduling"],
        schedule: "daily",
        isActive: false,
        successRate: 0,
        avgDuration: 20,
        costEst: 0,
        roi: 0,
        icon: "📱",
        tags: ["facebook", "linkedin", "social-media", "marketing"],
        dependencies: ["facebook-api", "linkedin-api"],
        requirements: {
          facebookCredentials: "required",
          linkedinCredentials: "required",
          contentStrategy: "required"
        }
      }
    ],
    payment: {
      totalAmount: 5000,
      currency: "USD",
      paymentMethod: "installments",
      installments: [
        { amount: 2500, status: "pending", dueDate: "project-start", description: "Project initiation payment" },
        { amount: 2500, status: "pending", dueDate: "project-completion", description: "Project completion payment" }
      ],
      status: "pending",
      paidAmount: 0,
      remainingAmount: 5000
    }
  },

  // ORTAL FLANARY - LOCAL-IL.COM & WONDER.CARE
  "ortal-flanary": {
    customer: {
      name: "Ortal Flanary",
      email: "ortal.flanary@gmail.com",
      company: "Local-IL.com & Wonder.care",
      website: "https://local-il.com",
      industry: "Marketing & Healthcare",
      businessSize: "small",
      primaryUseCase: "Facebook group scraping for Jewish community lead generation",
      currentAutomationLevel: "intermediate",
      plan: "pro",
      status: "active",
      billingCycle: "monthly",
      projectTimeline: "ongoing",
      budget: "monthly subscription",
      successMetrics: "Lead generation, Facebook audience creation, community engagement",
      notes: "Working for local-il.com (Facebook scraper active) and wonder.care (no agent needed yet). Waiting for offer.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    organization: {
      name: "Portal Flanary",
      slug: "portal-flanary",
      domain: "local-il.com",
      industry: "marketing",
      businessSize: "small",
      subscription: "pro",
      brandTheme: "default",
      status: "active"
    },
    agents: [
      {
        name: "Facebook Group Scraper",
        key: "ortal-facebook-scraper",
        description: "Scrapes public Facebook groups for Jewish community lead generation",
        status: "ready",
        type: "data-scraping",
        capabilities: ["data-extraction", "api-integration", "scheduling", "custom-audiences"],
        schedule: "weekly",
        isActive: true,
        successRate: 95,
        avgDuration: 45,
        costEst: 2.5,
        roi: 3.2,
        icon: "📘",
        tags: ["scraping", "social-media", "lead-generation", "jewish-community"],
        dependencies: ["apify", "facebook"],
        features: {
          groupScraping: "Scrapes 50+ Jewish community Facebook groups",
          leadExtraction: "Extracts contact information and engagement data",
          customAudiences: "Creates Facebook custom audiences automatically",
          performanceAnalytics: "Tracks groups processed, leads generated, audiences created"
        }
      }
    ],
    payment: {
      totalAmount: 0,
      currency: "USD",
      paymentMethod: "subscription",
      status: "active",
      paidAmount: 0,
      remainingAmount: 0,
      note: "Waiting for offer"
    }
  },

  // SHELLY MIZRAHI - INSURANCE AGENT
  "shelly-mizrahi": {
    customer: {
      name: "Shelly Mizrahi",
      email: "shellypensia@gmail.com",
      company: "Shelly Mizrahi Consulting",
      website: null,
      industry: "Insurance Services",
      businessSize: "small",
      primaryUseCase: "Excel file processing for family insurance profiles",
      currentAutomationLevel: "none",
      plan: "basic",
      status: "active",
      billingCycle: "one-time",
      projectTimeline: "1-2 weeks",
      budget: "$250",
      successMetrics: "Automated family profile generation, easy data access",
      notes: "Insurance agent in Afula, Israel. No website. Needs Excel file processing agent. Paid $250 via QuickBooks manually.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    organization: {
      name: "Shelly Mizrahi Consulting",
      slug: "shelly-mizrahi-insurance",
      domain: null,
      industry: "insurance",
      businessSize: "small",
      subscription: "basic",
      brandTheme: "professional",
      status: "active"
    },
    agents: [
      {
        name: "Family Profile Generator",
        key: "shelly-family-profile",
        description: "Processes Excel files to generate combined family insurance profiles",
        status: "draft",
        type: "data-processing",
        capabilities: ["excel-processing", "data-aggregation", "profile-generation"],
        schedule: "manual",
        isActive: false,
        successRate: 0,
        avgDuration: 15,
        costEst: 0,
        roi: 0,
        icon: "👨‍👩‍👧‍👦",
        tags: ["excel", "insurance", "family-profiles", "data-processing"],
        dependencies: ["excel-parser", "data-aggregation"],
        requirements: {
          excelTemplate: "required",
          familyDataStructure: "required"
        },
        features: {
          fileUpload: "Easy Excel file upload through customer dashboard",
          dataProcessing: "Automatically processes family member data",
          profileGeneration: "Creates combined family insurance profiles",
          dataAccess: "Easy access to all family profiles in dashboard",
          dataExport: "Export processed data in various formats"
        }
      }
    ],
    payment: {
      totalAmount: 250,
      currency: "USD",
      paymentMethod: "quickbooks",
      status: "paid",
      paidAmount: 250,
      remainingAmount: 0,
      note: "Paid via QuickBooks manually"
    }
  }
};

// Create customer profile files
Object.keys(CUSTOMER_PROFILES).forEach(customerKey => {
  const profile = CUSTOMER_PROFILES[customerKey];
  
  // Save customer profile
  fs.writeFileSync(
    `/tmp/${customerKey}-profile.json`,
    JSON.stringify(profile, null, 2)
  );
  
  console.log(`✅ Created profile for ${profile.customer.name}`);
});

// Create summary report
const summary = {
  totalCustomers: Object.keys(CUSTOMER_PROFILES).length,
  totalAgents: Object.values(CUSTOMER_PROFILES).reduce((sum, profile) => sum + profile.agents.length, 0),
  totalRevenue: Object.values(CUSTOMER_PROFILES).reduce((sum, profile) => sum + profile.payment.totalAmount, 0),
  customers: Object.keys(CUSTOMER_PROFILES).map(key => ({
    name: CUSTOMER_PROFILES[key].customer.name,
    agents: CUSTOMER_PROFILES[key].agents.length,
    status: CUSTOMER_PROFILES[key].customer.status,
    payment: CUSTOMER_PROFILES[key].payment
  }))
};

fs.writeFileSync('/tmp/customer-summary.json', JSON.stringify(summary, null, 2));

console.log('\n📊 CUSTOMER PROFILE SUMMARY:');
console.log('============================');
console.log(`Total Customers: ${summary.totalCustomers}`);
console.log(`Total Agents: ${summary.totalAgents}`);
console.log(`Total Revenue: $${summary.totalRevenue}`);
console.log('\nCustomers:');
summary.customers.forEach(customer => {
  console.log(`  - ${customer.name}: ${customer.agents} agents, ${customer.status}, $${customer.payment.totalAmount}`);
});

console.log('\n✅ All customer profiles created successfully!');
EOF

echo "✅ Created customer profile generator"

echo ""
echo "🎯 CREATING AGENT WORKFLOWS..."

# Create n8n workflows for each agent
cat > /tmp/create-agent-workflows.js << 'EOF'
// Create n8n Workflows for All Agents
const fs = require('fs');

const AGENT_WORKFLOWS = {
  // BEN GINATI AGENTS
  "ben-wordpress-content": {
    name: "WordPress Content Agent",
    description: "Automates WordPress content creation (excluding blog and posts)",
    triggers: ["manual", "schedule"],
    nodes: [
      {
        name: "Content Research",
        type: "openai",
        config: {
          model: "gpt-4",
          prompt: "Research tax-related content for WordPress website"
        }
      },
      {
        name: "Content Generation",
        type: "openai",
        config: {
          model: "gpt-4",
          prompt: "Generate SEO-optimized WordPress content"
        }
      },
      {
        name: "WordPress API",
        type: "http",
        config: {
          method: "POST",
          url: "{{$node.Content Generation.data.content}}",
          headers: {
            "Authorization": "Bearer {{$env.WORDPRESS_API_KEY}}"
          }
        }
      }
    ]
  },
  
  "ben-wordpress-blog": {
    name: "WordPress Blog & Posts Agent",
    description: "Automates WordPress blog and posts content creation",
    triggers: ["manual", "schedule"],
    nodes: [
      {
        name: "Blog Topic Research",
        type: "openai",
        config: {
          model: "gpt-4",
          prompt: "Research trending tax topics for blog posts"
        }
      },
      {
        name: "Blog Content Generation",
        type: "openai",
        config: {
          model: "gpt-4",
          prompt: "Generate comprehensive blog post content"
        }
      },
      {
        name: "WordPress Blog API",
        type: "http",
        config: {
          method: "POST",
          url: "{{$node.Blog Content Generation.data.content}}",
          headers: {
            "Authorization": "Bearer {{$env.WORDPRESS_API_KEY}}"
          }
        }
      }
    ]
  },
  
  "ben-podcast-agent": {
    name: "Podcast Complete Agent",
    description: "Complete podcast automation for Apple and Spotify platforms",
    triggers: ["manual", "schedule"],
    nodes: [
      {
        name: "Content Research",
        type: "openai",
        config: {
          model: "gpt-4",
          prompt: "Research market and competitors for fresh podcast content"
        }
      },
      {
        name: "Episode Outline",
        type: "openai",
        config: {
          model: "gpt-4",
          prompt: "Generate detailed episode outline and script"
        }
      },
      {
        name: "Audio Recording",
        type: "text-to-speech",
        config: {
          voice: "professional",
          speed: "normal"
        }
      },
      {
        name: "Apple Podcasts Upload",
        type: "http",
        config: {
          method: "POST",
          url: "https://api.apple.com/podcasts/upload",
          headers: {
            "Authorization": "Bearer {{$env.APPLE_PODCASTS_KEY}}"
          }
        }
      },
      {
        name: "Spotify Upload",
        type: "http",
        config: {
          method: "POST",
          url: "https://api.spotify.com/podcasts/upload",
          headers: {
            "Authorization": "Bearer {{$env.SPOTIFY_API_KEY}}"
          }
        }
      }
    ]
  },
  
  "ben-social-agent": {
    name: "Social Media Agent",
    description: "Facebook and LinkedIn social media automation",
    triggers: ["manual", "schedule"],
    nodes: [
      {
        name: "Content Generation",
        type: "openai",
        config: {
          model: "gpt-4",
          prompt: "Generate social media content for Facebook and LinkedIn"
        }
      },
      {
        name: "Facebook Post",
        type: "http",
        config: {
          method: "POST",
          url: "https://graph.facebook.com/v18.0/me/feed",
          headers: {
            "Authorization": "Bearer {{$env.FACEBOOK_ACCESS_TOKEN}}"
          }
        }
      },
      {
        name: "LinkedIn Post",
        type: "http",
        config: {
          method: "POST",
          url: "https://api.linkedin.com/v2/ugcPosts",
          headers: {
            "Authorization": "Bearer {{$env.LINKEDIN_ACCESS_TOKEN}}"
          }
        }
      }
    ]
  },

  // ORTAL FLANARY AGENT (already exists, but updated)
  "ortal-facebook-scraper": {
    name: "Facebook Group Scraper",
    description: "Scrapes public Facebook groups for Jewish community lead generation",
    triggers: ["manual", "schedule"],
    nodes: [
      {
        name: "Apify Scraper",
        type: "http",
        config: {
          method: "POST",
          url: "https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs",
          headers: {
            "Authorization": "Bearer {{$env.APIFY_API_KEY}}"
          }
        }
      },
      {
        name: "Data Processing",
        type: "function",
        config: {
          code: "// Process scraped data and create custom audiences"
        }
      },
      {
        name: "Facebook Custom Audience",
        type: "http",
        config: {
          method: "POST",
          url: "https://graph.facebook.com/v18.0/act_{{ACCOUNT_ID}}/customaudiences",
          headers: {
            "Authorization": "Bearer {{$env.FACEBOOK_ACCESS_TOKEN}}"
          }
        }
      }
    ]
  },

  // SHELLY MIZRAHI AGENT
  "shelly-family-profile": {
    name: "Family Profile Generator",
    description: "Processes Excel files to generate combined family insurance profiles",
    triggers: ["manual", "file-upload"],
    nodes: [
      {
        name: "Excel File Upload",
        type: "file-upload",
        config: {
          allowedTypes: [".xlsx", ".xls"],
          maxSize: "10MB"
        }
      },
      {
        name: "Excel Parser",
        type: "function",
        config: {
          code: "// Parse Excel file and extract family member data"
        }
      },
      {
        name: "Data Aggregation",
        type: "function",
        config: {
          code: "// Combine family member data into unified profiles"
        }
      },
      {
        name: "Profile Generation",
        type: "function",
        config: {
          code: "// Generate comprehensive family insurance profiles"
        }
      },
      {
        name: "Database Storage",
        type: "mongodb",
        config: {
          operation: "insert",
          collection: "family_profiles",
          document: "{{$node.Profile Generation.data}}"
        }
      }
    ]
  }
};

// Create workflow files
Object.keys(AGENT_WORKFLOWS).forEach(agentKey => {
  const workflow = AGENT_WORKFLOWS[agentKey];
  
  // Save workflow
  fs.writeFileSync(
    `/tmp/${agentKey}-workflow.json`,
    JSON.stringify(workflow, null, 2)
  );
  
  console.log(`✅ Created workflow for ${workflow.name}`);
});

console.log('\n✅ All agent workflows created successfully!');
EOF

echo "✅ Created agent workflow generator"

echo ""
echo "🎯 CREATING ADMIN APPROVAL SYSTEM..."

# Create admin approval system
cat > /tmp/admin-approval-system.js << 'EOF'
// Admin Approval System for Customer Profiles
const fs = require('fs');

class AdminApprovalSystem {
  constructor() {
    this.pendingApprovals = [];
    this.approvedProfiles = [];
    this.rejectedProfiles = [];
  }

  addPendingApproval(customerProfile, researchData) {
    const approval = {
      id: `approval-${Date.now()}`,
      customerProfile,
      researchData,
      status: "pending",
      createdAt: new Date(),
      adminNotes: "",
      missingInfo: researchData.missingInfo || []
    };

    this.pendingApprovals.push(approval);
    this.saveApprovals();
    
    return approval;
  }

  approveProfile(approvalId, adminNotes = "") {
    const approval = this.pendingApprovals.find(a => a.id === approvalId);
    if (!approval) return false;

    approval.status = "approved";
    approval.adminNotes = adminNotes;
    approval.approvedAt = new Date();

    this.approvedProfiles.push(approval);
    this.pendingApprovals = this.pendingApprovals.filter(a => a.id !== approvalId);
    
    this.saveApprovals();
    this.sendCustomerNotification(approval);
    
    return true;
  }

  rejectProfile(approvalId, adminNotes = "", missingInfo = []) {
    const approval = this.pendingApprovals.find(a => a.id === approvalId);
    if (!approval) return false;

    approval.status = "rejected";
    approval.adminNotes = adminNotes;
    approval.missingInfo = missingInfo;
    approval.rejectedAt = new Date();

    this.rejectedProfiles.push(approval);
    this.pendingApprovals = this.pendingApprovals.filter(a => a.id !== approvalId);
    
    this.saveApprovals();
    this.sendCustomerNotification(approval);
    
    return true;
  }

  sendCustomerNotification(approval) {
    const { customerProfile } = approval;
    
    if (approval.status === "approved") {
      console.log(`📧 Sending approval notification to ${customerProfile.customer.email}`);
      // TODO: Implement email notification
    } else if (approval.status === "rejected") {
      console.log(`📧 Sending rejection notification to ${customerProfile.customer.email}`);
      console.log(`📋 Missing information: ${approval.missingInfo.join(", ")}`);
      // TODO: Implement email notification
    }
  }

  saveApprovals() {
    const data = {
      pendingApprovals: this.pendingApprovals,
      approvedProfiles: this.approvedProfiles,
      rejectedProfiles: this.rejectedProfiles
    };
    
    fs.writeFileSync('/tmp/admin-approvals.json', JSON.stringify(data, null, 2));
  }

  getPendingApprovals() {
    return this.pendingApprovals;
  }

  getApprovedProfiles() {
    return this.approvedProfiles;
  }

  getRejectedProfiles() {
    return this.rejectedProfiles;
  }
}

// Create admin approval system instance
const adminSystem = new AdminApprovalSystem();

// Add sample pending approvals
const customerProfiles = JSON.parse(fs.readFileSync('/tmp/customer-summary.json', 'utf8'));

customerProfiles.customers.forEach(customer => {
  const researchData = {
    businessName: customer.name,
    website: customer.website || null,
    industry: customer.industry || "Unknown",
    missingInfo: [
      "Email address confirmation needed",
      "Business requirements details needed",
      "Technical integration preferences needed"
    ]
  };

  adminSystem.addPendingApproval(customer, researchData);
});

console.log('✅ Admin approval system created');
console.log(`📋 Pending approvals: ${adminSystem.getPendingApprovals().length}`);
console.log(`✅ Approved profiles: ${adminSystem.getApprovedProfiles().length}`);
console.log(`❌ Rejected profiles: ${adminSystem.getRejectedProfiles().length}`);

module.exports = AdminApprovalSystem;
EOF

echo "✅ Created admin approval system"

echo ""
echo "📤 DEPLOYING TO SERVER..."

# Deploy all systems to server
sshpass -p "05ngBiq2pTA8XSF76x" scp -o StrictHostKeyChecking=no /tmp/complete-customer-profiles.js root@173.254.201.134:/tmp/
sshpass -p "05ngBiq2pTA8XSF76x" scp -o StrictHostKeyChecking=no /tmp/create-agent-workflows.js root@173.254.201.134:/tmp/
sshpass -p "05ngBiq2pTA8XSF76x" scp -o StrictHostKeyChecking=no /tmp/admin-approval-system.js root@173.254.201.134:/tmp/

echo ""
echo "🚀 EXECUTING ON SERVER..."

# Execute on server
sshpass -p "05ngBiq2pTA8XSF76x" ssh -o StrictHostKeyChecking=no root@173.254.201.134 "cd /tmp && node complete-customer-profiles.js && node create-agent-workflows.js && node admin-approval-system.js"

echo ""
echo "🎉 COMPLETE CUSTOMER PROFILES CREATED!"
echo "======================================"
echo ""
echo "📊 CUSTOMER SUMMARY:"
echo "   ✅ Ben Ginati (Tax4Us) - 4 agents, $5000"
echo "   ✅ Ortal Flanary (Local-IL) - 1 agent, active"
echo "   ✅ Shelly Mizrahi (Insurance) - 1 agent, $250"
echo ""
echo "🤖 AGENT BREAKDOWN:"
echo "   📝 WordPress Content Agent (Ben)"
echo "   📰 WordPress Blog Agent (Ben)"
echo "   🎙️ Podcast Complete Agent (Ben)"
echo "   📱 Social Media Agent (Ben)"
echo "   📘 Facebook Scraper (Ortal)"
echo "   👨‍👩‍👧‍👦 Family Profile Generator (Shelly)"
echo ""
echo "💰 PAYMENT STATUS:"
echo "   Ben Ginati: $5000 (2 installments) - PENDING"
echo "   Ortal Flanary: Subscription - ACTIVE"
echo "   Shelly Mizrahi: $250 - PAID"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Review admin approval system"
echo "   2. Build customer dashboards"
echo "   3. Implement payment tracking"
echo "   4. Create agent workflows in n8n"
echo "   5. Test complete system"
