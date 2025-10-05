# 🎯 **N8N ISRAELI LEADS WORKFLOW MODIFICATION**

**Date**: January 26, 2025  
**Status**: ✅ **COMPLETE MODIFICATION PLAN**  
**Purpose**: Modify workflow `cgk7FI57o6cg3eju` to target Israeli professionals using n8n data tables

---

## 🚀 **OVERVIEW**

This document provides a complete plan to modify your existing n8n workflow to:
1. **Target Israeli professionals** living in the USA, ages 25-50
2. **Use n8n data tables** instead of Supabase
3. **Add Israeli-specific filtering** at multiple points
4. **Maintain all existing functionality** while adding new capabilities

---

## 📋 **STEP 1: CREATE N8N DATA TABLES**

### **Before modifying the workflow, you need to create data tables in n8n:**

1. **Go to your n8n instance**: `http://173.254.201.134:5678`
2. **Navigate to "Data Tables"** (new tab in n8n interface)
3. **Create two data tables**:

#### **Table 1: `israeli_linkedin_leads`**
- **Columns**:
  - `id` (auto-generated)
  - `publicidentifier` (text)
  - `linkedinurl` (text)
  - `name` (text)
  - `headline` (text)
  - `about` (text)
  - `premium` (boolean)
  - `verified` (boolean)
  - `openprofile` (boolean)
  - `topskills` (text)
  - `connectionscount` (number)
  - `followercount` (number)
  - `latest_experience` (text)
  - `education` (text)
  - `estimated_age` (number)
  - `israeli_score` (number)
  - `phone` (text)
  - `email` (text)
  - `location` (text)
  - `created_at` (auto-generated)

#### **Table 2: `israeli_googlemaps_leads`**
- **Columns**:
  - `id` (auto-generated)
  - `title` (text)
  - `category_name` (text)
  - `address` (text)
  - `neighborhood` (text)
  - `street` (text)
  - `city` (text)
  - `postal_code` (text)
  - `state` (text)
  - `country_code` (text)
  - `website` (text)
  - `phone` (text)
  - `phone_unformatted` (text)
  - `location` (text)
  - `total_score` (number)
  - `israeli_score` (number)
  - `business_type` (text)
  - `created_at` (auto-generated)

---

## 🔧 **STEP 2: WORKFLOW MODIFICATIONS**

### **A. Form Input Modifications**

**Current Form Fields**:
- Title/Industry: "CEOs or Finance"
- Location: "Enter targeted location"
- Source: Google Maps/LinkedIn/Both
- Number of results: Optional

**Modified Form Fields**:
- **Title/Industry**: "Israeli CEO", "Israeli Marketing Director", "Israeli Software Engineer"
- **Location**: "New York City", "Los Angeles", "Miami", "Chicago", "San Francisco"
- **Source**: Google Maps/LinkedIn/Both
- **Number of results**: 1000-15000
- **Age Range**: 25-50 (new field)
- **Lead Type**: US Cities/NYC (new field)

### **B. Add Israeli Filtering Nodes**

#### **1. LinkedIn Israeli Filter Node (Code Node)**
```javascript
// Add after linkedin_dataset, before get_linkedin
function filterIsraeliLinkedInLeads(item) {
  const data = item.json;
  
  // Israeli keyword detection
  const israeliKeywords = ['israeli', 'israel', 'hebrew', 'tel aviv', 'jerusalem', 'idf'];
  const textToSearch = `${data.headline || ''} ${data.about || ''} ${data.latest_experience || ''} ${data.education || ''}`.toLowerCase();
  
  const israeliScore = israeliKeywords.reduce((score, keyword) => {
    return textToSearch.includes(keyword) ? score + 1 : score;
  }, 0);
  
  // Age estimation from experience
  let estimatedAge = null;
  if (data.experience && data.experience.length > 0) {
    const firstExperience = data.experience[0];
    if (firstExperience.startsAt && firstExperience.startsAt.year) {
      const yearsOfExperience = new Date().getFullYear() - firstExperience.startsAt.year;
      estimatedAge = 22 + yearsOfExperience; // Assuming start working at 22
    }
  }
  
  // US location check
  const isUSLocation = (data.location || '').toLowerCase().includes('usa') ||
                     (data.location || '').toLowerCase().includes('united states') ||
                     (data.city || '').toLowerCase().includes('new york') ||
                     (data.city || '').toLowerCase().includes('los angeles');
  
  // Filter criteria
  if (israeliScore > 0 && isUSLocation && estimatedAge >= 25 && estimatedAge <= 50) {
    return {
      ...data,
      estimated_age: estimatedAge,
      israeli_score: israeliScore,
      phone: data.phone || '',
      email: data.email || '',
      location: data.location || ''
    };
  }
  
  return null;
}

// Process all items
const filteredLeads = items.map(item => filterIsraeliLinkedInLeads(item)).filter(Boolean);
return filteredLeads;
```

