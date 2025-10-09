# Agent 2: WordPress Pages Design Document

**Customer**: Tax4Us LLC (Boost.space ID: 39)
**Workflow Name**: WF: WordPress Pages - Services, FAQs, Glossary, Case Studies
**Agent Note ID**: 291 (Boost.space Space 45)
**Status**: Design Phase
**Created**: October 8, 2025
**Estimated Build Time**: 6-8 hours

---

## Purpose

Generate non-blog WordPress pages for Tax4Us website using ACF (Advanced Custom Fields) integration. Content types include:
- **Services pages** (tax preparation, consulting, bookkeeping, etc.)
- **FAQ pages** (common tax questions with structured answers)
- **Glossary entries** (tax terms and definitions)
- **Case studies** (client success stories with testimonials)

---

## Technical Requirements

### WordPress Integration
- **WordPress Site**: https://tax4us.co.il
- **API**: WordPress REST API v2 (/wp-json/wp/v2/)
- **ACF Version**: 5.11+ (enables REST API support for custom fields)
- **ACF REST API**: /wp-json/acf/v3/
- **Authentication**: Application Password (not JWT)

### Airtable Integration
- **Base ID**: appkZD1ew4aKoBqDM
- **Table**: Content_Specs (tbloWUmXIuBQXa1YQ)
- **Trigger Field**: Status
- **Content Types**: Services, FAQ, Glossary, Case Study (in Type field)

### AI Integration
- **Primary**: OpenAI gpt-4o (content generation)
- **Research**: Tavily API (web research for tax info)
- **Memory**: context7 (remember previous pages, avoid repetition)

### Approval Workflow
- **Platform**: Slack
- **Timeout**: 24-48 hours (with reminder)
- **Auto-approve**: After 48 hours if no response
- **Rejection**: Store feedback, regenerate

---

## Workflow Architecture

### High-Level Flow

```
1. Airtable Trigger (Content_Specs, Status = "Ready for Draft")
   ↓
2. IF: Content_Type = Services/FAQ/Glossary/Case Study?
   ↓
3. context7: Fetch Previous Pages (avoid repetition)
   ↓
4. Tavily Research (gather tax-specific information)
   ↓
5. OpenAI: Generate Page Content
   ↓
6. Code: Build ACF Payload (map to custom fields)
   ↓
7. Slack: Send Preview with Approve/Reject Buttons
   ↓ WAIT (24-48 hours)
   ↓ APPROVED
8. HTTP/WordPress: Create Page with ACF Fields
   ↓
9. Airtable: Update Status = "Published"
   ↓
10. context7: Save Page Context
   ↓
11. Slack: Notify Success
   ↓
   ↓ REJECTED
12. Airtable: Update Status = "Needs Revision"
   ↓
13. context7: Save Rejection Feedback
   ↓
14. Slack: Notify Ben with Feedback Request
   ↓ (Loop back to step 5 with feedback)
```

---

## Content Type Specifications

### 1. Services Pages

**Purpose**: Describe Tax4Us service offerings

**ACF Fields**:
- `service_title` (Text): Service name
- `service_tagline` (Text): One-line description
- `service_description` (WYSIWYG): Full description
- `service_features` (Repeater): List of key features
  - `feature_title` (Text)
  - `feature_description` (Textarea)
- `service_pricing` (Group):
  - `starting_price` (Number)
  - `pricing_note` (Textarea)
- `service_cta_text` (Text): Call-to-action button text
- `service_cta_link` (URL): Link to booking/contact
- `service_image` (Image): Service illustration

**Example Services**:
- Tax Preparation (Individual)
- Tax Preparation (Business)
- Tax Consulting
- Bookkeeping
- Payroll Services
- IRS Representation
- Audit Support
- Business Formation

