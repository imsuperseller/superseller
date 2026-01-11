# 🚀 Rensto Marketplace

A comprehensive automation marketplace platform built with Next.js, featuring 18 proven automation products across 6 categories.

## 🎯 Features

- **18 Automation Products** - Email automation, business process automation, content generation, financial automation, customer management, and technical integration
- **4 Service Types** - Marketplace, Custom Solutions, Subscriptions, Ready Solutions
- **4 Deployment Packages** - Self-service to white-label solutions
- **Stripe Integration** - Complete payment processing and subscription management
- **Customer Portals** - Subdomain-based customer access with product downloads
- **Multi-language Support** - English, Hebrew, Spanish, and French
- **Enterprise Security** - Bank-level security with compliance ready features

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Database**: MongoDB
- **CMS**: Airtable
- **Hosting**: Vercel + RackNerd VPS
- **CDN**: Cloudflare

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB
- Stripe account
- Airtable account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rensto/marketplace.git
   cd marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database setup**
   ```bash
   # Start MongoDB
   mongod
   
   # Create database
   mongo
   use rensto-marketplace
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3003
   ```

## 📁 Project Structure

```
apps/marketplace/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   └── stripe/        # Payment processing
│   ├── components/        # React components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── header.tsx         # Navigation header
│   ├── hero.tsx           # Hero section
│   ├── product-grid.tsx   # Product catalog
│   ├── pricing-section.tsx # Pricing tiers
│   └── ...
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication config
│   └── stripe.ts         # Stripe configuration
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Required
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-secret-here
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb://localhost:27017/rensto-marketplace

# Optional
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AIRTABLE_API_KEY=your-airtable-api-key
```

### Stripe Setup

1. Create a Stripe account
2. Get your API keys from the dashboard
3. Set up webhooks for `/api/stripe/webhook`
4. Configure products and prices in Stripe

### Airtable Setup

1. Create an Airtable base for products
2. Get your API key and base ID
3. Configure the product catalog structure

## 📦 Products

### Email Automation Suite
- AI-Powered Email Persona System (Custom Solutions)
- Hebrew Email Automation ($297)
- Multi-Language Email Support ($397)

### Business Process Automation
- Complete Business Process Automation (Ready Solutions)
- Customer Onboarding Automation ($297)
- Project Management Automation ($397)

### Content Generation & Marketing
- Tax4Us Content Automation ($597)
- Insurance Content Generator ($697)
- Multi-Platform Content Automation ($797)

### Financial & Invoicing Automation
- QuickBooks Integration Suite ($297)
- Automated Billing System (Subscriptions)
- Multi-Currency Financial Automation ($697)

### Customer Onboarding & Management
- Complete Customer Lifecycle Management ($597)
- Lead Nurturing Automation ($397)
- Customer Support Automation (Custom Solutions)

### Technical Integration Packages
- n8n Deployment Package ($797)
- MCP Server Integration Suite ($997)
- API Integration Hub ($1,197)

## 💰 Pricing Tiers

### Marketplace - Templates & Installation
- Basic email automation
- Simple business processes
- Community support
- Up to 1,000 contacts

### Professional - $297/month
- 6-persona email system
- Complete business automation
- Priority email support
- Up to 10,000 contacts

### Enterprise - $797/month
- All products included
- Multi-language support
- White-label options
- Unlimited contacts

### Custom Enterprise - $2,997/month
- Custom development
- Industry-specific solutions
- Multi-tenant architecture
- 24/7 phone support

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Configure environment variables**
   - Add all environment variables in Vercel dashboard
   - Set up Stripe webhooks

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

1. **Build image**
   ```bash
   docker build -t rensto-marketplace .
   ```

2. **Run container**
   ```bash
   docker run -p 3003:3003 rensto-marketplace
   ```

### Manual Deployment

1. **Build application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔐 Security

- **Authentication**: NextAuth.js with multiple providers
- **Payments**: Stripe with PCI DSS compliance
- **Data**: End-to-end encryption
- **API**: Rate limiting and validation
- **Headers**: Security headers configured

## 📊 Analytics

- **Google Analytics**: User behavior tracking
- **Mixpanel**: Event tracking
- **Stripe**: Payment analytics
- **Custom**: Business metrics dashboard

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Code Style

- **ESLint**: Configured for Next.js
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled
- **Tailwind**: Utility-first CSS

## 📈 Performance

- **Next.js**: App Router with server components
- **Images**: Optimized with next/image
- **Fonts**: Optimized with next/font
- **Bundle**: Analyzed and optimized
- **CDN**: Cloudflare for global delivery

## 🧪 Testing

```bash
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 📚 Documentation

- [API Documentation](/docs/api.md)
- [Component Library](/docs/components.md)
- [Deployment Guide](/docs/deployment.md)
- [Contributing Guide](/docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.rensto.com](https://docs.rensto.com)
- **Email**: support@rensto.com
- **Discord**: [Join our community](https://discord.gg/rensto)
- **GitHub Issues**: [Report bugs](https://github.com/rensto/marketplace/issues)

## 🎉 Acknowledgments

- Built with ❤️ by the Rensto team
- Inspired by our amazing customers
- Powered by the open-source community

---

**Ready to transform your business with automation?** [Get started today!](https://marketplace.rensto.com)

