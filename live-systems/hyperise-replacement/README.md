# 🚀 Hyperise Replacement API

A custom landing page personalization system with enhanced functionality and seamless n8n/Make.com integration, designed to replace Hyperise with superior features and cost savings.

## ✨ Features

### 🎯 Core Functionality
- **Dynamic Landing Pages**: Real-time personalization based on user data
- **Short Link Generation**: Custom branded URLs with QR codes
- **Image Personalization**: Dynamic image generation with user data
- **Campaign Management**: Visual campaign builder with A/B testing
- **Analytics Engine**: Comprehensive tracking and reporting
- **Template System**: Drag-and-drop template builder

### 🔗 Integrations
- **n8n**: Workflow automation and triggers
- **Make.com**: Scenario integration and data exchange
- **Customer CRM Systems**: Configurable integration points
- **OpenAI**: AI-powered personalization
- **Webhooks**: Real-time event notifications

### 📊 Analytics & Tracking
- **Click Tracking**: Detailed click analytics
- **Conversion Tracking**: Goal completion monitoring
- **UTM Parameter Tracking**: Campaign attribution
- **Real-time Dashboard**: Live performance metrics
- **Data Export**: CSV/JSON export capabilities

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Database      │
│   (React/Next)  │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   File Storage  │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hyperise-replacement
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the services**
   - API: http://localhost:3000
   - Database Admin: http://localhost:8080
   - Redis Admin: http://localhost:8081
   - Health Check: http://localhost:3000/health

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   # Create database
   createdb hyperise_replacement
   
   # Run schema
   psql -d hyperise_replacement -f database/schema.sql
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication
```bash
# JWT Token
Authorization: Bearer <your-jwt-token>

# API Key
X-API-Key: <your-api-key>
```

### Core Endpoints

#### Short Links
```bash
# Create short link
POST /api/short-links/create
{
  "original_url": "https://example.com",
  "title": "My Campaign",
  "description": "Campaign description"
}

# Get short link
GET /api/short-links/{shortCode}

# Get analytics
GET /api/short-links/{shortCode}/analytics?period=7d

# Get QR code
GET /api/short-links/{shortCode}/qr?size=200&format=png
```

#### Templates
```bash
# Create template
POST /api/templates
{
  "name": "Welcome Template",
  "type": "landing_page",
  "content": {
    "title": "Welcome {{name}}!",
    "subtitle": "We have something special for you"
  },
  "variables": ["name", "email", "company"]
}

# Get templates
GET /api/templates?type=landing_page&user_id=1
```

#### Campaigns
```bash
# Create campaign
POST /api/campaigns
{
  "name": "Summer Sale",
  "template_id": 1,
  "settings": {
    "personalization": true,
    "ab_testing": true
  }
}

# Get campaign analytics
GET /api/campaigns/{id}/analytics
```

### Landing Page Rendering
```
GET /p/{shortCode}?name=John&email=john@example.com&company=Acme
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `BASE_URL` | Base URL for links | `http://localhost:3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_NAME` | Database name | `hyperise_replacement` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

### Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `templates` - Landing page and image templates
- `campaigns` - Marketing campaigns
- `short_links` - Generated short URLs
- `analytics_events` - Tracking and analytics data
- `personalization_rules` - Dynamic content rules
- `ab_test_variants` - A/B testing variants

## 🎨 Customization

### Template Variables
Templates support dynamic variables using `{{variable_name}}` syntax:

```json
{
  "title": "Welcome {{name}}!",
  "subtitle": "Your company {{company}} has special offers",
  "cta": "Get {{discount}}% off"
}
```

### Personalization Rules
Define conditional content based on user data:

```json
{
  "conditions": {
    "company": "Acme Corp"
  },
  "actions": {
    "content": {
      "title": "Special offer for Acme employees!",
      "discount": "25"
    }
  }
}
```

## 🔗 Integration Examples

### n8n Integration
```javascript
// Webhook trigger in n8n
const webhookUrl = 'https://your-api.com/api/webhooks/n8n';
const payload = {
  event: 'campaign_created',
  data: {
    campaign_id: 123,
    user_data: { name: 'John', email: 'john@example.com' }
  }
};
```

### Make.com Integration
```javascript
// Scenario trigger
const makeWebhook = 'https://hook.eu1.make.com/your-webhook';
const response = await fetch(makeWebhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    short_link_id: 456,
    event_type: 'conversion',
    user_data: { name: 'Jane', company: 'TechCorp' }
  })
});
```

### Customer CRM Integration
```javascript
// Sync lead data to customer CRM
const crmData = {
  lead_id: 789,
  name: 'John Doe',
  email: 'john@doe.com',
  company: 'Acme Corp',
  source: 'personalized_landing_page'
};
```

## 📊 Analytics & Reporting

### Event Types
- `view` - Page view
- `click` - Link click
- `conversion` - Goal completion
- `form_submit` - Form submission
- `scroll` - Page scroll tracking

### Metrics Available
- Click-through rates
- Conversion rates
- Geographic data
- Device information
- Referrer analysis
- UTM parameter performance

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale api=3
```

### Cloud Deployment
The system is designed to deploy on:
- **Railway**: Simple deployment with managed PostgreSQL
- **Render**: Free tier with automatic deployments
- **Heroku**: Easy scaling and add-ons
- **AWS**: Full control with RDS and ElastiCache

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Configure CDN
- [ ] Set up monitoring
- [ ] Configure backups

## 🔒 Security

### Authentication
- JWT tokens with configurable expiration
- API key authentication
- Role-based access control
- Rate limiting and DDoS protection

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure headers with Helmet

## 📈 Performance

### Optimization Features
- Redis caching for templates and analytics
- Database connection pooling
- Image optimization with Sharp
- Gzip compression
- CDN-ready static assets

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Request logging
- Database query monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆚 Comparison with Hyperise

| Feature | Hyperise | Custom Solution | Advantage |
|---------|----------|-----------------|-----------|
| **API Access** | Limited | Full | ✅ Custom |
| **Integration** | Basic | Advanced | ✅ Custom |
| **Cost** | $50-200/month | $0/month | ✅ Custom |
| **Control** | Vendor-controlled | Full ownership | ✅ Custom |
| **Scalability** | Vendor limits | Unlimited | ✅ Custom |
| **Features** | Standard | Enhanced | ✅ Custom |
| **Analytics** | Basic | Advanced | ✅ Custom |
| **Automation** | Limited | Full | ✅ Custom |

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Short link generation
- [x] Landing page rendering
- [x] Basic analytics
- [x] Template system

### Phase 2: Advanced Features 🚧
- [ ] Image personalization
- [ ] A/B testing
- [ ] Advanced analytics
- [ ] Campaign management

### Phase 3: Integrations 🚧
- [ ] n8n webhooks
- [ ] Make.com scenarios
- [ ] Customer CRM sync
- [ ] OpenAI personalization

### Phase 4: Enterprise Features 📋
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] White-label options
- [ ] API rate limiting

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@rensto.com
- Documentation: https://docs.rensto.com

---

**Built with ❤️ by the Rensto Team**