**OpenAI Prompt Structure**:
```
You are creating a service page for Tax4Us, a Texas-based tax preparation firm.

Service Name: {service_name}
Target Audience: {audience}

Generate:
1. Tagline (10 words max, professional, benefit-focused)
2. Description (200-300 words, emphasize expertise and local knowledge)
3. Key Features (5-7 bullet points, specific and actionable)
4. Pricing Note (explain pricing structure without listing exact prices)
5. CTA Text (5-7 words, action-oriented)

Tone: Professional, trustworthy, clear
Include: Texas-specific tax regulations when relevant
Avoid: Specific tax advice (always say "consult your CPA")
```

---

### 2. FAQ Pages

**Purpose**: Answer common tax questions

**ACF Fields**:
- `faq_category` (Taxonomy): Category (Filing, Deductions, Business, etc.)
- `faq_question` (Text): The question
- `faq_answer` (WYSIWYG): Detailed answer
- `faq_related_links` (Repeater): Related resources
  - `link_text` (Text)
  - `link_url` (URL)
- `faq_last_updated` (Date): For compliance/accuracy tracking
- `faq_disclaimer` (Text): Legal disclaimer

**Example FAQ Categories**:
- **Filing**: "When is the tax deadline?", "Do I need to file quarterly?"
- **Deductions**: "What expenses can I deduct?", "Home office deduction rules?"
- **Business**: "LLC vs S-Corp for taxes?", "How to pay estimated taxes?"
- **Texas-Specific**: "Does Texas have state income tax?", "Texas franchise tax?"
- **Compliance**: "What if I can't pay my taxes?", "IRS payment plans?"

**OpenAI Prompt Structure**:
```
You are creating an FAQ entry for Tax4Us, a Texas-based tax preparation firm.

Question: {question}
Category: {category}
Audience Level: {beginner|intermediate|advanced}

Generate:
1. Clear, concise answer (150-250 words)
2. Include specific tax code references when applicable (e.g., "IRS Form 1040")
3. Texas-specific considerations when relevant
4. Actionable next steps for the reader
5. 2-3 related FAQ suggestions

Tone: Helpful, educational, clear (no jargon)
Include: Disclaimer at end ("This is general information. Consult a CPA for specific advice.")
Avoid: Specific dollar amounts (tax laws change)
```

---

### 3. Glossary Entries

**Purpose**: Define tax terms in plain language

**ACF Fields**:
- `term_name` (Text): The tax term
- `term_definition_short` (Text): One-sentence definition
- `term_definition_long` (WYSIWYG): Detailed explanation
- `term_example` (WYSIWYG): Real-world example
- `term_related_terms` (Relationship): Links to other glossary entries
- `term_irs_reference` (Text): IRS publication reference (if applicable)
- `term_category` (Taxonomy): Filing, Deductions, Business, etc.

**Example Terms**:
- **Adjusted Gross Income (AGI)**: "Your total income minus specific deductions"
- **1099 Form**: "Tax form for independent contractors and freelancers"
- **Estimated Taxes**: "Quarterly tax payments for self-employed individuals"
- **Franchise Tax**: "Texas state tax on business gross receipts"
- **Standard Deduction**: "Fixed amount you can deduct without itemizing"

**OpenAI Prompt Structure**:
```
You are creating a glossary entry for Tax4Us, a Texas-based tax preparation firm.

Term: {term_name}
Category: {category}

Generate:
1. Short definition (1 sentence, ~20 words, clear and simple)
2. Long explanation (100-150 words, break down complex concepts)
3. Real-world example (50-75 words, relatable scenario)
4. Related terms (3-5 terms that are connected)
5. IRS reference (if applicable, e.g., "See IRS Publication 334")

Tone: Educational, accessible (8th grade reading level)
Avoid: Circular definitions (don't use the term to define itself)
Include: Texas-specific considerations when relevant
```

---

### 4. Case Studies

**Purpose**: Showcase client success stories (anonymized)

**ACF Fields**:
- `case_study_title` (Text): Catchy title
- `case_study_client_type` (Select): Individual, Small Business, Startup, etc.
- `case_study_challenge` (WYSIWYG): What problem did they have?
- `case_study_solution` (WYSIWYG): How did Tax4Us help?
- `case_study_results` (Repeater): Measurable outcomes
  - `result_metric` (Text): e.g., "Tax savings"
  - `result_value` (Text): e.g., "$15,000"
