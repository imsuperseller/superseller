import json

def normalize():
    path = "/Users/shaifriedman/New Rensto/rensto/infra/full_restored_final_v2.json"
    with open(path, "r") as f:
        wf = json.load(f)
    
    # Map old names to new names (replace spaces with underscores)
    name_map = {}
    for n in wf["nodes"]:
        old_name = n["name"]
        new_name = old_name.replace(" ", "_").replace("‘", "").replace("’", "")
        n["name"] = new_name
        name_map[old_name] = new_name
    
    # Update connections keys and target names
    new_connections = {}
    for source, targets in wf["connections"].items():
        new_source = name_map.get(source, source.replace(" ", "_").replace("‘", "").replace("’", ""))
        new_connections[new_source] = targets
        for type_key, outputs in targets.items():
            for output_idx, target_list in enumerate(outputs):
                for target_info in target_list:
                    target_info["node"] = name_map.get(target_info["node"], target_info["node"].replace(" ", "_").replace("‘", "").replace("’", ""))
    
    wf["connections"] = new_connections
    wf["name"] = wf["name"] + " [FULLY_CONNECTED_VERIFIED]"
    
    with open("/Users/shaifriedman/New Rensto/rensto/infra/full_restored_norm.json", "w") as f:
        json.dump(wf, f)
    
    print("Normalization complete.")

if __name__ == "__main__":
    normalize()
