# Rensto - Zero-Dupes Architecture

> **AI-Powered Business Automation Platform** with global uniqueness and duplicate prevention

[![CI/CD](https://github.com/imsuperseller/rensto/workflows/Duplicate%20Scanner/badge.svg)](https://github.com/imsuperseller/rensto/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Overview

Rensto is a comprehensive business automation platform that leverages AI agents, MCP servers, and workflow automation to transform business operations. This repository implements a **Zero-Dupes Architecture** that prevents duplicates and enforces global uniqueness across all systems.

## 🏗️ Architecture

### Zero-Dupes Core Principles

1. **Global Uniqueness**: Every entity has a unique RGID (Rensto Global ID)
2. **Single Source of Truth**: Postgres database as the canonical data store
3. **Idempotency**: All operations are idempotent and deduplicated
4. **Standardized Structure**: Enforced directory structure and naming conventions

### Directory Structure

```
rensto/
├── apps/                    # Applications (Next.js, CLIs)
│   └── web/                # Main web application
├── packages/               # Shared packages
│   ├── db/                # Database utilities and schema
│   ├── identity/          # Identity and key generation
│   ├── schema/            # Data models and types
│   └── utils/             # Shared utilities
├── services/              # External service adapters
│   └── mcp-servers/       # MCP server implementations
├── infra/                 # Infrastructure configuration
├── scripts/               # Automation scripts
├── docs/                  # Documentation
├── tests/                 # Test suites
├── assets/                # Static assets
├── examples/              # Example implementations
├── experiments/           # Experimental code
└── archived/              # Archived/legacy code
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Docker (for local development)
- Cursor AI (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/imsuperseller/rensto.git
cd rensto

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Development with Cursor AI

This repository is optimized for Cursor AI development:

1. **Rules**: `.cursor/rules.md` contains authoritative development rules
2. **Context**: `.cursor/context.json` defines directory structure
3. **BMAD**: All changes follow Build-Measure-Analyze-Deploy methodology

## 🔧 Core Features

### Database Schema

- **Entities**: Global entity registry with RGID
- **External Identities**: Cross-system identity mapping
- **Idempotency Keys**: Duplicate prevention for all operations
- **Usage Tracking**: Comprehensive usage analytics

### MCP Server Ecosystem

- **n8n Integration**: Workflow automation
- **Airtable Adapter**: Data synchronization
- **Webflow Integration**: Content management
- **Stripe Billing**: Payment processing
- **OpenAI/OpenRouter**: AI model integration

### Customer Portals

- **Ben Ginati (Tax4Us)**: Tax automation portal
- **Shelly Mizrahi**: Insurance services portal
- **Unified Dashboard**: Admin and analytics

## 🛡️ Security & Compliance

- **API Key Management**: Secure credential storage
- **Rate Limiting**: Request throttling
- **Input Validation**: Comprehensive sanitization
- **Audit Logging**: Complete operation tracking

## 📊 Monitoring & Analytics

- **Usage Tracking**: Per-customer analytics
- **Performance Monitoring**: Real-time metrics
- **Error Tracking**: Comprehensive error reporting
- **BMAD Projects**: Optimization tracking

## 🔄 CI/CD Pipeline

### Automated Checks

- **Duplicate Scanner**: Prevents duplicate entities and assets
- **Directory Structure**: Enforces standardized layout
- **Security Scanning**: Vulnerability detection
- **Code Quality**: Linting and formatting

### Deployment

- **Vercel**: Web application hosting
- **Racknerd VPS**: Infrastructure and MCP servers
- **Docker**: Containerized services
- **Cloudflare**: DNS and CDN

## 📈 BMAD Methodology

All changes follow the BMAD (Build-Measure-Analyze-Deploy) methodology:

1. **Build**: Implement new features or optimizations
2. **Measure**: Collect metrics and performance data
3. **Analyze**: Identify gaps and optimization opportunities
4. **Deploy**: Roll out improvements and track results

## 🤝 Contributing

### Development Rules

1. **Search First**: Always search for existing implementations
2. **No Duplicates**: Never create duplicate functionality
3. **Follow Structure**: Use standardized directory layout
4. **RGID Required**: All entities must have RGID
5. **Idempotency**: All operations must be idempotent

### Pull Request Process

1. Create feature branch from `main`
2. Follow BMAD methodology
3. Run duplicate scanner: `node scripts/ci/scan-dupes.mjs`
4. Ensure all CI checks pass
5. Submit PR with comprehensive description

## 📚 Documentation

- [Architecture Guide](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [BMAD Projects](archived/data/bmad-projects/)

## 🏢 Business Information

- **Company**: Rensto
- **Website**: https://rensto.com
- **Contact**: [Contact Information]
- **License**: MIT

## 🎨 Brand Guidelines

- **Primary**: #fe3d51
- **Secondary**: #bf5700
- **Accent**: #1eaef7
- **Highlight**: #5ffbfd
- **Dark**: #110d28

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Rensto Team**
