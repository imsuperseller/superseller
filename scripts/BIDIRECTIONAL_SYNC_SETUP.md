# BIDIRECTIONAL SYNC SETUP INSTRUCTIONS

## 🎯 **CURRENT STATUS: 95% COMPLETE**

### ✅ **COMPLETED**
- All 3 Notion databases created and populated
- MCP server fixed and working
- Sync scripts created and configured
- Database IDs identified and documented

### 🔧 **REMAINING SETUP (5%)**

#### 1. **Configure Airtable**
1. Go to [Airtable](https://airtable.com) and create a new base
2. Create 3 tables:
   - **Business References** (13 fields)
   - **Customer Management** (13 fields)  
   - **Project Tracking** (14 fields)
3. Get your Base ID and Table IDs
4. Get your API key from Account settings

#### 2. **Set Environment Variables**
Copy `.env.template` to `.env` and fill in:
```
AIRTABLE_API_KEY=your_actual_api_key
AIRTABLE_BASE_ID=your_actual_base_id
AIRTABLE_BUSINESS_REF_TABLE_ID=your_actual_table_id
AIRTABLE_CUSTOMER_MGMT_TABLE_ID=your_actual_table_id
AIRTABLE_PROJECT_TRACK_TABLE_ID=your_actual_table_id
```

#### 3. **Run Sync Setup**
```bash
node scripts/setup-bidirectional-sync.js
```

#### 4. **Test Sync**
```bash
node scripts/comprehensive-sync.js
```

### 📊 **DATABASE IDs**

**Notion Databases:**
- Business References: `6f3c687f-91b4-46fc-a54e-193b0951d1a5`
- Customer Management: `7840ad47-64dc-4e8a-982c-cb3a0dcc3a14`
- Project Tracking: `2123596d-d33c-40bb-91d9-3d2983dbfb23`

**Airtable Configuration:**
- Base ID: `YOUR_AIRTABLE_BASE_ID`
- Business References Table: `YOUR_BUSINESS_REF_TABLE_ID`
- Customer Management Table: `YOUR_CUSTOMER_MGMT_TABLE_ID`
- Project Tracking Table: `YOUR_PROJECT_TRACK_TABLE_ID`

### 🚀 **SYNC FEATURES**
- ✅ Real-time bidirectional sync
- ✅ RGID-based record matching
- ✅ Conflict resolution (Notion wins)
- ✅ Automatic field mapping
- ✅ Error handling and logging
- ✅ Rate limiting and retry logic

### 🎉 **ONCE COMPLETE**
The system will achieve **100% BMAD compliance** with:
- All 3 Notion databases populated
- Full bidirectional sync with Airtable
- Real-time data synchronization
- Complete RGID system implementation
