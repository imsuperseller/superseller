#!/usr/bin/env python3
"""
Monday.com Duplicate Deletion Script for wonder.care
Comprehensive script to identify and delete all duplicates from the board

DUPLICATE DEFINITION:
- PRIMARY: Same Patient Name (text_mkqa8gn7) - Keep oldest, delete newer
- SECONDARY: Same Appointment Number (text_mksqd4m0) - Should be unique
- TERTIARY: Same Patient+Date+Nurse combination - Most strict criteria

Generated: 2025-01-22
Board: מידע מבק אופיס (9021789808)
"""

import requests
import json
import time
from collections import defaultdict
from datetime import datetime
import sys

# Monday.com API configuration
API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ2MTU0NDU3MywiYWFpIjoxMSwidWlkIjo2NzM4Mzk1MywiaWFkIjoiMjAyNS0wMS0yMlQxNToxOTo0Mi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjU5OTE4OTMsInJnbiI6InVzZTEifQ.mLJfk99Toj8CPxybC2_ihHCxEQu9jq0NHF6nNyOHc3E"
BOARD_ID = "9021789808"
API_URL = "https://api.monday.com/v2"

# Safety settings
DRY_RUN = False  # Set to False to actually delete items
BATCH_SIZE = 10  # Number of deletions per batch
DELAY_BETWEEN_BATCHES = 2  # Seconds to wait between batches

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
        print(f"❌ API Error: {response.status_code}")
        print(response.text)
        return None

def get_all_board_items():
    """Get all items from the board with pagination"""
    all_items = []
    limit = 500  # Get more items per request
    
    print("📥 Fetching all board items...")
    
    # Try to get all items in one request first
    query = f"""
    query {{
        boards(ids: ["{BOARD_ID}"]) {{
            items_page(limit: {limit}) {{
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
            }}
        }}
    }}
    """
    
    result = query_monday_api(query)
    if result and "data" in result:
        items = result["data"]["boards"][0]["items_page"]["items"]
        all_items.extend(items)
        print(f"   Fetched: {len(items)} items")
    
    print(f"✅ Total items fetched: {len(all_items)}")
    return all_items

def find_duplicates_by_patient_name(items):
    """Find duplicates by patient name (PRIMARY CRITERIA)"""
    patient_groups = defaultdict(list)
    
    for item in items:
        patient_name = None
        for col in item["column_values"]:
            if col["id"] == "text_mkqa8gn7":  # Patient name
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

def find_duplicates_by_appointment_number(items):
    """Find duplicates by appointment number (SECONDARY CRITERIA)"""
    number_groups = defaultdict(list)
    
    for item in items:
        appointment_number = None
        for col in item["column_values"]:
            if col["id"] == "text_mksqd4m0":  # Appointment number
                appointment_number = col["text"]
                break
        
        if appointment_number and appointment_number.strip():
            number_groups[appointment_number.strip()].append(item)
    
    # Find groups with duplicates
    duplicates = {}
    for number, items_list in number_groups.items():
        if len(items_list) > 1:
            duplicates[number] = items_list
    
    return duplicates

def find_duplicates_by_combination(items):
    """Find duplicates by Patient+Date+Nurse combination (TERTIARY CRITERIA)"""
    combo_groups = defaultdict(list)
    
    for item in items:
        patient_name = None
        appointment_date = None
        nurse_name = None
        
        for col in item["column_values"]:
            if col["id"] == "text_mkqa8gn7":  # Patient name
                patient_name = col["text"]
            elif col["id"] == "text_mkrvvskv":  # Appointment date
                appointment_date = col["text"]
            elif col["id"] == "text_mkqaez78":  # Nurse name
                nurse_name = col["text"]
        
        if patient_name and appointment_date and nurse_name:
            combo_key = f"{patient_name}|{appointment_date}|{nurse_name}"
            combo_groups[combo_key].append(item)
    
    # Find groups with duplicates
    duplicates = {}
    for combo_key, items_list in combo_groups.items():
        if len(items_list) > 1:
            duplicates[combo_key] = items_list
    
    return duplicates

