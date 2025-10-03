# 🎨 WEBFLOW API USAGE GUIDE

**Date**: January 14, 2025  
**Status**: ✅ **DOCUMENTED - READY FOR IMPLEMENTATION**

## 🎯 **OVERVIEW**

This guide documents the different Webflow APIs available and their appropriate usage patterns for the Rensto project.

---

## 📊 **CURRENT IMPLEMENTATION**

### **✅ What We're Using (Data API v2)**
- **Package**: `webflow-mcp-server@latest`
- **Tools Available**: 32 tools
- **Capabilities**:
  - Page metadata management (title, SEO, Open Graph)
  - Site settings and configuration
  - Publishing and deployment
  - CMS operations (collections, items)
  - Custom code injection (JavaScript/CSS)

### **✅ Current Limitations**
- **Cannot create HTML content** or page structure
- **Cannot manipulate visual elements** on the canvas
- **Cannot create responsive layouts** or components
- **Limited to metadata and content management**

### **🚨 CRITICAL LIMITATIONS DISCOVERED:**
- ❌ **Cannot update primary locale static content** (even English-only sites)
- ❌ **Cannot add/remove HTML elements** on primary locale pages
- ❌ **Cannot modify page structure** or visual components
- ❌ **Custom code API requires different token permissions** (`custom_code:write` scope)
- ✅ **Can update metadata** (titles, SEO, Open Graph)
- ✅ **Can manage CMS content** (collections, items)
- ✅ **Can publish sites** and manage settings

---

## 🎯 **API SELECTION STRATEGY**

### **When to Use Each API:**

| API | Use For | Cannot Do |
|-----|---------|-----------|
| **Data API v2** | CMS, metadata, site settings, publishing | Page content, HTML elements, visual design |
| **Designer API** | HTML content creation, page structure, visual elements | CMS operations, form data, asset management |
| **Browser API** | Client-side interactions, user tracking, personalization | Server-side operations, content management |
| **Flowkit** | Design system management, component libraries | Page content, CMS operations |

### **Real-World Examples:**
- **Homepage Content**: Use Designer API (not Data API)
- **CMS Blog Posts**: Use Data API (not Designer API)
- **User Analytics**: Use Browser API (not Data API)
- **Component Library**: Use Flowkit (not Data API)

---

## 🚀 **AVAILABLE BUT UNUSED APIs**

### **❌ Webflow Designer API**
**Purpose**: Visual design and content management
**Capabilities**:
- Create and modify design elements on the canvas
- Manage styles, variables, and components
- Work with responsive breakpoints and layouts
- Add HTML elements and content to pages
- Real-time design manipulation

**Setup Requirements**:
1. **Node.js 22.3.0+** ✅ (Current: 22.12.0)
2. **Open Webflow Designer** - Site must be open in Designer interface
3. **Launch MCP Bridge App** - Press `E` → Apps → "Webflow MCP Bridge App"
4. **Keep App Open** - Must remain active for Designer API tools to function
5. **OAuth Authorization** - Companion app installs automatically

### **❌ Webflow Browser API**
**Purpose**: Advanced page content manipulation
**Capabilities**:
- Client-side interactions and user tracking
- Personalization and dynamic content
- A/B testing and optimization
- User consent management
- Real-time user behavior tracking

**Implementation**:
- Add JavaScript via custom code settings
- Use `wf.ready()` wrapper for API access
- Integrate with Google Tag Manager

### **❌ Webflow Flowkit**
**Purpose**: Programmatic design system management
**Capabilities**:
- Component library management
- Design token management
- Automated design system updates
- Cross-project design consistency

### **❌ Webflow Cloud**
**Purpose**: Comprehensive site management
**Capabilities**:
- Advanced site administration
- Team collaboration features
- Enterprise-level management
- Bulk operations and automation

---

## 🎯 **WHEN TO USE EACH API**

### **Data API v2** (Current)
- ✅ **Use for**: CMS operations, metadata, site settings
- ✅ **Use for**: Custom code injection
- ✅ **Use for**: Publishing and deployment
- ❌ **Don't use for**: HTML content creation
- ❌ **Don't use for**: Visual design changes

### **Designer API** (Recommended for Homepage Fix)
- ✅ **Use for**: Creating HTML content and page structure
- ✅ **Use for**: Building hero sections, features, pricing
- ✅ **Use for**: Visual element manipulation
- ✅ **Use for**: Responsive design implementation
- ❌ **Don't use for**: CMS content management

### **Browser API** (Future Enhancement)
- ✅ **Use for**: User tracking and analytics
- ✅ **Use for**: Personalization features
- ✅ **Use for**: A/B testing implementation
- ❌ **Don't use for**: Server-side operations

### **Flowkit** (Design System)
- ✅ **Use for**: Component library management
- ✅ **Use for**: Design token consistency
- ✅ **Use for**: Cross-project standardization
- ❌ **Don't use for**: Individual page content

---

## 🔧 **IMPLEMENTATION ROADMAP**

### **Phase 1: Homepage Fix (Immediate)**
1. **Set up Designer API access**
   - Open Webflow Designer
   - Launch MCP Bridge App
   - Verify connection status

2. **Create homepage content**
   - Build hero section with proper HTML structure
   - Add features, pricing, and testimonial sections
   - Remove LinkedIn verification content
   - Implement responsive design

### **Phase 2: Enhanced Functionality (Future)**
1. **Browser API Integration**
   - Add user tracking and analytics
   - Implement personalization features
   - Set up A/B testing

2. **Flowkit Implementation**
   - Create component library
   - Establish design tokens
   - Standardize across projects

### **Phase 3: Advanced Features (Long-term)**
1. **Cloud API Integration**
   - Advanced site management
   - Team collaboration features
   - Enterprise-level automation

---

## 🚨 **CRITICAL REQUIREMENTS**

### **Designer API Setup Checklist**
- [ ] Node.js 22.3.0+ installed ✅
- [ ] Webflow Designer open with site loaded
- [ ] MCP Bridge App launched and active
- [ ] OAuth authorization completed
- [ ] Companion app connection verified

### **Current Blockers**
- **Homepage Issue**: LinkedIn verification content showing instead of actual homepage
- **Root Cause**: Homepage is empty (only one image node)
- **Solution**: Use Designer API to create proper HTML content structure

---

## 📋 **NEXT STEPS**

1. **Immediate**: Set up Designer API access for homepage fix
2. **Short-term**: Implement Browser API for enhanced functionality
3. **Long-term**: Consider Flowkit for design system management

---

**Status**: ✅ **DOCUMENTED** - Ready for Designer API implementation to fix homepage content issue
