# 🎯 CRO INSIGHTS ROBOT - n8n 2.0.1 Workflow Plan

**Client**: Iolite Ventures (David Varnai)  
**Purpose**: Replace Kelly's manual CRO work with automated monthly insights  
**Created**: December 11, 2025  
**Status**: 📋 Planning Phase

---

## 📊 OVERVIEW

**Goal**: Create a Monthly CRO Insights Robot that:
- Runs automatically on the 1st of each month at 09:00
- Pulls behavior data from Microsoft Clarity + GA4 per client
- Uses AI to generate insights, hypotheses, and recommendations
- Outputs structured report in Notion + Slack notification
- Reduces Kelly's work to: Open Notion → Add screenshots → Send to client

---

## 🏗️ WORKFLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│              CRO INSIGHTS ROBOT WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

[1] SCHEDULE TRIGGER (Monthly)
    │
    ├─▶ Cron: "0 9 1 * *" (1st of month, 9:00 AM)
    └─▶ Timezone: Set in workflow settings
    │
    ▼
[2] LOAD CLIENT CONFIGURATION
    │
    ├─▶ n8n Data Table: Get rows from `CRO_Clients`
    ├─▶ Filter: active = true
    └─▶ Split In Batches: Loop per client
    │
    ▼
[3] FOR EACH CLIENT: Calculate Date Range
    │
    ├─▶ Function Node: Previous month calculation
    │   ├─▶ start_date = first day of previous month
    │   └─▶ end_date = last day of previous month
    │
    ▼
[4] PULL MICROSOFT CLARITY DATA
    │
    ├─▶ HTTP Request: Clarity API (if available)
    │   ├─▶ Rage Clicks
    │   ├─▶ Dead Clicks
    │   ├─▶ Scroll Depth
    │   ├─▶ Session Stats
    │   └─▶ Device Breakdown
    │
    ├─▶ ⚠️ FALLBACK: If no API, use web scraping or manual export
    │
    └─▶ Function Node: Aggregate problem pages
    │
    ▼
[5] PULL GA4 DATA
    │
    ├─▶ GA4 Data API Node (@prokodo/n8n-nodes-ga4)
    │   ├─▶ Metrics: sessions, totalUsers, conversions
    │   ├─▶ Dimensions: deviceCategory, landingPage, country
    │   └─▶ Date Range: Previous month
    │
    └─▶ Function Node: Calculate conversion rates
    │
    ▼
[6] MERGE DATA
    │
    ├─▶ Function Node: Combine Clarity + GA4
    └─▶ Structure: Single JSON payload for AI
    │
    ▼
[7] AI INSIGHTS GENERATION
    │
    ├─▶ OpenAI Node (GPT-4 or Claude)
    │   ├─▶ System Prompt: CRO specialist persona
    │   ├─▶ User Prompt: Structured data + instructions
    │   └─▶ Output: Markdown report
    │
    └─▶ Function Node: Parse markdown structure
    │
    ▼
[8] CREATE NOTION REPORT
    │
    ├─▶ Notion Node: Create Page
    │   ├─▶ Parent: CRO Reports Database
    │   ├─▶ Properties: Client, Month, Status
    │   └─▶ Content: Convert markdown to Notion blocks
    │
    └─▶ ⚠️ Use Mark2Notion or community node for conversion
    │
    ▼
[9] SEND NOTIFICATIONS
    │
    ├─▶ Slack Node: #cro-reports channel
    │   ├─▶ Message: Report link + @Kelly mention
    │   └─▶ Link to Notion page
    │
    └─▶ Email Node (Gmail/SMTP)
        ├─▶ To: Recipients from config
        ├─▶ Subject: Client - Monthly CRO Insights
        └─▶ Body: Summary + Notion link
    │
    ▼
[10] ERROR HANDLING
    │
    ├─▶ Error Trigger: Catch API failures
    ├─▶ Google Sheets: Log errors
    └─▶ Slack: Alert on failures
```

---

## 🔧 NODE-BY-NODE CONFIGURATION

### **1. Schedule Trigger Node**

**Node Type**: `n8n-nodes-base.scheduleTrigger`

**Configuration**:
```json
{
  "rule": {
    "interval": [
      {
        "field": "cronExpression",
        "expression": "0 9 1 * *"
      }
    ]
  },
  "timezone": "America/New_York"
}
```

**Best Practices** (n8n 2.0.1):
- ✅ Use cron expression: `0 9 1 * *` (1st of month, 9:00 AM)
- ✅ Set timezone in workflow settings (not just node)
- ✅ Add Code node filter if you need "first Saturday" logic
- ✅ Enable "Activate Workflow" toggle

**Validation**: Test with `0 * * * *` (every hour) first, then switch to monthly

---

### **2. n8n Data Tables: Read Client Config** ✅ UPDATED

**Node Type**: `n8n-nodes-base.dataTable`

**Why n8n Data Tables Instead of Google Sheets**:
- ✅ **No external dependencies** — data lives inside n8n
- ✅ **No API rate limits** — no Google Sheets quota issues
- ✅ **Built-in conditional operations** — `If Row Exists`, `If Row Does Not Exist`
- ✅ **Upsert support** — insert or update in one operation
- ✅ **Native to n8n 2.0.1** — first-class citizen, not external integration
- ✅ **Auto-generated IDs** — unique ID, `created_at`, `updated_at` columns
- ✅ **50MB limit** — more than enough for client config (adjustable via `N8N_DATA_TABLES_MAX_SIZE_BYTES`)
- ✅ **Import/Export CSV** — easy migration from Google Sheets

**Configuration**:
```json
{
  "operation": "get",
  "table": "CRO_Clients",
  "filters": {
    "active": true
  },
  "returnAll": true
}
```

**Data Table Structure** (`CRO_Clients`):

| Column | Data Type | Example | Description |
|--------|-----------|---------|-------------|
| `id` | string (auto) | `abc123` | Unique row ID (auto-generated) |
| `client_name` | string | `Iolite Ventures` | Client display name |
| `client_slug` | string | `iolite-ventures` | URL-safe identifier |
| `website_url` | string | `https://ioliteventures.co` | Client website |
| `clarity_project_id` | string | `xyz789` | Microsoft Clarity project ID |
| `ga4_property_id` | string | `412345678` | GA4 property ID |
| `ga4_credentials_name` | string | `GA4 - Iolite` | Reference to n8n credential name |
| `primary_conversion_event` | string | `lead_submit` | Main conversion event to track |
| `email_recipients` | string | `david@ioliteventures.co,kelly@ioliteventures.co` | Comma-separated emails |
| `slack_channel_id` | string | `C01234567` | Slack channel for notifications |
| `notion_report_db_id` | string | `abc123...` | Notion database for reports |
| `active` | boolean | `true` | Whether to include in monthly run |
| `last_run_date` | string | `2025-12-01` | Last successful execution date |
| `last_run_status` | string | `success` | Status of last run |
| `created_at` | datetime (auto) | `2025-12-11T...` | Auto-generated |
| `updated_at` | datetime (auto) | `2025-12-11T...` | Auto-generated |

