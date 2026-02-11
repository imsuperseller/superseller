import json

def fix_workflow_51():
    # Use the 51-node version
    src_path = "/Users/shaifriedman/New Rensto/rensto/infra/full_restored_final.json"
    with open(src_path, "r") as f:
        wf = json.load(f)
    
    nodes = wf["nodes"]
    connections = wf["connections"]
    
    # Clean up node names (remove my previous corruption if any)
    # Actually, full_restored_final.json should be clean.
    valid_names = {n["name"] for n in nodes}
    
    new_connections = {}
    for source, targets in connections.items():
        # Literal quote rule from healthy workflow
        if " " in source and not source.startswith('"'):
            new_source = f'"{source}"'
        else:
            new_source = source
        
        # Verify source matches a node name (unquoted)
        base_source = source.strip('"')
        if base_source not in valid_names:
            print(f"Warning: Connection source '{base_source}' not found in nodes.")
            
        new_connections[new_source] = targets
        
        # Verify targets
        for type_key, outputs in targets.items():
            for output_idx, target_list in enumerate(outputs):
                for target_info in target_list:
                    t_name = target_info["node"].strip('"')
                    if t_name not in valid_names:
                        print(f"Warning: Connection target '{t_name}' not found in nodes.")
    
    wf["connections"] = new_connections
    wf["settings"] = {
        "callerPolicy": "workflowsFromSameOwner",
        "executionOrder": "v1",
        "saveManualExecutions": True,
        "saveExecutionProgress": True,
        "saveDataErrorExecution": "all"
    }
    wf["name"] = "Unified Marketplace Master [RESTORED_FINAL_v3]"
    
    with open("/Users/shaifriedman/New Rensto/rensto/infra/full_restored_definitive_51.json", "w") as f:
        json.dump(wf, f)
    
    print("Definitive 51-node JSON generated.")

if __name__ == "__main__":
    fix_workflow_51()
