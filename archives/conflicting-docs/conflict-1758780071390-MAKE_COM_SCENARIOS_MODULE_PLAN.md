# 🎯 Make.com Scenarios Module Planning

## **📊 Current Data Structure Being Sent:**

```json
{
  "success": true,
  "familyProfiles": [
    {
      "familyId": "family_0529876543",
      "phone": "052-9876543",
      "primaryParent": {
        "id": "111222333",
        "name": "דוד לוי",
        "age": 40,
        "income": 20000,
        "phone": "052-9876543",
        "city": "ירושלים",
        "maritalStatus": "נשוי",
        "children": 3,
        "profession": "רופא",
        "mortgage": 800000,
        "savings": 200000
      },
      "parents": [...],
      "children": [],
      "members": [...],
      "familySize": 2,
      "totalIncome": 35000,
      "totalSavings": 300000,
      "totalMortgage": 800000,
      "city": "ירושלים",
      "createdAt": "2025-09-11T22:32:50.710Z"
    }
  ],
  "individualProfiles": [],
  "summary": {
    "totalFamilies": 1,
    "totalIndividuals": 0,
    "totalPeople": 2
  }
}
```

## **🎯 Scenario 1: Surense Data Fetcher (2983190)**

### **Purpose**: Fetch additional data for family members

### **Current State**: Webhook receiving family data ✅

### **📋 Planned Modules After Webhook:**

#### **1. Data Parser Module**
- **Purpose**: Parse incoming family data
- **Input**: Webhook data
- **Output**: Structured family data for processing
- **Configuration**:
  ```
  - Extract familyProfiles array
  - Extract individualProfiles array
  - Validate data structure
  ```

#### **2. Family Member Iterator**
- **Purpose**: Process each family member individually
- **Input**: Parsed family data
- **Output**: Individual member records
- **Configuration**:
  ```
  - Loop through familyProfiles
  - For each family, loop through members
  - Create individual records for data fetching
  ```

#### **3. Surense API Data Fetcher**
- **Purpose**: Fetch additional data from Surense API
- **Input**: Individual member data (ID, name, phone)
- **Output**: Enhanced member data
- **Configuration**:
  ```
  - API Endpoint: Surense API
  - Authentication: API Key
  - Data to fetch:
    - Credit score
    - Financial history
    - Insurance history
    - Risk assessment
  ```

#### **4. Data Aggregator**
- **Purpose**: Combine original data with fetched data
- **Input**: Original + Surense data
- **Output**: Enhanced family profiles
- **Configuration**:
  ```
  - Merge Surense data with original family data
  - Calculate risk scores
  - Add data quality indicators
  ```

#### **5. Data Storage Module**
- **Purpose**: Store enhanced data
- **Input**: Enhanced family profiles
- **Output**: Stored data confirmation
- **Configuration**:
  ```
  - Database: Airtable/Google Sheets
  - Table: Enhanced Family Profiles
  - Fields: All original + Surense data
  ```

#### **6. Notification Module**
- **Purpose**: Notify about data fetching completion
- **Input**: Processing results
- **Output**: Notification sent
- **Configuration**:
  ```
  - Email: office@shellycover.co.il
  - Subject: "Surense Data Fetch Complete"
  - Content: Summary of fetched data
  ```

---

## **🎯 Scenario 2: Surense Action Processor (2983200)**

### **Purpose**: Process actions based on family data

### **Current State**: Webhook receiving family data ✅

### **📋 Planned Modules After Webhook:**

#### **1. Data Parser Module**
- **Purpose**: Parse incoming family data
- **Input**: Webhook data
- **Output**: Structured family data for processing
- **Configuration**:
  ```
  - Extract familyProfiles array
  - Extract individualProfiles array
  - Validate data structure
  ```

#### **2. Risk Assessment Module**
- **Purpose**: Assess family risk levels
- **Input**: Family data (income, savings, mortgage, etc.)
- **Output**: Risk scores and recommendations
- **Configuration**:
  ```
  - Calculate risk scores based on:
    - Income stability
    - Debt-to-income ratio
    - Savings ratio
    - Family size
    - Age factors
  ```

