#!/usr/bin/env node

/**
 * EXECUTE FINAL CURSOR CLEANUP
 * 
 * Moves operational files to live systems and cleans up all Cursor residue
 */

import fs from 'fs';
import path from 'path';

class FinalCursorCleanup {
  constructor() {
    this.cleanupResults = {
      movedToLiveSystems: [],
      archived: [],
      deleted: [],
      errors: []
    };
  }

  async startCleanup() {
    console.log('🧹 **STARTING FINAL CURSOR CLEANUP**\n');

    try {
      // Step 1: Move operational scripts to live systems
      await this.moveToLiveSystems();

      // Step 2: Archive experiments
      await this.archiveExperiments();

      // Step 3: Clean up Cursor residue
      await this.cleanupCursorResidue();

      // Step 4: Update references
      await this.updateReferences();

      // Step 5: Generate final report
      this.generateFinalReport();

    } catch (error) {
      console.log(`❌ Cleanup failed: ${error.message}`);
      this.cleanupResults.errors.push(error.message);
    }
  }

  async moveToLiveSystems() {
    console.log('🚀 **MOVING OPERATIONAL FILES TO LIVE SYSTEMS**\n');

    // Create live systems directories
    const liveSystemsDirs = [
      'live-systems/customer-portal',
      'live-systems/admin-portal',
      'live-systems/n8n-system',
      'live-systems/make-system',
      'live-systems/mcp-servers'
    ];

    for (const dir of liveSystemsDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Create data directory for customer portal
    if (!fs.existsSync('live-systems/customer-portal/data')) {
      fs.mkdirSync('live-systems/customer-portal/data', { recursive: true });
    }

    // Create config directory for admin portal
    if (!fs.existsSync('live-systems/admin-portal/config')) {
      fs.mkdirSync('live-systems/admin-portal/config', { recursive: true });
    }

    // Create workflows directory for n8n system
    if (!fs.existsSync('live-systems/n8n-system/workflows')) {
      fs.mkdirSync('live-systems/n8n-system/workflows', { recursive: true });
    }

    // Move customer portal files
    const customerPortalFiles = [
      'scripts/activate-quickbooks-integration.js',
      'scripts/add-missing-email-node.js',
      'scripts/apify-cli-facebook-scraping.js',
      'scripts/audit-admin-dashboard.js',
      'scripts/audit-journey-system-gaps.js',
      'scripts/comprehensive-business-visualization.js',
      'scripts/create-ortal-deliverables.js',
      'scripts/database-capacity-analysis.js',
      'scripts/execute-priority-actions.js',
      'scripts/fix-data-integration-simple.js',
      'scripts/fix-data-integration.js',
      'scripts/generate-massive-mock-data.js',
      'scripts/implement-agent-deployment-automation.js',
      'scripts/implement-automated-onboarding.js',
      'scripts/implement-payment-integration.js',
      'scripts/implement-quickbooks-realtime-integration.js',
      'scripts/implement-shiny-object-prevention.js',
      'scripts/infrastructure-gap-analysis.js',
      'scripts/integrate-rensto-components.js',
      'scripts/magical-disappearing-effects.js',
      'scripts/massive-facebook-scraping.js',
      'scripts/migrate-to-native-nodes.js',
      'scripts/monitor-codebase-health.js',
      'scripts/multi-user-ai-agent-security-optimization.js',
      'scripts/phase1-completion-summary.js',
      'scripts/process-real-apify-data.js',
      'scripts/proper-n8n-management.js',
      'scripts/real-facebook-scraping-ortal.js',
      'scripts/run-ortal-facebook-agent.js',
      'scripts/scrape-all-facebook-groups.js',
      'scripts/security-monitor.js',
      'scripts/setup-lightrag-github-integration.js',
      'scripts/task-management-system.js',
      'scripts/test-lightrag-integration.js',
      'scripts/usage-tracking-dashboard.js',
      'scripts/validate-infrastructure.js',
      'scripts/agents/enhanced-secure-ai-agent.js',
      'scripts/agents/intelligent-onboarding-agent.js',
      'scripts/agents/system-monitoring-agent.js',
      'scripts/automation/billing-automation.js',
      'scripts/automation/marketing-automation.js',
      'scripts/automation/support-automation.js',
      'scripts/business/admin-dashboard-implementation.js',
      'scripts/business/churn-prediction.js',
      'scripts/business/revenue-tracking.js',
      'scripts/business/upsell-opportunities.js',
      'scripts/customer-success/feedback-analysis.js',
      'scripts/customer-success/health-scoring.js',
      'scripts/customer-success/retention-strategies.js',
      'scripts/customer-success/success-metrics.js',
      'scripts/deployment/production-deployment.js',
      'scripts/security/data-protection.js'
    ];

    for (const file of customerPortalFiles) {
      if (fs.existsSync(file)) {
        const targetPath = `live-systems/customer-portal/${path.basename(file)}`;
        fs.copyFileSync(file, targetPath);
        this.cleanupResults.movedToLiveSystems.push({
          from: file,
          to: targetPath,
          system: 'customer-portal'
        });
        console.log(`✅ Moved: ${file} → ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    // Move admin portal files
    const adminPortalFiles = [
      'scripts/cleanup-old-business-processes-files.js',
      'scripts/cleanup-old-customer-files.js',
      'scripts/cleanup-old-infrastructure-files.js',
      'scripts/fix-ortal-delivery-issues.js',
      'scripts/proper-ortal-server.js',
      'scripts/quickbooks-re-authentication.js',
      'scripts/quickbooks-simple-auth.js',
      'scripts/refresh-quickbooks-token.js',
      'scripts/serve-5548-ortal-leads.js',
      'scripts/serve-massive-data.js',
      'scripts/serve-ortal-real-reports.js',
      'scripts/serve-ortal-reports.js',
      'scripts/serve-real-ortal-data.js',
      'scripts/ultimate-codebase-cleanup.js',
      'scripts/wait-for-massive-scraping.js',
      'scripts/agents/secure-ai-agent.js',
      'scripts/security/audit-automation.js'
    ];

    for (const file of adminPortalFiles) {
      if (fs.existsSync(file)) {
        const targetPath = `live-systems/admin-portal/${path.basename(file)}`;
        fs.copyFileSync(file, targetPath);
        this.cleanupResults.movedToLiveSystems.push({
          from: file,
          to: targetPath,
          system: 'admin-portal'
        });
        console.log(`✅ Moved: ${file} → ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    // Move n8n system files
    const n8nSystemFiles = [
      'scripts/fix-critical-infrastructure.js',
      'scripts/shadcn-ui-integration-demo.js',
      'scripts/simple-critical-fix.js',
      'scripts/start-infrastructure-consolidation.js'
    ];

    for (const file of n8nSystemFiles) {
      if (fs.existsSync(file)) {
        const targetPath = `live-systems/n8n-system/${path.basename(file)}`;
        fs.copyFileSync(file, targetPath);
        this.cleanupResults.movedToLiveSystems.push({
          from: file,
          to: targetPath,
          system: 'n8n-system'
        });
        console.log(`✅ Moved: ${file} → ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    // Move make system files
    const makeSystemFiles = [
      'scripts/query-make-modules.js'
    ];

    for (const file of makeSystemFiles) {
      if (fs.existsSync(file)) {
        const targetPath = `live-systems/make-system/${path.basename(file)}`;
        fs.copyFileSync(file, targetPath);
        this.cleanupResults.movedToLiveSystems.push({
          from: file,
          to: targetPath,
          system: 'make-system'
        });
        console.log(`✅ Moved: ${file} → ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    // Move customer data
    const customerDataFiles = [
      'data/customers/ben-ginati/portal-config.json',
      'data/customers/ben-ginati/setup-guide.md',
      'data/customers/shelly-mizrahi/SHELLY_FAMILY_PROFILE_SYSTEM.md',
      'data/customers/shelly-mizrahi/SHELLY_FAMILY_PROFILE_SYSTEM_FIXED.md',
      'data/customers/shelly-mizrahi/SHELLY_WEBHOOK_CONNECTION_GUIDE.md',
      'data/customers/shelly-mizrahi/ai-assistant-prompts.json',
      'data/customers/shelly-mizrahi/family-profile-generated.md',
      'data/customers/shelly-mizrahi/family-profile-template.md',
      'data/customers/shelly-mizrahi/surense-integration.json',
      'data/customers/shelly-mizrahi/surense-webhook-events.json'
    ];

    for (const file of customerDataFiles) {
      if (fs.existsSync(file)) {
        const targetPath = `live-systems/customer-portal/data/${path.basename(file)}`;
        fs.copyFileSync(file, targetPath);
        this.cleanupResults.movedToLiveSystems.push({
          from: file,
          to: targetPath,
          system: 'customer-portal'
        });
        console.log(`✅ Moved: ${file} → ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    // Move config files
    const configFiles = [
      'config/docker',
      'config/editor',
      'config/mcp',
      'config/n8n',
      'config/project-package-lock.json',
      'config/project-package.json'
    ];

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        const targetPath = `live-systems/admin-portal/config/${path.basename(file)}`;
        if (fs.statSync(file).isDirectory()) {
          this.copyDirectory(file, targetPath);
        } else {
          fs.copyFileSync(file, targetPath);
        }
        this.cleanupResults.movedToLiveSystems.push({
          from: file,
          to: targetPath,
          system: 'admin-portal'
        });
        console.log(`✅ Moved: ${file} → ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    // Move workflow files
    const workflowFiles = [
      'workflows/Smart_AI_Blog_Writing_System_for_Gumroad_Download_041225.json',
      'workflows/assets-renewals.json',
      'workflows/contact-intake.json',
      'workflows/facebook-group-scraper-clean.json',
      'workflows/facebook-group-scraper.json',
      'workflows/finance-unpaid-invoices.json',
      'workflows/leads-daily-followups.json',
      'workflows/projects-digest.json',
      'workflows/tax4us_enhanced_wordpress_agent.json'
    ];

    for (const file of workflowFiles) {
      if (fs.existsSync(file)) {
        const targetPath = `live-systems/n8n-system/workflows/${path.basename(file)}`;
        fs.copyFileSync(file, targetPath);
        this.cleanupResults.movedToLiveSystems.push({
          from: file,
          to: targetPath,
          system: 'n8n-system'
        });
        console.log(`✅ Moved: ${file} → ${targetPath}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    console.log(`\n✅ Moved ${this.cleanupResults.movedToLiveSystems.length} files to live systems\n`);
  }

  async archiveExperiments() {
    console.log('📦 **ARCHIVING EXPERIMENTS**\n');

    const experimentsDir = 'experiments';
    if (!fs.existsSync(experimentsDir)) return;

    const archiveDir = 'archived/experiments';
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const files = fs.readdirSync(experimentsDir, { recursive: true });

    for (const file of files) {
      if (typeof file === 'string') {
        const sourcePath = path.join(experimentsDir, file);
        const targetPath = path.join(archiveDir, file);

        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, targetPath);
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }

        this.cleanupResults.archived.push({
          from: sourcePath,
          to: targetPath,
          type: 'experiment'
        });
        console.log(`📦 Archived: ${sourcePath} → ${targetPath}`);
      }
    }

    console.log(`\n✅ Archived ${this.cleanupResults.archived.length} experiment files\n`);
  }

  async cleanupCursorResidue() {
    console.log('🗑️ **CLEANING UP CURSOR RESIDUE**\n');

    // List of files to delete (Cursor residue)
    const filesToDelete = [
      'scripts/activate-quickbooks-integration.js',
      'scripts/add-missing-email-node.js',
      'scripts/apify-cli-facebook-scraping.js',
      'scripts/audit-admin-dashboard.js',
      'scripts/audit-journey-system-gaps.js',
      'scripts/comprehensive-business-visualization.js',
      'scripts/create-ortal-deliverables.js',
      'scripts/database-capacity-analysis.js',
      'scripts/execute-priority-actions.js',
      'scripts/fix-data-integration-simple.js',
      'scripts/fix-data-integration.js',
      'scripts/generate-massive-mock-data.js',
      'scripts/implement-agent-deployment-automation.js',
      'scripts/implement-automated-onboarding.js',
      'scripts/implement-payment-integration.js',
      'scripts/implement-quickbooks-realtime-integration.js',
      'scripts/implement-shiny-object-prevention.js',
      'scripts/infrastructure-gap-analysis.js',
      'scripts/integrate-rensto-components.js',
      'scripts/magical-disappearing-effects.js',
      'scripts/massive-facebook-scraping.js',
      'scripts/migrate-to-native-nodes.js',
      'scripts/monitor-codebase-health.js',
      'scripts/multi-user-ai-agent-security-optimization.js',
      'scripts/phase1-completion-summary.js',
      'scripts/process-real-apify-data.js',
      'scripts/proper-n8n-management.js',
      'scripts/real-facebook-scraping-ortal.js',
      'scripts/run-ortal-facebook-agent.js',
      'scripts/scrape-all-facebook-groups.js',
      'scripts/security-monitor.js',
      'scripts/setup-lightrag-github-integration.js',
      'scripts/task-management-system.js',
      'scripts/test-lightrag-integration.js',
      'scripts/usage-tracking-dashboard.js',
      'scripts/validate-infrastructure.js',
      'scripts/agents/enhanced-secure-ai-agent.js',
      'scripts/agents/intelligent-onboarding-agent.js',
      'scripts/agents/system-monitoring-agent.js',
      'scripts/automation/billing-automation.js',
      'scripts/automation/marketing-automation.js',
      'scripts/automation/support-automation.js',
      'scripts/business/admin-dashboard-implementation.js',
      'scripts/business/churn-prediction.js',
      'scripts/business/revenue-tracking.js',
      'scripts/business/upsell-opportunities.js',
      'scripts/customer-success/feedback-analysis.js',
      'scripts/customer-success/health-scoring.js',
      'scripts/customer-success/retention-strategies.js',
      'scripts/customer-success/success-metrics.js',
      'scripts/deployment/production-deployment.js',
      'scripts/security/data-protection.js',
      'scripts/cleanup-old-business-processes-files.js',
      'scripts/cleanup-old-customer-files.js',
      'scripts/cleanup-old-infrastructure-files.js',
      'scripts/fix-ortal-delivery-issues.js',
      'scripts/proper-ortal-server.js',
      'scripts/quickbooks-re-authentication.js',
      'scripts/quickbooks-simple-auth.js',
      'scripts/refresh-quickbooks-token.js',
      'scripts/serve-5548-ortal-leads.js',
      'scripts/serve-massive-data.js',
      'scripts/serve-ortal-real-reports.js',
      'scripts/serve-ortal-reports.js',
      'scripts/serve-real-ortal-data.js',
      'scripts/ultimate-codebase-cleanup.js',
      'scripts/wait-for-massive-scraping.js',
      'scripts/agents/secure-ai-agent.js',
      'scripts/security/audit-automation.js',
      'scripts/fix-critical-infrastructure.js',
      'scripts/shadcn-ui-integration-demo.js',
      'scripts/simple-critical-fix.js',
      'scripts/start-infrastructure-consolidation.js',
      'scripts/query-make-modules.js'
    ];

    for (const file of filesToDelete) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        this.cleanupResults.deleted.push({
          file: file,
          reason: 'Cursor residue cleanup'
        });
        console.log(`🗑️ Deleted: ${file}`);
      }
    }

    // Delete customer data files (moved to live systems)
    const customerDataToDelete = [
      'data/customers/ben-ginati/portal-config.json',
      'data/customers/ben-ginati/setup-guide.md',
      'data/customers/shelly-mizrahi/SHELLY_FAMILY_PROFILE_SYSTEM.md',
      'data/customers/shelly-mizrahi/SHELLY_FAMILY_PROFILE_SYSTEM_FIXED.md',
      'data/customers/shelly-mizrahi/SHELLY_WEBHOOK_CONNECTION_GUIDE.md',
      'data/customers/shelly-mizrahi/ai-assistant-prompts.json',
      'data/customers/shelly-mizrahi/family-profile-generated.md',
      'data/customers/shelly-mizrahi/family-profile-template.md',
      'data/customers/shelly-mizrahi/surense-integration.json',
      'data/customers/shelly-mizrahi/surense-webhook-events.json'
    ];

    for (const file of customerDataToDelete) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        this.cleanupResults.deleted.push({
          file: file,
          reason: 'Moved to live customer portal'
        });
        console.log(`🗑️ Deleted: ${file}`);
      }
    }

    // Delete config files (moved to live systems)
    const configToDelete = [
      'config/docker',
      'config/editor',
      'config/mcp',
      'config/n8n',
      'config/project-package-lock.json',
      'config/project-package.json'
    ];

    for (const file of configToDelete) {
      if (fs.existsSync(file)) {
        if (fs.statSync(file).isDirectory()) {
          this.deleteDirectory(file);
        } else {
          fs.unlinkSync(file);
        }
        this.cleanupResults.deleted.push({
          file: file,
          reason: 'Moved to live admin portal'
        });
        console.log(`🗑️ Deleted: ${file}`);
      }
    }

    // Delete workflow files (moved to live systems)
    const workflowToDelete = [
      'workflows/Smart_AI_Blog_Writing_System_for_Gumroad_Download_041225.json',
      'workflows/assets-renewals.json',
      'workflows/contact-intake.json',
      'workflows/facebook-group-scraper-clean.json',
      'workflows/facebook-group-scraper.json',
      'workflows/finance-unpaid-invoices.json',
      'workflows/leads-daily-followups.json',
      'workflows/projects-digest.json',
      'workflows/tax4us_enhanced_wordpress_agent.json'
    ];

    for (const file of workflowToDelete) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        this.cleanupResults.deleted.push({
          file: file,
          reason: 'Moved to live n8n system'
        });
        console.log(`🗑️ Deleted: ${file}`);
      }
    }

    // Delete experiments directory (archived)
    if (fs.existsSync('experiments')) {
      this.deleteDirectory('experiments');
      this.cleanupResults.deleted.push({
        file: 'experiments',
        reason: 'Archived to archived/experiments'
      });
      console.log(`🗑️ Deleted: experiments directory`);
    }

    console.log(`\n✅ Deleted ${this.cleanupResults.deleted.length} Cursor residue files\n`);
  }

  async updateReferences() {
    console.log('🔗 **UPDATING REFERENCES**\n');

    // Update references in remaining files
    const filesToUpdate = [
      'README.md',
      'docs/FINAL_MISSION_ACCOMPLISHED_SUMMARY.md'
    ];

    for (const file of filesToUpdate) {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Update references to point to live systems
        content = content.replace(/scripts\//g, 'live-systems/');
        content = content.replace(/data\/customers\//g, 'live-systems/customer-portal/data/');
        content = content.replace(/config\//g, 'live-systems/admin-portal/config/');
        content = content.replace(/workflows\//g, 'live-systems/n8n-system/workflows/');

        fs.writeFileSync(file, content);
        console.log(`✅ Updated references in: ${file}`);
      }
    }

    console.log('\n✅ References updated\n');
  }

  copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);

    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  deleteDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);

        if (fs.statSync(filePath).isDirectory()) {
          this.deleteDirectory(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }

      fs.rmdirSync(dirPath);
    }
  }

  generateFinalReport() {
    console.log('📊 **FINAL CLEANUP REPORT**\n');

    console.log('🚀 **MOVED TO LIVE SYSTEMS**:');
    const systemCounts = {};
    this.cleanupResults.movedToLiveSystems.forEach(item => {
      systemCounts[item.system] = (systemCounts[item.system] || 0) + 1;
    });

    Object.entries(systemCounts).forEach(([system, count]) => {
      console.log(`  - ${system}: ${count} files`);
    });

    console.log('\n📦 **ARCHIVED**:');
    console.log(`  - Experiments: ${this.cleanupResults.archived.length} files`);

    console.log('\n🗑️ **DELETED (CURSOR RESIDUE)**:');
    console.log(`  - Total: ${this.cleanupResults.deleted.length} files`);

    if (this.cleanupResults.errors.length > 0) {
      console.log('\n❌ **ERRORS**:');
      this.cleanupResults.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    // Save detailed cleanup report
    const reportPath = 'docs/FINAL_CURSOR_CLEANUP_REPORT.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.cleanupResults, null, 2));
    console.log(`\n📄 Detailed cleanup report saved to: ${reportPath}`);

    console.log('\n🎉 **FINAL CLEANUP COMPLETE!**');
    console.log('✅ Cursor residue cleaned up');
    console.log('✅ Operational files moved to live systems');
    console.log('✅ Experiments archived');
    console.log('✅ References updated');
    console.log('\n🚀 **READY FOR LIVE SYSTEM DEPLOYMENT!**');
  }
}

// Start cleanup
const cleanup = new FinalCursorCleanup();
cleanup.startCleanup().catch(console.error);
