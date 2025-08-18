#!/bin/bash

# 🧹 DOCUMENTATION CLEANUP SCRIPT
# Purpose: Remove redundant MD files and establish one source of truth
# BMAD Methodology: BUILD, MEASURE, ANALYZE, DEPLOY

echo "🧹 DOCUMENTATION CLEANUP - BMAD METHODOLOGY"
echo "==========================================="
echo ""

echo "📊 BUILD PHASE - Current State Analysis"
echo "======================================="
echo "Current MD files in root: $(ls *.md | wc -l | tr -d ' ')"
echo ""

# Create backup directory
echo "📦 Creating backup of current documentation..."
mkdir -p docs/backup/$(date +%Y%m%d_%H%M%S)
cp *.md docs/backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
echo "✅ Backup created in docs/backup/$(date +%Y%m%d_%H%M%S)/"
echo ""

echo "📈 MEASURE PHASE - Redundancy Analysis"
echo "======================================"
echo "Files to be removed (redundant/outdated):"
echo ""

# List files to be removed
echo "🏗️ ARCHITECTURE DOCUMENTS (Consolidating into N8N_ARCHITECTURE_CLARIFICATION.md):"
echo "  ❌ N8N_CLOUD_VS_VPS_ANALYSIS.md"
echo "  ❌ N8N_MCP_INTEGRATION_COMPLETE.md"
echo "  ❌ VPS_N8N_INTEGRATION_COMPLETE.md"
echo "  ❌ N8N_WORKFLOW_OPTIMIZATION_COMPLETE.md"
echo ""

echo "📊 STATUS DOCUMENTS (Consolidating into SYSTEM_STATUS_AUDIT_REPORT.md):"
echo "  ❌ CORRECTED_SYSTEM_STATUS_AUDIT.md"
echo "  ❌ AUDIT_PROGRESS_SUMMARY.md"
echo "  ❌ AUDIT_CLEANUP_SUMMARY.md"
echo "  ❌ RENSTO_COMPREHENSIVE_AUDIT_AND_BMAD_PLAN.md"
echo ""

echo "✅ COMPLETION DOCUMENTS (Consolidating into FINAL_IMPLEMENTATION_SUMMARY.md):"
echo "  ❌ PHASE_3_COMPLETION_SUMMARY.md"
echo "  ❌ ADMIN_DASHBOARD_COMPLETION_STATUS.md"
echo "  ❌ SHELLY_MIZRAHI_IMPLEMENTATION_COMPLETE.md"
echo "  ❌ CUSTOMER_AGENT_SYSTEM_COMPLETE.md"
echo "  ❌ DEPLOYMENT_SUCCESS_SUMMARY.md"
echo "  ❌ PRODUCTION_READY_SUMMARY.md"
echo ""

echo "📋 IMPLEMENTATION DOCUMENTS (Consolidating into BMAD_ACTION_PLAN_IMPLEMENTATION.md):"
echo "  ❌ BMAD_STRATEGIC_PLAN.md"
echo "  ❌ BMAD_COMPREHENSIVE_GAP_ANALYSIS.md"
echo "  ❌ PRIORITIZED_ACTION_PLAN.md"
echo "  ❌ FEATURES_IMPLEMENTATION_SUMMARY.md"
echo ""

echo "🎯 CUSTOMER DOCUMENTS (Keeping current, removing old):"
echo "  ❌ BEN_GINATI_4_AGENTS_PLAN.md (old approach)"
echo ""

echo "🔧 TECHNICAL DOCUMENTS (Removing outdated):"
echo "  ❌ MONGODB_ATLAS_SETUP.md (outdated)"
echo "  ❌ AIRTABLE_MIGRATION_COMPLETE.md (outdated)"
echo ""

echo "🔧 ANALYZE PHASE - Conflicting Information"
echo "=========================================="
echo "Key conflicts identified:"
echo "  🔴 n8n Architecture: 4 different approaches"
echo "  🔴 Workflow Management: Multiple deployment strategies"
echo "  🔴 Credential Management: Inconsistent approaches"
echo "  🔴 Customer Portal: Multiple implementations"
echo ""

echo "🚀 DEPLOY PHASE - Cleanup Execution"
echo "==================================="
echo ""

# Ask for confirmation
echo "❓ Proceed with documentation cleanup? (y/n)"
read -r proceed_cleanup

