#!/usr/bin/env python3
"""
Monday.com Duplicate Finder
Finds duplicates in the wonder.care board programmatically
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

def get_board_items():
    """Get all items from the board with patient names"""
    query = f"""
    query {{
        boards(ids: ["{BOARD_ID}"]) {{
            items {{
                id
                name
                created_at
                updated_at
                column_values {{
                    id
                    text
                    value
                }}
            }}
        }}
    }}
    """
    
    result = query_monday_api(query)
    if result and "data" in result:
        return result["data"]["boards"][0]["items"]
    return []

def find_duplicates(items):
    """Find duplicate items based on patient name"""
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
    print(f"=" * 50)
    print(f"Total duplicate groups found: {len(duplicates)}")
    
    total_duplicate_items = sum(len(items) for items in duplicates.values())
    print(f"Total duplicate items: {total_duplicate_items}")
    
    print(f"\n📋 DETAILED DUPLICATE BREAKDOWN:")
    print(f"=" * 50)
    
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
    
    return duplicates

def generate_delete_commands(duplicates):
    """Generate Monday.com API commands to delete duplicates"""
    print(f"\n🗑️  DELETE COMMANDS:")
    print(f"=" * 50)
    
    delete_commands = []
    
    for patient_name, items in duplicates.items():
        # Sort by creation date, keep oldest
        sorted_items = sorted(items, key=lambda x: x["created_at"])
        
        # Delete all except the first (oldest)
        for item in sorted_items[1:]:
            delete_commands.append({
                "patient_name": patient_name,
                "item_id": item["id"],
                "item_name": item["name"],
                "created_at": item["created_at"]
            })
    
    print(f"Items to delete: {len(delete_commands)}")
    
    for cmd in delete_commands:
        print(f"\nDELETE: {cmd['patient_name']}")
        print(f"  Item ID: {cmd['item_id']}")
        print(f"  Name: {cmd['item_name']}")
        print(f"  Created: {cmd['created_at']}")
    
    return delete_commands

def main():
    """Main function to find and analyze duplicates"""
    print("🚀 Starting Monday.com Duplicate Analysis...")
    print(f"Board ID: {BOARD_ID}")
    
    # Get all items from board
    print("\n📥 Fetching board items...")
    items = get_board_items()
    
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
    analyze_duplicates(duplicates)
    
    # Generate delete commands
    delete_commands = generate_delete_commands(duplicates)
    
    print(f"\n📊 SUMMARY:")
    print(f"=" * 50)
    print(f"Total items analyzed: {len(items)}")
    print(f"Duplicate groups: {len(duplicates)}")
    print(f"Items to delete: {len(delete_commands)}")
    print(f"Items to keep: {len(items) - len(delete_commands)}")

if __name__ == "__main__":
    main()
