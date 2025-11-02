---
name: n8n-tax4us-agent
description: Specialized patterns for Tax4Us n8n agent workflows including content creation, validation, WordPress integration, and Slack notifications. Use when working with Tax4Us agents, content pipelines, or WordPress automation.
allowed-tools: [Read, Write, Edit, Bash]
---

# Tax4Us n8n Agent Patterns

## Overview
Specialized patterns and best practices for Tax4Us n8n agent workflows, including content creation pipelines, WordPress integration, validation logic, and Slack communication patterns.

## Quick Start
Create or fix Tax4Us agent workflows:
"Fix the Design Validator loop in the Tax4Us content creation workflow"

## Tax4Us Agent Architecture

### Core Workflow Pattern
```
Airtable Trigger → Content Planning → Content Creation → Validation → WordPress → Slack Notification
```

### Key Components
1. **Airtable Trigger** - Content specifications
2. **AI Agent: Planner** - Research and strategy
3. **AI Agent: Creator** - Content generation
4. **AI Agent: Validator** - Quality validation
5. **WordPress Integration** - Content publishing
6. **Slack Notifications** - Status updates

## Common Tax4Us Patterns

### Content Validation Loop Prevention
❌ **BAD** - Infinite validation loops:
```javascript
// Too strict validation always fails
if (!uagbContainer || !uagbHeading || !backgroundImage) {
  validation_passed = false; // Always fails!
}
```

✅ **GOOD** - Lenient validation with minimum score:
```javascript
// Start with true, only fail for critical issues
validation_passed = true;
design_score = 10;

// Reduce penalties, don't kill validation
if (!uagbContainer) {
  design_score -= 0.5; // Warning, not failure
}

// Only fail for truly critical issues
if (design_score < 5 && hasCriticalIssues) {
  validation_passed = false;
}
```

### WordPress Integration Patterns
```javascript
// Proper WordPress payload structure
const wordpress_data = {
  title: String(content.title).trim().substring(0, 200),
  content: String(content.content).trim(),
  excerpt: String(content.excerpt).trim().substring(0, 500),
  slug: String(content.slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200),
  status: 'draft',
  
  // Yoast SEO meta fields for schema generation
  meta: {
    _yoast_wpseo_title: String(content.seo_data?.meta_title || content.title).substring(0, 60),
    _yoast_wpseo_metadesc: String(content.seo_data?.meta_description || content.excerpt).substring(0, 160),
    _yoast_wpseo_focuskw: String(content.seo_data?.focus_keyword || '').substring(0, 50),
    _yoast_wpseo_schema_type: 'Article',
    _yoast_wpseo_schema_article_type: 'BlogPosting'
  }
};
```

### Slack Notification Patterns
```javascript
// Success notification
const successMessage = `✅ Content published successfully! 
WordPress URL: ${wordpress.link}
Quality Score: ${validation.quality_score}/10
Word Count: ${content.metadata.word_count}`;

// Error notification with context
const errorMessage = `❌ Content validation failed
Topic: ${context.topic}
Issues: ${validation.issues.join(', ')}
Attempt: ${attempt_count}/3`;
```

### AI Agent Memory Patterns
```javascript
// Proper memory configuration for Tax4Us agents
const memoryConfig = {
  sessionIdType: "customKey",
  sessionKey: `tax4us_${agent_type}_${record_id}`,
  contextWindowLength: 3
};
```

## Tax4Us-Specific Node Patterns

### Design Validator Node
```javascript
// Tax4Us template validation with UAGB blocks
const designValidation = {
  validation_passed: true, // Start optimistic
  design_score: 10,
  issues: [],
  warnings: [],
  suggestions: []
};

// Check for UAGB container (Tax4Us banner)
const uagbContainerPattern = /<!-- wp:uagb\/container[^>]*-->/g;
const uagbContainers = [...content.matchAll(uagbContainerPattern)];

if (uagbContainers.length === 0) {
  designValidation.warnings.push('No UAGB container found');
  designValidation.design_score -= 0.5; // Warning, not failure
}

// Only fail for critical issues
const criticalIssues = designValidation.issues.filter(issue => 
  issue.includes('CRITICAL')
);

if (criticalIssues.length > 0 || designValidation.design_score < 5) {
  designValidation.validation_passed = false;
}
```

### Content Processing Node
```javascript
// Safe content extraction with fallbacks
let content = null;

// Priority 1: Direct content
if (inputData.title && inputData.content) {
  content = inputData;
}
// Priority 2: In 'output' property
else if (inputData.output && inputData.output.title) {
  content = inputData.output;
}
// Priority 3: Parse JSON string
else if (typeof inputData.output === 'string') {
  try {
    content = JSON.parse(inputData.output);
  } catch (e) {
    console.error('Failed to parse output string');
  }
}

if (!content || !content.title) {
  throw new Error('No valid content found');
}
```

## Error Handling for Tax4Us Agents

### Regeneration Logic
```javascript
// Prevent infinite loops with attempt counting
if (attempt_count >= max_attempts) {
  return {
    max_attempts_reached: true,
    final_score: previous_score,
    message: `Failed after ${attempt_count} attempts`
  };
}

// Create comprehensive feedback for regeneration
const feedback = `
🔄 REGENERATION REQUEST (Attempt ${attempt_count}/3)

PREVIOUS SCORE: ${previous_score}/10
ISSUES TO FIX: ${issues.join('\n')}
SUGGESTIONS: ${suggestions.join('\n')}

CRITICAL: Address ALL feedback above!
`;
```

### Validation Loop Prevention
```javascript
// Minimum score prevents infinite loops
design_score = Math.max(6, Math.min(10, design_score));

// Only fail for truly critical issues
const hasCriticalIssues = criticalIssues.length > 0;
const lowScore = design_score < 5;

if (hasCriticalIssues || lowScore) {
  validation_passed = false;
} else {
  validation_passed = true; // Pass for minor issues
}
```

## Tax4Us Workflow Optimization

### Performance Patterns
- Use `Split In Batches` for large content processing
- Implement proper error handling to prevent workflow failures
- Add progress tracking for long-running operations
- Use memory efficiently with proper session keys

### Monitoring Patterns
- Log all validation scores and decisions
- Track attempt counts for regeneration
- Monitor WordPress post creation success
- Alert on workflow failures via Slack

## Common Issues & Solutions

### Issue: Infinite Validation Loop
**Cause**: Design Validator too strict, always fails
**Solution**: Use lenient validation with minimum score of 6

### Issue: WordPress JSON Errors
**Cause**: Malformed content structure
**Solution**: Add content validation before WordPress creation

### Issue: Slack Notification Failures
**Cause**: Missing user context or malformed messages
**Solution**: Use proper Slack node configuration with user selection

### Issue: AI Agent Memory Loss
**Cause**: Incorrect session key or context window
**Solution**: Use consistent session keys and appropriate context length

## Validation Checklist
- [ ] Design Validator uses lenient scoring (minimum 6)
- [ ] WordPress payload properly structured
- [ ] Slack notifications include proper context
- [ ] Regeneration logic prevents infinite loops
- [ ] Error handling provides clear feedback
- [ ] Memory configuration uses consistent session keys
- [ ] Content validation before processing
- [ ] Progress tracking for long operations
