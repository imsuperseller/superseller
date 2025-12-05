# Chat Trigger Test Questions for INT-SYNC-007

**Workflow**: `41dvc6epRUoQIyjs`  
**Trigger**: Chat Trigger v1.4  
**Purpose**: Test AI Agent with Boost.space tools via chat interface

---

## 🎯 Test Questions by Category

### **Category 1: Query/List Operations** (Testing Query Tools)

#### **Basic Queries**:
1. **"List all products in Space 59"**
   - Should use: Query Products tool
   - Expected: Returns all workflow products

2. **"Show me all workflows stored as products"**
   - Should use: Query Products tool
   - Expected: Lists all products in Space 59

3. **"Find all notes in Space 45"**
   - Should use: Query Notes tool
   - Expected: Returns workflow metadata notes

4. **"List all contacts"**
   - Should use: Query Contacts tool
   - Expected: Returns contact records

5. **"Show me all projects"**
   - Should use: Query Projects tool
   - Expected: Returns project records

6. **"Get all invoices"**
   - Should use: Query Invoices tool
   - Expected: Returns invoice records

#### **Filtered Queries**:
7. **"Find products with 'INT-' in the name"**
   - Should use: Query Products tool with filter
   - Expected: Returns products matching pattern

8. **"Search for workflow product named 'INT-SYNC-007'"**
   - Should use: Query Products tool
   - Expected: Returns specific product if exists

---

### **Category 2: Create Operations** (Testing Create Tools)

#### **Product Creation**:
9. **"Create a product for workflow INT-TEST-001 with ID abc123"**
   - Should use: Create Product tool
   - Expected: Creates product with name "INT-TEST-001", sku "abc123", spaces [59]

10. **"Add a new workflow product called 'TEST-WORKFLOW-002'"**
    - Should use: Create Product tool
    - Expected: Creates product in Space 59

11. **"Register a new product: name 'My Workflow', SKU 'wf-456', description 'Test workflow'"**
    - Should use: Create Product tool
    - Expected: Creates product with all fields

#### **Note Creation**:
12. **"Create a note titled 'Workflow Documentation' with content 'This is test documentation'"**
    - Should use: Create Note tool
    - Expected: Creates note in Space 45

13. **"Add a note for workflow metadata: title 'INT-TEST-001 Metadata', content '{\"status\": \"active\"}'"**
    - Should use: Create Note tool
    - Expected: Creates note with JSON content

#### **Contact Creation**:
14. **"Create a contact named 'John Doe' with email 'john@example.com'"**
    - Should use: Create Contact tool
    - Expected: Creates contact in Space 26

15. **"Add a new contact: name 'Jane Smith', company 'Acme Corp', phone '555-1234'"**
    - Should use: Create Contact tool
    - Expected: Creates contact with multiple fields

#### **Project Creation**:
16. **"Create a project called 'Website Redesign'"**
    - Should use: Create Project tool
    - Expected: Creates project in Space 49

17. **"Add a new project: name 'API Integration', description 'Integrate third-party API'"**
    - Should use: Create Project tool
    - Expected: Creates project with description

#### **Invoice Creation**:
18. **"Create an invoice for $500"**
    - Should use: Create Invoice tool
    - Expected: Creates invoice with amount 500

19. **"Add an invoice: number 'INV-001', amount 1000, currency 'USD', status 'pending'"**
    - Should use: Create Invoice tool
    - Expected: Creates invoice with all fields

---

### **Category 3: Update Operations** (Testing Update Tools)

20. **"Update product abc123: change name to 'Updated Workflow Name'"**
    - Should use: Update Product tool
    - Expected: Updates product name

21. **"Modify product with ID xyz789: update description to 'New description text'"**
    - Should use: Update Product tool
    - Expected: Updates product description

---

### **Category 4: Complex Multi-Step Operations**

22. **"Sync all n8n workflows to Boost.space products"**
   - Should: Query existing products, compare, create/update as needed
   - Expected: Comprehensive sync report

