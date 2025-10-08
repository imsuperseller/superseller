# 🛠️ Webflow Maintenance Checklist

**Purpose**: Regular maintenance tasks to keep Rensto Webflow deployment healthy
**Frequency**: Weekly, Monthly, Quarterly

---

## 📅 Weekly Maintenance (Every Monday)

### 1. Run Automated Test Suite (5 minutes)
```bash
cd /Users/shaifriedman/New\ Rensto/rensto/webflow
node automated-test-suite.js
```

**Expected Output**: All tests passing (✅)

**If tests fail**:
- Check which pages are affected
- Verify CDN is accessible
- Review recent changes in GitHub repo
- Check Webflow for accidental page edits

---

### 2. Verify Payment Links Still Work (10 minutes)

Test 3 random pages:
1. Open https://www.rensto.com/marketplace
2. Open browser console (F12)
3. Reload page (Cmd+R)
4. Look for: `🎯 [Rensto Stripe] Rensto Stripe Core loaded`
5. Check for errors in console

Repeat for 2 other random pages from list:
- /subscriptions, /ready-solutions, /custom-solutions
- /hvac, /amazon-seller, /realtor, /roofers

**If issues found**:
- Note which pages have issues
- Check if it's CDN problem (affects all) or page-specific
- Review recent Webflow publishes

---

### 3. Check Analytics (5 minutes)

Review in Google Analytics (when integrated):
- Page views on service pages
- Bounce rate on checkout pages
- Button click tracking
- Conversion rates

**Action items**:
- Note any pages with unusually high bounce rates
- Investigate pages with low engagement

---

## 📅 Monthly Maintenance (First Monday of Month)

### 1. Full Page Audit (30 minutes)

Run comprehensive audit:
```bash
cd /Users/shaifriedman/New\ Rensto/rensto/webflow
bash /tmp/audit_all_pages.sh > monthly_audit_$(date +%Y-%m).txt
```

Review results:
- [ ] All 19 pages returning HTTP 200
- [ ] All pages have 2 script tags
- [ ] No new 404 errors
- [ ] No unexpected redirects

**Archive report**:
```bash
mv monthly_audit_*.txt /Users/shaifriedman/New\ Rensto/rensto/archives/webflow-audits/
```

---

### 2. Review GitHub Repository (15 minutes)

Check https://github.com/imsuperseller/rensto-webflow-scripts

- [ ] Review recent commits
- [ ] Check for any failed deployments in Vercel
- [ ] Verify no security alerts
- [ ] Update dependencies if needed (`npm audit fix`)

---

### 3. Stripe Integration Check (20 minutes)

Verify all Stripe products and payment links:

1. **Check Stripe Dashboard**: https://dashboard.stripe.com
   - [ ] All 18 products still active
   - [ ] Payment links haven't expired
   - [ ] No failed payments due to integration issues

