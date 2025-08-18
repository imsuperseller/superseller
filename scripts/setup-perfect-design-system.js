#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * SETUP PERFECT DESIGN SYSTEM
 * 
 * This script sets up the directory structure for the perfect design system
 * and creates example files to demonstrate the workflow.
 */

class PerfectDesignSystemSetup {
  constructor() {
    this.baseDir = '.';
    this.directories = [
      'designs',
      'infinite_ui_cursor',
      'variations',
      'variations3',
      'cursor-rules'
    ];
  }

  async setupDesignSystem() {
    console.log('🎨 SETTING UP PERFECT DESIGN SYSTEM');
    console.log('====================================\n');
    
    try {
      // 1. Create directory structure
      console.log('📁 1. Creating directory structure...');
      await this.createDirectories();
      
      // 2. Create example design.json
      console.log('🎨 2. Creating example design.json...');
      await this.createExampleDesignJson();
      
      // 3. Create example HTML files
      console.log('📄 3. Creating example HTML files...');
      await this.createExampleHTMLFiles();
      
      // 4. Create usage guide
      console.log('📚 4. Creating usage guide...');
      await this.createUsageGuide();
      
      // 5. Create workflow examples
      console.log('🔄 5. Creating workflow examples...');
      await this.createWorkflowExamples();
      
      console.log('\n✅ PERFECT DESIGN SYSTEM SETUP COMPLETE!');
      console.log('📁 Directory structure created');
      console.log('🎨 Example files generated');
      console.log('📚 Usage guide available');
      console.log('\n🚀 Ready to use the two-step iterative design method!');
      
    } catch (error) {
      console.error('❌ Error setting up design system:', error.message);
    }
  }

