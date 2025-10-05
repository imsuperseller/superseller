# 🎯 Israeli Professionals in USA - Lead Filtering Analysis

## 📋 Target Requirements
- **Nationality**: Israeli professionals
- **Location**: Living in USA
- **Age Range**: 25-50 years old
- **Minimum Data**: Names and phone numbers
- **Total Required**: 15,000 leads (10,000 US cities + 5,000 NYC)

## 🔍 Current Workflow Analysis

### **Workflow Structure**: `cgk7FI57o6cg3eju`
**Name**: "Scrape Targeted Leads from Google Maps & LinkedIn to Supabase using Apify"

### **Data Sources**:
1. **Google Maps Scraper** (Apify Actor: `nwua9Gu5YrADL7ZDj`)
2. **LinkedIn Profile Search** (Apify Actor: `M2FMdjRVeF1HPGFcc`)

### **Database Tables**:
- **`googlemaps`** - Business listings with contact info
- **`linkedin`** - Professional profiles with detailed info

## 🎯 Specific Filtering Points

### **1. FORM INPUT MODIFICATION**
**Current Form Fields**:
- Title/Industry: "CEOs or Finance"
- Location: "Enter targeted location"
- Source: Google Maps/LinkedIn/Both
- Number of results: Optional

**🔧 REQUIRED CHANGES**:
```javascript
// Modify form to include Israeli-specific searches
{
  "fieldLabel": "Title/Industry",
  "placeholder": "Israeli CEO, Israeli Marketing Director, Israeli Business Owner",
  "requiredField": true
},
{
  "fieldLabel": "Location", 
  "placeholder": "New York, Los Angeles, Miami, Chicago, Boston",
  "requiredField": true
},
{
  "fieldLabel": "Search Keywords",
  "placeholder": "Israeli, Israel, Hebrew, Tel Aviv, Jerusalem",
  "requiredField": true
}
```

### **2. GOOGLE MAPS SCRAPING FILTERS**
**Current Apify Configuration**:
```json
{
  "searchStringsArray": ["{{ $json['Title/Industry'] }}"],
  "locationQuery": "{{ $json.Location }}",
  "maxCrawledPlacesPerSearch": "{{ $json['Number of results'] }}"
}
```

**🔧 ISRAELI-SPECIFIC MODIFICATIONS**:
```json
{
  "searchStringsArray": [
    "Israeli restaurant",
    "Israeli business", 
    "Israeli community center",
    "Israeli cultural center",
    "Hebrew school",
    "Israeli grocery",
    "Kosher restaurant",
    "Israeli tech company"
  ],
  "locationQuery": "{{ $json.Location }}, USA",
  "maxCrawledPlacesPerSearch": "{{ $json['Number of results'] }}",
  "scrapeReviewsPersonalData": true
}
```

### **3. LINKEDIN SCRAPING FILTERS**
**Current Apify Configuration**:
```json
{
  "locations": ["{{ $json.Location }}"],
  "maxItems": "{{ $json['Number of results'] }}",
  "searchQuery": "{{ $json['Title/Industry'] }}"
}
```

**🔧 ISRAELI-SPECIFIC MODIFICATIONS**:
```json
{
  "locations": ["{{ $json.Location }}, United States"],
  "maxItems": "{{ $json['Number of results'] }}",
  "searchQuery": "Israeli {{ $json['Title/Industry'] }}",
  "profileScraperMode": "Full"
}
```

### **4. DATA PROCESSING FILTERS**

#### **A. Google Maps Data Filtering** (Node: `set_google_maps_column`)
**Add Israeli-specific filters**:
```javascript
// Add new field for Israeli detection
{
  "name": "isIsraeliBusiness",
  "type": "boolean", 
  "value": "={{ $json.title.toLowerCase().includes('israeli') || $json.title.toLowerCase().includes('hebrew') || $json.title.toLowerCase().includes('kosher') || $json.title.toLowerCase().includes('israel') }}"
},
{
  "name": "hasPhoneNumber",
  "type": "boolean",
  "value": "={{ $json.phone && $json.phone.length > 0 }}"
}
```