def analyze_duplicates(items):
    """Comprehensive duplicate analysis"""
    print("\n🔍 COMPREHENSIVE DUPLICATE ANALYSIS")
    print("=" * 60)
    
    # Find duplicates by different criteria
    patient_duplicates = find_duplicates_by_patient_name(items)
    number_duplicates = find_duplicates_by_appointment_number(items)
    combo_duplicates = find_duplicates_by_combination(items)
    
    print(f"📊 DUPLICATE SUMMARY:")
    print(f"   By Patient Name: {len(patient_duplicates)} groups")
    print(f"   By Appointment Number: {len(number_duplicates)} groups")
    print(f"   By Combination: {len(combo_duplicates)} groups")
    
    # Calculate total items to delete
    total_to_delete = 0
    delete_commands = []
    
    # Process patient name duplicates (PRIMARY)
    print(f"\n👥 PATIENT NAME DUPLICATES (PRIMARY):")
    for patient_name, items_list in patient_duplicates.items():
        sorted_items = sorted(items_list, key=lambda x: x["created_at"])
        print(f"   {patient_name}: {len(items_list)} items")
        
        # Keep oldest, delete rest
        for i, item in enumerate(sorted_items[1:], 1):
            delete_commands.append({
                "type": "patient_name",
                "patient_name": patient_name,
                "item_id": item["id"],
                "item_name": item["name"],
                "created_at": item["created_at"],
                "reason": f"Duplicate patient name (keep oldest)"
            })
            total_to_delete += 1
    
    # Process appointment number duplicates (SECONDARY)
    print(f"\n🔢 APPOINTMENT NUMBER DUPLICATES (SECONDARY):")
    for number, items_list in number_duplicates.items():
        sorted_items = sorted(items_list, key=lambda x: x["created_at"])
        print(f"   Number {number}: {len(items_list)} items")
        
        # Keep oldest, delete rest
        for i, item in enumerate(sorted_items[1:], 1):
            delete_commands.append({
                "type": "appointment_number",
                "appointment_number": number,
                "item_id": item["id"],
                "item_name": item["name"],
                "created_at": item["created_at"],
                "reason": f"Duplicate appointment number (keep oldest)"
            })
            total_to_delete += 1
    
    # Process combination duplicates (TERTIARY)
    print(f"\n🔗 COMBINATION DUPLICATES (TERTIARY):")
    for combo_key, items_list in combo_duplicates.items():
        patient, date, nurse = combo_key.split("|")
        sorted_items = sorted(items_list, key=lambda x: x["created_at"])
        print(f"   {patient} on {date} with {nurse}: {len(items_list)} items")
        
        # Keep oldest, delete rest
        for i, item in enumerate(sorted_items[1:], 1):
            delete_commands.append({
                "type": "combination",
                "combination": combo_key,
                "item_id": item["id"],
                "item_name": item["name"],
                "created_at": item["created_at"],
                "reason": f"Duplicate combination (keep oldest)"
            })
            total_to_delete += 1
    
    print(f"\n📊 FINAL SUMMARY:")
    print(f"   Total items to delete: {total_to_delete}")
    print(f"   Items to keep: {len(items) - total_to_delete}")
    
    return delete_commands

def delete_item(item_id):
    """Delete an item from Monday.com"""
    headers = {
        "Authorization": API_KEY,
        "Content-Type": "application/json"
    }
    
    query = f"""
    mutation {{
        delete_item(item_id: {item_id}) {{
            id
        }}
    }}
    """
    
    response = requests.post(API_URL, json={"query": query}, headers=headers)
    return response.json()

