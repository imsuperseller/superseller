import json

def finalize_51():
    src_path = "/Users/shaifriedman/New Rensto/rensto/infra/full_restored_final.json"
    with open(src_path, "r") as f:
        wf = json.load(f)
    
    nodes = wf["nodes"]
    connections = wf["connections"]
    
    # 1. Normalize all node names (underscores, no special chars)
    name_map = {}
    for n in nodes:
        old_name = n["name"]
        new_name = old_name.replace(" ", "_").replace("‘", "").replace("’", "").replace("-", "_")
        n["name"] = new_name
        name_map[old_name] = new_name
    
    # 2. Update connections using the map
    new_connections = {}
    for source, targets in connections.items():
        base_source = source.strip('"')
        new_source = name_map.get(base_source, base_source.replace(" ", "_").replace("‘", "").replace("’", "").replace("-", "_"))
        
        updated_targets = {}
        for type_key, outputs in targets.items():
            new_outputs = []
            for target_list in outputs:
                new_target_list = []
                for t_info in target_list:
                    old_t_name = t_info["node"].strip('"')
                    new_t_name = name_map.get(old_t_name, old_t_name.replace(" ", "_").replace("‘", "").replace("’", "").replace("-", "_"))
                    t_info["node"] = new_t_name
                    new_target_list.append(t_info)
                new_outputs.append(new_target_list)
            updated_targets[type_key] = new_outputs
        
        new_connections[new_source] = updated_targets
    
    wf["connections"] = new_connections
    wf["name"] = "Unified Marketplace Master [RESTORED_FINAL_STABLE]"
    wf["settings"] = {
        "callerPolicy": "workflowsFromSameOwner",
        "saveManualExecutions": True,
        "saveExecutionProgress": True,
        "saveDataErrorExecution": "all"
    }
    
    with open("/Users/shaifriedman/New Rensto/rensto/infra/full_restored_stable_v51.json", "w") as f:
        json.dump(wf, f)
    
    print("Stable 51-node JSON generated.")

if __name__ == "__main__":
    finalize_51()