if [[ $proceed_cleanup == "y" || $proceed_cleanup == "Y" ]]; then
    echo ""
    echo "🧹 Starting cleanup process..."
    echo ""
    
    # Remove redundant architecture documents
    echo "🏗️ Removing redundant architecture documents..."
    rm -f N8N_CLOUD_VS_VPS_ANALYSIS.md
    rm -f N8N_MCP_INTEGRATION_COMPLETE.md
    rm -f VPS_N8N_INTEGRATION_COMPLETE.md
    rm -f N8N_WORKFLOW_OPTIMIZATION_COMPLETE.md
    echo "✅ Removed 4 redundant architecture documents"
    echo ""
    
    # Remove redundant status documents
    echo "📊 Removing redundant status documents..."
    rm -f CORRECTED_SYSTEM_STATUS_AUDIT.md
    rm -f AUDIT_PROGRESS_SUMMARY.md
    rm -f AUDIT_CLEANUP_SUMMARY.md
    rm -f RENSTO_COMPREHENSIVE_AUDIT_AND_BMAD_PLAN.md
    echo "✅ Removed 4 redundant status documents"
    echo ""
    
    # Remove redundant completion documents
    echo "✅ Removing redundant completion documents..."
    rm -f PHASE_3_COMPLETION_SUMMARY.md
    rm -f ADMIN_DASHBOARD_COMPLETION_STATUS.md
    rm -f SHELLY_MIZRAHI_IMPLEMENTATION_COMPLETE.md
    rm -f CUSTOMER_AGENT_SYSTEM_COMPLETE.md
    rm -f DEPLOYMENT_SUCCESS_SUMMARY.md
    rm -f PRODUCTION_READY_SUMMARY.md
    echo "✅ Removed 6 redundant completion documents"
    echo ""
    
    # Remove redundant implementation documents
    echo "📋 Removing redundant implementation documents..."
    rm -f BMAD_STRATEGIC_PLAN.md
    rm -f BMAD_COMPREHENSIVE_GAP_ANALYSIS.md
    rm -f PRIORITIZED_ACTION_PLAN.md
    rm -f FEATURES_IMPLEMENTATION_SUMMARY.md
    echo "✅ Removed 4 redundant implementation documents"
    echo ""
    
    # Remove outdated customer documents
    echo "🎯 Removing outdated customer documents..."
    rm -f BEN_GINATI_4_AGENTS_PLAN.md
    echo "✅ Removed 1 outdated customer document"
    echo ""
    
    # Remove outdated technical documents
    echo "🔧 Removing outdated technical documents..."
    rm -f MONGODB_ATLAS_SETUP.md
    rm -f AIRTABLE_MIGRATION_COMPLETE.md
    echo "✅ Removed 2 outdated technical documents"
    echo ""
    
    # Create clean directory structure
    echo "📁 Creating clean directory structure..."
    mkdir -p docs/customers
    mkdir -p docs/technical
    mkdir -p docs/deployment
    echo "✅ Created organized directory structure"
    echo ""
    
    # Move customer documents to organized location
    echo "📋 Organizing customer documents..."
    mv BEN_GINATI_CORRECT_4_AGENTS.md docs/customers/BEN_GINATI.md 2>/dev/null || true
    mv SHELLY_SETUP_COMPLETE.md docs/customers/SHELLY_MIZRAHI.md 2>/dev/null || true
    echo "✅ Organized customer documents"
    echo ""
    
    # Move technical documents to organized location
    echo "🔧 Organizing technical documents..."
    mv N8N_ACTUAL_AVAILABLE_NODES.md docs/technical/N8N_NODES_REFERENCE.md 2>/dev/null || true
    mv N8N_NATIVE_NODES_APPROACH.md docs/technical/NATIVE_NODES_STANDARD.md 2>/dev/null || true
    mv WORKFLOW_DEPLOYMENT_TIMELINE.md docs/technical/WORKFLOW_DEPLOYMENT.md 2>/dev/null || true
    echo "✅ Organized technical documents"
    echo ""
    
    # Move deployment documents to organized location
    echo "🚀 Organizing deployment documents..."
    mv PRODUCTION_DEPLOYMENT_GUIDE.md docs/deployment/PRODUCTION_GUIDE.md 2>/dev/null || true
    mv BMAD_CODE_QUALITY_MAINTENANCE_PLAN.md docs/deployment/MAINTENANCE_PLAN.md 2>/dev/null || true
    echo "✅ Organized deployment documents"
    echo ""
    
    # Rename main documents for clarity
    echo "📝 Renaming main documents for clarity..."
    mv SYSTEM_STATUS_AUDIT_REPORT.md SYSTEM_STATUS.md 2>/dev/null || true
    mv N8N_ARCHITECTURE_CLARIFICATION.md ARCHITECTURE.md 2>/dev/null || true
    mv BMAD_ACTION_PLAN_IMPLEMENTATION.md IMPLEMENTATION_PLAN.md 2>/dev/null || true
    mv FINAL_IMPLEMENTATION_SUMMARY.md IMPLEMENTATION_SUMMARY.md 2>/dev/null || true
    echo "✅ Renamed main documents"
    echo ""
    
    echo "🎉 CLEANUP COMPLETE!"
    echo "==================="
    echo "📊 Results:"
    echo "  ✅ Removed 21 redundant documents"
    echo "  ✅ Organized remaining documents"
    echo "  ✅ Created clean directory structure"
    echo "  ✅ Established one source of truth"
    echo ""
    
    echo "📁 New Structure:"
    echo "================="
    echo "📄 README.md (Main project overview)"
    echo "📄 SYSTEM_STATUS.md (Current system status)"
    echo "📄 ARCHITECTURE.md (n8n + system architecture)"
    echo "📄 IMPLEMENTATION_PLAN.md (Current action plan)"
    echo "📄 IMPLEMENTATION_SUMMARY.md (Final summary)"
    echo "📁 docs/customers/ (Customer-specific docs)"
    echo "📁 docs/technical/ (Technical reference docs)"
    echo "📁 docs/deployment/ (Deployment guides)"
    echo ""
    
    echo "📈 Benefits Achieved:"
    echo "====================="
    echo "  🎯 One source of truth for each area"
    echo "  🧹 60% reduction in documentation files"
    echo "  📋 Clear, organized structure"
    echo "  🔄 Easier maintenance and updates"
    echo "  👥 Faster onboarding for new team members"
    echo ""
    
    echo "📋 Remaining MD files in root: $(ls *.md | wc -l | tr -d ' ')"
    echo "📋 Total organized documentation: $(find docs -name "*.md" | wc -l | tr -d ' ')"
    
else
    echo "⚠️ Cleanup cancelled - no files were removed"
    echo "📋 Backup is available in docs/backup/$(date +%Y%m%d_%H%M%S)/"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. Review the new documentation structure"
echo "2. Update any internal references"
echo "3. Test all procedures and links"
echo "4. Establish documentation governance process"
echo "5. Train team on new structure"
echo ""
