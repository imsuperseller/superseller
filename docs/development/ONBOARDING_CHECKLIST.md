# Rensto Onboarding Checklist

## New Developer Onboarding

### Day 1: Environment Setup

#### Development Tools
- [ ] Install Node.js 18+ (check with `node -v`)
- [ ] Install Docker Desktop
- [ ] Install VS Code or preferred IDE
- [ ] Install Git
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Install cloudflared (for tunnel testing)

#### Repository Access
- [ ] Clone repository: `git clone https://github.com/rensto/rensto.git`
- [ ] Create feature branch: `git checkout -b feature/your-name-onboarding`
- [ ] Install dependencies:
  ```bash
  cd web/rensto-site
  npm install
  ```

#### VS Code Extensions
- [ ] ESLint
- [ ] Prettier
- [ ] Tailwind CSS IntelliSense
- [ ] GitLens
- [ ] Docker
- [ ] Thunder Client (API testing)

#### Environment Variables
- [ ] Copy `.env.example` files
- [ ] Request access to:
  - [ ] Airtable API key
  - [ ] Stripe test keys
  - [ ] n8n credentials
  - [ ] Cloudflare account

### Day 2: Project Familiarity

#### Documentation Review
- [ ] Read [README.md](../README.md)
- [ ] Read [CONTEXT.md](../CONTEXT.md)
- [ ] Read [SECURITY.md](../SECURITY.md)
- [ ] Review [ops/plan.md](../ops/plan.md)
- [ ] Review [ops/spec.md](../ops/spec.md)

#### Codebase Exploration
- [ ] Run development server:
  ```bash
  cd web/rensto-site
  npm run dev
  ```
- [ ] Visit http://localhost:3000
- [ ] Explore all pages
- [ ] Test contact form
- [ ] Review component structure
- [ ] Understand routing (app directory)

#### Unified Working Methodology
- [ ] Read [RENSTO_UNIFIED_WORKING_METHODOLOGY.md](../RENSTO_UNIFIED_WORKING_METHODOLOGY.md)
- [ ] Understand MCP-First approach for automation
- [ ] Learn BMAD methodology (Build-Measure-Analyze-Deploy)
- [ ] Review task management discipline
- [ ] Understand business model integration

### Day 3: Infrastructure

#### Docker Setup
- [ ] Start local infrastructure:
  ```bash
  cd infra
  cp .env.example .env
  # Edit .env with test values
  docker-compose up -d
  ```
- [ ] Access n8n at http://localhost:5678
- [ ] Connect to PostgreSQL
- [ ] Note: MongoDB is running on Racknerd at 173.254.201.134:27017

#### n8n Workflows
- [ ] Import example workflows
- [ ] Create test workflow
- [ ] Understand webhook triggers
- [ ] Test Airtable connection
- [ ] Test Slack integration

#### Backup System
- [ ] Review backup script
- [ ] Understand restore process
- [ ] Test backup locally
- [ ] Configure rclone (optional)

### Day 4: Development Workflow

#### Git Workflow
- [ ] Create feature branch
- [ ] Make small change
- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Commit with conventional commits
- [ ] Create pull request
- [ ] Understand CI checks

#### Testing
- [ ] Write unit test
- [ ] Run coverage: `npm test -- --coverage`
- [ ] Write E2E test
- [ ] Run E2E: `npm run test:e2e`
- [ ] Understand 85% coverage requirement

#### Deployment
- [ ] Deploy preview with Vercel
- [ ] Understand environment promotion
- [ ] Review Cloudflare DNS
- [ ] Test production build locally

### Day 5: Client Work

#### Airtable Setup
- [ ] Access Airtable base
- [ ] Understand table structure
- [ ] Review views (🔥 Active, etc.)
- [ ] Create test records
- [ ] Test automation triggers

#### Client Communication
- [ ] Join Slack workspace
- [ ] Understand channel structure:
  - #alerts - System notifications
  - #projects - Project updates
  - #sales - Lead notifications
- [ ] Review communication tone
- [ ] Understand SLA requirements

#### Security Practices
- [ ] Never commit secrets
- [ ] Use environment variables
- [ ] Understand tunnel security
- [ ] Review password policies
- [ ] Enable 2FA everywhere

## New Client Onboarding

### Pre-Kickoff (Sales Team)

#### Discovery
- [ ] Complete automation audit
- [ ] Document current pain points
- [ ] Identify quick wins
- [ ] Estimate ROI
- [ ] Define success metrics

#### Contract & Setup
- [ ] Sign service agreement
- [ ] Collect deposit (50%)
- [ ] Create Airtable records:
  - [ ] Lead → Client (status: Won)
  - [ ] New Project record
  - [ ] Invoice record
- [ ] Schedule kickoff call

### Week 1: Kickoff

#### Day 1: Kickoff Meeting
- [ ] Introduce team
- [ ] Review project scope
- [ ] Confirm deliverables
- [ ] Set timeline expectations
- [ ] Establish communication channels