**Create Table via n8n UI**:
1. Go to n8n → Data → Data Tables
2. Click "Create Data Table" or "Import from CSV"
3. Name: `CRO_Clients`
4. Add columns as above
5. Import initial data from CSV (see template below)

**Initial Data Migration (from Google Sheets)**:
```csv
client_name,client_slug,website_url,clarity_project_id,ga4_property_id,ga4_credentials_name,primary_conversion_event,email_recipients,slack_channel_id,notion_report_db_id,active,last_run_date,last_run_status
Iolite Ventures,iolite-ventures,https://ioliteventures.co,CLARITY_ID_HERE,GA4_PROPERTY_HERE,GA4 - Iolite,lead_submit,"david@ioliteventures.co,kelly@ioliteventures.co",C01234567,NOTION_DB_ID_HERE,true,,
```

**Best Practices (n8n 2.0.1)**:
- ✅ Use `client_slug` as lookup key (not auto-generated `id`)
- ✅ Store API credentials in n8n Credentials Manager (not in data table)
- ✅ Use `upsert` operation for updating `last_run_date` after each execution
- ✅ Use `If Row Exists` for duplicate checking
- ✅ Keep `active` boolean for easy filtering
- ✅ Auto-generated `created_at` and `updated_at` for audit trail

---

### **3. Split In Batches (Loop Per Client)**

**Node Type**: `n8n-nodes-base.splitInBatches`

**Configuration**:
```json
{
  "batchSize": 1,
  "options": {}
}
```

**Purpose**: Process one client at a time to avoid rate limits

---

### **4. Function Node: Calculate Date Range**

**Node Type**: `n8n-nodes-base.code`

**Code**:
```javascript
// Calculate previous month date range
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

// First day of previous month
const startDate = new Date(currentYear, currentMonth - 1, 1);
// Last day of previous month
const endDate = new Date(currentYear, currentMonth, 0);

// Format for APIs (YYYY-MM-DD)
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

return [{
  json: {
    ...$input.item.json,
    dateRange: {
      start: formatDate(startDate),
      end: formatDate(endDate),
      month: startDate.toLocaleString('default', { month: 'long' }),
      year: startDate.getFullYear()
    }
  }
}];
```

**Output**:
```json
{
  "dateRange": {
    "start": "2025-11-01",
    "end": "2025-11-30",
    "month": "November",
    "year": 2025
  }
}
```

---

### **5. Microsoft Clarity Data Pull** ✅ UPDATED — API NOW AVAILABLE

**Good News**: Microsoft Clarity **DOES** have an official Data Export API!

