import json

def renovate_workflow(file_path):
    with open(file_path, 'r') as f:
        wf = json.load(f)
    
    # ID-based mapping to new unique names
    id_map = {
        "8cd71756-1a61-48c0-9557-c050fe13fd7d": "IMG_GEN_1",
        "6ce13b89-3f7c-439e-aebe-f0f04b679718": "IMG_STORE_TASK_1",
        "dee4ca75-43b3-4f1d-be7c-864d610fd3fb": "IMG_WAIT_1",
        "7cbaa589-bd1e-4ba9-a737-90ed037445e1": "IMG_POLL_1",
        "86fbbd4c-0a53-463c-8725-c654534028ca": "IMG_EXTRACT_1",
        "3371a157-8c79-40a5-bc01-86c981d80c2a": "IMG_GEN_2",
        "0c8b37d5-8f91-46f9-8648-5ef173e64368": "IMG_STORE_TASK_2",
        "c5aa4390-3a3b-4b88-9a9c-f0ffdd0fc170": "IMG_WAIT_2",
        "fe08725c-5ed9-41c8-bd02-588a24ad6eac": "IMG_POLL_2",
        "1f8f614f-53b6-412e-bd4f-585e5ff5ef9c": "IMG_EXTRACT_2",
        "4feb9243-018c-4710-bbfa-5a7a8651381a": "IMG_GEN_3",
        "cc1240b0-03f0-44bd-9fe1-4ce4fdf68b64": "IMG_STORE_TASK_3",
        "ec60477a-0887-4511-be1f-afb5792ac77b": "IMG_WAIT_3",
        "eaf50cd4-55e8-4402-b54e-844d95f817a5": "IMG_POLL_3",
        "df33698c-9b05-485a-961e-1ac87bccf7af": "IMG_EXTRACT_3"
    }

    # 1. Update node names and internal JS code references
    old_name_to_new_name = {}
    
    for node in wf['nodes']:
        old_name = node['name']
        if node['id'] in id_map:
            new_name = id_map[node['id']]
            node['name'] = new_name
            old_name_to_new_name[old_name] = new_name
            
            # Update internal JS code if it's a code node
            if node['type'] == 'n8n-nodes-base.code' and 'jsCode' in node['parameters']:
                code = node['parameters']['jsCode']
                # Selective replacement for cross-node calls
                if node['id'] == "6ce13b89-3f7c-439e-aebe-f0f04b679718": # IMG_STORE_TASK_1
                    # No change needed, refers to GENERATE_CONFIG1
                    pass
                elif node['id'] == "0c8b37d5-8f91-46f9-8648-5ef173e64368": # IMG_STORE_TASK_2
                    code = code.replace("$('EXTRACT_IMAGE_URL_')", "$('IMG_EXTRACT_1')")
                    code = code.replace("$('EXTRACT_IMAGE_URL__')", "$('IMG_EXTRACT_1')")
                elif node['id'] == "1f8f614f-53b6-412e-bd4f-585e5ff5ef9c": # IMG_EXTRACT_2
                    code = code.replace("$('STORE_TASK_')", "$('IMG_STORE_TASK_2')")
                    code = code.replace("$('STORE_TASK__2')", "$('IMG_STORE_TASK_2')")
                elif node['id'] == "cc1240b0-03f0-44bd-9fe1-4ce4fdf68b64": # IMG_STORE_TASK_3
                    code = code.replace("$('EXTRACT_')", "$('IMG_EXTRACT_2')")
                elif node['id'] == "df33698c-9b05-485a-961e-1ac87bccf7af": # IMG_EXTRACT_3
                    code = code.replace("$('STORE_TASK_6')", "$('IMG_STORE_TASK_3')")
                node['parameters']['jsCode'] = code
        
        # Also need to fix PARSE_COPY1 code which might refer to old names
        if node['id'] == "aaea0889-6ed4-4511-b69c-3c1b0a7e9b34": # PARSE_COPY1
             code = node['parameters']['jsCode']
             code = code.replace("$('EXTRACT_6')", "$('IMG_EXTRACT_3')")
             node['parameters']['jsCode'] = code

    # 2. Rebuild connections using NEW names
    connections = wf['connections']
    new_connections = {}

    generation_ids = set(id_map.keys())
    generation_names = set(id_map.values())

    for source_name, ports in connections.items():
        # Only keep and translate if the source exists or was renamed
        # IMPORTANT: If it's one of our generation nodes, we will explicitly manage its 'main' out.
        fixed_source = old_name_to_new_name.get(source_name, source_name)
        
        if fixed_source in generation_names:
            # We will handle this in the explicit chain enforcement below
            continue

        new_ports = {}
        for ptype, outputs in ports.items():
            new_outputs = []
            for group in outputs:
                new_group = []
                for link in group:
                    # Translate target node names
                    fixed_target = old_name_to_new_name.get(link['node'], link['node'])
                    link['node'] = fixed_target
                    new_group.append(link)
                new_outputs.append(new_group)
            new_ports[ptype] = new_outputs
        
        new_connections[fixed_source] = new_ports

    # 3. Explicitly enforce the missing/broken links by name
    # Ensure BRANCH_PRODUCT_TYPE1 -> IMG_GEN_1
    if "BRANCH_PRODUCT_TYPE1" in new_connections:
        # Switch output 0 is IMAGE chain
        new_connections["BRANCH_PRODUCT_TYPE1"]["main"][0] = [{"index": 0, "node": "IMG_GEN_1", "type": "main"}]
    
    # Ensure sequential chain
    chain = ["IMG_GEN_1", "IMG_STORE_TASK_1", "IMG_WAIT_1", "IMG_POLL_1", "IMG_EXTRACT_1", 
             "IMG_GEN_2", "IMG_STORE_TASK_2", "IMG_WAIT_2", "IMG_POLL_2", "IMG_EXTRACT_2",
             "IMG_GEN_3", "IMG_STORE_TASK_3", "IMG_WAIT_3", "IMG_POLL_3", "IMG_EXTRACT_3", "PARSE_COPY1"]
    
    for i in range(len(chain) - 1):
        src = chain[i]
        dst = chain[i+1]
        new_connections[src] = {"main": [[{"index": 0, "node": dst, "type": "main"}]]}

    # Final filter: Only allow keys for nodes that actually exist
    actual_names = {node['name'] for node in wf['nodes']}
    wf['connections'] = {k: v for k, v in new_connections.items() if k in actual_names}

    with open('renovated_workflow.json', 'w') as f:
        json.dump(wf, f, indent=2)

if __name__ == "__main__":
    renovate_workflow('/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769497252949.json')
