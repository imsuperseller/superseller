#!/bin/bash

# Compare workflows across all 3 n8n instances
# Usage: ./compare-instances.sh

cd "$(dirname "$0")/.."

echo "====================================================================="
echo "n8n Instance Comparison"
echo "====================================================================="
echo ""

declare -A instance_data

# Collect data from all instances
for instance in rensto tax4us shelly; do
  result=$(node multi-instance-api.js list-workflows $instance 2>/dev/null)

  if [ $? -eq 0 ]; then
    total=$(echo "$result" | jq '.data | length' 2>/dev/null || echo "0")
    active=$(echo "$result" | jq '.data | map(select(.active==true)) | length' 2>/dev/null || echo "0")
    inactive=$(echo "$result" | jq '.data | map(select(.active==false)) | length' 2>/dev/null || echo "0")

    instance_data["${instance}_total"]=$total
    instance_data["${instance}_active"]=$active
    instance_data["${instance}_inactive"]=$inactive
  else
    instance_data["${instance}_total"]=0
    instance_data["${instance}_active"]=0
    instance_data["${instance}_inactive"]=0
  fi
done

# Display comparison table
printf "%-20s | %-10s | %-10s | %-10s\n" "Instance" "Total" "Active" "Inactive"
echo "---------------------+------------+------------+-----------"

for instance in rensto tax4us shelly; do
  total=${instance_data["${instance}_total"]}
  active=${instance_data["${instance}_active"]}
  inactive=${instance_data["${instance}_inactive"]}

  instance_name=$(echo "$instance" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')

  printf "%-20s | %-10s | %-10s | %-10s\n" "$instance_name" "$total" "$active" "$inactive"
done

echo ""
echo "====================================================================="

# Calculate totals
total_workflows=$((${instance_data["rensto_total"]} + ${instance_data["tax4us_total"]} + ${instance_data["shelly_total"]}))
total_active=$((${instance_data["rensto_active"]} + ${instance_data["tax4us_active"]} + ${instance_data["shelly_active"]}))
total_inactive=$((${instance_data["rensto_inactive"]} + ${instance_data["tax4us_inactive"]} + ${instance_data["shelly_inactive"]}))

echo "Total Workflows: $total_workflows"
echo "Total Active: $total_active"
echo "Total Inactive: $total_inactive"
echo "====================================================================="
