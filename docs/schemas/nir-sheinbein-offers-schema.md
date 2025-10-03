# Airtable Schema for "Nir - Offers" Table

Please create a new table named **Nir - Offers** in the **Rensto Client Operations** base (`appQijHhqqP4z6wGe`) and add the following fields precisely as described.

---

### **Field List**

1.  **Status**
    *   Type: `Single select`
    *   Options: `Draft`, `Validating`, `Pending Review`, `Ready`, `Signed`, `Closed`, `Error`
2.  **Source**
    *   Type: `Single select`
    *   Options: `MLS`, `Off-market`, `Manual`
3.  **MLS ID**
    *   Type: `Single line text`
4.  **Property URL**
    *   Type: `URL`
5.  **Street Address**
    *   Type: `Single line text`
6.  **City**
    *   Type: `Single line text`
7.  **County**
    *   Type: `Single line text`
8.  **State**
    *   Type: `Single line text`
9.  **ZIP**
    *   Type: `Single line text`
10. **Lot**
    *   Type: `Single line text`
11. **Block**
    *   Type: `Single line text`
12. **Legal Name**
    *   Type: `Single line text`
13. **Year Built**
    *   Type: `Number` (Integer)
14. **Is Rented**
    *   Type: `Checkbox`
15. **Seller Name**
    *   Type: `Single line text`
16. **Buyer Name**
    *   Type: `Single line text`
17. **Escrow Agent**
    *   Type: `Single line text`
18. **Title Company**
    *   Type: `Single line text`
19. **Earnest Money (USD)**
    *   Type: `Currency`
20. **Option Fee (USD)**
    *   Type: `Currency`
21. **Down Payment %**
    *   Type: `Percent`
22. **Down Payment (USD)**
    *   Type: `Currency`
23. **Remainder (USD)**
    *   Type: `Currency`
24. **Offer Amount (USD)**
    *   Type: `Currency`
25. **Effective Days**
    *   Type: `Number` (Integer)
26. **Proposed Closing Date**
    *   Type: `Date`
27. **Adjusted Closing Date**
    *   Type: `Date`
28. **Holiday Region**
    *   Type: `Single select`
    *   Option: `US`
29. **Addenda Required**
    *   Type: `Multiple select`
    *   Options: `Lead-Based Paint`, `Tenant`, `Other`
30. **Validation Flags**
    *   Type: `Long text`
31. **Validation Errors**
    *   Type: `Long text`
32. **Contract PDF**
    *   Type: `Attachment`
33. **Last Validated At**
    *   Type: `Date` (Include a time field)
34. **Run ID**
    *   Type: `Autonumber`

---

### **CRITICAL FINAL STEP: The Button**

After creating the fields above, please add the final field:

35. **Generate Offer**
    *   Type: `Button`
    *   Action: **Open URL**
    *   URL Formula: You will leave this blank for now. I will provide the exact n8n webhook URL for you to paste here once I have built the workflow.

This manual setup is a necessary workaround for the API limitations. Once you have created this table, please let me know, and I will proceed with building the n8n automation for Nir's project.
