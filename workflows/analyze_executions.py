#!/usr/bin/env python3
"""
Analyze recent executions to identify all failure patterns.
"""
import requests
import json

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ"
BASE_URL = "https://n8n.rensto.com/api/v1"

headers = {"X-N8N-API-KEY": API_KEY}

# Get recent executions
resp = requests.get(f"{BASE_URL}/executions?workflowId=eQSCUFw91oXLxtvn&limit=10&includeData=true", headers=headers)
executions = resp.json()['data']

results = []
for ex in executions[:8]:  # Analyze last 8
    try:
        run_data = ex['data']['resultData']['runData']
        router_data = run_data.get('Smart Message Router', [{}])[0].get('data', {}).get('main', [[{}]])[0][0].get('json', {})
        
        msg_type = router_data.get('messageType', 'unknown')
        text = (router_data.get('textContent') or router_data.get('caption') or '')[:50]
        
        error = ex['data']['resultData'].get('error', {})
        error_msg = error.get('message', 'none')[:100] if error else 'none'
        
        # Check AI response
        ai_response = 'none'
        if 'Rensto AI Agent' in run_data:
            ai_data = run_data['Rensto AI Agent'][0].get('data', {}).get('main', [[{}]])[0][0].get('json', {})
            ai_response = (ai_data.get('output') or ai_data.get('text') or 'none')[:100]
        
        results.append({
            'id': ex['id'],
            'status': ex['status'],
            'messageType': msg_type,
            'text': text,
            'error': error_msg,
            'aiResponse': ai_response
        })
    except Exception as e:
        results.append({'id': ex['id'], 'status': ex['status'], 'error': str(e)})

# Output
for r in results:
    print(json.dumps(r, ensure_ascii=False))