- `case_study_testimonial` (WYSIWYG): Client quote (anonymized)
- `case_study_industry` (Text): Client's industry
- `case_study_image` (Image): Generic industry illustration

**Example Case Studies**:
- "How a Texas Startup Saved $25K in First Year Tax Planning"
- "Small Restaurant Owner Avoids IRS Penalties with Quarterly Filing"
- "Real Estate Investor Maximizes Deductions with Strategic Planning"
- "Freelance Consultant Reduces Tax Burden by 40% with S-Corp Election"

**OpenAI Prompt Structure**:
```
You are creating a case study for Tax4Us, a Texas-based tax preparation firm.

Client Type: {client_type}
Industry: {industry}
Challenge Category: {challenge}

Generate:
1. Title (8-12 words, benefit-focused, specific)
2. Challenge (100-150 words, relatable pain points)
3. Solution (150-200 words, Tax4Us expertise and approach)
4. Results (3-5 measurable outcomes with approximate values)
5. Testimonial (50-75 words, authentic client voice, anonymized)

Tone: Professional, results-focused, credible
Include: Texas-specific tax considerations
Avoid: Identifying client details (use "a Texas-based startup" not "ABC Corp")
Note: All case studies are composites for privacy protection
```

---

## ACF REST API Integration

### Field Mapping Strategy

WordPress ACF REST API exposes custom fields in the `acf` object of the response/request.

**Standard WordPress Fields**:
```json
{
  "title": "Service: Tax Preparation",
  "content": "Main page content (not ACF)",
  "status": "publish",
  "type": "page",
  "slug": "tax-preparation"
}
```

**ACF Custom Fields** (sent separately):
```json
{
  "acf": {
    "service_title": "Individual Tax Preparation",
    "service_tagline": "Fast, accurate tax filing for individuals",
    "service_description": "<p>Full description here...</p>",
    "service_features": [
      {
        "feature_title": "Same-day filing",
        "feature_description": "We file your return within 24 hours"
      },
      {
        "feature_title": "Maximize deductions",
        "feature_description": "Find every deduction you're eligible for"
      }
    ],
    "service_pricing": {
      "starting_price": 150,
      "pricing_note": "Price varies based on complexity"
    }
  }
}
```

### API Endpoints

**Create Page**:
- `POST /wp-json/wp/v2/pages`
- Body: Standard WordPress fields only
- Returns: Page ID

**Update ACF Fields**:
- `POST /wp-json/acf/v3/pages/{page_id}`
- Body: `{ "fields": { ...acf fields... } }`
- Note: Some ACF versions use `/wp-json/wp/v2/pages/{page_id}` with `acf` in body

