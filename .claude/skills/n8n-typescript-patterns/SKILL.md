---
name: n8n-typescript-patterns
description: Apply n8n TypeScript coding standards and best practices. Use when writing n8n node code, reviewing implementations, fixing linter errors, or optimizing node performance.
allowed-tools: [Read, Write, Edit]
---

# n8n TypeScript Patterns

## Overview
Enforces n8n TypeScript coding standards, detects anti-patterns, suggests optimizations, and ensures code quality for custom n8n nodes and workflows.

## Quick Start
Review n8n code for best practices:
"Review this n8n node code for TypeScript patterns and suggest improvements"

## Core Principles

### 1. Never Modify Input Data
❌ **BAD** - Mutates original:
```typescript
const items = this.getInputData();
items[0].json.modified = true; // Dangerous!
```

✅ **GOOD** - Clone before modifying:
```typescript
const items = this.getInputData();
const newItems = JSON.parse(JSON.stringify(items));
newItems[0].json.modified = true;
```

### 2. Use Built-in Request Helpers
❌ **BAD** - Direct axios:
```typescript
import axios from 'axios';
const response = await axios.get(url);
```

✅ **GOOD** - n8n helpers:
```typescript
const response = await this.helpers.httpRequest({
  method: 'GET',
  url: endpoint,
  json: true
});
```

### 3. Implement Proper Error Handling
❌ **BAD** - Raw errors:
```typescript
throw new Error('Request failed');
```

✅ **GOOD** - NodeOperationError:
```typescript
import { NodeOperationError } from 'n8n-workflow';

throw new NodeOperationError(
  this.getNode(),
  `Request failed: ${error.message}`,
  { itemIndex: i }
);
```

### 4. Follow Resource/Operation Pattern
✅ **Multi-operation nodes structure:**
```typescript
{
  name: 'resource',
  type: 'options',
  options: [
    { name: 'User', value: 'user' },
    { name: 'Post', value: 'post' }
  ]
},
{
  name: 'operation',
  type: 'options',
  displayOptions: {
    show: { resource: ['user'] }
  },
  options: [
    { name: 'Create', value: 'create' },
    { name: 'Get', value: 'get' }
  ]
}
```

## Common Patterns

### Parameter Access with Type Safety
```typescript
const operation = this.getNodeParameter('operation', i) as string;
const userId = this.getNodeParameter('userId', i) as number;
const options = this.getNodeParameter('options', i, {}) as IDataObject;
```

### HTTP Requests with Authentication
```typescript
const credentials = await this.getCredentials('myNodeApi');

const response = await this.helpers.httpRequestWithAuthentication.call(
  this,
  'myNodeApi',
  {
    method: 'GET',
    url: `https://api.example.com/users/${userId}`,
    json: true
  }
);
```

### Processing Multiple Items
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      const operation = this.getNodeParameter('operation', i) as string;
      
      let responseData;
      if (operation === 'create') {
        responseData = await createResource.call(this, i);
      } else if (operation === 'get') {
        responseData = await getResource.call(this, i);
      }
      
      returnData.push({ json: responseData });
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i }
        });
        continue;
      }
      throw new NodeOperationError(this.getNode(), error, {
        itemIndex: i
      });
    }
  }
  
  return [returnData];
}
```

## Anti-Patterns to Avoid

### Over-Engineering
❌ Creating elaborate abstractions for simple operations
✅ Use minimal, focused implementations

### Context Ignorance
❌ Ignoring existing codebase patterns
✅ Review similar nodes before implementing

### Missing Validation
❌ Processing data without checking required fields
✅ Validate early, fail fast with clear messages

### Hardcoded Values
❌ `const apiKey = 'sk_live_abc123'`
✅ Use credentials system

### Poor Error Messages
❌ `throw new Error('Failed')`
✅ `throw new NodeOperationError(this.getNode(), 'User creation failed: Email already exists', { itemIndex: i })`

## Validation Checklist
- [ ] No direct mutation of input data
- [ ] Using n8n helper methods for HTTP requests
- [ ] Proper error handling with NodeOperationError
- [ ] Type safety for all parameters
- [ ] Resource/operation pattern for multi-operation nodes
- [ ] Credentials handled securely
- [ ] Input validation before processing
- [ ] Clear, actionable error messages
- [ ] No hardcoded secrets or values
- [ ] Proper async/await usage