#### Access Requests
- [ ] List all required accesses:
  - [ ] Current systems
  - [ ] API keys needed
  - [ ] Domain access
  - [ ] Hosting access
- [ ] Create secure password vault
- [ ] Document access matrix

#### Technical Discovery
- [ ] Audit existing systems
- [ ] Document data sources
- [ ] Map current workflows
- [ ] Identify integration points
- [ ] Review security requirements

### Week 2: Development

#### Environment Setup
- [ ] Create development branch
- [ ] Set up staging environment
- [ ] Configure n8n workspace
- [ ] Create Airtable views
- [ ] Set up monitoring

#### Workflow Development
- [ ] Build core automations
- [ ] Test with sample data
- [ ] Document workflow logic
- [ ] Create error handling
- [ ] Set up notifications

#### Client Review
- [ ] Demo progress
- [ ] Gather feedback
- [ ] Adjust based on input
- [ ] Confirm next steps
- [ ] Update project status

### Week 3: Testing & Training

#### Testing Phase
- [ ] Run end-to-end tests
- [ ] Load testing
- [ ] Security validation
- [ ] Backup verification
- [ ] Rollback testing

#### Documentation
- [ ] Create user guide
- [ ] Document workflows
- [ ] Prepare runbooks
- [ ] Create video tutorials
- [ ] Build FAQ section

#### Training
- [ ] Schedule training sessions
- [ ] Hands-on walkthrough
- [ ] Q&A session
- [ ] Provide sandbox access
- [ ] Record training videos

### Week 4: Deployment

#### Pre-Deployment
- [ ] Final client approval
- [ ] Production credentials
- [ ] DNS configuration
- [ ] SSL certificates
- [ ] Monitoring setup

#### Go-Live
- [ ] Deploy to production
- [ ] Smoke testing
- [ ] Monitor first runs
- [ ] Address immediate issues
- [ ] Confirm successful deployment

#### Handover
- [ ] Transfer ownership
- [ ] Provide all documentation
- [ ] Share access credentials
- [ ] Explain support process
- [ ] Schedule follow-up

### Post-Launch

#### Week 5: Stabilization
- [ ] Daily monitoring
- [ ] Address issues
- [ ] Fine-tune automations
- [ ] Gather metrics
- [ ] Document lessons learned

#### Week 6: Optimization
- [ ] Review performance
- [ ] Identify improvements
- [ ] Implement optimizations
- [ ] Update documentation
- [ ] Prepare care plan proposal

#### Ongoing: Care Plan
- [ ] Monthly check-ins
- [ ] Quarterly reviews
- [ ] Annual audits
- [ ] Continuous improvements
- [ ] Scaling support

## Tool-Specific Onboarding

### n8n Access
- [ ] Create n8n account
- [ ] Learn interface basics
- [ ] Understand node types
- [ ] Practice webhook creation
- [ ] Master error handling

### Airtable Setup
- [ ] Get base access
- [ ] Understand schema
- [ ] Learn formula fields
- [ ] Create custom views
- [ ] Set up automations

### Stripe Configuration
- [ ] Access Stripe dashboard
- [ ] Understand payment links
- [ ] Review webhook setup
- [ ] Test payment flow
- [ ] Configure notifications

### Cloudflare Management
- [ ] Access Cloudflare account
- [ ] Understand DNS records
- [ ] Learn tunnel configuration
- [ ] Review security settings
- [ ] Monitor analytics

## Role-Specific Paths

### Frontend Developer
Focus areas:
- Next.js app structure
- Tailwind styling
- GSAP animations
- Component development
- SEO optimization

### Backend Developer
Focus areas:
- n8n workflow development
- API integrations
- Database management
- Security implementation
- Performance optimization

### DevOps Engineer
Focus areas:
- Docker configuration
- Cloudflare tunnels
- Backup systems
- Monitoring setup
- CI/CD pipelines

### Project Manager
Focus areas:
- Airtable management
- Client communication
- Timeline tracking
- Resource allocation
- Quality assurance

## Troubleshooting Resources

### Common Issues
- [Infrastructure Runbook](../infra/RENSTO-OPERATIONS-GUIDE.md)
- [Deployment Guide](../infra/RENSTO-OPERATIONS-GUIDE.md#deployment)
- [DNS Configuration](DNS_AND_TUNNEL.md)

### Support Channels
- **Internal**: Slack #dev-help
- **Documentation**: This repository
- **External**: service@rensto.com

## Completion Confirmation

### Developer Checklist
- [ ] Can run project locally
- [ ] Understands architecture
- [ ] Has made first commit
- [ ] Passed first PR review
- [ ] Has production access

### Client Checklist
- [ ] All automations working
- [ ] Team trained
- [ ] Documentation received
- [ ] Support plan active
- [ ] Satisfaction confirmed

## Feedback

After completing onboarding:
1. What was unclear?
2. What was missing?
3. What took longest?
4. Suggestions for improvement?

Submit feedback via PR to update this document.

---

*Last updated: 2024-01-06*  
*Version: 1.0*
