#!/usr/bin/env node

/**
 * Main Workflow Generator
 * Generates complete n8n workflows from templates and customer configs
 */

const WorkflowTemplateLoader = require('./workflow-template-loader');
const WorkflowAssembler = require('./workflow-assembler');
const WorkflowValidator = require('./workflow-validator');
const fs = require('fs');
const path = require('path');

class WorkflowGenerator {
  constructor() {
    this.loader = new WorkflowTemplateLoader();
    this.assembler = new WorkflowAssembler();
    this.validator = new WorkflowValidator();
  }

  /**
   * Generate workflow from template and customer config
   * @param {string} templateName - Name of template to use
   * @param {Object} customerConfig - Customer configuration
   * @returns {Object} Generated workflow and validation result
   */
  generate(templateName, customerConfig) {
    console.log(`\n🚀 Generating workflow from template: ${templateName}`);
    console.log(`   Customer: ${customerConfig.customerName || 'Unknown'}`);

    // Load template
    let template;
    try {
      template = this.loader.loadTemplate(templateName);
      console.log(`✅ Loaded template: ${template.name}`);
      console.log(`   Nodes: ${template.workflow?.nodes?.length || 0}`);
    } catch (error) {
      throw new Error(`Failed to load template: ${error.message}`);
    }

    // Assemble workflow
    let workflow;
    try {
      workflow = this.assembler.assembleWorkflow(template, customerConfig);
      console.log(`✅ Assembled workflow: ${workflow.name}`);
    } catch (error) {
      throw new Error(`Failed to assemble workflow: ${error.message}`);
    }

    // Validate workflow
    const validation = this.validator.validate(workflow);
    console.log(`\n📋 Validation Results:`);
    console.log(`   Valid: ${validation.valid ? '✅' : '❌'}`);
    if (validation.errors.length > 0) {
      console.log(`   Errors: ${validation.errors.length}`);
      validation.errors.forEach(err => console.log(`     - ${err}`));
    }
    if (validation.warnings.length > 0) {
      console.log(`   Warnings: ${validation.warnings.length}`);
      validation.warnings.slice(0, 5).forEach(warn => console.log(`     - ${warn}`));
      if (validation.warnings.length > 5) {
        console.log(`     ... and ${validation.warnings.length - 5} more`);
      }
    }

    return {
      workflow,
      validation,
      template: template.name
    };
  }

  /**
   * Save generated workflow to file
   * @param {Object} workflow - Generated workflow
   * @param {string} outputPath - Path to save workflow JSON
   */
  saveWorkflow(workflow, outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Saved workflow to: ${outputPath}`);
  }

  /**
   * Generate workflow and save to file
   */
  generateAndSave(templateName, customerConfig, outputPath) {
    const result = this.generate(templateName, customerConfig);
    this.saveWorkflow(result.workflow, outputPath);
    return result;
  }
}

module.exports = WorkflowGenerator;

// CLI usage
if (require.main === module) {
  const generator = new WorkflowGenerator();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'generate') {
    const templateName = args[1] || 'base-whatsapp-agent';
    const configPath = args[2];
    
    if (!configPath) {
      console.error('❌ Error: Config file path required');
      console.log('\nUsage:');
      console.log('  node generate-workflow.js generate <template-name> <config-file>');
      process.exit(1);
    }

    // Load customer config
    let customerConfig;
    try {
      customerConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error(`❌ Error loading config: ${error.message}`);
      process.exit(1);
    }

    // Generate workflow
    const outputPath = args[3] || `generated-workflows/${customerConfig.customerName || 'workflow'}-${Date.now()}.json`;
    const result = generator.generateAndSave(templateName, customerConfig, outputPath);

    if (!result.validation.valid) {
      console.error('\n❌ Workflow validation failed!');
      process.exit(1);
    }

    console.log('\n✅ Workflow generated successfully!');
  } else if (command === 'list-templates') {
    const templates = generator.loader.listTemplates();
    console.log('Available templates:');
    templates.forEach(t => console.log(`  - ${t}`));
  } else {
    console.log('Usage:');
    console.log('  node generate-workflow.js generate <template-name> <config-file> [output-file]');
    console.log('  node generate-workflow.js list-templates');
  }
}