**API Details** ([learn.microsoft.com](https://learn.microsoft.com/en-gb/clarity/setup-and-installation/clarity-data-export-api)):
- **Endpoint**: `https://www.clarity.ms/export-data/api/v1/project-live-insights`
- **Auth**: Bearer token (generated in Clarity → Settings → Data Export)
- **Rate Limit**: ⚠️ **10 API requests per project per day**
- **Data Range**: Only last 1-3 days (not full month)
- **Max Rows**: 1,000 rows (no pagination)
- **Dimensions**: Up to 3 per request (Browser, Device, Country, OS, Source, Medium, Campaign, Channel, URL)

**Available Metrics**:
- ✅ Rage Click Count
- ✅ Dead Click Count
- ✅ Scroll Depth
- ✅ Engagement Time
- ✅ Traffic
- ✅ Popular Pages
- ✅ Excessive Scroll
- ✅ Quickback Click
- ✅ Script Error Count
- ✅ Error Click Count

**⚠️ API Limitations for Monthly Reports**:
- Only 1-3 days of data available per request
- 10 requests/day limit means max ~3-4 clients/day if running multiple dimensions
- **Solution**: Run **weekly micro-reports** and aggregate, OR use API for recent snapshot + dashboard links for full context

---

**Node Type**: `n8n-nodes-base.httpRequest`

**Step 1: Generate Clarity API Token** (One-time per client)
1. Go to Clarity project → Settings → Data Export
2. Click "Generate new API token"
3. Name it: `n8n-cro-robot`
4. Save token securely in n8n Credentials

**Step 2: Store Token in n8n Credentials**
- Type: Header Auth
- Name: `Clarity - {client_name}`
- Header Name: `Authorization`
- Header Value: `Bearer {API_TOKEN}`

**Step 3: HTTP Request Node Configuration**

```json
{
  "method": "GET",
  "url": "https://www.clarity.ms/export-data/api/v1/project-live-insights",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "httpHeaderAuth",
  "sendQuery": true,
  "queryParameters": {
    "numOfDays": 3,
    "dimension1": "URL",
    "dimension2": "Device",
    "dimension3": "Browser"
  },
  "options": {
    "response": {
      "response": {
        "responseFormat": "json"
      }
    }
  }
}
```

**Function Node: Process Clarity Data**:
```javascript
const clarityResponse = $input.item.json;
const client = $('Get Client Config').first().json;

// Extract key metrics from API response
const metrics = clarityResponse.data || clarityResponse;

// Find top problem pages (high rage clicks, low scroll depth)
const problemPages = [];
if (metrics.pages) {
  metrics.pages.forEach(page => {
    if (page.rageClickCount > 5 || page.scrollDepth < 50) {
      problemPages.push({
        url: page.url,
        rageClicks: page.rageClickCount || 0,
        deadClicks: page.deadClickCount || 0,
        scrollDepth: page.scrollDepth || 0,
        sessions: page.sessions || 0,
        engagementTime: page.engagementTime || 0
      });
    }
  });
}

// Sort by rage clicks (worst first)
problemPages.sort((a, b) => b.rageClicks - a.rageClicks);

// Generate dashboard links for full context
const clarityBaseUrl = `https://clarity.microsoft.com/projects/${client.clarity_project_id}`;
const dateRange = $('Calculate Date Range').first().json.dateRange;

return [{
  json: {
    clarityData: {
      source: 'api',
      dataRange: '3 days',
      note: 'API provides last 3 days only. See dashboard for full month.',
      metrics: {
        totalRageClicks: metrics.totalRageClicks || problemPages.reduce((sum, p) => sum + p.rageClicks, 0),
        totalDeadClicks: metrics.totalDeadClicks || problemPages.reduce((sum, p) => sum + p.deadClicks, 0),
        avgScrollDepth: metrics.avgScrollDepth || 0,
        avgEngagementTime: metrics.avgEngagementTime || 0
      },
      problemPages: problemPages.slice(0, 10), // Top 10 problem pages
      dashboardLinks: {
        overview: `${clarityBaseUrl}/dashboard`,
        rageClicks: `${clarityBaseUrl}/insights/rage-clicks`,
        deadClicks: `${clarityBaseUrl}/insights/dead-clicks`,
        scrollDepth: `${clarityBaseUrl}/insights/scroll-depth`,
        heatmaps: `${clarityBaseUrl}/heatmaps`,
        recordings: `${clarityBaseUrl}/recordings`
      }
    }
  }
}];
```

**Alternative: Weekly Aggregation Strategy**

Since API only provides 3 days of data, run workflow **weekly** instead of monthly:

1. **Schedule**: Every Monday at 9:00 AM (`0 9 * * 1`)
2. **Store weekly data** in `CRO_Weekly_Snapshots` data table
3. **Monthly report**: Aggregate 4 weekly snapshots
4. **Benefit**: Captures full month of Clarity data over time

**Weekly Snapshot Data Table** (`CRO_Weekly_Snapshots`):
```
id (auto)           | client_slug        | week_number
year               | rage_clicks         | dead_clicks
avg_scroll_depth   | avg_engagement_time | problem_pages_json
created_at (auto)
```

**Monthly Aggregation Code**:
```javascript
// Get all weekly snapshots for previous month
const weeklyData = $('Get Weekly Snapshots').all();

const aggregated = {
  totalRageClicks: 0,
  totalDeadClicks: 0,
  avgScrollDepth: 0,
  avgEngagementTime: 0,
  problemPages: []
};

weeklyData.forEach(week => {
  aggregated.totalRageClicks += week.json.rage_clicks || 0;
  aggregated.totalDeadClicks += week.json.dead_clicks || 0;
  aggregated.avgScrollDepth += week.json.avg_scroll_depth || 0;
  aggregated.avgEngagementTime += week.json.avg_engagement_time || 0;
  
  if (week.json.problem_pages_json) {
    const pages = JSON.parse(week.json.problem_pages_json);
    aggregated.problemPages.push(...pages);
  }
});

// Average the averages
const weekCount = weeklyData.length || 1;
aggregated.avgScrollDepth = Math.round(aggregated.avgScrollDepth / weekCount);
aggregated.avgEngagementTime = Math.round(aggregated.avgEngagementTime / weekCount);

// Deduplicate and rank problem pages
const pageMap = new Map();
aggregated.problemPages.forEach(page => {
  if (pageMap.has(page.url)) {
    const existing = pageMap.get(page.url);
    existing.rageClicks += page.rageClicks;
    existing.deadClicks += page.deadClicks;
    existing.occurrences++;
  } else {
    pageMap.set(page.url, { ...page, occurrences: 1 });
  }
});

aggregated.topProblemPages = Array.from(pageMap.values())
  .sort((a, b) => b.rageClicks - a.rageClicks)
  .slice(0, 10);

return [{ json: aggregated }];
```

---

### **6. GA4 Data Pull**

**Node Type**: `@prokodo/n8n-nodes-ga4` (Community Node)

**Installation**:
```bash
# For self-hosted n8n
export N8N_CUSTOM_EXTENSIONS=~/.n8n
npm install --prefix "$N8N_CUSTOM_EXTENSIONS" @prokodo/n8n-nodes-ga4@latest

# Restart n8n
```

**Configuration**:
```json
{
  "operation": "runReport",
  "propertyId": "{{$json.ga4_property_id}}",
  "dateRanges": [
    {
      "startDate": "{{$json.dateRange.start}}",
      "endDate": "{{$json.dateRange.end}}"
    }
  ],
  "metrics": [
    { "name": "sessions" },
    { "name": "totalUsers" },
    { "name": "eventCount" }
  ],
  "dimensions": [
    { "name": "deviceCategory" },
    { "name": "landingPage" },
    { "name": "country" }
  ],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "stringFilter": {
        "matchType": "EXACT",
        "value": "{{$json.primary_conversion_event}}"
      }
    }
  }
}
```

**Credentials**: Google Service Account (stored in N8N)

**Setup Steps**:
1. Create Service Account in Google Cloud Console
2. Download JSON key file
3. Add Service Account email to GA4 property (Viewer/Analyst role)
4. Create N8N credential: "Google Service Account"
5. Paste JSON key content

**Function Node: Process GA4 Data**:
```javascript
const ga4Response = $input.item.json;
const conversionEvent = $input.item.json.primary_conversion_event;

// Extract metrics
const overview = {
  sessions: parseInt(ga4Response.rows[0]?.metricValues[0]?.value || 0),
  users: parseInt(ga4Response.rows[0]?.metricValues[1]?.value || 0),
  conversions: parseInt(ga4Response.rows[0]?.metricValues[2]?.value || 0)
};
overview.conversion_rate = overview.sessions > 0 
  ? (overview.conversions / overview.sessions).toFixed(4) 
  : 0;

// Group by device
const byDevice = {};
ga4Response.rows.forEach(row => {
  const device = row.dimensionValues[0]?.value || 'unknown';
  if (!byDevice[device]) {
    byDevice[device] = {
      device,
      sessions: 0,
      conversions: 0,
      conversion_rate: 0
    };
  }
  byDevice[device].sessions += parseInt(row.metricValues[0]?.value || 0);
  byDevice[device].conversions += parseInt(row.metricValues[2]?.value || 0);
});

// Calculate rates
Object.keys(byDevice).forEach(device => {
  const data = byDevice[device];
  data.conversion_rate = data.sessions > 0 
    ? (data.conversions / data.sessions).toFixed(4) 
    : 0;
});

// Group by landing page
const byLandingPage = {};
ga4Response.rows.forEach(row => {
  const page = row.dimensionValues[1]?.value || 'unknown';
  if (!byLandingPage[page]) {
    byLandingPage[page] = {
      url: page,
      sessions: 0,
      conversions: 0,
      conversion_rate: 0
    };
  }
  byLandingPage[page].sessions += parseInt(row.metricValues[0]?.value || 0);
  byLandingPage[page].conversions += parseInt(row.metricValues[2]?.value || 0);
});

Object.keys(byLandingPage).forEach(page => {
  const data = byLandingPage[page];
  data.conversion_rate = data.sessions > 0 
    ? (data.conversions / data.sessions).toFixed(4) 
    : 0;
});

return [{
  json: {
    ...$input.item.json,
    ga4: {
      overview,
      byDevice: Object.values(byDevice),
      byLandingPage: Object.values(byLandingPage).sort((a, b) => b.sessions - a.sessions)
    }
  }
}];
```

---

### **7. Merge Data for AI**

**Function Node: Combine Clarity + GA4**:
```javascript
const input = $input.item.json;

