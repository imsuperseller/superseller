#!/usr/bin/env python3
"""
Monday.com Duplicate Analysis for wonder.care board
Analyzes all items and finds duplicates based on patient names
"""

import requests
import json
from collections import defaultdict
from datetime import datetime

# Monday.com API configuration
API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ2MTU0NDU3MywiYWFpIjoxMSwidWlkIjo2NzM4Mzk1MywiaWFkIjoiMjAyNS0wMS0yMlQxNToxOTo0Mi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjU5OTE4OTMsInJnbiI6InVzZTEifQ.mLJfk99Toj8CPxybC2_ihHCxEQu9jq0NHF6nNyOHc3E"
BOARD_ID = "9021789808"
API_URL = "https://api.monday.com/v2"

def query_monday_api(query):
    """Execute GraphQL query against Monday.com API"""
    headers = {
        "Authorization": API_KEY,
        "Content-Type": "application/json"
    }
    
    response = requests.post(API_URL, json={"query": query}, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"API Error: {response.status_code}")
        print(response.text)
        return None

def get_all_board_items():
    """Get all items from the board with pagination"""
    all_items = []
    page = 1
    limit = 100
    
    while True:
        query = f"""
        query {{
            boards(ids: ["{BOARD_ID}"]) {{
                items_page(limit: {limit}, page: {page}) {{
                    items {{
                        id
                        name
                        created_at
                        updated_at
                        column_values {{
                            id
                            text
                        }}
                    }}
                    cursor
                }}
            }}
        }}
        """
        
        result = query_monday_api(query)
        if not result or "data" not in result:
            break
            
        items = result["data"]["boards"][0]["items_page"]["items"]
        if not items:
            break
            
        all_items.extend(items)
        print(f"Fetched page {page}: {len(items)} items")
        
        # Check if there are more pages
        cursor = result["data"]["boards"][0]["items_page"].get("cursor")
        if not cursor:
            break
            
        page += 1
    
    return all_items

def find_duplicates(items):
    """Find duplicate items based on patient name (text_mkqa8gn7)"""
    patient_groups = defaultdict(list)
    
    for item in items:
        # Find patient name column (text_mkqa8gn7)
        patient_name = None
        for col in item["column_values"]:
            if col["id"] == "text_mkqa8gn7":
                patient_name = col["text"]
                break
        
        if patient_name and patient_name.strip():
            patient_groups[patient_name.strip()].append(item)
    
    # Find groups with duplicates
    duplicates = {}
    for patient_name, items_list in patient_groups.items():
        if len(items_list) > 1:
            duplicates[patient_name] = items_list
    
    return duplicates

def analyze_duplicates(duplicates):
    """Analyze and display duplicate information"""
    print(f"\n🔍 DUPLICATE ANALYSIS REPORT")
    print(f"=" * 60)
    print(f"Total duplicate groups found: {len(duplicates)}")
    
    total_duplicate_items = sum(len(items) for items in duplicates.values())
    print(f"Total duplicate items: {total_duplicate_items}")
    
    print(f"\n📋 DETAILED DUPLICATE BREAKDOWN:")
    print(f"=" * 60)
    
    delete_commands = []
    
    for patient_name, items in duplicates.items():
        print(f"\n👤 Patient: {patient_name}")
        print(f"   Duplicate count: {len(items)}")
        
        # Sort by creation date
        sorted_items = sorted(items, key=lambda x: x["created_at"])
        
        for i, item in enumerate(sorted_items):
            created_date = datetime.fromisoformat(item["created_at"].replace('Z', '+00:00'))
            status = "🟢 KEEP (oldest)" if i == 0 else "🔴 DELETE (duplicate)"
            
            print(f"   {i+1}. Item ID: {item['id']}")
            print(f"      Name: {item['name']}")
            print(f"      Created: {created_date.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"      Status: {status}")
            
            # Add to delete list if not the oldest
            if i > 0:
                delete_commands.append({
                    "patient_name": patient_name,
                    "item_id": item["id"],
                    "item_name": item["name"],
                    "created_at": item["created_at"]
                })
    
    return delete_commands

def generate_delete_script(delete_commands):
    """Generate a script to delete duplicates"""
    print(f"\n🗑️  DELETE SCRIPT GENERATION:")
    print(f"=" * 60)
    
    if not delete_commands:
        print("No items to delete!")
        return
    
    print(f"Items to delete: {len(delete_commands)}")
    
    # Generate Python script
    script_content = f'''#!/usr/bin/env python3
"""
Auto-generated script to delete duplicate items from Monday.com board
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

import requests
import json

API_KEY = "{API_KEY}"
API_URL = "https://api.monday.com/v2"

def delete_item(item_id):
    """Delete an item from Monday.com"""
    headers = {{
        "Authorization": API_KEY,
        "Content-Type": "application/json"
    }}
    
    query = f"""
    mutation {{
        delete_item(item_id: {item_id}) {{
            id
        }}
    }}
    """
    
    response = requests.post(API_URL, json={{"query": query}}, headers=headers)
    return response.json()

# Items to delete:
items_to_delete = {json.dumps(delete_commands, indent=2)}

print("Starting deletion process...")
for item in items_to_delete:
    print(f"Deleting: {{item['patient_name']}} - {{item['item_name']}} ({{item['item_id']}})")
    result = delete_item(item['item_id'])
    print(f"Result: {{result}}")
    print("-" * 50)

print("Deletion process completed!")
'''
    
    with open("delete_duplicates.py", "w") as f:
        f.write(script_content)
    
    print(f"✅ Generated delete_duplicates.py script")
    print(f"📝 To execute deletions, run: python3 delete_duplicates.py")

def main():
    """Main function to find and analyze duplicates"""
    print("🚀 Starting Monday.com Duplicate Analysis...")
    print(f"Board ID: {BOARD_ID}")
    print(f"Board Name: מידע מבק אופיס")
    
    # Get all items from board
    print("\n📥 Fetching all board items...")
    items = get_all_board_items()
    
    if not items:
        print("❌ No items found or API error")
        return
    
    print(f"✅ Found {len(items)} total items")
    
    # Find duplicates
    print("\n🔍 Analyzing for duplicates...")
    duplicates = find_duplicates(items)
    
    if not duplicates:
        print("✅ No duplicates found!")
        return
    
    # Analyze and display results
    delete_commands = analyze_duplicates(duplicates)
    
    # Generate delete script
    generate_delete_script(delete_commands)
    
    print(f"\n📊 SUMMARY:")
    print(f"=" * 60)
    print(f"Total items analyzed: {len(items)}")
    print(f"Duplicate groups: {len(duplicates)}")
    print(f"Items to delete: {len(delete_commands)}")
    print(f"Items to keep: {len(items) - len(delete_commands)}")
    
    # Show some statistics
    if duplicates:
        print(f"\n📈 DUPLICATE STATISTICS:")
        print(f"Average duplicates per group: {sum(len(items) for items in duplicates.values()) / len(duplicates):.1f}")
        max_duplicates = max(len(items) for items in duplicates.values())
        print(f"Maximum duplicates in one group: {max_duplicates}")

if __name__ == "__main__":
    main()
