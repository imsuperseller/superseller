# Boost.space Marketplace Schema Design

## Overview

The marketplace needs two boost.space modules working together:

1. **`product` module (existing)** - For basic marketplace listings
2. **`business-case` or custom module** - For detailed workflow data, metadata, and generalization info

---

## Option 1: Use Existing `product` Module (Recommended)

**Advantages**:
- Already exists in Space 39
- Has built-in pricing fields
- Has status system (Active/Inactive)
- Can add custom fields for marketplace-specific data

**Custom Fields to Add**:

```json
{
  "customFields": [
    {
      "name": "workflow_id",
      "type": "text",
      "description": "n8n workflow ID"
    },
    {
      "name": "workflow_name",
      "type": "text",
      "description": "Original workflow name from n8n"
    },
    {
      "name": "workflow_json",
      "type": "textarea",
      "description": "Generalized workflow JSON (sanitized)"
    },
    {
      "name": "template_variables",
      "type": "textarea",
      "description": "JSON array of variables user needs to configure"
    },
    {
      "name": "slug",
      "type": "text",
      "description": "URL-friendly slug for product page"
    },
    {
      "name": "category",
      "type": "select",
      "options": ["Lead Generation", "Customer Support", "E-commerce", "Marketing", "Sales", "Operations", "Data Processing", "Integration"],
      "description": "Marketplace category"
    },
    {
      "name": "complexity_score",
      "type": "number",
      "description": "1-10 complexity rating"
    },
    {
      "name": "node_count",
      "type": "number",
      "description": "Number of nodes in workflow"
    },
    {
      "name": "integration_count",
      "type": "number",
      "description": "Number of external integrations"
    },
    {
      "name": "required_tools",
      "type": "textarea",
      "description": "JSON array of tools/services required"
    },
    {
      "name": "setup_time_minutes",
      "type": "number",
      "description": "Estimated setup time"
    },
    {
      "name": "build_time_hours",
      "type": "number",
      "description": "Estimated time to build from scratch"
    },
    {
      "name": "diy_price",
      "type": "number",
      "description": "DIY template download price"
    },
    {
      "name": "full_service_price",
      "type": "number",
      "description": "Full installation service price"
    },
    {
      "name": "subscription_price",
      "type": "number",
      "description": "Optional monthly subscription price"
    },
    {
      "name": "setup_guide_md",
      "type": "textarea",
      "description": "Markdown setup guide"
    },
    {
      "name": "configuration_steps",
      "type": "textarea",
      "description": "JSON array of config steps"
    },
    {
      "name": "demo_video_url",
      "type": "text",
      "description": "URL to demo video"
    },
    {
      "name": "screenshot_urls",
      "type": "textarea",
      "description": "JSON array of screenshot URLs"
    },
    {
      "name": "total_sales",
      "type": "number",
      "description": "Total number of sales",
      "default": 0
    },
    {
      "name": "total_revenue",
      "type": "number",
      "description": "Total revenue generated",
      "default": 0
    },
    {
      "name": "average_rating",
      "type": "number",
      "description": "Average customer rating",
      "default": 0
    },
    {
      "name": "review_count",
      "type": "number",
      "description": "Number of reviews",
      "default": 0
    },
    {
      "name": "seo_keywords",
      "type": "textarea",
      "description": "Comma-separated SEO keywords"
    },
    {
      "name": "meta_description",
      "type": "text",
      "description": "SEO meta description"
    },
    {
      "name": "tags",
      "type": "textarea",
      "description": "JSON array of tags"
    },
    {
      "name": "marketplace_status",
      "type": "select",
      "options": ["draft", "pending_review", "pricing_pending", "published", "archived"],
      "description": "Marketplace publishing status"
    },
    {
      "name": "published_date",
      "type": "datetime",
      "description": "Date workflow was published"
    },
    {
      "name": "pricing_approved",
      "type": "boolean",
      "description": "Whether pricing was approved via WhatsApp",
      "default": false
    },
    {
      "name": "pricing_approved_by",
      "type": "text",
      "description": "Who approved the pricing"
    },
    {
      "name": "pricing_approved_date",
      "type": "datetime",
      "description": "When pricing was approved"
    },
    {
      "name": "generalization_status",
      "type": "select",
      "options": ["pending", "in_progress", "completed", "failed"],
      "description": "Status of AI generalization process"
    },
    {
      "name": "generalization_notes",
      "type": "textarea",
      "description": "Notes from generalization agent"
    },
    {
      "name": "original_workflow_json",
      "type": "textarea",
      "description": "Original workflow JSON before generalization"
    }
  ]
}
```

---

## Recommended Approach

**Use existing `product` module with custom fields**

**Steps**:

1. Add custom fields to `product` module via boost.space
2. Create marketplace products in Space 39 or new Space 51
3. Use `business-case` module for detailed workflow metadata if needed

---

## Next Steps

1. Create schema in boost.space with custom fields
2. Build n8n workflow to populate records
3. Test with 1 workflow first
4. Scale to all 5 workflows
