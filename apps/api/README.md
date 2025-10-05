# Rensto SaaS API

**Version:** 1.0.0
**Stack:** Express.js + TypeScript + MongoDB + Stripe

## 📋 Overview

The Rensto SaaS API is the backend service powering the Rensto Universal Micro-SaaS Platform. It handles:

- **Multi-tenant management** - Tenant registration, configuration, and isolation
- **Lead generation services** - API endpoints for lead delivery and tracking
- **Subscription management** - Stripe integration for billing and subscriptions
- **Authentication & authorization** - JWT-based auth with bcrypt password hashing
- **Rate limiting & security** - Helmet, CORS, and express-rate-limit

## 🏗️ Architecture

```
src/
├── config/          # Configuration (database, env vars)
├── controllers/     # Request handlers
│   └── tenant-controller.ts
├── middleware/      # Auth, validation, rate limiting
├── models/          # MongoDB schemas
├── routes/          # API route definitions
│   ├── lead-generation-routes.ts
│   ├── subscription-routes.ts
│   └── tenant-routes.ts
├── services/        # Business logic layer
├── tests/           # Unit and integration tests
└── index.ts         # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB instance (local or cloud)
- Stripe account (for subscription billing)

### Installation

```bash
cd apps/api
npm install
```

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/rensto

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRATION=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# API Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
npm run lint:fix
```

## 📡 API Endpoints

### Tenant Management
- `POST /api/tenants` - Register new tenant
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant configuration
- `DELETE /api/tenants/:id` - Delete tenant

### Lead Generation
- `POST /api/leads` - Submit new lead
- `GET /api/leads` - List leads (with filtering)
- `GET /api/leads/:id` - Get lead details

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/:id` - Get subscription details
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/webhooks/stripe` - Stripe webhook handler

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Obtain a token by authenticating through the tenant login endpoint.

## 🔗 Integration Points

### MongoDB
- Primary data store for tenants, leads, subscriptions, users
- Connection managed via Mongoose ODM

### Stripe
- Payment processing and subscription management
- Webhook handlers for subscription events
- Integration with Stripe Customer Portal

### Airtable (via gateway-worker)
- Lead data syncing
- Usage tracking
- Business intelligence

### n8n (via gateway-worker)
- Workflow triggers
- Lead processing automation
- Customer journey automation

## 📊 Deployment

### Recommended Platform: Railway / Render / Vercel (Serverless Functions)

**Current Status:** ⚠️ Deployment configuration needed

### Environment-Specific Configs

- `env.example` - Template for all environments
- `env.production` - Production environment variables
- `env.production.example` - Production template

### Deployment Checklist

- [ ] Set all environment variables in hosting platform
- [ ] Configure MongoDB connection string (production)
- [ ] Add Stripe production keys
- [ ] Set up Stripe webhooks
- [ ] Configure CORS allowed origins
- [ ] Set NODE_ENV=production
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (e.g., Rollbar, Sentry)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tenant-controller.test.ts
```

## 📝 Dependencies

### Core
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **stripe** - Payment processing
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing

### Security
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

### Utilities
- **dotenv** - Environment variable management
- **joi** - Request validation
- **winston** - Logging

## 🔍 Monitoring & Logging

Logs are written to:
- Console (development)
- File system (production) - `/logs/`
- External service (configure in env vars)

Log levels: error, warn, info, http, verbose, debug, silly

## 🤝 Related Services

- **apps/gateway-worker/** - Cloudflare Worker for request routing and orchestration
- **apps/marketplace/** - Marketplace frontend (Next.js)
- **apps/web/admin-dashboard/** - Admin dashboard (Next.js)
- **n8n workflows** - Automation workflows triggered by API events

## 📚 Documentation

- API documentation: Generate with Swagger/OpenAPI (TODO)
- Postman collection: `docs/postman/` (TODO)

## 🐛 Known Issues

- [ ] Deployment configuration not finalized
- [ ] API documentation needs generation
- [ ] Monitoring integration pending
- [ ] Test coverage needs improvement

## 📞 Support

For issues related to the API, contact the Rensto development team or file an issue in the repository.

---

**Last Updated:** October 5, 2025
**Maintained By:** Rensto Team
