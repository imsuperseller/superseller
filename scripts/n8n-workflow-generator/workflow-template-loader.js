#!/usr/bin/env node

/**
 * Workflow Template Loader
 * Loads base templates from exported n8n workflows
 */

const fs = require('fs');
const path = require('path');

class WorkflowTemplateLoader {
  constructor(templatesDir = null) {
    this.templatesDir = templatesDir || path.join(__dirname, 'templates');
  }

  /**
   * Load a base template by name
   * @param {string} templateName - Name of the template (e.g., 'base-whatsapp-agent')
   * @returns {Object} Template object with workflow JSON
   */
  loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, `${templateName}.json`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // If template has a reference to an exported workflow, load that
    if (templateData.workflowPath) {
      const workflowPath = path.join(this.templatesDir, templateData.workflowPath);
      if (fs.existsSync(workflowPath)) {
        const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
        templateData.workflow = workflowData;
      }
    }

    return templateData;
  }

  /**
   * Save an exported workflow as a template
   * @param {Object} workflowData - Exported n8n workflow JSON
   * @param {string} templateName - Name for the template
   * @param {Object} metadata - Additional metadata
   */
  saveTemplate(workflowData, templateName, metadata = {}) {
    const template = {
      name: templateName,
      description: metadata.description || `Template extracted from workflow ${workflowData.id}`,
      version: metadata.version || "1.0.0",
      extractedFrom: workflowData.id,
      extractedAt: new Date().toISOString(),
      workflow: workflowData,
      customizableNodes: metadata.customizableNodes || [],
      requiredCredentials: metadata.requiredCredentials || [],
      notes: metadata.notes || ""
    };

    const templatePath = path.join(this.templatesDir, `${templateName}.json`);
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    
    console.log(`✅ Template saved: ${templatePath}`);
    return template;
  }

  /**
   * List all available templates
   * @returns {Array} Array of template names
   */
  listTemplates() {
    if (!fs.existsSync(this.templatesDir)) {
      return [];
    }

    return fs.readdirSync(this.templatesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }
}

module.exports = WorkflowTemplateLoader;

// CLI usage
if (require.main === module) {
  const loader = new WorkflowTemplateLoader();
  const command = process.argv[2];
  const templateName = process.argv[3];

  if (command === 'list') {
    const templates = loader.listTemplates();
    console.log('Available templates:');
    templates.forEach(t => console.log(`  - ${t}`));
  } else if (command === 'load' && templateName) {
    try {
      const template = loader.loadTemplate(templateName);
      console.log(`✅ Loaded template: ${template.name}`);
      console.log(`   Nodes: ${template.workflow?.nodes?.length || 0}`);
      console.log(`   Description: ${template.description}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('Usage:');
    console.log('  node workflow-template-loader.js list');
    console.log('  node workflow-template-loader.js load <template-name>');
  }
}
