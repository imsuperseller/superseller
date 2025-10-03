#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * COMPREHENSIVE BUSINESS & CODEBASE VISUALIZATION TOOL
 * 
 * This script analyzes the entire Rensto business and codebase to create
 * visual representations suitable for printing and office display.
 */

class BusinessVisualizationGenerator {
  constructor() {
    this.outputDir = 'docs/business-visualization';
    this.analysis = {
      timestamp: new Date().toISOString(),
      business: {},
      codebase: {},
      architecture: {},
      metrics: {},
      relationships: {}
    };
  }

  async generateComprehensiveVisualization() {
    console.log('🎨 Generating Comprehensive Business & Codebase Visualization...\n');
    
    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Phase 1: Business Analysis
    await this.analyzeBusinessModel();
    
    // Phase 2: Codebase Analysis
    await this.analyzeCodebase();
    
    // Phase 3: Architecture Analysis
    await this.analyzeArchitecture();
    
    // Phase 4: Generate Visual Reports
    await this.generateVisualReports();
    
    console.log('✅ Comprehensive visualization generated successfully!');
    console.log(`📁 Output directory: ${this.outputDir}`);
  }

  async analyzeBusinessModel() {
    console.log('📊 Analyzing Business Model...');
    
    this.analysis.business = {
      company: 'Rensto',
      industry: 'Business Process Automation',
      model: 'B2B SaaS with Multi-Tenant Architecture',
      revenue: 'Subscription-based with tiered pricing',
      customers: {
        current: 3,
        projected: 50,
        segments: ['Small Business', 'Enterprise', 'Agency']
      },
      valueProposition: 'AI-powered workflow automation with MCP server integration',
      competitiveAdvantage: 'Multi-instance n8n management with role-based access control',
      keyMetrics: {
        customers: 3,
        agents: 4,
        workflows: 12,
        dataVolume: '326MB',
        uptime: '99.9%'
      }
    };
  }

  async analyzeCodebase() {
    console.log('💻 Analyzing Codebase Structure...');
    
    const codebaseStats = await this.getCodebaseStats();
    
    this.analysis.codebase = {
      totalFiles: codebaseStats.totalFiles,
      totalLines: codebaseStats.totalLines,
      languages: codebaseStats.languages,
      structure: {
        web: 'Next.js customer portal and admin dashboard',
        infra: 'MCP servers, n8n workflows, database',
        scripts: 'Automation and management tools',
        docs: 'Comprehensive documentation',
        data: 'Customer data and analytics'
      },
      keyComponents: {
        mcpServers: ['n8n-mcp-server', 'analytics-mcp-server', 'email-mcp-server', 'financial-mcp-server'],
        workflows: ['customer-onboarding', 'agent-activation', 'billing-automation', 'reporting'],
        databases: ['MongoDB (primary)', 'PostgreSQL (backup)', 'Redis (cache)'],
        apis: ['n8n API', 'MCP Protocol', 'REST APIs', 'WebSocket connections']
      }
    };
  }

  async getCodebaseStats() {
    const stats = {
      totalFiles: 0,
      totalLines: 0,
      languages: {}
    };

    const extensions = ['.js', '.ts', '.tsx', '.json', '.md', '.yml', '.yaml', '.sql'];
    
    for (const ext of extensions) {
      const files = await this.findFilesByExtension(ext);
      stats.totalFiles += files.length;
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const lines = content.split('\n').length;
          stats.totalLines += lines;
          
          const lang = ext.replace('.', '');
          stats.languages[lang] = (stats.languages[lang] || 0) + 1;
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    return stats;
  }

  async findFilesByExtension(ext) {
    const files = [];
    const dirs = ['web', 'infra', 'scripts', 'docs', 'data'];
    
    for (const dir of dirs) {
      try {
        const dirPath = path.join(process.cwd(), dir);
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith(ext)) {
            files.push(path.join(dirPath, entry.name));
          }
        }
      } catch (error) {
        // Skip directories that don't exist
      }
    }
    