  async createDirectories() {
    for (const dir of this.directories) {
      const dirPath = path.join(this.baseDir, dir);
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`   ✅ Created: ${dir}/`);
    }
  }

  async createExampleDesignJson() {
    const designJson = {
      "colors": {
        "primary": {
          "50": "#eff6ff",
          "100": "#dbeafe",
          "500": "#3b82f6",
          "600": "#2563eb",
          "900": "#1e3a8a"
        },
        "secondary": {
          "50": "#f8fafc",
          "100": "#f1f5f9",
          "500": "#64748b",
          "600": "#475569",
          "900": "#0f172a"
        },
        "accent": {
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
          "info": "#06b6d4"
        }
      },
      "typography": {
        "fontFamily": {
          "primary": "Inter, system-ui, sans-serif",
          "secondary": "Georgia, serif",
          "mono": "JetBrains Mono, monospace"
        },
        "fontSize": {
          "xs": "0.75rem",
          "sm": "0.875rem",
          "base": "1rem",
          "lg": "1.125rem",
          "xl": "1.25rem",
          "2xl": "1.5rem",
          "3xl": "1.875rem",
          "4xl": "2.25rem"
        },
        "fontWeight": {
          "normal": "400",
          "medium": "500",
          "semibold": "600",
          "bold": "700"
        }
      },
      "spacing": {
        "xs": "0.25rem",
        "sm": "0.5rem",
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "2xl": "3rem",
        "3xl": "4rem"
      },
      "components": {
        "button": {
          "height": "2.5rem",
          "padding": "0.75rem 1.5rem",
          "borderRadius": "0.375rem",
          "fontWeight": "500"
        },
        "card": {
          "padding": "1.5rem",
          "borderRadius": "0.5rem",
          "shadow": "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
        },
        "input": {
          "height": "2.5rem",
          "padding": "0.5rem 0.75rem",
          "borderRadius": "0.375rem",
          "borderWidth": "1px"
        }
      }
    };

    const filePath = path.join(this.baseDir, 'designs', 'design.json');
    await fs.writeFile(filePath, JSON.stringify(designJson, null, 2));
    console.log('   ✅ Created: designs/design.json');
  }

  async createExampleHTMLFiles() {
    const exampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example UI Design</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Inter, system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
        }
        
        .title {
            font-size: 1.875rem;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .subtitle {
            color: #64748b;
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .button {
            background: #3b82f6;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.2s;
        }
        
        .button:hover {
            background: #2563eb;
        }
        
        .input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            font-size: 1rem;
        }
        
        .input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">Perfect Design System</h1>
        <p class="subtitle">Example UI generated using the iterative design method</p>
        
        <form>
            <input type="email" class="input" placeholder="Enter your email" required>
            <input type="password" class="input" placeholder="Enter your password" required>
            <button type="submit" class="button">Get Started</button>
        </form>
    </div>
</body>
</html>`;

    // Create example files in different directories
    const files = [
      { path: 'infinite_ui_cursor/ui_1.html', content: exampleHTML },
      { path: 'variations/design1.html', content: exampleHTML },
      { path: 'variations3/design1.html', content: exampleHTML }
    ];

    for (const file of files) {
      const filePath = path.join(this.baseDir, file.path);
      await fs.writeFile(filePath, file.content);
      console.log(`   ✅ Created: ${file.path}`);
    }
  }

  async createUsageGuide() {
    const usageGuide = `# 🎨 Perfect Design System - Usage Guide

## Quick Start

### Step 1: Extract Design System
1. Paste a UI image into Cursor
2. Use the \`extract-design.md\` rule
3. This creates \`designs/design.json\` with reusable design tokens

### Step 2: Generate Multiple Variations
1. Describe what UI you want to build
2. Use the \`multiple-ui.md\` rule
3. This creates 3 different design approaches in \`infinite_ui_cursor/\`

### Step 3: Create Targeted Variations
1. Choose your preferred design
2. Use \`geo.md\`, \`persona.md\`, or \`device.md\` rules
3. This creates region/persona/device-specific variations

### Step 4: Infinite Iteration
1. Reference your chosen design
2. Use the \`infinite-design.md\` rule
3. This creates endless variations in \`variations/\`

## Available Cursor Rules

- \`extract-design.md\` - Extract design system from images
- \`multiple-ui.md\` - Generate 3 concurrent design variations
- \`infinite-design.md\` - Rapid iteration on existing designs
- \`geo.md\` - Geographical adaptation for different regions
- \`persona.md\` - Persona-based design variations
- \`device.md\` - Device-specific design adaptations

## File Structure

\`\`\`
designs/
├── design.json                    # Extracted design system
└── reference-images/             # Source images

infinite_ui_cursor/
├── ui_1.html                     # First UI variation
├── ui_2.html                     # Second UI variation
├── ui_3.html                     # Third UI variation
└── source.html                   # Reference design

variations/
├── source.html                   # Original design for iteration
├── design1.html                  # First iteration
├── design2.html                  # Second iteration
└── design3.html                  # Third iteration

variations3/
├── design1.html                  # Regional/persona/device variation 1
├── design2.html                  # Regional/persona/device variation 2
└── design3.html                  # Regional/persona/device variation 3

cursor-rules/
├── extract-design.md             # Design extraction rule
├── multiple-ui.md                # Multiple UI generation rule
├── infinite-design.md            # Infinite iteration rule
├── geo.md                        # Geographical adaptation rule
├── persona.md                    # Persona-based variation rule
└── device.md                     # Device-specific variation rule
\`\`\`

## Best Practices

1. **Start with Design Extraction**: Always extract design tokens from reference images
2. **Generate Multiple Approaches**: Create 3 distinct design philosophies
3. **Target Your Audience**: Use persona and geographical rules for specific users
4. **Iterate Rapidly**: Use infinite design for quick variations
5. **Maintain Consistency**: Use design.json tokens across all variations
6. **Test Across Devices**: Use device rules for responsive design
7. **Consider Accessibility**: Ensure all variations meet WCAG standards

## Integration with Existing Systems

This design system integrates with:
- **BMAD Methodology**: Use in all project phases
- **Shiny Object Prevention**: Maintain design consistency
- **MCP Server**: Automate design generation
- **Customer Portal**: Display design variations

## Success Metrics

- **Design Quality**: 95% design token compliance
- **Generation Speed**: < 30s per variation
- **User Satisfaction**: 90% approval rate
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Performance**: < 2s load time

---

*Ready to create perfect UI designs every time!*`;

    const filePath = path.join(this.baseDir, 'PERFECT_DESIGN_SYSTEM_USAGE.md');
    await fs.writeFile(filePath, usageGuide);
    console.log('   ✅ Created: PERFECT_DESIGN_SYSTEM_USAGE.md');
  }

  async createWorkflowExamples() {
    const workflowExamples = {
      "workflow_examples": {
        "food_ordering_app": {
          "step1": "Extract design from food app screenshot",
          "step2": "Generate 3 food app variations (minimalist, vibrant, functional)",
          "step3": "Create persona variations (student, professional, senior)",
          "step4": "Generate geographical adaptations (US, Japan, Middle East)",
          "step5": "Infinite iteration for color and style variations"
        },
        "todo_list_app": {
          "step1": "Extract design from productivity app",
          "step2": "Generate 3 todo app approaches (simple, detailed, collaborative)",
          "step3": "Create device variations (mobile, desktop, TV)",
          "step4": "Generate cultural adaptations (US productivity, Japanese collaboration)",
          "step5": "Infinite iteration for theme variations (dark, rainbow, minimal)"
        },
        "calculator_app": {
          "step1": "Extract design from calculator UI",
          "step2": "Generate 3 calculator approaches (basic, scientific, financial)",
          "step3": "Create function variations (simple, advanced, specialized)",
          "step4": "Generate regional adaptations (Western, Asian, Nordic)",
          "step5": "Infinite iteration for color schemes and layouts"
        }
      },
      "cursor_rule_usage": {
        "extract_design": "Paste UI image + use extract-design.md rule",
        "multiple_ui": "Describe UI + use multiple-ui.md rule",
        "infinite_design": "Reference design + use infinite-design.md rule",
        "geo_adaptation": "Reference design + use geo.md rule",
        "persona_variation": "Reference design + use persona.md rule",
        "device_adaptation": "Reference design + use device.md rule"
      }
    };

    const filePath = path.join(this.baseDir, 'designs', 'workflow-examples.json');
    await fs.writeFile(filePath, JSON.stringify(workflowExamples, null, 2));
    console.log('   ✅ Created: designs/workflow-examples.json');
  }
}

async function main() {
  const setup = new PerfectDesignSystemSetup();
  await setup.setupDesignSystem();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
