import json
import sys

def inspect_execution(file_path):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        run_data = data.get('data', {}).get('resultData', {}).get('runData', {})
        
        print("Available nodes:", list(run_data.keys()))
        
        nodes_to_inspect = ['Smart Message Router', 'Download a video', 'Analyze video']
        
        for node_name in nodes_to_inspect:
            print(f"\n--- {node_name} ---")
            node_runs = run_data.get(node_name, [])
            if not node_runs:
                print("No execution data found.")
                continue
                
            for i, run in enumerate(node_runs):
                print(f"Run {i+1}:")
                outputs = run.get('data', {}).get('main', [])
                if not outputs:
                    print("  No output data.")
                
                for output_index, output_items in enumerate(outputs):
                    print(f"  Output {output_index}:")
                    for item in output_items:
                        json_data = item.get('json', {})
                        if node_name == 'Smart Message Router':
                            print(f"    mediaInfo: {json_data.get('mediaInfo')}")
                            print(f"    messageType: {json_data.get('messageType')}")
                            print(f"    mediaUrl: {json_data.get('mediaUrl')}")
                        else:
                            # For other nodes, print keys to keep it short
                            print(f"    JSON Keys: {list(json_data.keys())}")
                        
                        binary_data = item.get('binary', {})
                        if binary_data:
                            print(f"    Binary Keys: {list(binary_data.keys())}")
                            for key, val in binary_data.items():
                                print(f"      {key}: mimeType={val.get('mimeType')}, fileName={val.get('fileName')}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_execution("/Users/shaifriedman/New Rensto/rensto/workflows/execution_18752_full.json")