const payload = {
  client_name: input.client_name,
  month: `${input.dateRange.month} ${input.dateRange.year}`,
  site: input.website_url,
  dateRange: {
    start: input.dateRange.start,
    end: input.dateRange.end
  },
  ga4: input.ga4,
  clarity: input.clarityData || {
    note: "Manual review required - see Clarity dashboard links",
    links: input.clarityLinks
  },
  primary_conversion_event: input.primary_conversion_event
};

return [{ json: payload }];
```

---

### **8. AI Insights Generation**

**Node Type**: `n8n-nodes-base.openAi` (or `n8n-nodes-base.anthropic`)

**Configuration**:
```json
{
  "operation": "complete",
  "model": "gpt-4o",
  "prompt": "{{$json.prompt}}",
  "options": {
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**Function Node: Build Prompt**:
```javascript
const data = $input.item.json;
const payload = JSON.stringify(data, null, 2);

const prompt = `You are a senior CRO (Conversion Rate Optimization) specialist with 15+ years of experience.

Analyze the following data from GA4 and Microsoft Clarity for **${data.client_name}** (${data.month}) and produce a concise, practical CRO report.

**DATA:**
\`\`\`json
${payload}
\`\`\`

**OUTPUT STRUCTURE (Markdown):**

# ${data.client_name} – CRO Insights (${data.month})

## 1. Performance Overview
- **Sessions**: ${data.ga4.overview.sessions.toLocaleString()}
- **Users**: ${data.ga4.overview.users.toLocaleString()}
- **Conversions** (${data.primary_conversion_event}): ${data.ga4.overview.conversions.toLocaleString()}
- **Sitewide Conversion Rate**: ${(data.ga4.overview.conversion_rate * 100).toFixed(2)}%

### Top 3 Converting Landing Pages
${data.ga4.byLandingPage.slice(0, 3).map(p => `- ${p.url}: ${(p.conversion_rate * 100).toFixed(2)}% (${p.sessions} sessions)`).join('\n')}

### Bottom 3 Converting Landing Pages
${data.ga4.byLandingPage.slice(-3).reverse().map(p => `- ${p.url}: ${(p.conversion_rate * 100).toFixed(2)}% (${p.sessions} sessions)`).join('\n')}

## 2. Key Behavioral Findings (from Clarity)
${data.clarity.note || 'Review Clarity dashboard for:'}
- Top pages with high rage clicks (user frustration indicators)
- Pages with low scroll depth or engagement
- Notable device-specific UX issues

**Clarity Dashboard Links:**
${data.clarity.links ? Object.entries(data.clarity.links).map(([key, url]) => `- ${key}: ${url}`).join('\n') : 'Manual review required'}

## 3. Hypotheses (What Might Be Going Wrong)
Provide 3-5 specific hypotheses based on the data. Format:
- **H1: [Hypothesis Title]**
  - Evidence: [What data supports this]
  - Impact: [Why this matters]

## 4. Recommended Experiments / Fixes
Provide 5-7 specific recommendations. For each:
- **Page/Section**: [Where to implement]
- **Issue**: [What's wrong]
- **Suggested Change**: [What to do]
- **Expected Impact**: [Qualitative assessment]

## 5. Priority Actions for Next Month
Top 3 actions to focus on (ranked by potential impact).

---

**Keep language simple, concrete, and non-technical. Assume the reader is a marketer/designer, not a data analyst.**

Focus on actionable insights that Kelly can implement or test.`;

return [{
  json: {
    ...$input.item.json,
    prompt: prompt
  }
}];
```

**Best Practices** (n8n 2.0.1):
- ✅ Use GPT-4o for better structured output
- ✅ Set `temperature: 0.7` for balanced creativity/consistency
- ✅ Use `maxTokens: 2000` to ensure complete responses
- ✅ Add retry logic (3 attempts) for API failures
- ✅ Parse markdown output in next node

---

### **9. Create Notion Report**

**Node Type**: `n8n-nodes-base.notion`

**⚠️ CRITICAL**: Notion API has limitations:
- Max 100 blocks per request
- Text blocks max 2000 characters
- Need to chunk content

**Option A: Use Mark2Notion Service** (Recommended)

**HTTP Request Node**:
```json
{
  "method": "POST",
  "url": "https://api.mark2notion.com/v1/convert",
  "headers": {
    "Authorization": "Bearer {{$env.MARK2NOTION_API_KEY}}",
    "Content-Type": "application/json"
  },
  "body": {
    "markdown": "{{$json.aiOutput}}",
    "notionParentId": "{{$env.NOTION_CRO_REPORTS_DB_ID}}",
    "title": "{{$json.client_name}} - CRO Insights - {{$json.dateRange.month}} {{$json.dateRange.year}}"
  }
}
```

**Option B: Use Community Node**

**Node Type**: `n8n-nodes-notion2md` (community)

**Configuration**:
```json
{
  "operation": "createPage",
  "resource": "page",
  "parent": {
    "databaseId": "{{$env.NOTION_CRO_REPORTS_DB_ID}}"
  },
  "properties": {
    "Client": {
      "title": [{"text": {"content": "{{$json.client_name}}"}}]
    },
    "Month": {
      "rich_text": [{"text": {"content": "{{$json.dateRange.month}} {{$json.dateRange.year}}"}}]
    },
    "Status": {
      "select": {"name": "Draft"}
    }
  },
  "children": "{{$json.notionBlocks}}"
}
```

**Function Node: Convert Markdown to Notion Blocks**:
```javascript
// Simplified version - use Mark2Notion for production
const markdown = $input.item.json.aiOutput;
const lines = markdown.split('\n');

const blocks = [];
let currentParagraph = '';

lines.forEach(line => {
  if (line.startsWith('# ')) {
    // Heading 1
    if (currentParagraph) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: currentParagraph } }] }
      });
      currentParagraph = '';
    }
    blocks.push({
      object: 'block',
      type: 'heading_1',
      heading_1: { rich_text: [{ type: 'text', text: { content: line.replace('# ', '') } }] }
    });
  } else if (line.startsWith('## ')) {
    // Heading 2
    if (currentParagraph) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: currentParagraph } }] }
      });
      currentParagraph = '';
    }
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: line.replace('## ', '') } }] }
    });
  } else if (line.trim() === '') {
    // Empty line - end paragraph
    if (currentParagraph) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: currentParagraph } }] }
      });
      currentParagraph = '';
    }
  } else {
    // Regular text
    currentParagraph += (currentParagraph ? ' ' : '') + line;
  }
});

// Add remaining paragraph
if (currentParagraph) {
  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: currentParagraph } }] }
  });
}

// Chunk into groups of 100 (Notion limit)
const chunkedBlocks = [];
for (let i = 0; i < blocks.length; i += 100) {
  chunkedBlocks.push(blocks.slice(i, i + 100));
}