def execute_deletions(delete_commands):
    """Execute the deletion commands"""
    if not delete_commands:
        print("✅ No items to delete!")
        return
    
    print(f"\n🗑️  EXECUTING DELETIONS")
    print("=" * 60)
    
    if DRY_RUN:
        print("🔒 DRY RUN MODE - No actual deletions will be performed")
        print("   Set DRY_RUN = False to execute actual deletions")
    else:
        print("⚠️  LIVE MODE - Items will be permanently deleted!")
    
    # Group deletions by type for better reporting
    by_type = defaultdict(list)
    for cmd in delete_commands:
        by_type[cmd["type"]].append(cmd)
    
    print(f"\n📋 DELETION PLAN:")
    for delete_type, commands in by_type.items():
        print(f"   {delete_type}: {len(commands)} items")
    
    if DRY_RUN:
        print(f"\n🔍 DRY RUN - Items that would be deleted:")
        for i, cmd in enumerate(delete_commands[:10]):  # Show first 10
            created_date = datetime.fromisoformat(cmd["created_at"].replace('Z', '+00:00'))
            print(f"   {i+1}. {cmd['item_id']} - {cmd['item_name']} ({created_date.strftime('%Y-%m-%d %H:%M')}) - {cmd['reason']}")
        
        if len(delete_commands) > 10:
            print(f"   ... and {len(delete_commands) - 10} more items")
        
        print(f"\n💡 To execute actual deletions:")
        print(f"   1. Review the list above")
        print(f"   2. Set DRY_RUN = False in the script")
        print(f"   3. Run the script again")
        return
    
    # Execute actual deletions
    print(f"\n🚀 Starting deletion process...")
    successful_deletions = 0
    failed_deletions = 0
    
    # Process in batches
    for i in range(0, len(delete_commands), BATCH_SIZE):
        batch = delete_commands[i:i + BATCH_SIZE]
        print(f"\n📦 Processing batch {i//BATCH_SIZE + 1} ({len(batch)} items)...")
        
        for j, cmd in enumerate(batch):
            try:
                print(f"   Deleting {j+1}/{len(batch)}: {cmd['item_id']} - {cmd['item_name']}")
                result = delete_item(cmd['item_id'])
                
                if "data" in result and result["data"]["delete_item"]:
                    print(f"   ✅ Successfully deleted {cmd['item_id']}")
                    successful_deletions += 1
                else:
                    print(f"   ❌ Failed to delete {cmd['item_id']}: {result}")
                    failed_deletions += 1
                
            except Exception as e:
                print(f"   ❌ Error deleting {cmd['item_id']}: {str(e)}")
                failed_deletions += 1
        
        # Wait between batches
        if i + BATCH_SIZE < len(delete_commands):
            print(f"   ⏳ Waiting {DELAY_BETWEEN_BATCHES} seconds before next batch...")
            time.sleep(DELAY_BETWEEN_BATCHES)
    
    print(f"\n📊 DELETION RESULTS:")
    print(f"   ✅ Successful: {successful_deletions}")
    print(f"   ❌ Failed: {failed_deletions}")
    print(f"   📊 Total processed: {successful_deletions + failed_deletions}")

def main():
    """Main function"""
    print("🚀 Monday.com Duplicate Deletion Script")
    print("=" * 60)
    print(f"Board ID: {BOARD_ID}")
    print(f"Board Name: מידע מבק אופיס")
    print(f"Mode: {'DRY RUN' if DRY_RUN else 'LIVE DELETION'}")
    print(f"Batch Size: {BATCH_SIZE}")
    print(f"Delay Between Batches: {DELAY_BETWEEN_BATCHES}s")
    
    # Get all items
    items = get_all_board_items()
    if not items:
        print("❌ No items found or API error")
        return
    
    # Analyze duplicates
    delete_commands = analyze_duplicates(items)
    
    # Execute deletions
    execute_deletions(delete_commands)
    
    print(f"\n✅ Script completed!")
    if DRY_RUN:
        print(f"💡 Remember to set DRY_RUN = False to execute actual deletions")

if __name__ == "__main__":
    main()
