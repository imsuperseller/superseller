import json

def fix_workflow():
    # Use the original source of truth
    src_path = "/Users/shaifriedman/New Rensto/rensto/infra/unified_marketplace_master.json"
    with open(src_path, "r") as f:
        wf = json.load(f)
    
    nodes = wf["nodes"]
    connections = wf["connections"]
    
    # 1. Map all names to ensure consistency
    # We will use the names as-is from the 'nodes' array
    valid_names = {n["name"] for n in nodes}
    
    # 2. Fix connections keys
    # n8n seems to prefer names with spaces to be literal-quoted in keys
    new_connections = {}
    for source, targets in connections.items():
        # If the source name has a space and isn't already literal-quoted
        if " " in source and not (source.startswith('"') and source.endswith('"')):
            new_source = f'"{source}"'
        else:
            new_source = source
        
        # Verify the base source name exists in nodes
        base_source = source.strip('"')
        if base_source not in valid_names:
            print(f"Warning: Connection source '{base_source}' not found in nodes.")
            
        new_connections[new_source] = targets
        
        # 3. Fix target node names in the connection values
        for type_key, outputs in targets.items():
            for output_idx, target_list in enumerate(outputs):
                for target_info in target_list:
                    t_name = target_info["node"]
                    if t_name not in valid_names:
                        print(f"Warning: Connection target '{t_name}' not found in nodes.")
    
    wf["connections"] = new_connections
    wf["name"] = "Unified Marketplace Master [DEFINITIVE RESTORE]"
    
    # Ensure settings are present and standard
    if "settings" not in wf:
        wf["settings"] = {}
    wf["settings"]["callerPolicy"] = "workflowsFromSameOwner"
    
    with open("/Users/shaifriedman/New Rensto/rensto/infra/full_restored_definitive.json", "w") as f:
        json.dump(wf, f)
    
    print("Definitive fix JSON generated.")

if __name__ == "__main__":
    fix_workflow()