return [{
  json: {
    ...$input.item.json,
    notionBlocks: blocks,
    chunkedBlocks: chunkedBlocks
  }
}];
```

**Best Practices**:
- ✅ Use Mark2Notion service for reliable conversion
- ✅ Chunk content into 100-block batches
- ✅ Split text blocks >2000 chars
- ✅ Handle rate limits (retry with delay)

---

### **10. Slack Notification**

**Node Type**: `n8n-nodes-base.slack`

**Configuration**:
```json
{
  "operation": "postMessage",
  "channel": "{{$json.slack_channel_id}}",
  "text": "New CRO report generated for *{{$json.client_name}}* ({{$json.dateRange.month}} {{$json.dateRange.year}}).\n\n👉 {{$json.notionPageUrl}}\n\n@Kelly – please review, add 1–2 Clarity screenshots, and finalize action items.",
  "options": {
    "unfurlLinks": true,
    "unfurlMedia": true
  }
}
```

---

### **11. Email Notification**

**Node Type**: `n8n-nodes-base.emailSend` (or Gmail/SMTP)

**Configuration**:
```json
{
  "fromEmail": "noreply@rensto.com",
  "toEmail": "{{$json.email_recipients}}",
  "subject": "{{$json.client_name}} – Monthly CRO Insights ({{$json.dateRange.month}} {{$json.dateRange.year}})",
  "text": "A new CRO insights report has been generated for {{$json.client_name}}.\n\nView the full report: {{$json.notionPageUrl}}\n\nPriority Actions:\n{{$json.priorityActions}}\n\n— Automated by Rensto CRO Robot",
  "options": {
    "allowUnauthorizedCerts": false
  }
}
```

**Function Node: Extract Priority Actions**:
```javascript
const markdown = $input.item.json.aiOutput;
const prioritySection = markdown.match(/## 5\. Priority Actions[\s\S]*?(?=##|$)/);

return [{
  json: {
    ...$input.item.json,
    priorityActions: prioritySection ? prioritySection[0] : "See full report in Notion."
  }
}];
```

---

### **12. Error Handling** ✅ UPDATED WITH DATA TABLES

**Error Trigger Node**:
- Connected to all external API calls (Clarity, GA4, OpenAI, Notion)
- Catches failures and logs to n8n Data Table

**n8n Data Table: Error Log** (`CRO_Errors`)

**Create Data Table**:
1. Go to n8n → Data → Data Tables
2. Create: `CRO_Errors`
3. Columns:
   - `client_slug` (string) — Which client failed
   - `error_type` (string) — API name (clarity/ga4/openai/notion/slack)
   - `error_message` (string) — Error details
   - `execution_id` (string) — n8n execution ID for debugging
   - `workflow_name` (string) — Workflow name
   - `resolved` (boolean) — Whether issue was fixed
   - `created_at` (auto) — When error occurred
   - `updated_at` (auto) — Last update

**Data Table Node Configuration** (Error Logging):
```json
{
  "operation": "insert",
  "table": "CRO_Errors",
  "columns": {
    "client_slug": "={{ $json.client_slug }}",
    "error_type": "={{ $json.error_type }}",
    "error_message": "={{ $json.error_message }}",
    "execution_id": "={{ $execution.id }}",
    "workflow_name": "={{ $workflow.name }}",
    "resolved": false
  }
}
```

**Execution Tracking Data Table** (`CRO_Executions`)

**Create Data Table**:
1. Go to n8n → Data → Data Tables
2. Create: `CRO_Executions`
3. Columns:
   - `client_slug` (string) — Client identifier
   - `month_year` (string) — "December 2025"
   - `execution_id` (string) — n8n execution ID
   - `status` (string) — success/failed/partial
   - `notion_page_url` (string) — Generated report URL
   - `ga4_sessions` (number) — Sessions for the month
   - `ga4_conversions` (number) — Conversions for the month
   - `processing_time_ms` (number) — How long it took
   - `created_at` (auto) — Execution timestamp

**After Successful Execution**:
```json
{
  "operation": "insert",
  "table": "CRO_Executions",
  "columns": {
    "client_slug": "={{ $json.client_slug }}",
    "month_year": "={{ $json.dateRange.month }} {{ $json.dateRange.year }}",
    "execution_id": "={{ $execution.id }}",
    "status": "success",
    "notion_page_url": "={{ $json.notionPageUrl }}",
    "ga4_sessions": "={{ $json.ga4.overview.sessions }}",
    "ga4_conversions": "={{ $json.ga4.overview.conversions }}",
    "processing_time_ms": "={{ Date.now() - $json.startTime }}"
  }
}
```

**Update Client Last Run Status** (Upsert):
```json
{
  "operation": "update",
  "table": "CRO_Clients",
  "filters": {
    "client_slug": "={{ $json.client_slug }}"
  },
  "columns": {
    "last_run_date": "={{ $now.format('YYYY-MM-DD') }}",
    "last_run_status": "success"
  }
}
```

**Slack: Error Alert**:
```json
{
  "operation": "postMessage",
  "channel": "#cro-robot-alerts",
  "text": "🚨 CRO Robot: Failed for *{{ $json.client_slug }}*\n\nError: {{ $json.error_message }}\n\nExecution ID: {{ $execution.id }}\n\nCheck n8n Data Tables → CRO_Errors for details."
}
```

**Retry Logic**:
- Add "Retry on Fail" node after GA4/OpenAI/Notion calls
- Max retries: 3
- Delay: 5 seconds between retries
- On final failure: Log to `CRO_Errors` and continue to next client

---

## 📋 SETUP CHECKLIST

### **Pre-Workflow Setup**

- [ ] **1. Install GA4 Community Node**
  ```bash
  export N8N_CUSTOM_EXTENSIONS=~/.n8n
  npm install --prefix "$N8N_CUSTOM_EXTENSIONS" @prokodo/n8n-nodes-ga4@latest
  ```

- [ ] **2. Create n8n Data Tables** ✅ NEW (Replaces Google Sheets)
  
  **Table 1: `CRO_Clients`** (Client Configuration)
  ```
  Columns:
  - client_name (string)
  - client_slug (string) ← Primary lookup key
  - website_url (string)
  - clarity_project_id (string)
  - ga4_property_id (string)
  - ga4_credentials_name (string)
  - primary_conversion_event (string)
  - email_recipients (string)
  - slack_channel_id (string)
  - notion_report_db_id (string)
  - active (boolean)
  - last_run_date (string)
  - last_run_status (string)
  ```
  
  **Table 2: `CRO_Executions`** (Execution History)
  ```
  Columns:
  - client_slug (string)
  - month_year (string)
  - execution_id (string)
  - status (string)
  - notion_page_url (string)
  - ga4_sessions (number)
  - ga4_conversions (number)
  - processing_time_ms (number)
  ```
  
  **Table 3: `CRO_Errors`** (Error Logging)
  ```
  Columns:
  - client_slug (string)
  - error_type (string)
  - error_message (string)
  - execution_id (string)
  - workflow_name (string)
  - resolved (boolean)
  ```

  **Table 4: `CRO_Weekly_Snapshots`** (Clarity Data Aggregation) ✅ NEW
  ```
  Columns:
  - client_slug (string)
  - week_number (number) — Week of year (1-52)
  - year (number) — e.g., 2025
  - rage_clicks (number)
  - dead_clicks (number)
  - avg_scroll_depth (number)
  - avg_engagement_time (number)
  - problem_pages_json (string) — JSON array of top problem pages
  - api_response_json (string) — Raw API response for reference
  ```
  
  **Why Weekly Snapshots?**
  - Clarity API only provides last 1-3 days of data
  - Running weekly captures full month over 4 runs
  - Monthly report aggregates all weekly snapshots

- [ ] **3. Create Google Service Account for GA4**
  - Google Cloud Console → IAM & Admin → Service Accounts
  - Create new service account
  - Download JSON key
  - Add service account email to GA4 property (Viewer role)

- [ ] **4. Create N8N Credentials**
  - Google Service Account (for GA4)
  - OpenAI API Key (for AI insights)
  - Notion API Token
  - Slack Webhook/Bot Token
  - Gmail/SMTP credentials

- [ ] **5. Create Notion Database: "CRO Reports"**
  - Properties: Client (Title), Month (Text), Status (Select), Created (Date), Notion Page (URL)
  - Get Database ID for workflow

- [ ] **6. Set Up Slack Channel**
  - Create #cro-reports channel
  - Create #cro-robot-alerts channel (for errors)
  - Add bot to channels
  - Get channel IDs

- [ ] **7. Import Initial Client Data**
  - Option A: Import CSV into `CRO_Clients` data table
  - Option B: Manually add Iolite Ventures row
  
  **Initial CSV** (`CRO_Clients_Initial.csv`):
  ```csv
  client_name,client_slug,website_url,clarity_project_id,ga4_property_id,ga4_credentials_name,primary_conversion_event,email_recipients,slack_channel_id,notion_report_db_id,active,last_run_date,last_run_status
  Iolite Ventures,iolite-ventures,https://ioliteventures.co,CLARITY_PROJECT_ID,GA4_PROPERTY_ID,GA4 - Iolite,lead_submit,"david@ioliteventures.co,kelly@ioliteventures.co",C01234567,NOTION_DB_ID,true,,
  ```

### **Workflow Creation**

- [ ] **8. Create Workflow in n8n**
  - Name: `CRO-INSIGHTS-001: Monthly CRO Insights Robot v1`
  - Tag: `cro`, `automation`, `iolite-ventures`

- [ ] **9. Build Workflow Nodes** (in order) ✅ UPDATED
  1. Schedule Trigger
  2. **Data Table (Get CRO_Clients)** ← Replaces Google Sheets
  3. Split In Batches
  4. Code (Date Range Calculation)
  5. Code (Generate Clarity Links)
  6. GA4 Data API
  7. Code (Process GA4 Data)
  8. Code (Merge Data for AI)
  9. Code (Build AI Prompt)
  10. OpenAI (Generate Insights)
  11. Code (Parse Markdown)
  12. Notion (Create Page) or HTTP (Mark2Notion)
  13. Code (Extract Priority Actions)
  14. **Data Table (Insert CRO_Executions)** ← Log execution
  15. **Data Table (Update CRO_Clients)** ← Update last_run
  16. Slack (Notification)
  17. Email (Notification)
  18. Error Trigger → **Data Table (Insert CRO_Errors)** → Slack (Alert)

- [ ] **10. Test Workflow**
  - Test with single client (Iolite Ventures)
  - Verify all API calls work
  - Check Notion page creation
  - Verify Slack/Email notifications

- [ ] **11. Activate Workflow**
  - Set schedule to monthly
  - Enable "Activate Workflow" toggle
  - Monitor first execution

---

## 🎯 EXPECTED OUTPUT

### **Notion Page Structure**

```
# Iolite Ventures – CRO Insights (November 2025)

## 1. Performance Overview
- Sessions: 14,500
- Users: 9,800
- Conversions (lead_submit): 420
- Sitewide Conversion Rate: 2.90%

### Top 3 Converting Landing Pages
- /home: 3.00% (6,000 sessions)
- /services: 1.50% (2,000 sessions)
- /contact: 2.50% (1,500 sessions)

### Bottom 3 Converting Landing Pages
- /blog: 0.50% (800 sessions)
- /about: 0.80% (600 sessions)
- /pricing: 1.20% (1,200 sessions)

## 2. Key Behavioral Findings (from Clarity)
[Kelly adds screenshots here]

Clarity Dashboard Links:
- Rage Clicks: https://clarity.microsoft.com/projects/abc123/insights/rage-clicks?start=2025-11-01&end=2025-11-30
- Dead Clicks: https://clarity.microsoft.com/projects/abc123/insights/dead-clicks?start=2025-11-01&end=2025-11-30
- Scroll Depth: https://clarity.microsoft.com/projects/abc123/insights/scroll-depth?start=2025-11-01&end=2025-11-30

## 3. Hypotheses
- H1: Mobile conversion rate is 50% lower than desktop
  - Evidence: Mobile CR 2.1% vs Desktop 4.1%
  - Impact: 60% of traffic is mobile, significant revenue loss

## 4. Recommended Experiments
[AI-generated recommendations]

## 5. Priority Actions
1. Optimize mobile checkout flow
2. A/B test homepage CTA
3. Fix dead clicks on contact form
```

### **Slack Message**

```
New CRO report generated for *Iolite Ventures* (November 2025).

👉 https://notion.so/iolite-ventures-cro-insights-nov-2025

@Kelly – please review, add 1–2 Clarity screenshots, and finalize action items.
```

---

## 🔌 N8N NODES REFERENCE — Native & Community

### **Native n8n 2.0.1 Nodes Used**

| Node | Purpose | Configuration |
|------|---------|---------------|
| **Schedule Trigger** | Monthly/weekly cron | `0 9 1 * *` or `0 9 * * 1` |
| **Data Table** | Client config, execution logs, errors | Get, Insert, Update, Upsert |
| **HTTP Request** | Clarity API, Mark2Notion | Bearer auth, JSON response |
| **Split In Batches** | Process one client at a time | Batch size: 1 |
| **Code** | Data transformation, date calc | JavaScript |
| **OpenAI** | AI insights generation | GPT-4o, structured prompt |
| **Notion** | Create report pages | Database page creation |
| **Slack** | Team notifications | Channel message |
| **Email Send** | Client notifications | SMTP/Gmail |

### **Community Nodes to Install**

| Node | Package | Purpose | Required? |
|------|---------|---------|-----------|
| **GA4** | `@prokodo/n8n-nodes-ga4` | Google Analytics 4 Data API | ✅ **Yes** — No native GA4 node |

### **Optional Community Nodes** (Not Required)

| Node | Package | Purpose | Why Optional |
|------|---------|---------|--------------|
| ~~JSON Parser~~ | `n8n-nodes-json-parser` | Extract JSON from AI | ❌ **Not needed** — Use Code node instead |
| ~~Structured Output~~ | `n8n-nodes-openai-structured` | Enforce AI schema | ❌ **Not needed** — Use built-in Structured Output Parser |

### **Built-In JSON Parsing (Recommended Approach)**

n8n has excellent built-in JSON handling — **no community nodes needed**:

1. **HTTP Request Node** — Auto-parses JSON responses
2. **Code Node** — Full JavaScript with `JSON.parse()`, regex, etc.
3. **Expressions** — `{{ $json.field }}` or `{{ JSON.parse($json.text) }}`
4. **Edit Fields Node** — Restructure JSON without code
5. **Structured Output Parser** — Built-in AI output parsing (n8n 2.0+)

**For AI Output Parsing (Code Node Example)**:
```javascript
// Extract JSON from AI markdown response
const aiResponse = $input.item.json.message.content;

// Method 1: Simple JSON.parse (if AI returns clean JSON)
try {
  return [{ json: JSON.parse(aiResponse) }];
} catch (e) {
  // Method 2: Extract from markdown code block
  const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return [{ json: JSON.parse(jsonMatch[1].trim()) }];
  }
  
  // Method 3: Find first { to last }
  const start = aiResponse.indexOf('{');
  const end = aiResponse.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    return [{ json: JSON.parse(aiResponse.slice(start, end + 1)) }];
  }
  
  throw new Error('Could not parse JSON from AI response');
}
```

### **n8n 2.0.1 AI Nodes (Built-in)**

| Node | Purpose | Use Case |
|------|---------|----------|
| **Tools AI Agent** | Orchestrate multiple tools | Complex multi-step analysis |
| **Structured Output Parser** | Parse AI to JSON schema | Ensure consistent report format |
| **Auto-fixing Output Parser** | Self-healing parser | Retry on malformed AI output |
| **OpenAI Chat Model** | GPT-4o, GPT-4 Turbo | Report generation |

### **Recommended Node Configuration**

#### **Structured Output Parser** (For AI Insights)

Instead of free-form markdown, use structured output:

```json
{
  "schema": {
    "type": "object",
    "properties": {
      "performanceOverview": {
        "type": "object",
        "properties": {
          "sessions": { "type": "number" },
          "users": { "type": "number" },
          "conversions": { "type": "number" },
          "conversionRate": { "type": "number" }
        }
      },
      "topConvertingPages": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "url": { "type": "string" },
            "conversionRate": { "type": "number" },
            "sessions": { "type": "number" }
          }
        }
      },
      "problemPages": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "url": { "type": "string" },
            "issue": { "type": "string" },
            "rageClicks": { "type": "number" },
            "scrollDepth": { "type": "number" }
          }
        }
      },
      "hypotheses": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "evidence": { "type": "string" },
            "impact": { "type": "string" }
          }
        }
      },
      "recommendations": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "page": { "type": "string" },
            "issue": { "type": "string" },
            "suggestedChange": { "type": "string" },
            "expectedImpact": { "type": "string" },
            "priority": { "type": "string", "enum": ["high", "medium", "low"] }
          }
        }
      },
      "priorityActions": {
        "type": "array",
        "maxItems": 3,
        "items": { "type": "string" }
      }
    },
    "required": ["performanceOverview", "hypotheses", "recommendations", "priorityActions"]
  }
}
```

**Benefits**:
- ✅ Consistent output format
- ✅ Easier Notion page generation (no markdown parsing)
- ✅ Can validate before saving
- ✅ Better error handling

#### **Auto-fixing Output Parser** (Backup)

Wrap the Structured Output Parser with Auto-fixing:
- If initial parse fails, sends to LLM to fix
- Retries with corrected JSON
- Higher reliability for production

### **Microsoft Graph Node** (Not Needed for Clarity)

Note: The community Microsoft Graph nodes (`n8n-nodes-msgraph-multitenant`, `@advenimuss-n8n-nodes-msgraph`) are for:
- Azure AD / Entra ID
- Office 365 (Outlook, Calendar, SharePoint)
- OneDrive, Teams

**Clarity is NOT part of Microsoft Graph** — it has its own separate API.

### **Installation Commands** (Self-Hosted n8n)

```bash
# Only ONE community node required: GA4
# All other JSON/AI parsing uses built-in n8n nodes

