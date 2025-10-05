# 🌐 Webflow Files

All Webflow deployment files are organized here.

## 📁 Structure

```
webflow/
├── pages/          # 23 page files (WEBFLOW_EMBED_*.html)
├── templates/      # 5 template files
└── docs/           # Deployment documentation
```

## 🚀 How to Deploy

1. **Find your page**: Look in `pages/` directory
2. **Open the file**: Find `WEBFLOW_EMBED_[PAGE_NAME].html`
3. **Copy entire contents**: Including version header
4. **Paste into Webflow**:
   - Open Webflow Designer
   - Go to the page
   - Page Settings → Custom Code
   - Paste in "Before </body> tag"
   - Save and Publish

## 📋 Files with Stripe Integration

✅ **Ready for deployment**:
- `pages/WEBFLOW_EMBED_MARKETPLACE_CVJ.html` (v2.0) - 6 Stripe buttons
- `pages/WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html` (v2.0) - 3 Stripe buttons

⏳ **Not yet integrated**:
- All other pages (no Stripe checkout yet)

## 📖 Documentation

- `docs/WEBFLOW_DEPLOYMENT_INSTRUCTIONS.md` - Complete deployment guide
- `docs/WEBFLOW_FILES_SOURCE_OF_TRUTH.md` - File inventory

## ⚠️ Important

- **Never edit files directly in Webflow** - Always update source files here
- **Version headers** - Check version at top of file
- **Test after deploy** - Verify checkout buttons work

**Last updated**: October 5, 2025