#### **2. Google Maps Israeli Filter Node (Code Node)**
```javascript
// Add after googlemaps_dataset, before set_google_maps_column
function filterIsraeliGoogleMapsLeads(item) {
  const data = item.json;
  
  // Israeli business keyword detection
  const israeliKeywords = ['israeli', 'hebrew', 'kosher', 'synagogue', 'tel aviv', 'jerusalem'];
  const textToSearch = `${data.title || ''} ${data.categoryName || ''} ${data.address || ''}`.toLowerCase();
  
  const israeliScore = israeliKeywords.reduce((score, keyword) => {
    return textToSearch.includes(keyword) ? score + 1 : score;
  }, 0);
  
  // US location check
  const isUSLocation = (data.countryCode || '').toUpperCase() === 'US' ||
                     (data.state || '').toLowerCase().includes('new york') ||
                     (data.state || '').toLowerCase().includes('california');
  
  // Business type detection
  let businessType = 'other';
  if (textToSearch.includes('restaurant')) businessType = 'restaurant';
  else if (textToSearch.includes('school')) businessType = 'education';
  else if (textToSearch.includes('center')) businessType = 'community';
  else if (textToSearch.includes('business')) businessType = 'business';
  
  // Filter criteria
  if (israeliScore > 0 && isUSLocation && data.phone) {
    return {
      ...data,
      israeli_score: israeliScore,
      business_type: businessType
    };
  }
  
  return null;
}

// Process all items
const filteredLeads = items.map(item => filterIsraeliGoogleMapsLeads(item)).filter(Boolean);
return filteredLeads;
```

### **C. Replace Supabase Nodes with Data Table Nodes**

#### **1. Replace `save_linkedin` Supabase node with Data Table node**
- **Node Type**: `n8n-nodes-base.dataTable`
- **Operation**: `Insert`
- **Data Table**: `israeli_linkedin_leads`
- **Column Mapping**:
  - `publicidentifier` → `{{ $json.publicIdentifier }}`
  - `linkedinurl` → `{{ $json.linkedinUrl }}`
  - `name` → `{{ $json.name }}`
  - `headline` → `{{ $json.headline }}`
  - `about` → `{{ $json.about }}`
  - `premium` → `{{ $json.premium }}`
  - `verified` → `{{ $json.verified }}`
  - `openprofile` → `{{ $json.openProfile }}`
  - `topskills` → `{{ $json.topSkills }}`
  - `connectionscount` → `{{ $json.connectionsCount }}`
  - `followercount` → `{{ $json.followerCount }}`
  - `latest_experience` → `{{ $json.latest_experience }}`
  - `education` → `{{ $json.education }}`
  - `estimated_age` → `{{ $json.estimated_age }}`
  - `israeli_score` → `{{ $json.israeli_score }}`
  - `phone` → `{{ $json.phone }}`
  - `email` → `{{ $json.email }}`
  - `location` → `{{ $json.location }}`