#### **B. LinkedIn Data Filtering** (Node: `get_linkedin`)
**Add Israeli-specific filters**:
```javascript
// Add new field for Israeli detection
{
  "name": "isIsraeliProfessional", 
  "type": "boolean",
  "value": "={{ $json.headline.toLowerCase().includes('israeli') || $json.about.toLowerCase().includes('israeli') || $json.about.toLowerCase().includes('israel') || $json.about.toLowerCase().includes('hebrew') || $json.about.toLowerCase().includes('tel aviv') || $json.about.toLowerCase().includes('jerusalem') }}"
},
{
  "name": "hasValidName",
  "type": "boolean", 
  "value": "={{ $json.firstName && $json.lastName && $json.firstName.length > 0 && $json.lastName.length > 0 }}"
}
```

### **5. SUPABASE DATABASE FILTERING**

#### **A. Google Maps Table Queries**
```sql
-- Get Israeli businesses in USA with phone numbers
SELECT * FROM googlemaps 
WHERE (
  LOWER(title) LIKE '%israeli%' OR 
  LOWER(title) LIKE '%hebrew%' OR 
  LOWER(title) LIKE '%kosher%' OR
  LOWER(title) LIKE '%israel%'
) 
AND country_code = 'US'
AND phone IS NOT NULL 
AND phone != ''
ORDER BY created_at DESC;
```

#### **B. LinkedIn Table Queries**
```sql
-- Get Israeli professionals in USA
SELECT * FROM linkedin 
WHERE (
  LOWER(headline) LIKE '%israeli%' OR 
  LOWER(about) LIKE '%israeli%' OR 
  LOWER(about) LIKE '%israel%' OR
  LOWER(about) LIKE '%hebrew%' OR
  LOWER(about) LIKE '%tel aviv%' OR
  LOWER(about) LIKE '%jerusalem%'
)
AND name IS NOT NULL
AND name != ''
ORDER BY created_at DESC;
```

### **6. AGE FILTERING (LinkedIn Only)**
**Add age estimation based on experience**:
```javascript
// In get_linkedin node, add age estimation
{
  "name": "estimatedAge",
  "type": "number",
  "value": "={{ $json.experience.length > 0 ? 25 + ($json.experience.length * 2) : 30 }}"
},
{
  "name": "isTargetAge",
  "type": "boolean", 
  "value": "={{ $json.estimatedAge >= 25 && $json.estimatedAge <= 50 }}"
}
```

## 🚀 Implementation Strategy

### **Phase 1: Modify Form Input**
1. Update form to include Israeli-specific search terms
2. Add location targeting for major US cities
3. Include Hebrew/Israeli keywords

### **Phase 2: Enhance Scraping**
1. Modify Apify configurations for Israeli-specific searches
2. Add multiple search strings for better coverage
3. Enable personal data scraping for contact info

### **Phase 3: Add Data Processing**
1. Add Israeli detection logic to both data paths
2. Add phone number validation
3. Add age estimation for LinkedIn profiles

### **Phase 4: Database Filtering**
1. Create filtered queries for Israeli professionals
2. Add location-based filtering (US cities vs NYC)
3. Implement age range filtering

### **Phase 5: Export & Delivery**
1. Create CSV exports with required fields
2. Separate US cities vs NYC leads
3. Ensure minimum data requirements (name + phone)

## 📊 Expected Results

### **Google Maps Leads**:
- Israeli restaurants, businesses, community centers
- Contact information (phone, address, website)
- Location-based filtering for US cities vs NYC

### **LinkedIn Leads**:
- Israeli professionals with detailed profiles
- Age estimation based on experience
- Professional contact information

### **Combined Output**:
- 15,000 Israeli professionals in USA
- Ages 25-50 (estimated from LinkedIn data)
- Names and phone numbers (minimum requirement)
- Separated by location (US cities vs NYC)

## 🔧 Technical Implementation

### **Required n8n Workflow Modifications**:
1. **Form Input Node**: Add Israeli-specific fields
2. **Apify Nodes**: Modify search parameters
3. **Data Processing Nodes**: Add filtering logic
4. **Supabase Nodes**: Add query filters
5. **Export Nodes**: Create filtered outputs

### **Database Schema Enhancements**:
1. Add `isIsraeli` boolean field to both tables
2. Add `hasPhoneNumber` boolean field
3. Add `estimatedAge` number field (LinkedIn)
4. Add `locationType` field (US cities vs NYC)

## ✅ Success Metrics

- **Target**: 15,000 Israeli professionals in USA
- **Age Range**: 25-50 years old
- **Minimum Data**: Name + Phone number
- **Location Split**: 10,000 US cities + 5,000 NYC
- **Quality**: Verified Israeli professionals with contact info

This analysis provides the specific points where the n8n workflow can be modified to target Israeli professionals living in the USA with the required age range and contact information.
