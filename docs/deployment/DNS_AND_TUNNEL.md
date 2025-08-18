# DNS and Cloudflare Tunnel Configuration

## Overview

This guide covers DNS setup and Cloudflare Tunnel configuration for secure access to n8n without exposing ports.

## Prerequisites

- Domain registered (rensto.com)
- Cloudflare account (free tier works)
- Domain nameservers pointed to Cloudflare
- VPS with Docker installed

## DNS Structure

### Production Setup

```
Domain              Type    Target                   Purpose
------------------------------------------------------------------
rensto.com          A       76.76.21.21             Vercel (website)
www.rensto.com      CNAME   cname.vercel-dns.com    Vercel (website)
n8n.rensto.com      CNAME   tunnel-id.cfargotunnel.com  n8n interface
api.rensto.com      CNAME   tunnel-id.cfargotunnel.com  Future API
```

### Cloudflare Settings

1. **SSL/TLS Mode**: Full (strict)
2. **Always Use HTTPS**: On
3. **Automatic HTTPS Rewrites**: On
4. **Minimum TLS Version**: 1.2

## Cloudflare Tunnel Setup

### Step 1: Create Tunnel

```bash
# Install cloudflared on VPS
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login to Cloudflare
cloudflared tunnel login
# This opens a browser - authorize the connection

# Create tunnel
cloudflared tunnel create rensto-tunnel
# Save the tunnel ID and credentials file path
```

### Step 2: Configure Tunnel

Create `/etc/cloudflared/config.yml`:

```yaml
tunnel: YOUR-TUNNEL-ID-HERE
credentials-file: /etc/cloudflared/YOUR-TUNNEL-ID.json

# Ingress rules - order matters!
ingress:
  # n8n interface
  - hostname: n8n.rensto.com
    service: http://localhost:5678
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      httpHostHeader: n8n.rensto.com

  # Future API endpoint
  - hostname: api.rensto.com
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true

  # Catch-all rule (required)
  - service: http_status:404
```

### Step 3: Install as Service

```bash
# Copy credentials
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/YOUR-TUNNEL-ID.json /etc/cloudflared/

# Install service
sudo cloudflared service install

# Start service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

### Step 4: Configure DNS

In Cloudflare Dashboard:

1. Go to DNS → Records
2. Add CNAME record:
   - Type: CNAME
   - Name: n8n
   - Target: YOUR-TUNNEL-ID.cfargotunnel.com
   - Proxy: ✓ (orange cloud ON)
   - TTL: Auto

### Step 5: Verify Connection

```bash
# From VPS
curl -I http://localhost:5678/healthz

# From external
curl -I https://n8n.rensto.com

# Check tunnel status
cloudflared tunnel info rensto-tunnel
```

## Access Control

### Basic Authentication (n8n)

Set in `infra/.env`:

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=rensto
N8N_BASIC_AUTH_PASSWORD=your-secure-password
```

### Cloudflare Access (Optional)

For additional security, enable Cloudflare Access:

1. Go to Zero Trust → Access → Applications
2. Add application:
   - Name: Rensto n8n
   - Domain: n8n.rensto.com
3. Configure policy:
   - Name: Admin Access
   - Action: Allow
   - Include: Emails ending in @rensto.com

### IP Restrictions

In Cloudflare Firewall Rules:

```
(http.host eq "n8n.rensto.com" and not ip.src in {YOUR_IP_RANGE})
Action: Block
```

## Monitoring

### Tunnel Health

```bash
# Check tunnel status
cloudflared tunnel list
cloudflared tunnel info rensto-tunnel

# View tunnel metrics
cloudflared tunnel metrics rensto-tunnel

# Check logs
sudo journalctl -u cloudflared -f
```

### DNS Propagation

```bash
# Check DNS resolution
dig n8n.rensto.com
nslookup n8n.rensto.com
host n8n.rensto.com

# Test from multiple locations
curl -I https://n8n.rensto.com
```

## Troubleshooting

### Tunnel Won't Start

```bash
# Check config syntax
cloudflared tunnel ingress validate

# Test tunnel
cloudflared tunnel run rensto-tunnel

# Check permissions
ls -la /etc/cloudflared/

# View detailed logs
cloudflared tunnel run --loglevel debug rensto-tunnel
```

### DNS Not Resolving