**Check if Page Exists**:
- `GET /wp-json/wp/v2/pages?slug={slug}`
- Returns: Array of pages (empty if doesn't exist)

---

## Slack Approval Workflow

### Preview Message Format

```
🔵 WordPress Page Ready for Review

📄 Type: {Service Page | FAQ | Glossary | Case Study}
📝 Title: {page_title}
🔗 Slug: tax4us.co.il/{slug}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PREVIEW:

{Formatted preview of content, truncated to ~500 words}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Details:
• Word Count: {count}
• ACF Fields: {field_count}
• Category: {category}
• Target Audience: {audience}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ This approval expires in 24 hours
```

**Buttons**:
- ✅ Approve & Publish
- ❌ Reject with Feedback
- ✏️ Edit Before Publishing (optional)

**Rejection Flow**:
1. User clicks "Reject with Feedback"
2. Slack opens modal with textarea
3. User enters feedback (e.g., "Tone too formal, needs more examples")
4. Workflow saves feedback to context7
5. Workflow regenerates content with feedback
6. New preview sent to Slack (with feedback noted)

---

## Estimated Node Count

| Node Type | Count | Purpose |
|-----------|-------|---------|
| Airtable Trigger | 1 | Monitor Content_Specs |
| IF | 3 | Content type routing, approval handling |
| context7 | 2 | Fetch history, save context |
| HTTP (Tavily) | 1 | Research |
| OpenAI | 1 | Content generation |
| Code | 5 | ACF payload builder, preview formatter, etc. |
| HTTP (WordPress) | 3 | Check exists, create page, update ACF |
| Slack | 4 | Preview, approval wait, rejection modal, notifications |
| Airtable | 2 | Update status (published, revision) |
| **TOTAL** | **22** | Moderate complexity |

---

## Build Plan

### Step 1: Core Workflow (3-4 hours)
1. Create workflow "WF: WordPress Pages - ACF Content"
2. Add Airtable trigger (Content_Specs table)
3. Add IF node: Filter by content type
4. Add Tavily research node
5. Add OpenAI content generation node
6. Add ACF payload builder (Code node)
7. Add WordPress API integration (3 HTTP nodes)
8. Test with 1 example (Service page)

### Step 2: Slack Approval (2-3 hours)
1. Add Slack preview message
2. Add approval buttons
3. Add wait node (24-hour timeout)
4. Add rejection modal
5. Add reminder logic
6. Test approval/rejection flows

### Step 3: context7 Memory (1-2 hours)
1. Add context7 fetch node
2. Add context7 save node
3. Pass history to OpenAI prompt
4. Test memory persistence

### Step 4: Testing & Refinement (1-2 hours)
1. Test all 4 content types (Service, FAQ, Glossary, Case Study)
2. Verify ACF fields populate correctly
3. Test Hebrew content (if needed)
4. Ben approval testing
5. Edge case handling

**Total Build Time**: 7-11 hours (estimate: 6-8 hours for experienced developer)

---

## Success Criteria

- ✅ Triggers on Airtable status change
- ✅ Generates content for all 4 types (Service, FAQ, Glossary, Case Study)
- ✅ ACF fields populate correctly in WordPress
- ✅ Slack approval workflow functional (approve, reject, timeout)
- ✅ context7 memory prevents repetition
- ✅ Ben approves content quality
- ✅ Pages visible on tax4us.co.il

---

## Risks & Mitigation

### Risk 1: ACF REST API Not Enabled
**Mitigation**: Verify ACF version (5.11+) and REST API option enabled in WordPress settings

### Risk 2: WordPress Authentication Issues
**Mitigation**: Use Application Password (not JWT), test credentials before building workflow

### Risk 3: Complex ACF Field Structures
**Mitigation**: Start with simple fields (text, textarea), add complex fields (repeater, group) incrementally

### Risk 4: Content Quality Issues
**Mitigation**: Use detailed OpenAI prompts with examples, add human approval step

---

## Next Steps

1. ✅ Complete design document (DONE)
2. ⏭️ Verify WordPress ACF REST API access
3. ⏭️ Create workflow shell in Tax4Us n8n Cloud
4. ⏭️ Build Step 1: Core workflow
5. ⏭️ Build Step 2: Slack approval
6. ⏭️ Build Step 3: context7 memory
7. ⏭️ Test with Ben
8. ⏭️ Deploy to production
9. ⏭️ Update Agent 2 note in Boost.space (ID: 291)

---

## Questions for Ben

1. **ACF Configuration**: Are ACF custom fields already configured in WordPress? Or do we need to create field groups?
2. **Page Templates**: Does tax4us.co.il have specific page templates for Services, FAQs, etc.?
3. **Approval Process**: Should all pages require approval? Or only Case Studies (client-facing)?
4. **Publishing**: Publish immediately after approval? Or schedule for specific date/time?
5. **Categories**: Should pages be organized in WordPress categories/taxonomies?
6. **Parent Pages**: Should pages have hierarchy? (e.g., Services > Tax Preparation > Individual)

---

**Ready to build after ACF verification and Ben's input on questions above.**
