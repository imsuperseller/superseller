#!/usr/bin/env python3
"""
Validate a workflow JSON file: syntax and optional duplicate node names/IDs.
Usage: python validate_workflow_json.py <workflow.json>
"""
import json
import sys
import collections

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_workflow_json.py <workflow.json>")
        sys.exit(1)
    path = sys.argv[1]

    with open(path, "r") as f:
        data = json.load(f)

    print("JSON syntax OK.")

    nodes = data.get("nodes", [])
    if not nodes:
        print("No nodes found.")
        return

    names = [n.get("name") for n in nodes if n.get("name")]
    ids = [n.get("id") for n in nodes if n.get("id")]

    dup_names = [x for x, c in collections.Counter(names).items() if c > 1]
    dup_ids = [x for x, c in collections.Counter(ids).items() if c > 1]

    if dup_names:
        print(f"Duplicate node names: {dup_names}")
    if dup_ids:
        print(f"Duplicate node IDs: {dup_ids}")
    if not dup_names and not dup_ids:
        print("No duplicate names or IDs.")

if __name__ == "__main__":
    main()
