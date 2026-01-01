# Lemmy Integration Guide

**Date**: December 31, 2025  
**Status**: ✅ Ready to Use

---

## 🎯 **OVERVIEW**

Lemmy is a federated, open-source alternative to Reddit. This integration allows you to:
- Scrape posts and comments from Lemmy instances
- Extract leads from business-related content
- Automate lead generation from Lemmy communities
- Sync data to n8n Data Tables and Airtable

---

## 📋 **QUICK START**

### **Option 1: Use the Script** (Standalone)

```bash
# Run the Lemmy scraper
node scripts/lemmy-scraper.js
```

**Output**:
- `data/lemmy-data/lemmy-results-{timestamp}.json` - Full results
- `data/lemmy-data/lemmy-leads-{timestamp}.csv` - Leads CSV
- `data/lemmy-data/lemmy-analytics-{timestamp}.json` - Analytics

### **Option 2: Use n8n Workflow** (Automated)

1. **Import Workflow**: `workflows/INT-LEMMY-001.json`
2. **Configure**:
   - Communities to scrape (edit "Get Communities" node)
   - Schedule (default: every 6 hours)
   - Airtable base ID (if syncing)
3. **Activate** workflow

---

## 🔧 **CONFIGURATION**

### **Lemmy Instances**

Popular instances you can use:

| Instance | URL | Size | Notes |
|----------|-----|------|-------|
| **lemmy.world** | https://lemmy.world | Largest | Default |
| **lemmy.ml** | https://lemmy.ml | Large | Official instance |
| **beehaw.org** | https://beehaw.org | Medium | High quality |
| **sh.itjust.works** | https://sh.itjust.works | Medium | Active |
| **lemmy.one** | https://lemmy.one | Small | Friendly |

**Change Instance**:
```javascript
// In script
const scraper = new LemmyScraper();
scraper.baseUrl = 'https://beehaw.org'; // Change instance

// In n8n workflow
const BASE_URL = 'https://beehaw.org'; // Edit code node
```

### **Communities to Scrape**

**Business/Lead Generation Communities**:
- `technology`
- `programming`
- `startups`
- `business`
- `entrepreneur`
- `freelance`
- `consulting`
- `marketing`

**Find More Communities**:
```bash
# Run script to see all communities
node scripts/lemmy-scraper.js
# Check output: data/lemmy-data/lemmy-results-*.json
```

---

## 📊 **API ENDPOINTS**

### **Get Communities**
```javascript
POST https://lemmy.world/api/v3/community/list
Body: {
  type_: 'All', // All, Subscribed, Local
  sort: 'TopMonth', // Active, Hot, New, Old, TopDay, TopWeek, TopMonth, TopYear, TopAll
  limit: 50,
  page: 1
}
```

### **Get Posts**
```javascript
POST https://lemmy.world/api/v3/post/list
Body: {
  community_name: 'technology',
  type_: 'All',
  sort: 'Hot', // Active, Hot, New, Old, TopDay, TopWeek, TopMonth, TopYear, TopAll
  limit: 50,
  page: 1
}
```

### **Get Comments**
```javascript
POST https://lemmy.world/api/v3/comment/list
Body: {
  post_id: 12345,
  type_: 'All',
  sort: 'Hot', // Top, New, Old, Hot
  limit: 50,
  page: 1
}
```

---

## 🎯 **LEAD EXTRACTION**

The scraper automatically extracts leads based on:

1. **Business Keywords**: 
   - business, company, startup, service, product
   - consulting, agency, freelance, hire, looking for
   - need help, contact, email, website, phone

2. **High Engagement**:
   - Posts with score > 5
   - Posts with comments > 3

3. **Contact Information**:
   - Email addresses
   - Phone numbers
   - Websites
   - Company names

**Customize Lead Extraction**:
```javascript
// In scripts/lemmy-scraper.js
isPotentialLead(text, item) {
  // Add your custom logic
  const customKeywords = ['your', 'keywords', 'here'];
  return customKeywords.some(kw => text.includes(kw));
}
```

---

## 🔄 **INTEGRATION WITH EXISTING WORKFLOWS**

### **Add to INT-LEAD-001**

You can add Lemmy as a source in your existing lead generation workflow:

```javascript
// In INT-LEAD-001 workflow
// Add new node: "Fetch Lemmy Leads"
const lemmyLeads = await fetchLemmyLeads();
// Merge with LinkedIn/Facebook leads
```

### **Sync to Airtable**

The workflow automatically syncs to:
- **Base**: `appQijHhqqP4z6wGe` (Rensto Client Operations)
- **Table**: `Leads`

**Customize**:
- Edit "Save to Airtable" node
- Change base ID and table name

---

## 📈 **ANALYTICS**

The scraper generates analytics:

```json
{
  "total_communities": 50,
  "total_posts": 500,
  "total_leads": 25,
  "top_communities": [...],
  "top_posts": [...]
}
```

**View Analytics**:
```bash
cat data/lemmy-data/lemmy-analytics-*.json
```

---

## ⚠️ **RATE LIMITING**

**Be Respectful**:
- Lemmy instances are community-run
- Add delays between requests (1-2 seconds)
- Don't scrape too frequently (max once per hour)
- Follow instance rules and ToS

**Current Settings**:
- 1 second delay between community requests
- 6-hour schedule in n8n workflow
- 50 posts per community limit

---

## 🚀 **ADVANCED USAGE**

### **Filter by Community**

```javascript
// Only scrape specific communities
const scraper = new LemmyScraper();
await scraper.getCommunities();
const targetCommunities = scraper.results.communities
  .filter(c => c.subscribers > 1000)
  .map(c => c.name);
await scraper.fetchPosts(targetCommunities);
```

### **Get Comments**

```javascript
// Get comments for a post
const comments = await scraper.getComments(postId);
```

### **Multiple Instances**

```javascript
// Scrape from multiple instances
const instances = ['lemmy.world', 'beehaw.org', 'lemmy.ml'];
for (const instance of instances) {
  scraper.baseUrl = `https://${instance}`;
  await scraper.run();
}
```

---

## 🔗 **RESOURCES**

- **Lemmy API Docs**: https://join-lemmy.org/docs/contributors/04-api.html
- **Lemmy Instances**: https://join-lemmy.org/instances
- **n8n HTTP Request Node**: Use for custom API calls
- **Your Lead Workflow**: `INT-LEAD-001`

---

## ✅ **NEXT STEPS**

1. **Test the Script**:
   ```bash
   node scripts/lemmy-scraper.js
   ```

2. **Import n8n Workflow**:
   - Go to n8n
   - Import `workflows/INT-LEMMY-001.json`
   - Configure communities
   - Activate

3. **Integrate with INT-LEAD-001**:
   - Add Lemmy as a source
   - Merge leads with existing sources

4. **Monitor Results**:
   - Check `data/lemmy-data/` for outputs
   - Review Airtable Leads table
   - Adjust communities/keywords as needed

---

**Last Updated**: December 31, 2025