1. Verify CNAME record in Cloudflare
2. Check proxy status (orange cloud)
3. Wait for propagation (up to 5 minutes)
4. Clear DNS cache:

   ```bash
   # Linux
   sudo systemd-resolve --flush-caches

   # macOS
   sudo dscacheutil -flushcache

   # Windows
   ipconfig /flushdns
   ```

### 502 Bad Gateway

```bash
# Check if service is running
docker-compose ps
curl http://localhost:5678

# Check tunnel config
cat /etc/cloudflared/config.yml

# Restart tunnel
sudo systemctl restart cloudflared

# Check firewall
sudo ufw status
```

### SSL Certificate Issues

1. Verify SSL mode in Cloudflare: Full (strict)
2. Check origin certificate if using
3. Ensure tunnel is using HTTP internally
4. Disable TLS verification in tunnel config if needed

## Advanced Configuration

### Multiple Services

```yaml
ingress:
  # n8n
  - hostname: n8n.rensto.com
    service: http://localhost:5678

  # MongoDB Express (admin panel)
  - hostname: mongo.rensto.com
    service: http://localhost:8081
    originRequest:
      access:
        required: true
        teamName: admin-team

  # Future API
  - hostname: api.rensto.com
    service: http://localhost:3000

  # Health check endpoint
  - hostname: health.rensto.com
    path: /*
    service: http://localhost:9090

  # Catch-all
  - service: http_status:404
```

### Load Balancing

```yaml
ingress:
  - hostname: n8n.rensto.com
    service: http://localhost:5678
    originRequest:
      originServerName: n8n.rensto.com
    loadBalancer:
      policy: round_robin
      pools:
        - http://localhost:5678
        - http://localhost:5679
```

### Custom Headers

```yaml
ingress:
  - hostname: n8n.rensto.com
    service: http://localhost:5678
    originRequest:
      httpHostHeader: n8n.rensto.com
      headers:
        - name: X-Custom-Header
          value: rensto-tunnel
```

## Security Best Practices

1. **Never expose ports directly**

   - All traffic through Cloudflare Tunnel
   - Firewall blocks all except SSH

2. **Use strong authentication**

   - Complex passwords for basic auth
   - Consider Cloudflare Access for additional layer

3. **Regular updates**

   ```bash
   # Update cloudflared
   cloudflared update

   # Update tunnel configuration
   cloudflared tunnel route dns rensto-tunnel n8n.rensto.com
   ```

4. **Monitor access logs**

   - Check Cloudflare Analytics
   - Review tunnel logs regularly
   - Set up alerts for anomalies

5. **Backup tunnel credentials**

   ```bash
   # Backup credentials
   sudo cp /etc/cloudflared/*.json /backup/location/

   # Can recreate tunnel if needed
   cloudflared tunnel delete rensto-tunnel
   cloudflared tunnel create rensto-tunnel
   ```

## Current Production Setup

### Active Environment

- rensto.com on Vercel (production)
- DNS managed in Cloudflare
- All systems operational

### Migration Completed

- ✅ Webflow migration completed
- ✅ All systems migrated to Vercel
- ✅ DNS properly configured
- ✅ No further migration needed

## Disaster Recovery

### Tunnel Recovery

```bash
# If tunnel is deleted accidentally
cloudflared tunnel cleanup rensto-tunnel
cloudflared tunnel create rensto-tunnel-new

# Update DNS
cloudflared tunnel route dns rensto-tunnel-new n8n.rensto.com

# Update config
sudo nano /etc/cloudflared/config.yml
# Change tunnel ID

# Restart
sudo systemctl restart cloudflared
```

### DNS Recovery

Keep backup of DNS records:

```bash
# Export via Cloudflare API
curl -X GET "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records/export" \
  -H "Authorization: Bearer API_TOKEN" > dns-backup.txt
```

## Monitoring Checklist

Daily:

- [ ] Tunnel status green
- [ ] Services accessible
- [ ] No error alerts

Weekly:

- [ ] Review access logs
- [ ] Check SSL certificates
- [ ] Update tunnel if available

Monthly:

- [ ] Audit DNS records
- [ ] Review security policies
- [ ] Test disaster recovery

## Support Resources

- **Cloudflare Tunnel Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps
- **DNS Help**: https://developers.cloudflare.com/dns
- **Zero Trust**: https://developers.cloudflare.com/cloudflare-one
- **Status Page**: https://cloudflarestatus.com

---

_Last updated: 2024-01-06_
