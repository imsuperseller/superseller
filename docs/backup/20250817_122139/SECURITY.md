# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Practices

### Infrastructure Security

1. **No Exposed Ports**: All services run behind Cloudflare Tunnel
2. **Encrypted Storage**: N8N_ENCRYPTION_KEY required for credentials
3. **Access Control**: Basic auth on n8n interface
4. **Network Isolation**: Docker services on internal network only
5. **Regular Updates**: Automated dependency updates via Dependabot
6. **Automated Security Scanning**: Continuous vulnerability scanning
7. **System Monitoring**: Real-time security monitoring and alerts
8. **Backup Verification**: Automated backup integrity checks

### Application Security

1. **Environment Variables**: All secrets in .env files (never committed)
2. **Input Validation**: Zod schemas for all user inputs
3. **HTTPS Only**: Enforced via Cloudflare
4. **CSP Headers**: Configured in Next.js
5. **SQL Injection Prevention**: Parameterized queries only
6. **Bug Detection**: Automated static and runtime analysis
7. **Auto-Fix Capabilities**: Automated security issue resolution
8. **Performance Monitoring**: Real-time security performance tracking

### Data Security

1. **Backups**: Encrypted and stored in Icedrive
2. **PII Handling**: Minimal collection, encrypted at rest
3. **API Keys**: Rotated quarterly
4. **Audit Logs**: All admin actions logged

## Reporting a Vulnerability

### Process

1. **DO NOT** create public GitHub issues for security vulnerabilities
2. Email security concerns to: service@rensto.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 48 hours
- **Fix Timeline**: Based on severity
  - Critical: 24 hours
  - High: 72 hours
  - Medium: 1 week
  - Low: Next release

### Severity Levels

- **Critical**: Data breach, RCE, authentication bypass
- **High**: Privilege escalation, XSS with session theft
- **Medium**: Information disclosure, CSRF
- **Low**: Minor information leaks, best practice violations

## Security Checklist

### Pre-Deployment

- [ ] All dependencies updated
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Environment variables configured correctly
- [ ] Cloudflare Tunnel active
- [ ] N8N_ENCRYPTION_KEY set (64 characters)
- [ ] Database passwords strong (16+ characters)
- [ ] Backup scripts tested

### Post-Deployment

- [ ] SSL certificate valid
- [ ] Security headers present (check with securityheaders.com)
- [ ] Rate limiting configured
- [ ] Monitoring alerts active
- [ ] Logs aggregating properly

### Quarterly Review

- [ ] Rotate API keys
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Test backup restoration
- [ ] Security scan with OWASP ZAP
- [ ] Review and update this policy

## Compliance

### GDPR Considerations

- Right to erasure implemented
- Data portability available
- Privacy policy updated
- Cookie consent (if applicable)

### PCI DSS (If Processing Payments)

- Use Stripe Payment Links (PCI burden on Stripe)
- Never store card details
- Use tokenization only

## Incident Response

### Immediate Actions

1. Isolate affected systems
2. Preserve logs
3. Notify affected users (if required)
4. Document timeline

### Recovery

1. Fix vulnerability
2. Deploy patch
3. Verify fix
4. Post-mortem analysis

### Communication

- Internal: Slack #alerts
- External: Email to affected users
- Public: Status page update (if applicable)

## Tools & Resources

### Security Testing

- **OWASP ZAP**: Application security testing
- **npm audit**: Dependency vulnerability scanning
- **ESLint Security Plugin**: Code-level security checks
- **Docker Bench**: Container security audit

### Monitoring

- **Rollbar**: Error tracking (when enabled)
- **Cloudflare Analytics**: Traffic anomaly detection
- **n8n Logs**: Workflow execution audit

## Contact

Security Team: service@rensto.com
Location: Plano, TX

---

*This security policy is reviewed quarterly and updated as needed.*
