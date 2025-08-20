# 🌐 **LANGUAGE PREFERENCES SYSTEM**

## 📋 **OVERVIEW**

The Language Preferences System allows customers to specify their preferred language for both the customer app interface and AI agent communications during the Typeform onboarding process. This ensures a fully localized experience from the moment of first contact.

## 🎯 **FEATURES**

### **✅ IMPLEMENTED FEATURES**

#### **1. Typeform Language Questions**
- **Customer App Language**: Choose interface language for portal/dashboard
- **Agent Interface Language**: Choose communication language for AI agents
- **RTL Support**: Automatic detection for RTL languages (Hebrew, Arabic, etc.)
- **Localization Preferences**: Additional cultural and format preferences

#### **2. Supported Languages**
- **English** (en-US)
- **Hebrew** (he-IL) - with RTL support
- **Spanish** (es-ES)
- **French** (fr-FR)
- **German** (de-DE)
- **Arabic** (ar-SA) - with RTL support
- **Chinese** (zh-CN)
- **Japanese** (ja-JP)
- **Korean** (ko-KR)
- **Russian** (ru-RU)
- **Portuguese** (pt-BR)
- **Italian** (it-IT)
- **Dutch** (nl-NL)

#### **3. RTL (Right-to-Left) Support**
- **Automatic Detection**: Based on language selection
- **Layout Adjustment**: Complete RTL layout support
- **Text Direction**: Proper text flow for RTL languages
- **Component Alignment**: Flexbox and grid adjustments

## 📝 **TYPEFORM IMPLEMENTATION**

### **Language Preference Fields**

```javascript
// Customer App Language
{
  id: 'customer_app_language',
  type: 'multiple_choice',
  title: 'What language would you prefer for your customer app interface?',
  description: 'This will be the language used in your customer portal and dashboard',
  choices: [
    'English',
    'Hebrew (עברית)',
    'Spanish (Español)',
    'French (Français)',
    'German (Deutsch)',
    'Arabic (العربية)',
    'Chinese (中文)',
    'Japanese (日本語)',
    'Korean (한국어)',
    'Russian (Русский)',
    'Portuguese (Português)',
    'Italian (Italiano)',
    'Dutch (Nederlands)',
    'Other (Please specify)'
  ],
  required: true
}

// Agent Interface Language
{
  id: 'agent_interface_language',
  type: 'multiple_choice',
  title: 'What language would you prefer for your AI agent interface?',
  description: 'This will be the language your AI agents communicate in',
  choices: [
    'English',
    'Hebrew (עברית)',
    'Spanish (Español)',
    'French (Français)',
    'German (Deutsch)',
    'Arabic (العربية)',
    'Chinese (中文)',
    'Japanese (日本語)',
    'Korean (한국어)',
    'Russian (Русский)',
    'Portuguese (Português)',
    'Italian (Italiano)',
    'Dutch (Nederlands)',
    'Same as customer app',
    'Other (Please specify)'
  ],
  required: true
}

// RTL Support
{
  id: 'rtl_support_needed',
  type: 'multiple_choice',
  title: 'Do you need Right-to-Left (RTL) text support?',
  description: 'Required for languages like Hebrew, Arabic, and other RTL languages',
  choices: [
    'Yes, I need RTL support',
    'No, I don\'t need RTL support',
    'I\'m not sure'
  ],
  required: true
}

// Localization Preferences
{
  id: 'localization_preferences',
  type: 'long_text',
  title: 'Any specific localization preferences?',
  description: 'For example: date formats, currency, number formats, cultural considerations',
  required: false
}
```

## 🔧 **API INTEGRATION**

### **Customer Configuration API**

```typescript
interface CustomerConfig {
  name: string;
  company: string;
  industry: string;
  language: {
    customerApp: string;
    agentInterface: string;
    rtlSupport: boolean;
    locale: string;
  };
  // ... other fields
}
```

### **Language Detection Logic**

