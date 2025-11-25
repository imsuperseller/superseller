import json

def enforce_connections():
    # Load the FULL workflow (not the debug one)
    with open('workflow_fixed.json') as f:
        workflow = json.load(f)
    
    # Define the CORRECT LINEAR PATH
    correct_chain = [
        ('Webhook', 'Message a model'),              # 1. Webhook -> Perplexity
        ('Message a model', 'Message a model1'),     # 2. Perplexity -> Anthropic
        ('Message a model1', 'Parse Script'),        # 3. Anthropic -> Parse Script
        ('Parse Script', 'Generate Video Kie1'),     # 4. Parse -> Generate Video
        ('Generate Video Kie1', 'Return TaskId Immediately'),  # 5. Generate -> Return TaskId
        ('Return TaskId Immediately', 'Respond to Webhook'),   # 6. Return -> Respond
    ]
    
    # CLEAR ALL CONNECTIONS and rebuild from scratch
    workflow['connections'] = {}
    
    # Add each connection in the chain
    for source, target in correct_chain:
        if source not in workflow['connections']:
            workflow['connections'][source] = {'main': [[]]}
        
        workflow['connections'][source]['main'][0].append({
            'node': target,
            'type': 'main',
            'index': 0
        })
        print(f'✓ Connected: {source} → {target}')
    
    # Verify the chain
    print('\n=== VERIFICATION ===')
    for source, target in correct_chain:
        found = False
        if source in workflow['connections']:
            for conn in workflow['connections'][source]['main'][0]:
                if conn['node'] == target:
                    found = True
                    break
        if found:
            print(f'✓ {source} → {target}')
        else:
            print(f'✗ MISSING: {source} → {target}')
    
    # Save clean workflow
    allowed_keys = ['name', 'nodes', 'connections', 'settings']
    clean_workflow = {k: workflow[k] for k in allowed_keys if k in workflow}
    
    with open('workflow_correct_chain.json', 'w') as f:
        json.dump(clean_workflow, f, indent=2)
    print('\nSaved to workflow_correct_chain.json')

if __name__ == "__main__":
    enforce_connections()
