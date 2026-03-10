import json

def generate_v5():
    # Base configuration
    wf = {
        "name": "FB Marketplace V5 TITANIUM (ROBUST LOOP)",
        "nodes": [],
        "connections": {},
        "settings": {
            "executionOrder": "v1",
            "saveDataErrorExecution": "all",
            "saveDataSuccessExecution": "all",
            "saveManualExecutions": True,
            "saveExecutionProgress": True,
            "callerPolicy": "workflowsFromSameOwner"
        },
        "staticData": {}
    }

    # Helper to add node
    def add_node(node):
        wf["nodes"].append(node)

    # 1. Triggers
    add_node({
        "id": "trigger_schedule",
        "name": "ACTUAL_START_TRIGGER1",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.1,
        "position": [200, 400],
        "parameters": {"rule": {"interval": [{"field": "minutes", "minutesInterval": 20}]}}
    })
    add_node({
        "id": "trigger_get",
        "name": "MARKETPLACE_API_GET1",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 2,
        "position": [200, 200],
        "parameters": {"path": "v1/marketplace/jobs/:product", "responseMode": "lastNode"}
    })
    add_node({
        "id": "trigger_post",
        "name": "MARKETPLACE_API_POST1",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 2,
        "position": [200, 600],
        "parameters": {"httpMethod": "POST", "path": "v1/marketplace/update/:product", "responseMode": "lastNode"}
    })

    # 2. Global Validation & Context
    add_node({
        "id": "validate_time",
        "name": "VALIDATE_TIME_WINDOW1",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [450, 400],
        "parameters": {
            "jsCode": "const now = new Date();\nconst hour = parseInt(new Intl.DateTimeFormat('en-US', {\n  timeZone: 'America/Chicago',\n  hour: 'numeric',\n  hour12: false\n}).format(now));\nconst isWithinHours = hour >= 7 && hour < 23;\nreturn [\n  { json: { isWithinHours, currentHour: hour, product: 'uad', mode: 'generate' } },\n  { json: { isWithinHours, currentHour: hour, product: 'missparty', mode: 'generate' } }\n];"
        }
    })

    add_node({
        "id": "route_input",
        "name": "ROUTE_PRODUCT_INPUT1",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [650, 400],
        "parameters": {
            "jsCode": "const product = $json.product || $json.params?.product || \"uad\";\nconst mode = $json.mode || $json.body?.mode || \"generate\";\nreturn [{ json: { product, mode } }];"
        }
    })

    add_node({
        "id": "fetch_config",
        "name": "FETCH_FIRESTORE_CONFIG1",
        "type": "n8n-nodes-base.googleFirebaseCloudFirestore",
        "typeVersion": 1.1,
        "position": [850, 400],
        "parameters": {
            "authentication": "serviceAccount",
            "projectId": "rensto",
            "collection": "marketplace_configs",
            "documentId": "={{ $json.product }}"
        },
        "credentials": {"googleApi": {"id": "HbI3P6PUIe8ATqzp", "name": "Google Service Account account"}}
    })

    add_node({
        "id": "check_hours",
        "name": "CHECK_OPERATING_HOURS1",
        "type": "n8n-nodes-base.if",
        "typeVersion": 2.3,
        "position": [1050, 400],
        "parameters": {
            "conditions": [
                {
                    "leftValue": "={{ $node['VALIDATE_TIME_WINDOW1'].json.isWithinHours }}",
                    "operator": {"operation": "true", "singleValue": True, "type": "boolean"}
                }
            ]
        }
    })

    # 3. Branching Logic
    add_node({
        "id": "branch_mode",
        "name": "BRANCH_FLOW_MODE1",
        "type": "n8n-nodes-base.switch",
        "typeVersion": 3.4,
        "position": [1300, 400],
        "parameters": {
            "mode": "expression",
            "output": "={{ [\"generate\", \"api-get\", \"api-update\"].indexOf($node[\"ROUTE_PRODUCT_INPUT1\"].json.mode) }}"
        }
    })

    # 4. Generate Flow Prep
    add_node({
        "id": "prepare_context",
        "name": "PREPARE_CONTEXT1",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1550, 300],
        "parameters": {
            "jsCode": "const config = $node[\"FETCH_FIRESTORE_CONFIG1\"].json;\nconst pick = (arr) => (arr && Array.isArray(arr) && arr.length > 0) ? arr[Math.floor(Math.random() * arr.length)] : null;\n\nconst phoneNumber = pick(config.phoneNumbers) || \"+1-469-814-6509\";\nconst city = pick(config.cities) || \"Dallas, Texas\";\nconst collection = pick(config.collections) || \"Classic\";\nconst basePrice = config.basePrice || 2500;\nconst total = Math.round(basePrice * 1.1 * (0.95 + Math.random() * 0.1));\n\nconst fallbacks = [\n  \"https://static.aiquickdraw.com/tools/example/1767778229847_vlvnwO6j.png\",\n  \"https://static.aiquickdraw.com/tools/example/1767778235468_hdL7eCh2.png\"\n];\nconst refUrls = (config.referenceImages || config.input_urls || fallbacks).filter(u => u != null);\n\nreturn [{ json: { \n  phoneNumber,\n  city,\n  collection,\n  config,\n  ListingPrice: total,\n  uniqueHash: `mp-${config.slug || 'gen'}-${Date.now()}`,\n  input_urls: refUrls,\n  prompt1: config.prompts?.[0] || `Realistic ${config.productName} listing photo, polished finish, 8k resolution`,\n  prompt2: config.prompts?.[1] || `Alternative angle of ${config.productName}, detailed texture`,\n  prompt3: config.prompts?.[2] || `Professional product shot of ${config.productName} in ${city}`\n} }];"
        }
    })

    add_node({
        "id": "gen_copy",
        "name": "GENERATE_LISTING_COPY1",
        "type": "@n8n/n8n-nodes-langchain.anthropic",
        "typeVersion": 1,
        "position": [1776, 300],
        "parameters": {
            "modelId": {"__rl": True, "mode": "list", "value": "claude-sonnet-4-5-20250929"},
            "messages": {
                "values": [
                    {
                        "content": "={{ 'Create a Facebook Marketplace listing for ' + $json.config.productName + '.\\n\\nDETAILS: ' + JSON.stringify($json) + '\\n\\nGenerate catching title and description. Include ' + $json.phoneNumber + ' prominently. Return JSON { \"title\": \"...\", \"description\": \"...\" }' }}"
                    }
                ]
            }
        },
        "credentials": {"anthropicApi": {"id": "Mi6bprya2ly47Vry", "name": "szender"}}
    })

    # 5. Image generation blocks (3 images)
    current_pos_x = 2100
    for i in range(1, 4):
        # Create Task
        add_node({
            "id": f"img_gen_{i}",
            "name": f"IMG_GEN_{i}",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [current_pos_x, 300],
            "parameters": {
                "method": "POST",
                "url": "https://api.kie.ai/api/v1/jobs/createTask",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Authorization", "value": "Bearer 6bb5a5733b79dc30f42ea4ab6a95b9a0"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "specifyBody": "json",
                "jsonBody": "={{ JSON.stringify({ \"model\": \"flux-2/pro-image-to-image\", \"input\": { \"input_urls\": $node[\"PREPARE_CONTEXT1\"].json.input_urls, \"prompt\": $node[\"PREPARE_CONTEXT1\"].json.prompt" + str(i) + ", \"aspect_ratio\": \"1:1\", \"resolution\": \"1K\" } }) }}",
                "options": {}
            }
        })

        # Poll Status
        add_node({
            "id": f"img_poll_{i}",
            "name": f"IMG_POLL_{i}",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [current_pos_x + 224, 300],
            "parameters": {
                "url": "=https://api.kie.ai/api/v1/jobs/recordInfo?taskId={{ $node[\"IMG_GEN_" + str(i) + "\"].json.data.taskId }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Authorization", "value": "Bearer 6bb5a5733b79dc30f42ea4ab6a95b9a0"}]},
                "options": {}
            }
        })

        # Check Status & Retry
        add_node({
            "id": f"img_check_{i}",
            "name": f"IMG_CHECK_{i}",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [current_pos_x + 448, 300],
            "parameters": {
                "jsCode": "const data = $input.item.json.data;\nconst retryCount = $json.retryCount || 0;\nconst ready = data.state === 'success';\nconst failed = data.state === 'fail' || data.state === 'failed' || retryCount >= 20;\n\nconsole.log(`Image " + str(i) + " Polling: ready=${ready}, retry=${retryCount}`);\n\nreturn { json: { \n  ready, \n  failed, \n  retryCount: retryCount + 1, \n  data, \n  url: ready ? JSON.parse(data.resultJson).resultUrls[0] : null \n} };"
            }
        })

        # Is Ready?
        add_node({
            "id": f"img_ready_{i}",
            "name": f"IMG_READY_{i}",
            "type": "n8n-nodes-base.if",
            "typeVersion": 2.2,
            "position": [current_pos_x + 672, 200],
            "parameters": {
                "conditions": {"conditions": [{"leftValue": "={{ $json.ready }}", "operator": {"operation": "true", "singleValue": True, "type": "boolean"}}]}
            }
        })

        # Wait
        add_node({
            "id": f"img_wait_{i}",
            "name": f"IMG_WAIT_{i}",
            "type": "n8n-nodes-base.wait",
            "typeVersion": 1.1,
            "position": [current_pos_x + 896, 400],
            "parameters": {"amount": 5}
        })

        current_pos_x += 1200

    # 6. Final Steps
    add_node({
        "id": "parse_copy",
        "name": "PARSE_COPY1",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [current_pos_x, 300],
        "parameters": {
            "jsCode": "const ctx = $node[\"PREPARE_CONTEXT1\"].json;\nconst claude = $node[\"GENERATE_LISTING_COPY1\"].json;\nconst img1 = $node[\"IMG_CHECK_1\"].json.url || '';\nconst img2 = $node[\"IMG_CHECK_2\"].json.url || '';\nconst img3 = $node[\"IMG_CHECK_3\"].json.url || '';\n\nlet title = ctx.config.productName;\nlet desc = ctx.config.productName + ' available now!';\ntry {\n  const p = JSON.parse(claude.message.content[0].text.match(/\\{[\\s\\S]*\\}/)[0]);\n  title = p.title || title;\n  desc = p.description || desc;\n} catch(e) {}\n\nreturn [{ json: { \n  ...ctx, \n  ListingTitle: title, \n  ListingDescription: desc, \n  Image_URL: img1, \n  Image_URL2: img2, \n  Image_URL3: img3,\n  Status: 'Ready'\n} }];"
        }
    })

    add_node({
        "id": "save_to_table",
        "name": "SAVE_TO_DATA_TABLE1",
        "type": "n8n-nodes-base.dataTable",
        "typeVersion": 1.1,
        "position": [current_pos_x + 224, 300],
        "parameters": {
            "operation": "upsert",
            "dataTableId": {"__rl": True, "mode": "id", "value": "={{ $node[\"FETCH_FIRESTORE_CONFIG1\"].json.tableId }}"},
            "filters": {"conditions": [{"keyName": "hash", "keyValue": "={{ $json.uniqueHash }}"}]},
            "columns": {"mappingMode": "defineBelow", "value": {"Status": "Ready", "hash": "={{ $json.uniqueHash }}", "ListingTitle": "={{ $json.ListingTitle }}", "ListingDescription": "={{ $json.ListingDescription }}", "Image_URL": "={{ $json.Image_URL }}", "Image_URL2": "={{ $json.Image_URL2 }}", "Image_URL3": "={{ $json.Image_URL3 }}", "ListingPrice": "={{ $json.ListingPrice }}", "PhoneNumber": "={{ $json.phoneNumber }}", "Location": "={{ $json.city }}"}}
        }
    })

    # 7. Helper paths (Not implemented fully for brevity, but let's add placeholders)
    add_node({"id": "api_get", "name": "API_GET_PENDING_ROW1", "type": "n8n-nodes-base.dataTable", "typeVersion": 1.1, "position": [1550, 500], "parameters": {"operation": "get", "dataTableId": {"__rl": True, "mode": "list", "value": "={{ $node[\"FETCH_FIRESTORE_CONFIG1\"].json.dataTableId }}"}, "filters": {"conditions": [{"keyName": "Status", "keyValue": "Ready"}]}}})
    add_node({"id": "api_update", "name": "API_UPDATE_ROW1", "type": "n8n-nodes-base.dataTable", "typeVersion": 1.1, "position": [1550, 700], "parameters": {"operation": "update", "dataTableId": {"__rl": True, "mode": "list", "value": "={{ $node[\"FETCH_FIRESTORE_CONFIG1\"].json.dataTableId }}"}, "filters": {"conditions": [{"keyName": "Image_URL", "keyValue": "={{ $node[\"MARKETPLACE_API_POST1\"].json.body.imageUrl }}"}]}, "columns": {"mappingMode": "defineBelow", "schema": [{"displayName": "Status", "id": "Status", "type": "string"}], "value": {"Status": "={{ $node[\"MARKETPLACE_API_POST1\"].json.body.status }}"}}}})

    # Connections
    wf["connections"] = {
        "ACTUAL_START_TRIGGER1": {"main": [[{"node": "VALIDATE_TIME_WINDOW1", "type": "main", "index": 0}]]},
        "MARKETPLACE_API_GET1": {"main": [[{"node": "VALIDATE_TIME_WINDOW1", "type": "main", "index": 0}]]},
        "MARKETPLACE_API_POST1": {"main": [[{"node": "VALIDATE_TIME_WINDOW1", "type": "main", "index": 0}]]},
        "VALIDATE_TIME_WINDOW1": {"main": [[{"node": "ROUTE_PRODUCT_INPUT1", "type": "main", "index": 0}]]},
        "ROUTE_PRODUCT_INPUT1": {"main": [[{"node": "FETCH_FIRESTORE_CONFIG1", "type": "main", "index": 0}]]},
        "FETCH_FIRESTORE_CONFIG1": {"main": [[{"node": "CHECK_OPERATING_HOURS1", "type": "main", "index": 0}]]},
        "CHECK_OPERATING_HOURS1": {"main": [[{"node": "BRANCH_FLOW_MODE1", "type": "main", "index": 0}]]},
        "BRANCH_FLOW_MODE1": {"main": [
            [{"node": "PREPARE_CONTEXT1", "type": "main", "index": 0}],
            [{"node": "API_GET_PENDING_ROW1", "type": "main", "index": 0}],
            [{"node": "API_UPDATE_ROW1", "type": "main", "index": 0}]
        ]},
        "PREPARE_CONTEXT1": {"main": [[{"node": "GENERATE_LISTING_COPY1", "type": "main", "index": 0}]]},
        "GENERATE_LISTING_COPY1": {"main": [[{"node": "IMG_GEN_1", "type": "main", "index": 0}]]},
    }

    # Connect image loops
    for i in range(1, 4):
        wf["connections"][f"IMG_GEN_{i}"] = {"main": [[{"node": f"IMG_POLL_{i}", "type": "main", "index": 0}]]}
        wf["connections"][f"IMG_POLL_{i}"] = {"main": [[{"node": f"IMG_CHECK_{i}", "type": "main", "index": 0}]]}
        wf["connections"][f"IMG_CHECK_{i}"] = {"main": [[{"node": f"IMG_READY_{i}", "type": "main", "index": 0}]]}
        
        # Branch from "Is Ready?"
        if i < 3:
            wf["connections"][f"IMG_READY_{i}"] = {"main": [
                [{"node": f"IMG_GEN_{i+1}", "type": "main", "index": 0}], # Ready
                [{"node": f"IMG_WAIT_{i}", "type": "main", "index": 0}]   # Not Ready
            ]}
        else:
            wf["connections"][f"IMG_READY_{i}"] = {"main": [
                [{"node": "PARSE_COPY1", "type": "main", "index": 0}],    # Ready
                [{"node": f"IMG_WAIT_{i}", "type": "main", "index": 0}]   # Not Ready
            ]}
        
        # Loop back from "Wait"
        wf["connections"][f"IMG_WAIT_{i}"] = {"main": [[{"node": f"IMG_POLL_{i}", "type": "main", "index": 0}]]}

    wf["connections"]["PARSE_COPY1"] = {"main": [[{"node": "SAVE_TO_DATA_TABLE1", "type": "main", "index": 0}]]}

    with open('v5_deploy.json', 'w') as f:
        json.dump(wf, f, indent=2)

if __name__ == "__main__":
    generate_v5()
