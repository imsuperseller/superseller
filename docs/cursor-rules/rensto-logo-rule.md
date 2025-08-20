# RENSTO LOGO RULE

## 🎯 **OBJECTIVE**
Always use the actual Rensto logo (stylized "R" with orange-red to blue gradient) instead of text-only branding.

## 📋 **REQUIREMENTS**

### **MANDATORY LOGO USAGE:**
- **NEVER** use just "RENSTO" text without the logo
- **ALWAYS** include the stylized "R" logo with gradient
- **ALWAYS** use the orange-red to blue gradient (#fe3d51 to #1eaef7)
- **ALWAYS** apply glow effects to the logo

### **LOGO SPECIFICATIONS:**
- **Design**: Stylized "R" with curved, modern strokes
- **Colors**: Orange-red (#fe3d51) to blue (#1eaef7) gradient
- **Style**: Smooth, rounded edges with dynamic flow
- **Background**: Black or dark background for contrast
- **Effects**: Drop shadow and glow effects

### **IMPLEMENTATION:**
```html
<svg class="rensto-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="renstoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fe3d51;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#bf5700;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1eaef7;stop-opacity:1" />
        </linearGradient>
    </defs>
    <path d="M20 20 L20 80 L35 80 L35 50 L60 80 L80 80 L50 45 L70 20 L50 20 L35 45 L35 20 Z" fill="url(#renstoGradient)" stroke="none"/>
</svg>
```

### **CSS STYLING:**
```css
.rensto-logo-svg {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    filter: drop-shadow(0 0 10px rgba(254, 61, 81, 0.5));
}

.rensto-logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
```

## 🚫 **WHAT NOT TO DO:**
- ❌ Don't use just "RENSTO" text
- ❌ Don't use generic icons or emojis
- ❌ Don't use different color schemes
- ❌ Don't skip the logo in headers
- ❌ Don't use plain text branding

## ✅ **WHAT TO ALWAYS DO:**
- ✅ Include the stylized "R" logo
- ✅ Use the orange-red to blue gradient
- ✅ Apply glow and shadow effects
- ✅ Place logo prominently in headers
- ✅ Maintain brand consistency

## 🎨 **BRAND IDENTITY:**
The Rensto logo represents:
- **Innovation**: Modern, dynamic design
- **Technology**: Clean, professional appearance
- **Energy**: Vibrant gradient colors
- **Trust**: Solid, recognizable branding

## 📝 **APPLICATION AREAS:**
- All dashboard headers
- All page titles
- All branding elements
- All user interfaces
- All marketing materials
- All documentation

## 🔄 **ENFORCEMENT:**
This rule must be followed for:
- All new designs
- All existing interfaces
- All branding updates
- All component creation
- All page development

**Remember: The Rensto logo is the core of our brand identity. Always use it instead of text-only branding.**