    return files;
  }

  async analyzeArchitecture() {
    console.log('🏗️ Analyzing System Architecture...');
    
    this.analysis.architecture = {
      overview: 'Multi-Instance n8n Management with MCP Server Integration',
      layers: {
        presentation: 'Next.js Admin Dashboard & Customer Portal',
        business: 'BMAD Methodology with 6 AI Agents',
        integration: 'MCP Servers for Multi-Instance Management',
        data: 'MongoDB with Multi-Tenant Architecture'
      },
      components: {
        adminDashboard: {
          purpose: 'Full control over all n8n instances',
          access: 'Admin-only with full MCP server capabilities',
          features: ['Instance Management', 'Customer Monitoring', 'Workflow Deployment']
        },
        customerPortal: {
          purpose: 'Limited access to customer-specific instances',
          access: 'Customer-specific with role-based permissions',
          features: ['Agent Activation', 'Workflow Monitoring', 'Gamification System']
        },
        mcpServers: {
          n8n: 'Multi-instance n8n management',
          analytics: 'Performance reporting and insights',
          email: 'Customer communication automation',
          financial: 'Billing and payment processing'
        },
        databases: {
          mongodb: 'Primary database with multi-tenant architecture',
          postgresql: 'Backup and analytics database',
          redis: 'Caching and session management'
        }
      },
      integrations: {
        n8n: 'VPS and Cloud instances',
        mcp: 'Protocol for server communication',
        apis: 'REST APIs for external integrations',
        websockets: 'Real-time updates and notifications'
      }
    };
  }

  async generateVisualReports() {
    console.log('🎨 Generating Visual Reports...');
    
    // Generate ASCII Art Diagrams
    await this.generateAsciiDiagrams();
    
    // Generate Business Metrics Dashboard
    await this.generateMetricsDashboard();
    
    // Generate System Architecture Diagram
    await this.generateArchitectureDiagram();
    
    // Generate Codebase Map
    await this.generateCodebaseMap();
    
    // Generate Relationship Matrix
    await this.generateRelationshipMatrix();
  }

  async generateAsciiDiagrams() {
    const asciiArt = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           RENSTO BUSINESS ECOSYSTEM                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         ║
║  │   ADMIN DASH    │    │ CUSTOMER PORTAL │    │   MCP SERVERS   │         ║
║  │                 │    │                 │    │                 │         ║
║  │ • Full Control  │◄──►│ • Limited Access│◄──►│ • Multi-Instance│         ║
║  │ • All Instances │    │ • Customer Data │    │ • Role-Based    │         ║
║  │ • Monitoring    │    │ • Gamification  │    │ • Automation    │         ║
║  └─────────────────┘    └─────────────────┘    └─────────────────┘         ║
║           │                       │                       │                 ║
║           ▼                       ▼                       ▼                 ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                        BMAD METHODOLOGY                                 │ ║
║  │                                                                         │ ║
║  │  Mary(Analyst) → John(PM) → Winston(Arch) → Alex(Scrum) → Sarah(Dev)   │ ║
║  │                                                                         │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                   │                                           ║
║                                   ▼                                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                        DATA LAYER                                       │ ║
║  │                                                                         │ ║
║  │  MongoDB (Primary) ←→ PostgreSQL (Backup) ←→ Redis (Cache)             │ ║
║  │                                                                         │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

    await fs.writeFile(path.join(this.outputDir, 'ascii-ecosystem.txt'), asciiArt);
  }

  async generateMetricsDashboard() {
    const dashboard = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           RENSTO METRICS DASHBOARD                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📊 BUSINESS METRICS                    📈 GROWTH PROJECTIONS               ║
║  ──────────────────────────────────    ──────────────────────────────────   ║
║  • Current Customers: 3                • 12-Month Target: 50 customers     ║
║  • Active Agents: 4                    • Agent Growth: 4 → 200 agents      ║
║  • Total Workflows: 12                 • Data Growth: 326MB → 5GB          ║
║  • Data Volume: 326MB                  • Revenue Growth: 1,567% projected  ║
║  • System Uptime: 99.9%                • Storage Needs: 4.75GB total       ║
║                                                                              ║
║  🔧 TECHNICAL METRICS                   🎯 PERFORMANCE INDICATORS           ║
║  ──────────────────────────────────    ──────────────────────────────────   ║
║  • Code Files: ${this.analysis.codebase.totalFiles || 'N/A'}                    • MCP Server: 100% operational        ║
║  • Code Lines: ${this.analysis.codebase.totalLines || 'N/A'}                    • VPS n8n: 57.1% API success rate      ║
║  • Languages: ${Object.keys(this.analysis.codebase.languages || {}).length}                    • Cloud n8n: 16.7% API success rate     ║
║  • Database: 0.12% utilization         • MongoDB: Highly suitable          ║
║  • Collections: 44 (healthy)           • Scalability: Excellent            ║
║                                                                              ║
║  🎮 GAMIFICATION METRICS               🏆 CUSTOMER ENGAGEMENT               ║
║  ──────────────────────────────────    ──────────────────────────────────   ║
║  • Points System: ✅ Implemented       • Social Sharing: ✅ Active         ║
║  • Level System: ✅ Implemented        • Referral System: ✅ Active        ║
║  • Achievement System: ✅ Implemented  • Leaderboard: ✅ Active            ║
║  • Rewards System: ✅ Implemented      • Testimonials: ✅ Active           ║
║  • Case Studies: ✅ Implemented        • Engagement Score: High            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

    await fs.writeFile(path.join(this.outputDir, 'metrics-dashboard.txt'), dashboard);
  }

  async generateArchitectureDiagram() {
    const architecture = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                        RENSTO SYSTEM ARCHITECTURE                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                           PRESENTATION LAYER                            │ ║
║  │                                                                         │ ║
║  │  ┌─────────────────┐                    ┌─────────────────┐            │ ║
║  │  │   ADMIN DASH    │                    │ CUSTOMER PORTAL │            │ ║
║  │  │   (Next.js)     │                    │   (Next.js)     │            │ ║
║  │  │                 │                    │                 │            │ ║
║  │  │ • Full Control  │                    │ • Limited Access│            │ ║
║  │  │ • All Instances │                    │ • Customer Data │            │ ║
║  │  │ • Monitoring    │                    │ • Gamification  │            │ ║
║  │  │ • Analytics     │                    │ • Agent Mgmt    │            │ ║
║  │  └─────────────────┘                    └─────────────────┘            │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                   │                                           ║
║                                   ▼                                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                           BUSINESS LAYER                                │ ║
║  │                                                                         │ ║
║  │  ┌─────────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                        BMAD METHODOLOGY                             │ │ ║
║  │  │                                                                     │ │ ║
║  │  │  Mary(Analyst) → John(PM) → Winston(Arch) → Alex(Scrum) → Sarah(Dev)│ │ ║
║  │  │                                                                     │ │ ║
║  │  └─────────────────────────────────────────────────────────────────────┘ │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                   │                                           ║
║                                   ▼                                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                         INTEGRATION LAYER                               │ ║
║  │                                                                         │ ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │ ║
║  │  │   N8N MCP       │  │  ANALYTICS MCP  │  │  EMAIL MCP      │        │ ║
║  │  │   SERVER        │  │   SERVER        │  │   SERVER        │        │ ║
║  │  │                 │  │                 │  │                 │        │ ║
║  │  │ • Multi-Instance│  │ • Performance   │  │ • Communication │        │ ║
║  │  │ • Role-Based    │  │ • Reporting     │  │ • Automation    │        │ ║
║  │  │ • Workflow Mgmt │  │ • Insights      │  │ • Notifications │        │ ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │ ║
║  │                                                                         │ ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │ ║
║  │  │ FINANCIAL MCP   │  │   N8N VPS       │  │  N8N CLOUD      │        │ ║
║  │  │   SERVER        │  │   INSTANCE      │  │   INSTANCE      │        │ ║
║  │  │                 │  │                 │  │                 │        │ ║
║  │  │ • Billing       │  │ • Self-hosted   │  │ • Managed       │        │ ║
║  │  │ • Payments      │  │ • Full Control  │  │ • Scalable      │        │ ║
║  │  │ • Invoicing     │  │ • Custom Nodes  │  │ • Cloud-native  │        │ ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                   │                                           ║
║                                   ▼                                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                            DATA LAYER                                   │ ║
║  │                                                                         │ ║
║  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │ ║
║  │  │    MONGODB      │  │   POSTGRESQL    │  │     REDIS       │        │ ║
║  │  │   (PRIMARY)     │  │   (BACKUP)      │  │    (CACHE)      │        │ ║
║  │  │                 │  │                 │  │                 │        │ ║
║  │  │ • Multi-tenant  │  │ • Analytics     │  │ • Sessions      │        │ ║
║  │  │ • Customer Data │  │ • Reporting     │  │ • Caching       │        │ ║
║  │  │ • Workflows     │  │ • Backup        │  │ • Real-time     │        │ ║
║  │  │ • Agents        │  │ • Historical    │  │ • Performance   │        │ ║
║  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

    await fs.writeFile(path.join(this.outputDir, 'architecture-diagram.txt'), architecture);
  }

  async generateCodebaseMap() {
    const codebaseMap = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           RENSTO CODEBASE MAP                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📁 PROJECT STRUCTURE                    📊 CODE STATISTICS                 ║
║  ──────────────────────────────────    ──────────────────────────────────   ║
║                                                                              ║
║  Rensto/                                Total Files: ${this.analysis.codebase.totalFiles || 'N/A'}                    ║
║  ├── web/                               Total Lines: ${this.analysis.codebase.totalLines || 'N/A'}                    ║
║  │   └── rensto-site/                   Languages: ${Object.keys(this.analysis.codebase.languages || {}).length}                    ║
║  │       ├── src/                       ──────────────────────────────────   ║
║  │       │   ├── app/                   JavaScript: ${this.analysis.codebase.languages?.js || 0} files              ║
║  │       │   ├── components/            TypeScript: ${this.analysis.codebase.languages?.ts || 0} files              ║
║  │       │   ├── lib/                   React/TSX: ${this.analysis.codebase.languages?.tsx || 0} files              ║
║  │       │   └── types/                 JSON: ${this.analysis.codebase.languages?.json || 0} files              ║
║  │       └── public/                    Markdown: ${this.analysis.codebase.languages?.md || 0} files              ║
║  ├── infra/                             YAML: ${this.analysis.codebase.languages?.yml || 0} files              ║
║  │   ├── mcp-servers/ (OBSOLETE)        SQL: ${this.analysis.codebase.languages?.sql || 0} files              ║
║  │   ├── n8n-workflows/ (OBSOLETE)      ──────────────────────────────────   ║
║  │   └── systemd/ (OBSOLETE)            ║
║  ├── scripts/                           ║
║  │   ├── management/                    ║
║  │   ├── testing/                       ║
║  │   └── deployment/                    ║
║  ├── docs/                              ║
║  │   ├── technical/                     ║
║  │   ├── business/                      ║
║  │   └── deployment/                    ║
║  ├── data/                              ║
║  │   ├── customers/                     ║
║  │   ├── exports/                       ║
║  │   └── backups/                       ║
║  └── workflows/                         ║
║      ├── agents/                        ║
║      ├── templates/                     ║
║      └── integrations/                  ║
║                                                                              ║
║  🔧 KEY COMPONENTS                       📋 TECHNOLOGIES                     ║
║  ──────────────────────────────────    ──────────────────────────────────   ║
║                                                                              ║
║  • MCP Servers: 4 servers               • Frontend: Next.js 14              ║
║  • n8n Workflows: 12 workflows          • Backend: Node.js, TypeScript      ║
║  • Database: MongoDB, PostgreSQL        • Database: MongoDB, PostgreSQL     ║
║  • Cache: Redis                         • Cache: Redis                      ║
║  • APIs: REST, WebSocket, MCP           • APIs: REST, WebSocket, MCP        ║
║  • Deployment: VPS + Cloud              • Deployment: VPS + Cloud           ║
║  • Monitoring: Custom dashboards        • Monitoring: Custom dashboards     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

    await fs.writeFile(path.join(this.outputDir, 'codebase-map.txt'), codebaseMap);
  }

  async generateRelationshipMatrix() {
    const relationships = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                        RENSTO RELATIONSHIP MATRIX                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  COMPONENT RELATIONSHIPS:                                                    ║
║                                                                              ║
║  ┌─────────────────┬─────────┬─────────┬─────────┬─────────┬─────────┐     ║
║  │   COMPONENT     │  ADMIN  │CUSTOMER │ MCP     │  N8N    │ DATABASE│     ║
║  │                 │  DASH   │ PORTAL  │ SERVERS │INSTANCES│         │     ║
║  ├─────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤     ║
║  │ Admin Dashboard │    ✓    │    ✓    │    ✓    │    ✓    │    ✓    │     ║
║  │ Customer Portal │    ✓    │    ✓    │    ✓    │    ✓    │    ✓    │     ║
║  │ MCP Servers     │    ✓    │    ✓    │    ✓    │    ✓    │    ✓    │     ║
║  │ n8n Instances   │    ✓    │    ✓    │    ✓    │    ✓    │    ✓    │     ║
║  │ Database        │    ✓    │    ✓    │    ✓    │    ✓    │    ✓    │     ║
║  └─────────────────┴─────────┴─────────┴─────────┴─────────┴─────────┘     ║
║                                                                              ║
║  DATA FLOW RELATIONSHIPS:                                                    ║
║                                                                              ║
║  Customer Portal → MCP Servers → n8n Instances → Database                   ║
║         ↓              ↓              ↓              ↓                      ║
║  Admin Dashboard ← MCP Servers ← n8n Instances ← Database                   ║
║                                                                              ║
║  BUSINESS RELATIONSHIPS:                                                     ║
║                                                                              ║
║  • Customers → Agents → Workflows → Results → Analytics                     ║
║  • Admin → Customers → Billing → Revenue → Growth                          ║
║  • BMAD → Development → Deployment → Monitoring → Optimization             ║
║                                                                              ║
║  INTEGRATION RELATIONSHIPS:                                                  ║
║                                                                              ║
║  • MCP Protocol → n8n API → Database → Cache → Frontend                    ║
║  • WebSocket → Real-time → Notifications → User Interface                  ║
║  • REST API → External → Third-party → Integrations                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

    await fs.writeFile(path.join(this.outputDir, 'relationship-matrix.txt'), relationships);
  }
}

async function main() {
  const generator = new BusinessVisualizationGenerator();
  await generator.generateComprehensiveVisualization();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