# Install GA4 node (required - no native GA4 node exists)
npm install --prefix ~/.n8n @prokodo/n8n-nodes-ga4@latest

# Restart n8n to load new node
systemctl restart n8n  # or pm2 restart n8n
```

### **Docker Installation**

```dockerfile
FROM n8nio/n8n:latest

ENV N8N_CUSTOM_EXTENSIONS=/home/node/.n8n
ENV NODE_PATH=/home/node/.n8n/node_modules

USER node
# Only GA4 community node needed
RUN npm install --prefix /home/node/.n8n @prokodo/n8n-nodes-ga4@latest
```

---

## ⚠️ KNOWN LIMITATIONS & WORKAROUNDS

### **1. Microsoft Clarity API** ✅ UPDATED
- **Issue**: API only provides last 1-3 days of data, 10 requests/day limit
- **Workaround**: 
  - **Option A**: Run weekly, aggregate 4 snapshots for monthly report
  - **Option B**: Use API for recent data + dashboard links for full context
- **Setup Required**: Generate API token in Clarity → Settings → Data Export

### **2. Notion Block Limits**
- **Issue**: 100 blocks per request, 2000 chars per text block
- **Workaround**: Use Mark2Notion service or chunk content
- **Future**: Consider Google Docs as alternative output

### **3. GA4 Data API Rate Limits**
- **Issue**: 10 requests per second per project
- **Workaround**: Process clients sequentially (Split In Batches)
- **Future**: Add exponential backoff retry logic

### **4. OpenAI Token Limits**
- **Issue**: Large data payloads may exceed context window
- **Workaround**: Summarize data before sending to AI
- **Future**: Use Claude 3.5 Sonnet (200K context) if needed

---

## 📊 COST ESTIMATION

| Service | Usage | Cost |
|---------|-------|------|
| **n8n** | 1 execution/month | $0 (self-hosted) |
| **GA4 Data API** | 1 client/month | $0 (free) |
| **OpenAI GPT-4o** | ~2000 tokens/month | ~$0.06 |
| **Notion API** | 1 page/month | $0 (free tier) |
| **Slack API** | 1 message/month | $0 (free) |
| **Email (SMTP)** | 1 email/month | $0 (Gmail free) |
| **Mark2Notion** | 1 conversion/month | ~$0.10 (if used) |
| **Total** | | **~$0.16/month** |

---

## 🚀 DEPLOYMENT TIMELINE

| Phase | Task | Estimated Time |
|-------|------|----------------|
| **Phase 1** | Setup (GA4 node, credentials, **n8n Data Tables**) | 2-3 hours |
| **Phase 2** | Build workflow (nodes 1-10) | 4-6 hours |
| **Phase 3** | AI integration & Notion output | 2-3 hours |
| **Phase 4** | Testing & error handling | 2-3 hours |
| **Phase 5** | Documentation & handoff | 1 hour |
| **Total** | | **11-16 hours** |

---

## 📝 NEXT STEPS

1. ✅ **Update Firestore** with David/Iolite Ventures client entry
2. ✅ **Review this plan** with David for approval
3. 🔜 **Install GA4 node** on n8n instance
4. 🔜 **Create n8n Data Tables** (CRO_Clients, CRO_Executions, CRO_Errors)
5. 🔜 **Build workflow** in n8n
6. 🔜 **Test with Iolite Ventures** data
7. 🔜 **Deploy to production**

---

## 🗄️ N8N DATA TABLES — COMPREHENSIVE GUIDE

### **Why n8n Data Tables Over Google Sheets**

| Feature | Google Sheets | n8n Data Tables |
|---------|---------------|-----------------|
| **External Dependency** | ⚠️ Requires Google API | ✅ Native to n8n |
| **API Rate Limits** | ⚠️ 300 requests/min | ✅ No limits |
| **Authentication** | ⚠️ OAuth/Service Account | ✅ None needed |
| **Latency** | ⚠️ Network round-trip | ✅ Local storage |
| **Conditional Operations** | ❌ Need If node | ✅ Built-in `If Row Exists` |
| **Upsert Support** | ❌ Manual logic | ✅ Native operation |
| **Auto-Generated IDs** | ❌ Manual | ✅ Unique ID, created_at, updated_at |
| **Import/Export CSV** | ✅ Manual | ✅ Native UI |
| **Cost** | ⚠️ Google API quotas | ✅ Free (included) |
| **Storage Limit** | ⚠️ Various | ✅ 50MB default (configurable) |

### **Data Table Operations (n8n 2.0.1)**

| Operation | Description | Use Case |
|-----------|-------------|----------|
| **Get** | Retrieve rows with filters | Load client config |
| **Insert** | Add new rows | Log new execution |
| **Update** | Modify existing rows | Update last_run_date |
| **Delete** | Remove rows | Clean old error logs |
| **Upsert** | Insert or update | Smart client sync |
| **If Row Exists** | Conditional check + return data | Duplicate prevention |
| **If Row Does Not Exist** | Conditional check | New client detection |

### **Key Data Handling Tips (from n8n Best Practices)**

#### **1. Use Expressions for Metadata Logging**

Always capture workflow metadata for debugging:

```javascript
// Available expressions in any node:
{{ $execution.id }}        // Unique execution ID (e.g., "38671")
{{ $workflow.name }}       // Workflow name (e.g., "CRO-INSIGHTS-001")
{{ $workflow.id }}         // Workflow ID for API calls
{{ $now }}                 // Current timestamp in workflow timezone
{{ $now.format('YYYY-MM-DD HH:mm:ss') }}  // Formatted timestamp
```

#### **2. Stabilize Data with Edit Fields Node**

Before major workflow sections, use Edit Fields to create consistent data:

```
[API Call] → [Code: Parse] → [Edit Fields: Standardize] → [Next Section]
```

**Why?** When you modify nodes earlier in the workflow, Edit Fields acts as a checkpoint — downstream references don't break.

#### **3. Access Data from Any Branch with `.first()`**

When multiple paths exist (If/Switch nodes), use `.first()`:

```javascript
// May fail if not on live wire:
{{ $json.client_slug }}