#### **2. Replace `save_googlemaps` Supabase node with Data Table node**
- **Node Type**: `n8n-nodes-base.dataTable`
- **Operation**: `Insert`
- **Data Table**: `israeli_googlemaps_leads`
- **Column Mapping**:
  - `title` → `{{ $json.title }}`
  - `category_name` → `{{ $json.categoryName }}`
  - `address` → `{{ $json.address }}`
  - `neighborhood` → `{{ $json.neighborhood }}`
  - `street` → `{{ $json.street }}`
  - `city` → `{{ $json.city }}`
  - `postal_code` → `{{ $json.postalCode }}`
  - `state` → `{{ $json.state }}`
  - `country_code` → `{{ $json.countryCode }}`
  - `website` → `{{ $json.website }}`
  - `phone` → `{{ $json.phone }}`
  - `phone_unformatted` → `{{ $json.phoneUnformatted }}`
  - `location` → `{{ $json.location }}`
  - `total_score` → `{{ $json.totalScore }}`
  - `israeli_score` → `{{ $json.israeli_score }}`
  - `business_type` → `{{ $json.business_type }}`

---

## 🎯 **STEP 3: APIFY CONFIGURATION MODIFICATIONS**

### **A. LinkedIn Scraper Configuration**
**Current**: Generic search
**Modified**: Israeli-specific search

```json
{
  "locations": ["United States"],
  "maxItems": 15000,
  "profileScraperMode": "Full",
  "searchQuery": "Israeli professionals OR Israeli CEO OR Israeli manager OR Israeli engineer OR Hebrew speaker"
}
```

### **B. Google Maps Scraper Configuration**
**Current**: Generic business search
**Modified**: Israeli business search

```json
{
  "includeWebResults": false,
  "language": "en",
  "locationQuery": "United States",
  "maxCrawledPlacesPerSearch": 15000,
  "scrapeContacts": true,
  "scrapePlaceDetailPage": true,
  "searchStringsArray": [
    "Israeli restaurant",
    "Hebrew school",
    "Kosher market",
    "Israeli community center",
    "Israeli business",
    "Synagogue"
  ]
}
```

---

## 📊 **STEP 4: EXPECTED RESULTS**

### **Target Metrics**:
- **15,000 Israeli professionals** total
- **10,000 US cities** (excluding NYC)
- **5,000 NYC** professionals
- **Ages 25-50** (estimated from LinkedIn experience)
- **Names and phone numbers** (minimum requirement)
- **Israeli relevance score** (1-5 scale)

### **Data Quality**:
- **Israeli Score**: 1-5 based on keyword matches
- **Age Estimation**: Based on LinkedIn experience length
- **Location Verification**: US-based professionals only
- **Contact Information**: Phone numbers prioritized
- **Business Type**: Categorized Israeli businesses

---

## 🚀 **STEP 5: IMPLEMENTATION CHECKLIST**

### **Pre-Implementation**:
- [ ] Create `israeli_linkedin_leads` data table in n8n
- [ ] Create `israeli_googlemaps_leads` data table in n8n
- [ ] Verify Apify credentials are working
- [ ] Test data table access

### **Implementation**:
- [ ] Add Israeli filtering Code nodes
- [ ] Replace Supabase nodes with Data Table nodes
- [ ] Update form input fields
- [ ] Modify Apify configurations
- [ ] Test workflow execution

### **Post-Implementation**:
- [ ] Verify data is being stored in n8n data tables
- [ ] Check Israeli filtering is working
- [ ] Validate age estimation logic
- [ ] Test location filtering
- [ ] Export sample data for verification

---

## 🎉 **BENEFITS OF N8N DATA TABLES**

1. **Native Performance**: No external API calls
2. **Cost Effective**: No Supabase costs
3. **Faster Processing**: Direct n8n integration
4. **Better Security**: Data stays within n8n
5. **Easier Management**: Single interface for everything
6. **Real-time Access**: Immediate data availability

---

## 📋 **NEXT STEPS**

1. **Create the data tables** in n8n interface
2. **Modify the workflow** using the provided configurations
3. **Test with small batches** (100-500 leads)
4. **Scale up** to full 15,000 lead target
5. **Monitor and optimize** based on results

**The workflow will now specifically target Israeli professionals living in the USA, ages 25-50, with names and phone numbers, using n8n's native data tables for storage!** 🎯
