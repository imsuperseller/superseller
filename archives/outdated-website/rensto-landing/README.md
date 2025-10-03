# Rensto Landing Pages - Component System

## 🚀 Quick Start

### Build Pages
```bash
node build.js
```

### Serve Locally
```bash
npm run serve
# or
python3 -m http.server 8000
```

## 📁 File Structure

```
rensto-landing/
├── components/
│   ├── header.html      # Reusable header component
│   ├── footer.html      # Reusable footer component
│   └── styles.html      # Global styles component
├── build.js             # Build script
├── template.html         # Page template
├── package.json         # Dependencies
└── README.md            # This file
```

## 🔧 How It Works

1. **Components**: Reusable HTML snippets in `components/`
2. **Template**: Base template with placeholders
3. **Build Script**: Combines components into complete pages
4. **Output**: Generated HTML files ready for deployment

## 📝 Adding New Pages

1. **Edit `build.js`** - Add new page to `pages` array
2. **Run build**: `node build.js`
3. **Deploy**: Upload generated HTML files

## 🎯 Benefits

- ✅ **Consistent Header/Footer** across all pages
- ✅ **Easy Maintenance** - update components once
- ✅ **No Server Requirements** - works with static hosting
- ✅ **Automated Build** - generate all pages at once

## 🚀 Usage

```bash
# Build all pages
npm run build

# Build and serve locally
npm run dev
```

Generated files:
- `home-updated.html` - Updated home page
- `lead-generator.html` - Lead generation page
