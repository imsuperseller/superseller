# 🎨 Assets

**Purpose:** Centralized storage for shared brand assets (logos, fonts, icons) used across multiple applications.

**Current Size:** 0B (cleaned Oct 5, 2025)

**Last Audit:** October 5, 2025

---

## 📂 Directory Structure

```
assets/
└── images/          # Shared images (logos, brand icons)
    └── (empty - ready for future assets)
```

---

## 📋 Asset Management Strategy

### **Hybrid Approach** (Recommended)

SuperSeller AI uses a **hybrid asset management strategy**:

### **1. Shared Brand Assets** → `/assets/`
**Use `/assets/` for:**
- Brand logos (primary, secondary, variations)
- Brand fonts (if self-hosted)
- Shared icons used across multiple apps
- Marketing materials used across platforms
- Any asset that ensures brand consistency

**Benefits:**
- Single source of truth for brand assets
- Easy to update logo everywhere
- Ensures brand consistency

**Examples:**
```
assets/
├── images/
│   ├── logos/
│   │   ├── superseller-logo-primary.svg
│   │   ├── superseller-logo-white.svg
│   │   └── superseller-icon.png
│   ├── brand/
│   │   └── brand-colors.png
│   └── marketing/
│       └── og-image-default.png
└── fonts/
    └── (if using custom fonts)
```

### **2. App-Specific Assets** → `apps/{app}/public/`
**Use app-specific `public/` folders for:**
- App-specific icons and images
- Favicons and app icons
- Page-specific graphics
- Assets only used in one app

**Current App Asset Locations:**
- `apps/web/superseller-site/public/` (32K) - Icons, SVGs for main site
- `apps/web/admin-dashboard/public/` - (if exists) Admin dashboard assets
- `apps/marketplace/public/` - (if exists) Marketplace assets

**Benefits:**
- Assets deployed with the app
- No cross-app dependencies
- Optimized per-app builds

---

## 🚀 How to Add Assets

### **Shared Brand Assets**

```bash
# 1. Add your asset to the appropriate directory
cp path/to/logo.svg assets/images/logos/

# 2. Optimize the asset (if needed)
# - SVGs: Remove unnecessary metadata
# - PNGs/JPGs: Compress with tools like ImageOptim, TinyPNG
# - Consider WebP format for better compression

# 3. Reference in your app
# In Next.js apps:
import Logo from '../../../assets/images/logos/superseller-logo.svg'

# Or with Image component:
<Image src="/assets/images/logos/superseller-logo.svg" alt="SuperSeller AI" />
```

### **App-Specific Assets**

```bash
# 1. Add your asset to the app's public directory
cp path/to/icon.png apps/web/superseller-site/public/icons/

# 2. Reference in your app (Next.js automatically serves from /public)
<Image src="/icons/icon.png" alt="Icon" />
```

---

## 📏 Asset Guidelines

### **File Naming Convention**

Use lowercase with hyphens:
```
✅ superseller-logo-primary.svg
✅ brand-icon-dark.png
✅ og-image-homepage.jpg

❌ SuperSeller AILogo.svg
❌ brand_icon.png
❌ OGImageHomepage.jpg
```

### **Image Optimization**

**Before adding any asset:**
1. **Compress images**
   - Use tools: ImageOptim, TinyPNG, Squoosh
   - Target: <100KB for most images, <500KB for high-res photos

2. **Choose the right format**
   - Logos, icons: SVG (vector, scalable)
   - Photos: WebP (best compression) or JPG
   - Transparency: PNG or WebP
   - Avoid: Large uncompressed PNGs

3. **Size appropriately**
   - Don't use 4K images for thumbnails
   - Provide multiple sizes if needed (@1x, @2x, @3x)

### **Recommended Sizes**

| Asset Type | Recommended Size | Format |
|------------|------------------|--------|
| Logo (standard) | 200-400px wide | SVG preferred |
| Favicon | 32x32, 192x192 | PNG or ICO |
| Open Graph image | 1200x630px | JPG or PNG |
| App icon | 512x512px | PNG |
| Hero images | 1920px wide max | WebP or JPG |
| Thumbnails | 400px wide max | WebP or JPG |

---

## 🗑️ Asset Cleanup

### **October 5, 2025 Cleanup:**
- ❌ Deleted `2025-10-03_18-02-12.png` (1.2MB screenshot) → Moved to archives/screenshots/
- ❌ Deleted `SuperSeller AI-Logo.png` (1.4MB) → Archived (not referenced in any code)
- ✅ **Result**: Reduced from 2.6MB → 0B

**Reason for archival:**
- Screenshot was a one-off file not meant for production
- Logo was unused (not referenced anywhere in codebase)
- Apps currently use their own assets in `public/` folders

### **Detection of Unused Assets**

To find unused assets:

```bash
# Search for references to an asset
grep -r "filename.png" apps/ --exclude-dir=node_modules

# If no results, the asset is likely unused
```

**Policy**: Archive assets unused for 3+ months

---

## 📊 Current Status

**Shared Brand Assets**: 0 (ready for future additions)

**App-Specific Assets**:
- `apps/web/superseller-site/public/` - 32KB (icons, SVGs)
- Other apps: Check individual app directories

**Archived Assets**:
- `archives/screenshots/2025-10-03_18-02-12.png` (1.2MB)
- `archives/screenshots/SuperSeller AI-Logo.png` (1.4MB)

---

## 🔗 Related Documentation

- **Webflow Assets**: See `/webflow/README.md` for Webflow-specific assets
- **Brand Guidelines**: (TODO - document brand colors, fonts, usage)
- **App Documentation**: See individual app README files for app-specific assets

---

## ⚠️ Important Notes

### **DO:**
- ✅ Optimize images before adding (compress, resize)
- ✅ Use SVG for logos and icons (vector, scalable)
- ✅ Use semantic names (superseller-logo-primary.svg, not logo1.svg)
- ✅ Keep shared assets in `/assets/`
- ✅ Keep app-specific assets in app's `public/` folder

### **DON'T:**
- ❌ Add large unoptimized images (>500KB without reason)
- ❌ Add screenshots or temporary files (use /archives/ or /tmp/)
- ❌ Add multiple versions of the same asset (clean up old versions)
- ❌ Add assets not referenced in code (remove unused assets)

---

## 🤝 Integration with Apps

### **Next.js Apps (Recommended)**

```typescript
// For assets in /assets/ (shared)
import Logo from '../../../assets/images/logos/superseller-logo.svg'

// For assets in app's /public/ (app-specific)
import { StaticImageData } from 'next/image'
<Image src="/icons/icon.png" alt="Icon" width={32} height={32} />
```

### **Webflow**

Webflow assets are managed separately in Webflow CMS. See `/webflow/README.md`.

---

## 📞 Questions?

If you need to add a new brand asset or have questions about asset management, refer to this guide or contact the SuperSeller AI development team.

---

**Last Updated:** October 5, 2025
**Next Audit:** January 2026 (3 months)
**Maintained By:** SuperSeller AI Team