#### **3. Insurance Product Matcher**
- **Purpose**: Match families with appropriate insurance products
- **Input**: Family data + risk assessment
- **Output**: Recommended insurance products
- **Configuration**:
  ```
  - Product categories:
    - Life insurance
    - Health insurance
    - Property insurance
    - Disability insurance
  - Match based on:
    - Risk level
    - Family needs
    - Budget constraints
  ```

#### **4. Quote Generator**
- **Purpose**: Generate insurance quotes
- **Input**: Recommended products
- **Output**: Insurance quotes
- **Configuration**:
  ```
  - Connect to insurance providers
  - Generate quotes for each recommended product
  - Calculate premiums and coverage
  ```

#### **5. Action Decision Engine**
- **Purpose**: Decide what actions to take
- **Input**: Quotes + family data
- **Output**: Action recommendations
- **Configuration**:
  ```
  - Actions:
    - Send quotes to family
    - Schedule follow-up call
    - Add to CRM
    - Create task for agent
    - Send to underwriting
  ```

#### **6. CRM Integration**
- **Purpose**: Update CRM with family data and actions
- **Input**: Family data + actions
- **Output**: CRM updated
- **Configuration**:
  ```
  - CRM: Airtable/Google Sheets
  - Create/update family records
  - Add interaction history
  - Set follow-up tasks
  ```

#### **7. Communication Module**
- **Purpose**: Send communications to families
- **Input**: Action decisions
- **Output**: Communications sent
- **Configuration**:
  ```
  - SMS: Send quotes via SMS
  - Email: Send detailed quotes
  - WhatsApp: Send personalized messages
  ```

#### **8. Task Creation Module**
- **Purpose**: Create tasks for agents
- **Input**: Action decisions
- **Output**: Tasks created
- **Configuration**:
  ```
  - Task management: Airtable/Google Sheets
  - Task types:
    - Follow-up call
    - Quote presentation
    - Underwriting review
    - Policy setup
  ```

#### **9. Reporting Module**
- **Purpose**: Generate processing reports
- **Input**: All processing data
- **Output**: Reports generated
- **Configuration**:
  ```
  - Daily processing summary
  - Family risk distribution
  - Product recommendation stats
  - Action completion rates
  ```

#### **10. Notification Module**
- **Purpose**: Notify about processing completion
- **Input**: Processing results
- **Output**: Notification sent
- **Configuration**:
  ```
  - Email: office@shellycover.co.il
  - Subject: "Family Processing Complete"
  - Content: Summary of actions taken
  ```

---

## **🔄 Integration Points:**

### **Between Scenarios:**
1. **Data Fetcher** → **Action Processor**: Enhanced data flow
2. **Shared Database**: Both scenarios read/write to same data store
3. **Status Tracking**: Track processing status across scenarios

### **External Integrations:**
1. **Surense API**: For additional data fetching
2. **Insurance APIs**: For quote generation
3. **CRM Systems**: Airtable/Google Sheets
4. **Communication**: SMS, Email, WhatsApp
5. **Task Management**: Agent task creation

---

## **📊 Expected Outcomes:**

### **Data Fetcher Scenario:**
- Enhanced family profiles with Surense data
- Risk scores and assessments
- Data quality indicators
- Stored in centralized database

### **Action Processor Scenario:**
- Insurance product recommendations
- Generated quotes
- Action plans for agents
- CRM updates
- Customer communications
- Task assignments

---

## **🎯 Next Steps:**

1. **Configure Data Fetcher modules** in Make.com scenario 2983190
2. **Configure Action Processor modules** in Make.com scenario 2983200
3. **Set up external API connections** (Surense, Insurance providers)
4. **Configure CRM integrations** (Airtable/Google Sheets)
5. **Test complete automation flow**
6. **Monitor and optimize performance**