// Works from any branch:
{{ $('Edit Fields').first().json.client_slug }}
```

#### **4. Return Entire Node Output with `.all()`**

Before loops or sub-workflows, get all data from a node:

```javascript
// In Code node:
return $('GA4 API').all();
```

#### **5. Code Node After Every API Call**

Always add Code node after HTTP/API calls:

```javascript
// Parse nested AI output:
const raw = $input.item.json;
const parsed = JSON.parse(raw.output || '{}');
return [{ json: { ...raw, parsed } }];
```

#### **6. Pin Data for Edge Case Testing**

1. Execute node once
2. Click "Pin Data" icon
3. Edit pinned data (change "success" to "fail")
4. Re-run workflow to test error handling

#### **7. Build Data Objects Before Transitions**

Before `Loop Over Items` or `Execute Sub-Workflow`:

```javascript
// Consolidate all needed data:
const client = $('Get Client').first().json;
const ga4 = $('GA4 API').first().json;
const clarity = $('Clarity Links').first().json;

return [{
  json: {
    client,
    ga4,
    clarity,
    meta: {
      execution_id: $execution.id,
      workflow: $workflow.name,
      timestamp: $now.toISO()
    }
  }
}];
```

#### **8. Use "No Operation" Node for Clean Path Merging**

When multiple paths converge but only one is live:

```
[Path A] ─┐
          ├→ [No Operation] → [Next Step]
