import json
import sys

def diag():
    file_path = '/Users/shaifriedman/New Rensto/rensto/infra/full_restored_final_v2.json'
    with open(file_path, 'r') as f:
        wf = json.load(f)
    
    node_names = {n['name'] for n in wf['nodes']}
    connections = wf.get('connections', {})
    
    errors = []
    for source, targets in connections.items():
        if source not in node_names:
            errors.append(f"Source node '{source}' not found in nodes list.")
        for type_key, outputs in targets.items():
            for output_idx, target_list in enumerate(outputs):
                for target_info in target_list:
                    target_node = target_info.get('node')
                    if target_node not in node_names:
                        errors.append(f"Target node '{target_node}' (referenced by '{source}' output {output_idx}) not found in nodes list.")
    
    if not errors:
        print("SUCCESS: All connection references match node names.")
    else:
        print("ERRORS FOUND:")
        for e in errors:
            print(f"- {e}")

if __name__ == "__main__":
    diag()
