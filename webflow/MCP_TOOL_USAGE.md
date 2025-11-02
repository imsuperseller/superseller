# 🎯 How to Use Webflow MCP Tools in Cursor

**Status**: 42 tools enabled ✅

---

## 📋 **MCP TOOL NAMES** (From Official Documentation)

Based on the Webflow MCP documentation, here are the tools you can use:

### **Custom Code Tools**:

1. **`register_custom_code_inline`** or **`add_inline_site_script`**
   - Registers inline CSS/JS code to the site
   - Parameters: `siteId`, `code` (the CSS), `location` ("head" or "body"), `name`

2. **`apply_custom_code_to_site`**
   - Applies registered scripts site-wide
   - Parameters: `siteId`, `scriptId`

3. **`get_registered_site_scripts`**
   - Lists all registered scripts
   - Parameters: `siteId`

4. **`publish_site`**
   - Publishes changes to live site
   - Parameters: `siteId`, `domains`

---

## 💬 **HOW TO USE IN CURSOR CHAT**

Since MCP tools are enabled, you can simply ask in Cursor chat:

### **Example Request**:
```
Register this CSS as custom code to the Rensto site (site ID: 66c7e551a317e0e9c9f906d8):

[paste CSS from webflow/quick-deploy-css.txt]

Apply it site-wide and publish.
```

The MCP server should automatically:
1. Register the CSS as an inline script
2. Apply it to the site
3. (Optionally) Publish the site

---

## 📝 **CSS LOCATION**

The CSS to deploy is in: `webflow/quick-deploy-css.txt`

It contains:
- Logo alignment fixes (37 lines)
- Button height consistency (36 lines)
- Total: 73 lines of production-ready CSS

---

## ✅ **WHAT TO SAY IN CURSOR**

**Copy and paste this into your Cursor chat**:

```
I want to deploy UI fixes CSS to my Webflow site. Please:

1. Register this CSS as an inline custom code script:
   Location: head
   Site ID: 66c7e551a317e0e9c9f906d8
   Name: "Rensto UI Fixes - Logo & Button Alignment"

2. Apply it site-wide

3. Publish the site

CSS Code:
[paste contents of webflow/quick-deploy-css.txt]
```

The MCP server should handle the rest!

---

**Or tell me which option you prefer and I'll help you execute it!**

