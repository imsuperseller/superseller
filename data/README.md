# 📊 Data Files

All data and configuration files organized by type.

## 📁 Structure

```
data/
├── json/       # 13 JSON data files (NICHE_DATA.json, etc.)
├── configs/    # Configuration files (credentials, etc.)
└── temp/       # Temporary TXT files
```

## 📝 What's Here

### json/
- `NICHE_DATA.json` - Niche page configuration
- `AIRTABLE_AUDIT_RESULTS.json` - Airtable audit data
- `TYPEFORM_IDS.json` - Typeform configuration
- And 10 more data files

### configs/
- `cloudflare-tunnel-credentials.json` - Cloudflare tunnel config

### temp/
- Temporary text files from various processes

## ⚠️ Security

- **Never commit credentials** - .gitignore handles this
- **Env files go in configs/** - Not in root
- **Sensitive data** - Keep in configs/, not json/

**Last updated**: October 5, 2025