2. **Test Checkout Flow** (pick 2 pages):
   - [ ] Click checkout button
   - [ ] Stripe modal opens correctly
   - [ ] Can navigate through checkout (don't complete)
   - [ ] No JavaScript errors in console

---

### 4. Performance Check (15 minutes)

Run Lighthouse audit on 3 pages:

```bash
# Install if needed: npm install -g lighthouse

lighthouse https://www.rensto.com/marketplace --output html --output-path ./reports/marketplace-lighthouse.html
lighthouse https://www.rensto.com/subscriptions --output html --output-path ./reports/subscriptions-lighthouse.html
lighthouse https://www.rensto.com/ready-solutions --output html --output-path ./reports/ready-solutions-lighthouse.html
```

**Check scores**:
- Performance: Should be ≥85
- Accessibility: Should be ≥90
- Best Practices: Should be ≥90
- SEO: Should be ≥90

**If scores drop**:
- Investigate what changed
- Check CDN caching
- Review script sizes
- Look for new render-blocking resources

---

### 5. Missing Pages Check (10 minutes)

Verify known gaps:
- [ ] Torah Teacher page - still missing scripts?
- [ ] Lead Machine page - determined if needs scripts?
- [ ] Any new niche pages added to Webflow?

**Action**: Deploy scripts to any new pages discovered

---

## 📅 Quarterly Maintenance (Every 3 Months)

### 1. Comprehensive Security Audit (1 hour)

- [ ] Rotate Stripe API keys (best practice)
- [ ] Review Vercel environment variables
- [ ] Check for exposed credentials in GitHub history
- [ ] Update all npm dependencies
- [ ] Review CDN CORS configuration

---

### 2. Documentation Review (30 minutes)

Update documentation if needed:
- [ ] COMPREHENSIVE_AUDIT_REPORT.md - Update metrics
- [ ] DEPLOYMENT_SUCCESS.md - Add any new deployments
- [ ] MAINTENANCE_CHECKLIST.md - Update procedures (this file)
- [ ] CLAUDE.md - Update Webflow section with new info

---

### 3. Code Cleanup (1 hour)

GitHub repository maintenance:
- [ ] Archive old feature branches
- [ ] Clean up test files
- [ ] Remove unused JavaScript functions
- [ ] Optimize script sizes if possible
- [ ] Update README with latest deployment info

---

### 4. Disaster Recovery Test (30 minutes)

Simulate failure scenarios:

**Test 1**: CDN Failure
- What happens if Vercel goes down?
- Do pages gracefully degrade?
- Can we quickly switch to backup CDN?

**Test 2**: Script Error
- Introduce intentional error in test environment
- Verify error tracking works
- Test rollback procedure

**Test 3**: Webflow Publish
- Make minor change in Webflow
- Publish and verify scripts still load
- Confirm no breaking changes

---

### 5. Business Impact Review (30 minutes)

Analyze metrics:
- Total button clicks across all pages (if tracked)
- Conversion rates by page type
- Revenue generated through each service page
- ROI on maintenance time vs issues prevented

**Prepare report for stakeholders**:
- System uptime: X%
- Pages monitored: 19
- Issues detected: X
- Issues resolved: X
- Estimated revenue impact: $X

---

## 🚨 Emergency Procedures

### If Scripts Stop Loading on All Pages

**Symptoms**: No console logs, 0 Stripe buttons initialized

**Likely Causes**:
1. Vercel CDN issue
2. GitHub repository access problem
3. CORS misconfiguration

**Fix Procedure**:
1. **Check Vercel**: https://vercel.com/shais-projects-f9b9e359/rensto-webflow-scripts
   - Deployment status
   - Environment variables
   - Recent deploys

2. **Check CDN directly**:
   ```bash
   curl -I https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js
   ```
   - Should return HTTP 200
   - Should have CORS headers

3. **Force redeploy**:
   ```bash
   cd ~/rensto-webflow-scripts
   git commit --allow-empty -m "Force redeploy"
   git push origin main
   ```

4. **Worst case - rollback**:
   - Revert to previous working commit in GitHub
   - Or temporarily embed inline scripts in Webflow

---

### If Specific Page Stops Working

**Symptoms**: One page not loading scripts, others work fine

**Likely Causes**:
1. Webflow page was edited and scripts removed
2. Page slug changed
3. Page deleted/archived

**Fix Procedure**:
1. **Check page exists**:
   ```bash
   curl -I https://www.rensto.com/{page-slug}
   ```

2. **Check Webflow Designer**:
   - Open page settings
   - Verify custom code section has script tags
   - Re-paste if missing (use SERVICE_PAGES_QUICK_GUIDE.md)

3. **Check for redirects**:
   - Page might have moved
   - Update documentation with new URL

---

### If Stripe Checkout Fails

**Symptoms**: Button clicks but modal doesn't open, or payment fails

**Likely Causes**:
1. Stripe API key issue
2. Vercel environment variables missing
3. Stripe product/price deleted

**Fix Procedure**:
1. **Check Vercel env vars**:
   - NEXT_PUBLIC_STRIPE_LINK_* variables
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLISHABLE_KEY

2. **Check Stripe Dashboard**:
   - Verify products active
   - Verify payment links valid
   - Check API key permissions

3. **Test with Stripe test mode**:
   - Switch to test keys temporarily
   - Verify checkout flow works
   - Helps isolate if issue is Stripe or integration

---

## 📊 Metrics to Track

### System Health Metrics
- **Uptime**: % of time all scripts accessible (Target: 99.9%)
- **Page Load Time**: Average time to load scripts (Target: <500ms)
- **Error Rate**: % of page loads with JS errors (Target: <0.1%)
- **Test Pass Rate**: % of automated tests passing (Target: 100%)

### Business Metrics
- **Button Click Rate**: % of visitors clicking checkout buttons
- **Conversion Rate**: % of button clicks resulting in checkout
- **Revenue per Page**: Which pages drive most revenue
- **Bounce Rate**: Are checkout pages causing exits?

---

## 🔔 Alert Thresholds

Set up monitoring (when available) to alert if:
- ❌ CDN returns non-200 status for >5 minutes
- ❌ Any page returns 404 for >5 minutes
- ❌ Script loading errors exceed 1% of page loads
- ❌ Automated test suite fails 2 times in a row
- ⚠️ Page load time exceeds 3 seconds
- ⚠️ Bounce rate on checkout pages exceeds 70%

---

## 📝 Maintenance Log Template

After each maintenance session, log:

```markdown
## Maintenance Log - [Date]

**Type**: Weekly / Monthly / Quarterly
**Duration**: [X minutes]
**Performed by**: [Name]

### Tests Run
- [ ] Automated test suite
- [ ] Manual page checks
- [ ] Stripe integration test
- [ ] Performance audit

### Issues Found
1. [Issue description]
   - Severity: Critical / High / Medium / Low
   - Action taken: [What you did]
   - Status: Fixed / Monitoring / Escalated

### Notes
- [Any observations, recommendations, or follow-up needed]

**Next maintenance due**: [Date]
```

---

## 📞 Escalation Contacts

If major issues arise:
- **GitHub Issues**: https://github.com/imsuperseller/rensto-webflow-scripts/issues
- **Vercel Support**: https://vercel.com/support
- **Webflow Support**: https://webflow.com/support
- **Stripe Support**: https://support.stripe.com

---

**Checklist Created**: October 7, 2025
**Last Updated**: October 7, 2025
**Owner**: Shai Friedman
**Review Frequency**: Update checklist quarterly or after major incidents