```javascript
// Helper function to get locale from language
function getLocaleFromLanguage(language: string): string {
  const localeMap: Record<string, string> = {
    'English': 'en-US',
    'Hebrew (עברית)': 'he-IL',
    'Spanish (Español)': 'es-ES',
    'French (Français)': 'fr-FR',
    'German (Deutsch)': 'de-DE',
    'Arabic (العربية)': 'ar-SA',
    'Chinese (中文)': 'zh-CN',
    'Japanese (日本語)': 'ja-JP',
    'Korean (한국어)': 'ko-KR',
    'Russian (Русский)': 'ru-RU',
    'Portuguese (Português)': 'pt-BR',
    'Italian (Italiano)': 'it-IT',
    'Dutch (Nederlands)': 'nl-NL'
  };
  
  return localeMap[language] || 'en-US';
}
```

## 🎨 **FRONTEND IMPLEMENTATION**

### **RTL Support in Customer Portal**

```typescript
// Apply language and RTL settings
useEffect(() => {
  if (!customerConfig) return;

  const { language } = customerConfig;
  
  // Set document direction and language
  document.documentElement.dir = language.rtlSupport ? 'rtl' : 'ltr';
  document.documentElement.lang = language.locale;
  
  // Add RTL class if needed
  if (language.rtlSupport) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
}, [customerConfig]);
```

### **Dynamic Layout Classes**

```jsx
// RTL-aware layout classes
<div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
  <div className={`flex items-center space-x-3 mb-4 ${isRTL ? 'space-x-reverse' : ''}`}>
    <span className="text-lg">{tab.icon}</span>
    <span>{tab.label}</span>
  </div>
</div>
```

## 📊 **CUSTOMER EXAMPLES**

### **Ben Ginati (Tax4Us) - English**
```json
{
  "name": "Ben Ginati",
  "company": "Tax4Us",
  "language": {
    "customerApp": "English",
    "agentInterface": "English",
    "rtlSupport": false,
    "locale": "en-US"
  }
}
```

### **Shelly Mizrahi (Insurance) - Hebrew**
```json
{
  "name": "Shelly Mizrahi",
  "company": "Insurance Services",
  "language": {
    "customerApp": "Hebrew",
    "agentInterface": "Hebrew",
    "rtlSupport": true,
    "locale": "he-IL"
  }
}
```

## 🚀 **IMPLEMENTATION STEPS**

### **1. Typeform Creation**
- ✅ Added language preference fields to Typeform
- ✅ Included RTL support detection
- ✅ Added localization preferences field

### **2. API Integration**
- ✅ Updated customer configuration API
- ✅ Added language detection logic
- ✅ Implemented locale mapping

### **3. Frontend Implementation**
- ✅ Updated customer portal with RTL support
- ✅ Added dynamic layout classes
- ✅ Implemented language display in header

### **4. Testing**
- ✅ Tested with English (LTR)
- ✅ Tested with Hebrew (RTL)
- ✅ Verified language preference persistence

## 🔮 **FUTURE ENHANCEMENTS**

### **Planned Features**
1. **Translation Management System**
   - Centralized translation database
   - Dynamic content translation
   - Translation memory

2. **Cultural Adaptation**
   - Date format preferences
   - Currency formatting
   - Number formatting
   - Cultural considerations

3. **Multi-Language Support**
   - Simultaneous multiple languages
   - Language switching within app
   - Fallback language handling

4. **AI Agent Localization**
   - Language-specific AI responses
   - Cultural context awareness
   - Localized agent personalities

## 📁 **FILE STRUCTURE**

```
scripts/
├── implement-complete-customer-journey.js  # Updated Typeform creation
web/rensto-site/src/
├── app/
│   ├── api/customers/[slug]/config/route.ts  # Updated API with language support
│   └── portal/[slug]/page.tsx  # Updated portal with RTL support
docs/
└── LANGUAGE_PREFERENCES_SYSTEM.md  # This documentation
```

## 🎯 **USAGE INSTRUCTIONS**

### **For Customers**
1. Fill out the Typeform during onboarding
2. Select preferred language for customer app
3. Select preferred language for AI agents
4. Indicate if RTL support is needed
5. Add any specific localization preferences

### **For Developers**
1. Language preferences are automatically applied
2. RTL support is automatically detected and applied
3. Customer portal adapts to language settings
4. AI agents communicate in selected language

## ✅ **STATUS**

**COMPLETE** - Language preferences system is fully implemented and operational.

- ✅ Typeform language questions added
- ✅ API integration complete
- ✅ Frontend RTL support implemented
- ✅ Customer portal language adaptation
- ✅ Documentation complete

The system now provides a fully localized experience from the moment customers first interact with Rensto through the Typeform onboarding process.