[Path B] ─┘
```

Passes through whichever path is live, no Merge node needed.

#### **9. First Live Wire Principle**

n8n takes the **first connected wire** that has data. If multiple paths could be live, ensure correct ordering or use explicit conditions.

#### **10. Loop Reset for Pagination**

For paginating large API responses:

1. Loop Over Items node → Add Option → Reset
2. Set condition: `={{ $('Check More Pages').first().json.hasMore }}`
3. Loop continues until `hasMore = false`

### **Data Table Schema Reference**

#### **CRO_Clients** (Configuration)
```
id (auto)          | client_slug (string) | client_name (string)
website_url        | clarity_project_id   | ga4_property_id
ga4_credentials_name | primary_conversion_event | email_recipients
slack_channel_id   | notion_report_db_id  | active (boolean)
last_run_date      | last_run_status      | created_at (auto)
updated_at (auto)
```

#### **CRO_Executions** (History)
```
id (auto)          | client_slug (string) | month_year (string)
execution_id       | status               | notion_page_url
ga4_sessions (number) | ga4_conversions (number) | processing_time_ms (number)
created_at (auto)
```

#### **CRO_Errors** (Error Log)
```
id (auto)          | client_slug (string) | error_type (string)
error_message      | execution_id         | workflow_name
resolved (boolean) | created_at (auto)    | updated_at (auto)
```

### **Migration from Google Sheets**

1. **Export**: Google Sheets → File → Download → CSV
2. **Import**: n8n → Data → Data Tables → Create → Import from CSV
3. **Map**: Ensure column names match schema
4. **Verify**: Check data types (Number vs String)
5. **Test**: Run workflow with one client

---

**Questions?** See n8n documentation or reach out for clarification.
