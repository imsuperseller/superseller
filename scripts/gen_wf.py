import json

wf = {
    "name": "Rensto Internal Content Engine (Official Patched)",
    "nodes": [
        {
            "parameters": {
                "rule": {
                    "interval": [
                        {
                            "field": "weeks",
                            "triggerAtDay": [1, 4],
                            "triggerAtHour": 8,
                            "triggerAtMinute": 30
                        }
                    ]
                }
            },
            "id": "trigger",
            "name": "Mon & Thu 8:30am",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.2,
            "position": [-1000, 0]
        },
        {
            "parameters": {
                "assignments": {
                    "assignments": [
                        { "id": "id-1", "name": "firestoreProjectId", "value": "rensto", "type": "string" },
                        { "id": "id-2", "name": "targetCollection", "value": "content_posts", "type": "string" }
                    ]
                }
            },
            "id": "config",
            "name": "Config",
            "type": "n8n-nodes-base.set",
            "typeVersion": 3.4,
            "position": [-800, 0]
        },
        {
            "parameters": {
                "jsCode": """
const topics = [
  "Leveraging AI RAG for Instant Employee Training",
  "Automating Outbound Lead Generation for SMBs",
  "The Future of Autonomous Voice Secretaries in Customer Service",
  "Building a Scalable AI Content Engine for SEO",
  "Maximizing ROI with AI-Driven Data Enrichment"
];
const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
return [{ json: { topic: topics[seed % topics.length] } }];
"""
            },
            "id": "topic",
            "name": "Topic Selector",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [-600, 0]
        },
        {
            "parameters": {
                "authentication": "oAuth2",
                "operation": "sendAndWait",
                "user": { "__rl": True, "value": "U09F6TB6Q7L", "mode": "list" },
                "message": "*Target Topic:* {{ $json.topic }}\\nApprove?",
                "approvalOptions": {
                    "values": {
                        "approveLabel": "Approve",
                        "disapproveLabel": "Edit"
                    }
                }
            },
            "id": "slack-topic",
            "name": "Topic Approval",
            "type": "n8n-nodes-base.slack",
            "typeVersion": 2.3,
            "position": [-400, 0],
            "credentials": {
                "slackOAuth2Api": { "id": "SzzmIuZvYlH8PQ30", "name": "rensto" }
            }
        },
        {
            "parameters": {
                "promptType": "define",
                "text": "You are Rensto Content Strategist. Create a blog post and SEO metadata for topic: {{ $json.topic }}. Return JSON with title, slug, content, excerpt, categories, tags, seoTitle, seoDescription, image_prompt, video_prompt, linkedin_post, facebook_post."
            },
            "id": "ai",
            "name": "AI Agent",
            "type": "@n8n/n8n-nodes-langchain.agent",
            "typeVersion": 3,
            "position": [-200, 0]
        },
        {
            "parameters": {
                "model": { "__rl": True, "mode": "list", "value": "claude-sonnet-4-20250514" }
            },
            "id": "claude",
            "name": "Claude Model",
            "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            "typeVersion": 1.3,
            "position": [-200, 200],
            "credentials": {
                "anthropicApi": { "id": "bOftv5dScq3IjYQQ", "name": "Anthropic account" }
            }
        },
        {
            "parameters": {
                "jsCode": "const t = $input.first().json.text; const c = t.replace(/```json/g, '').replace(/```/g, '').trim(); return { json: JSON.parse(c) };"
            },
            "id": "parse",
            "name": "Parse AI",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [0, 0]
        },
        {
            "parameters": {
                "authentication": "serviceAccount",
                "operation": "create",
                "projectId": "rensto",
                "collection": "content_posts"
            },
            "id": "fs-create",
            "name": "Firestore: Create",
            "type": "n8n-nodes-base.googleFirebaseCloudFirestore",
            "typeVersion": 1.1,
            "position": [200, 0],
            "credentials": {
                "googleApi": { "id": "HbI3P6PUIe8ATqzp", "name": "Google Service Account account" }
            }
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://api.kie.ai/api/v1/veo/generate",
                "authentication": "genericCredentialType",
                "genericAuthType": "httpHeaderAuth",
                "sendBody": True,
                "specifyBody": "json",
                "jsonBody": "={{ { 'prompt': $json.video_prompt, 'model': 'veo3_fast' } }}",
            },
            "id": "kie-v",
            "name": "Kie.ai: Video",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.3,
            "position": [400, -100],
            "credentials": {
                "httpHeaderAuth": { "id": "kRI7Q7bdV9tEVPNp", "name": "Kie.ai" }
            }
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://api.kie.ai/api/v1/jobs/createTask",
                "authentication": "genericCredentialType",
                "genericAuthType": "httpHeaderAuth",
                "sendBody": True,
                "specifyBody": "json",
                "jsonBody": "={{ { 'model': 'google/nano-banana', 'input': { 'prompt': $json.image_prompt } } }}",
            },
            "id": "kie-i",
            "name": "Kie.ai: Image",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.3,
            "position": [400, 100],
            "credentials": {
                "httpHeaderAuth": { "id": "kRI7Q7bdV9tEVPNp", "name": "Kie.ai" }
            }
        },
        {
            "id": "merge",
            "name": "Merge Media",
            "type": "n8n-nodes-base.merge",
            "typeVersion": 2.1,
            "position": [600, 0],
            "parameters": {
                "mode": "combine",
                "combinationMode": "merge"
            }
        },
        {
            "parameters": {
                "authentication": "oAuth2",
                "operation": "sendAndWait",
                "message": "🚀 *Content Ready*\\n*Title:* {{ $('Parse AI').first().json.title }}\\nApprove publishing?",
                "approvalOptions": {
                    "values": {
                        "approveLabel": "Publish",
                        "disapproveLabel": "Edit"
                    }
                }
            },
            "id": "slack-final",
            "name": "Final Approval",
            "type": "n8n-nodes-base.slack",
            "typeVersion": 2.3,
            "position": [800, 0],
            "credentials": {
                "slackOAuth2Api": { "id": "SzzmIuZvYlH8PQ30", "name": "rensto" }
            }
        },
        {
            "parameters": {
                "postAs": "organization",
                "organization": "urn:li:organization:17903965",
                "text": "={{ $('Parse AI').first().json.linkedin_post }}"
            },
            "id": "li",
            "name": "LinkedIn",
            "type": "n8n-nodes-base.linkedIn",
            "typeVersion": 1,
            "position": [1000, -100],
            "credentials": {
                "linkedInOAuth2Api": { "id": "mf5N0cA0xL4c7tNH", "name": "LinkedIn account" }
            }
        },
        {
            "parameters": {
                "resource": "pagePost",
                "page": "844266372343077",
                "message": "={{ $('Parse AI').first().json.facebook_post }}",
                "link": "https://rensto.com"
            },
            "id": "fb",
            "name": "Facebook",
            "type": "n8n-nodes-base.facebookGraphApi",
            "typeVersion": 1,
            "position": [1000, 100],
            "credentials": {
                "facebookGraphApi": { "id": "QsWE2aL68JecATFj", "name": "Facebook Graph account" }
            }
        }
    ],
    "connections": {
        "Mon & Thu 8:30am": { "main": [[{ "node": "Config", "type": "main", "index": 0 }]] },
        "Config": { "main": [[{ "node": "Topic Selector", "type": "main", "index": 0 }]] },
        "Topic Selector": { "main": [[{ "node": "Topic Approval", "type": "main", "index": 0 }]] },
        "Topic Approval": { "main": [[{ "node": "AI Agent", "type": "main", "index": 0 }]] },
        "AI Agent": { "main": [[{ "node": "Parse AI", "type": "main", "index": 0 }]] },
        "Claude Model": { "ai_languageModel": [[{ "node": "AI Agent", "type": "ai_languageModel", "index": 0 }]] },
        "Parse AI": { "main": [[{ "node": "Firestore: Create", "type": "main", "index": 0 }]] },
        "Firestore: Create": { "main": [[{ "node": "Kie.ai: Video", "type": "main", "index": 0 }, { "node": "Kie.ai: Image", "type": "main", "index": 0 }]] },
        "Kie.ai: Video": { "main": [[{ "node": "Merge Media", "type": "main", "index": 0 }]] },
        "Kie.ai: Image": { "main": [[{ "node": "Merge Media", "type": "main", "index": 1 }]] },
        "Merge Media": { "main": [[{ "node": "Final Approval", "type": "main", "index": 0 }]] },
        "Final Approval": { "main": [[{ "node": "LinkedIn", "type": "main", "index": 0 }, { "node": "Facebook", "type": "main", "index": 0 }]] }
    }
}

with open('/Users/shaifriedman/New Rensto/rensto/workflows/rensto_patched_internal.json', 'w') as f:
    json.dump(wf, f, indent=2)
