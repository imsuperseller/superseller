# 🎯 **ISRAELI LEADS IMPLEMENTATION GUIDE**

**Date**: January 26, 2025  
**Status**: ✅ **READY FOR IMPLEMENTATION**  
**Purpose**: Step-by-step guide to modify workflow `cgk7FI57o6cg3eju` for Israeli professionals

---

## 🚀 **QUICK START**

**Answer to your question**: Yes, you need to create data tables in the n8n UI first, then I can help you modify the workflow. Here's exactly what to do:

---

## 📋 **STEP 1: CREATE N8N DATA TABLES**

### **A. Access n8n Data Tables**
1. **Go to**: `http://173.254.201.134:5678`
2. **Look for**: "Data Tables" tab (new feature in n8n)
3. **Click**: "Create Data Table"

### **B. Create First Table: `israeli_linkedin_leads`**
1. **Table Name**: `israeli_linkedin_leads`
2. **Add Columns**:
   - `publicidentifier` (Text)
   - `linkedinurl` (Text)
   - `name` (Text)
   - `headline` (Text)
   - `about` (Text)
   - `premium` (Boolean)
   - `verified` (Boolean)
   - `openprofile` (Boolean)
   - `topskills` (Text)
   - `connectionscount` (Number)
   - `followercount` (Number)
   - `latest_experience` (Text)
   - `education` (Text)
   - `estimated_age` (Number)
   - `israeli_score` (Number)
   - `phone` (Text)
   - `email` (Text)
   - `location` (Text)

### **C. Create Second Table: `israeli_googlemaps_leads`**
1. **Table Name**: `israeli_googlemaps_leads`
2. **Add Columns**:
   - `title` (Text)
   - `category_name` (Text)
   - `address` (Text)
   - `neighborhood` (Text)
   - `street` (Text)
   - `city` (Text)
   - `postal_code` (Text)
   - `state` (Text)
   - `country_code` (Text)
   - `website` (Text)
   - `phone` (Text)
   - `phone_unformatted` (Text)
   - `location` (Text)
   - `total_score` (Number)
   - `israeli_score` (Number)
   - `business_type` (Text)

---

## 🔧 **STEP 2: MODIFY THE WORKFLOW**

### **A. Update Form Input**
1. **Go to**: `http://173.254.201.134:5678/workflow/cgk7FI57o6cg3eju`
2. **Click on**: "Input desired lead" node
3. **Update Form Fields**:
   - **Title/Industry**: Change placeholder to "Israeli CEO, Israeli Marketing Director, Israeli Software Engineer"
   - **Location**: Change placeholder to "New York City, Los Angeles, Miami, Chicago, San Francisco"
   - **Add New Fields**:
     - **Age Range**: Dropdown with options "25-50", "25-35", "35-50"
     - **Lead Type**: Dropdown with options "US Cities (excluding NYC)", "NYC Only", "Both"

### **B. Add Israeli Filtering Nodes**

#### **1. Add LinkedIn Filter Node**
1. **Add new node**: "Code" node
2. **Name**: "Filter Israeli LinkedIn Leads"
3. **Position**: Between "linkedin_dataset" and "get_linkedin"
4. **Code**:
```javascript
// Israeli LinkedIn Lead Filtering
function filterIsraeliLinkedInLeads(item) {
  const data = item.json;
  
  // Israeli keyword detection
  const israeliKeywords = [
    'israeli', 'israel', 'hebrew', 'tel aviv', 'jerusalem', 'idf',
    'technion', 'hebrew university', 'israeli army', 'mossad',
    'israeli tech', 'israeli startup', 'israeli business'
  ];
  
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
                     (data.city || '').toLowerCase().includes('los angeles') ||
                     (data.city || '').toLowerCase().includes('miami') ||
                     (data.city || '').toLowerCase().includes('chicago') ||
                     (data.city || '').toLowerCase().includes('san francisco');
  
  // Filter criteria: Israeli score > 0, US location, age 25-50
  if (israeliScore > 0 && isUSLocation && estimatedAge >= 25 && estimatedAge <= 50) {
    return {
      ...data,
      estimated_age: estimatedAge,
      israeli_score: israeliScore,
      phone: data.phone || '',
      email: data.email || '',
      location: data.location || '',
      filtered: true
    };
  }
  
  return null;
}

// Process all items
const filteredLeads = items.map(item => filterIsraeliLinkedInLeads(item)).filter(Boolean);
return filteredLeads;
```

#### **2. Add Google Maps Filter Node**
1. **Add new node**: "Code" node
2. **Name**: "Filter Israeli Google Maps Leads"
3. **Position**: Between "googlemaps_dataset" and "set_google_maps_column"
4. **Code**:
```javascript
// Israeli Google Maps Lead Filtering
function filterIsraeliGoogleMapsLeads(item) {
  const data = item.json;
  
  // Israeli business keyword detection
  const israeliKeywords = [
    'israeli', 'hebrew', 'kosher', 'synagogue', 'tel aviv', 'jerusalem',
    'israeli restaurant', 'hebrew school', 'kosher market', 'israeli community',
    'israeli business', 'israeli tech', 'israeli startup'
  ];
  
  const textToSearch = `${data.title || ''} ${data.categoryName || ''} ${data.address || ''}`.toLowerCase();
  
  const israeliScore = israeliKeywords.reduce((score, keyword) => {
    return textToSearch.includes(keyword) ? score + 1 : score;
  }, 0);
  
  // US location check
  const isUSLocation = (data.countryCode || '').toUpperCase() === 'US' ||
                     (data.state || '').toLowerCase().includes('new york') ||
                     (data.state || '').toLowerCase().includes('california') ||
                     (data.state || '').toLowerCase().includes('florida') ||
                     (data.state || '').toLowerCase().includes('illinois');
  
  // Business type detection
  let businessType = 'other';
  if (textToSearch.includes('restaurant')) businessType = 'restaurant';
  else if (textToSearch.includes('school')) businessType = 'education';
  else if (textToSearch.includes('center')) businessType = 'community';
  else if (textToSearch.includes('business')) businessType = 'business';
  else if (textToSearch.includes('market')) businessType = 'retail';
  
  // Filter criteria: Israeli score > 0, US location, has phone
  if (israeliScore > 0 && isUSLocation && data.phone) {
    return {
      ...data,
      israeli_score: israeliScore,
      business_type: businessType,
      filtered: true
    };
  }
  
  return null;
}

// Process all items
const filteredLeads = items.map(item => filterIsraeliGoogleMapsLeads(item)).filter(Boolean);
return filteredLeads;
```