23. **"Check if product 'INT-SYNC-007' exists, and if not, create it"**
   - Should: Query first, then create if missing
   - Expected: Either "exists" or "created"

24. **"Find all products, then create a note documenting the count"**
   - Should: Query products, then create note with count
   - Expected: Note created with product count

25. **"List all contacts, then create a project linking to the first contact"**
   - Should: Query contacts, then create project
   - Expected: Project created

---

### **Category 5: Error Handling & Edge Cases**

26. **"Create a product without a name"**
   - Should: Report error (name is required)
   - Expected: Clear error message

27. **"Update a product that doesn't exist (ID: fake-id-123)"**
   - Should: Attempt update, report error
   - Expected: Error message about missing product

28. **"Query products with invalid space ID"**
   - Should: Use correct Space 59 (not invalid)
   - Expected: Returns products or empty array

---

### **Category 6: Natural Language Variations**

29. **"What workflows do we have in Boost.space?"**
   - Should: Query Products tool
   - Expected: Lists products

30. **"Can you show me the invoices?"**
   - Should: Query Invoices tool
   - Expected: Lists invoices

31. **"I need to add a new workflow product"**
   - Should: Ask for details or use defaults
   - Expected: Creates product

32. **"How many products are in Space 59?"**
   - Should: Query Products, count results
   - Expected: Returns count

---

### **Category 7: Workflow-Specific Tasks**

33. **"Review and sync all n8n workflows to Boost.space products"**
   - Should: Full sync operation
   - Expected: Comprehensive report

34. **"Check for new workflows that need to be added to Boost.space"**
   - Should: Query and compare
   - Expected: List of new workflows

35. **"Find workflows that were updated but not synced"**
   - Should: Compare timestamps
   - Expected: List of outdated records

---

## 🧪 Recommended Test Sequence

### **Phase 1: Basic Functionality** (Start Here)
1. "List all products in Space 59" → Verify Query Products works
2. "Create a product for workflow INT-TEST-001" → Verify Create Product works
3. "Update product [ID from step 2]: change name to 'Updated Test'" → Verify Update Product works

### **Phase 2: All Tool Types**
4. "Show me all notes" → Test Query Notes
5. "Create a note titled 'Test Note'" → Test Create Note
6. "List all contacts" → Test Query Contacts
7. "Create a contact named 'Test User'" → Test Create Contact
8. "Show all projects" → Test Query Projects
9. "Create a project called 'Test Project'" → Test Create Project
10. "Get all invoices" → Test Query Invoices
11. "Create an invoice for $100" → Test Create Invoice

### **Phase 3: Complex Operations**
12. "Sync all n8n workflows to Boost.space products" → Test multi-step logic
13. "Find products with 'INT-' in the name" → Test filtering
14. "Check if product 'INT-SYNC-007' exists, and if not, create it" → Test conditional logic

### **Phase 4: Error Handling**
15. "Create a product without a name" → Test error handling
16. "Update product with ID fake-id-123" → Test error reporting

---

## 📝 Expected Response Format

The AI Agent should respond with:
- ✅ **Action taken**: "Created product 'INT-TEST-001'"
- ✅ **Summary statistics**: "Synced 68 workflows: 5 created, 3 updated"
- ✅ **Error reports**: "Failed to create product 'X': [reason]"
- ✅ **Clear, concise language** (verbosity: Low)

---

## ⚠️ Known Issues to Watch For

1. **Update Product URL**: Still missing `=` prefix (should be fixed)
2. **Parameter Names**: Some may still have spaces (should be underscores)
3. **Tool Recognition**: Validator shows warnings but tools should work

---

## 🎯 Success Criteria

✅ **Workflow is working if**:
- Chat Trigger receives messages
- AI Agent processes requests
- Tools are called correctly
- Responses are clear and accurate
- Errors are reported clearly

❌ **Workflow needs fixes if**:
- Chat Trigger doesn't respond
- AI Agent errors immediately
- Tools not being called
- Parameter errors in execution logs

---

**Last Updated**: November 30, 2025  
**Test Status**: Ready for Testing
