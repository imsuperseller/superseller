# 🚀 **UNIFIED LEAD MACHINE DEPLOYMENT GUIDE**
## Complete Production Deployment Instructions

### 📋 **OVERVIEW**

This guide provides step-by-step instructions for deploying the Unified Lead Generation Machine to production. The deployment process includes environment setup, dependency installation, configuration, testing, and monitoring.

### 🎯 **PREREQUISITES**

#### **System Requirements**
- **Node.js**: Version 18+ (recommended: 20+)
- **npm**: Version 8+ (recommended: 10+)
- **MongoDB**: Version 6+ (for data storage)
- **Redis**: Version 6+ (for caching and sessions)
- **Server**: Ubuntu 20.04+ or CentOS 8+ (recommended)

#### **API Keys Required**
- **Google Gemini API**: For AI lead generation
- **OpenAI API**: For advanced AI processing
- **Anthropic Claude API**: For Claude AI integration
- **Apify API**: For web scraping
- **Firecrawl API**: For LinkedIn scraping
- **Stripe API**: For payment processing
- **QuickBooks API**: For invoicing
- **Airtable API**: For CRM integration

### 🔧 **INSTALLATION PROCESS**

#### **Step 1: Clone and Setup**

```bash
# Clone the repository
git clone https://github.com/rensto/unified-lead-machine.git
cd unified-lead-machine

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

#### **Step 2: Environment Configuration**

```bash
# Edit .env file with your API keys
nano .env
```

**Required Environment Variables:**

```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lead-machine
REDIS_URL=redis://localhost:6379

# AI API Keys
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here

# Web Scraping API Keys
APIFY_API_KEY=your_apify_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
QUICKBOOKS_CLIENT_ID=your_quickbooks_client_id_here
QUICKBOOKS_CLIENT_SECRET=your_quickbooks_client_secret_here

# CRM Integration
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# Security
JWT_SECRET=your_jwt_secret_here
API_KEY_SECRET=your_api_key_secret_here

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info
```

#### **Step 3: Database Setup**

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Create database and collections
node scripts/setup-database.js
```

#### **Step 4: Build and Test**

```bash
# Build the application
npm run build

# Run tests
npm test

# Run integration tests
npm run test:integration
```

### 🚀 **DEPLOYMENT OPTIONS**

#### **Option 1: Direct Server Deployment**

```bash
# Start the production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start src/server.js --name "lead-machine"
pm2 startup
pm2 save
```

#### **Option 2: Docker Deployment**

```bash
# Build Docker image
docker build -t unified-lead-machine .

# Run Docker container
docker run -d \
  --name lead-machine \
  -p 3000:3000 \
  --env-file .env \
  unified-lead-machine
```

#### **Option 3: Kubernetes Deployment**

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lead-machine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lead-machine
  template:
    metadata:
      labels:
        app: lead-machine
    spec:
      containers:
      - name: lead-machine
        image: unified-lead-machine:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: lead-machine-secrets
              key: mongodb-uri
```

### 🔧 **CONFIGURATION**

#### **API Configuration**

```javascript
// src/config/api.js
module.exports = {
  gemini: {
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
    maxTokens: 8192
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    maxTokens: 4096
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20240620',
    maxTokens: 4096
  }
};
```

#### **Database Configuration**

```javascript
// src/config/database.js
module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },
  redis: {
    url: process.env.REDIS_URL,
    options: {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    }
  }
};
```

#### **Security Configuration**

```javascript
// src/config/security.js
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },
  apiKey: {
    secret: process.env.API_KEY_SECRET,
    expiresIn: '30d'
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
};
```

### 📊 **MONITORING SETUP**

#### **Health Check Endpoints**

```javascript
// src/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});

app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      apis: await checkAPIs()
    }
  };
  
  res.json(health);
});
```

#### **Logging Configuration**

```javascript
// src/config/logging.js
const winston = require('winston');

module.exports = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

#### **Error Tracking**

```javascript
// src/config/error-tracking.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

module.exports = Sentry;
```

### 🔒 **SECURITY SETUP**

#### **API Authentication**

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

#### **Rate Limiting**

```javascript
// src/middleware/rate-limit.js
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Apply rate limits
app.use('/api/leads/generate', createRateLimit(15 * 60 * 1000, 10)); // 10 requests per 15 minutes
app.use('/api/', createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
```

### 📈 **PERFORMANCE OPTIMIZATION**

#### **Caching Strategy**

```javascript
// src/middleware/cache.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

#### **Database Optimization**

```javascript
// src/config/database-optimization.js
module.exports = {
  indexes: [
    { collection: 'leads', index: { email: 1 }, unique: true },
    { collection: 'leads', index: { createdAt: -1 } },
    { collection: 'leads', index: { customerId: 1, createdAt: -1 } },
    { collection: 'customers', index: { email: 1 }, unique: true }
  ]
};
```

### 🧪 **TESTING**

#### **Unit Tests**

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

#### **Integration Tests**

```bash
# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

#### **Load Testing**

```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery run tests/load-test.yml
```

### 📊 **MONITORING & ALERTING**

#### **Performance Monitoring**

```javascript
// src/middleware/metrics.js
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
```

#### **Alerting Configuration**

```yaml
# alerts.yml
groups:
- name: lead-machine-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
```

### 🔄 **BACKUP & RECOVERY**

#### **Database Backup**

```bash
# Create backup script
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/lead-machine"
DB_NAME="lead-machine"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz $BACKUP_DIR/$DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

#### **Automated Backups**

```bash
# Add to crontab
0 2 * * * /path/to/backup-database.sh
```

### 🚀 **PRODUCTION CHECKLIST**

#### **Pre-Deployment Checklist**

- [ ] All API keys configured
- [ ] Database connections tested
- [ ] Environment variables set
- [ ] Security configurations applied
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Error handling tested
- [ ] Documentation updated

#### **Post-Deployment Checklist**

- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Performance metrics baseline
- [ ] Error tracking working
- [ ] Backup verification
- [ ] Security scan completed
- [ ] Load testing in production
- [ ] Team training completed
- [ ] Documentation accessible
- [ ] Support procedures defined

### 🎯 **TROUBLESHOOTING**

#### **Common Issues**

1. **API Key Errors**
   ```bash
   # Check API key configuration
   node scripts/verify-api-keys.js
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   node scripts/test-database.js
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   node scripts/monitor-memory.js
   ```

4. **Performance Issues**
   ```bash
   # Run performance analysis
   node scripts/performance-analysis.js
   ```

### 📚 **MAINTENANCE**

#### **Regular Maintenance Tasks**

- **Daily**: Check health endpoints, review error logs
- **Weekly**: Review performance metrics, update dependencies
- **Monthly**: Security updates, backup verification
- **Quarterly**: Full system audit, capacity planning

#### **Update Procedures**

```bash
# Update dependencies
npm update

# Run tests after updates
npm test

# Deploy updates
npm run deploy:production
```

### 🎯 **CONCLUSION**

This deployment guide provides comprehensive instructions for deploying the Unified Lead Generation Machine to production. The guide covers:

- **Complete installation process**
- **Environment configuration**
- **Security setup**
- **Monitoring and alerting**
- **Performance optimization**
- **Backup and recovery**
- **Troubleshooting procedures**

**The Unified Lead Machine is now ready for production deployment and represents the most advanced lead generation platform ever built for the Rensto ecosystem.** 🚀