### **C. Replace Supabase Nodes with Data Table Nodes**

#### **1. Replace `save_linkedin` Node**
1. **Delete**: Current Supabase node
2. **Add**: "Data Table" node
3. **Configure**:
   - **Resource**: Row
   - **Operation**: Insert
   - **Data Table**: `israeli_linkedin_leads`
   - **Column Mappings**:
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

#### **2. Replace `save_googlemaps` Node**
1. **Delete**: Current Supabase node
2. **Add**: "Data Table" node
3. **Configure**:
   - **Resource**: Row
   - **Operation**: Insert
   - **Data Table**: `israeli_googlemaps_leads`
   - **Column Mappings**:
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

### **D. Update Apify Configurations**

#### **1. LinkedIn Scraper**
1. **Click on**: "linkedin_dataset" node
2. **Update Custom Body**:
```json
{
  "locations": ["United States"],
  "maxItems": 15000,
  "profileScraperMode": "Full",
  "searchQuery": "Israeli professionals OR Israeli CEO OR Israeli manager OR Israeli engineer OR Hebrew speaker OR Israeli tech OR Israeli startup"
}
```

#### **2. Google Maps Scraper**
1. **Click on**: "googlemaps_dataset" node
2. **Update Custom Body**:
```json
{
  "includeWebResults": false,
  "language": "en",
  "locationQuery": "United States",
  "maxCrawledPlacesPerSearch": 15000,
  "maxImages": 0,
  "maximumLeadsEnrichmentRecords": 0,
  "scrapeContacts": true,
  "scrapeDirectories": false,
  "scrapeImageAuthors": false,
  "scrapePlaceDetailPage": true,
  "scrapeReviewsPersonalData": true,
  "scrapeTableReservationProvider": false,
  "searchStringsArray": [
    "Israeli restaurant",
    "Hebrew school",
    "Kosher market",
    "Israeli community center",
    "Israeli business",
    "Synagogue",
    "Israeli tech company",
    "Israeli startup"
  ],
  "skipClosedPlaces": false
}
```

### **E. Update Connections**
1. **Connect**: "linkedin_dataset" → "Filter Israeli LinkedIn Leads" → "get_linkedin" → "save_israeli_linkedin"
2. **Connect**: "googlemaps_dataset" → "Filter Israeli Google Maps Leads" → "set_google_maps_column" → "save_israeli_googlemaps"

---

## 🧪 **STEP 3: TEST THE WORKFLOW**

### **A. Test with Small Batch**
1. **Run workflow** with 100 leads
2. **Check data tables** for results
3. **Verify filtering** is working
4. **Check Israeli scores** and age estimates

### **B. Scale Up**
1. **Increase to 1000 leads**
2. **Monitor performance**
3. **Check data quality**
4. **Scale to full 15,000 target**

---

## 📊 **EXPECTED RESULTS**

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

## 🎉 **BENEFITS OF N8N DATA TABLES**

1. **Native Performance**: No external API calls
2. **Cost Effective**: No Supabase costs
3. **Faster Processing**: Direct n8n integration
4. **Better Security**: Data stays within n8n
5. **Easier Management**: Single interface for everything
6. **Real-time Access**: Immediate data availability

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Pre-Implementation**:
- [ ] Create `israeli_linkedin_leads` data table in n8n
- [ ] Create `israeli_googlemaps_leads` data table in n8n
- [ ] Verify Apify credentials are working
- [ ] Test data table access

### **Implementation**:
- [ ] Update form input fields
- [ ] Add Israeli filtering Code nodes
- [ ] Replace Supabase nodes with Data Table nodes
- [ ] Update Apify configurations
- [ ] Update workflow connections
- [ ] Test workflow execution

### **Post-Implementation**:
- [ ] Verify data is being stored in n8n data tables
- [ ] Check Israeli filtering is working
- [ ] Validate age estimation logic
- [ ] Test location filtering
- [ ] Export sample data for verification

---

## 🚀 **NEXT STEPS**

1. **Create the data tables** in n8n interface (Step 1)
2. **Modify the workflow** using the provided configurations (Step 2)
3. **Test with small batches** (100-500 leads)
4. **Scale up** to full 15,000 lead target
5. **Monitor and optimize** based on results

**The workflow will now specifically target Israeli professionals living in the USA, ages 25-50, with names and phone numbers, using n8n's native data tables for storage!** 🎯

---

## 📞 **SUPPORT**

If you need help with any step, I can:
1. **Guide you through** the n8n data table creation
2. **Help modify** the workflow step-by-step
3. **Test and verify** the results
4. **Optimize** the filtering logic

**Ready to start? Let's create those data tables first!** 🚀
