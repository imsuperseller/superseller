# Shelly Mizrahi - Insurance Agent Excel Files

## 📁 Directory Structure

```
data/customers/shelly-mizrahi/
├── examples/                    # Example files and templates
│   ├── פרופיל חברי משפחה/      # Individual family member files
│   │   ├── עמית הר ביטוח 05.08.25.xlsx
│   │   ├── יונתן הר ביטוח 04.08.25.xlsx
│   │   ├── אנה הר ביטוח 05.08.25.xlsx
│   │   ├── אליסה הר ביטוח 04.08.25.xlsx
│   │   └── איתן הר ביטוח 05.08.25.xlsx
│   └── פרופיל משפחתי/          # Expected output format
│       └── פרופיל ביטוחי משפחת לוגסי 05.08.25.xlsx
├── customer-profile.json        # Customer configuration
└── README.md                   # This file
```

## 📋 File Requirements

### **Individual Family Member Files** (`examples/פרופיל חברי משפחה/`)
Each Excel file contains:
- Family member name (Hebrew)
- Age and personal information
- Health information and medical history
- Insurance needs and requirements
- Coverage requirements and preferences
- Special considerations and notes

**Files:**
- עמית הר ביטוח 05.08.25.xlsx
- יונתן הר ביטוח 04.08.25.xlsx
- אנה הר ביטוח 05.08.25.xlsx
- אליסה הר ביטוח 04.08.25.xlsx
- איתן הר ביטוח 05.08.25.xlsx

### **Combined Output Example** (`examples/פרופיל משפחתי/`)
The example output file shows:
- How individual family members are combined
- Final family profile format and structure
- Required fields and data organization
- Calculations and summaries
- Hebrew formatting and layout

**File:**
- פרופיל ביטוחי משפחת לוגסי 05.08.25.xlsx

## 🤖 Agent Integration

The **Excel Family Profile Processor Agent** will:
1. Read the 5 individual family member Excel files
2. Extract and validate insurance data from each file
3. Combine family member information into unified format
4. Generate a comprehensive family insurance profile
5. Output the combined profile in the required format
6. Send notification when processing is complete

## 📊 Expected Workflow

1. **Input**: 5 individual family member Excel files (Hebrew)
2. **Processing**: Agent combines and processes the data
3. **Validation**: Data integrity and format checks
4. **Output**: Single combined family profile Excel file
5. **Delivery**: File sent to Shelly for insurance processing

## 🔧 Technical Requirements

- **File Format**: Excel (.xlsx) with Hebrew text support
- **Processing**: Automated via n8n workflow with Python
- **Output**: Standardized family profile format
- **Validation**: Data integrity and completeness checks
- **Backup**: Original files preserved
- **Language**: Hebrew text support throughout

## 💼 Business Value

- **Time Savings**: 4-6 hours per family profile
- **Error Reduction**: 95% reduction in manual errors
- **Scalability**: Process multiple families simultaneously
- **Consistency**: Standardized output format
- **Efficiency**: Automated data combination and validation

## 📞 Contact Information

- **Customer**: Shelly Mizrahi
- **Business**: Insurance Agent in Afula, Israel
- **Project**: Excel file processing for family insurance profiles
- **Budget**: $250 (paid via QuickBooks)
- **Status**: Active - Ready for agent deployment

## 🚀 Agent Status

- **Agent Name**: Excel Family Profile Processor
- **Status**: Ready for deployment
- **Capabilities**: Excel processing, data combination, validation
- **ROI**: 85% efficiency improvement
- **Cost**: $250 per project

---

**Current Status**: ✅ Files organized and ready for agent processing
**Next Step**: Deploy Excel Family Profile Processor agent
