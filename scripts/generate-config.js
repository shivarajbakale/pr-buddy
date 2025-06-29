#!/usr/bin/env node

/**
 * Configuration Generator for pr-buddy MCP Server
 * Generates config files for Cursor and Claude Desktop
 * Author: Shivaraj Bakale
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.serverPath = path.join(this.projectRoot, 'dist', 'index.js');
  }

  /**
   * Generate Claude Desktop MCP configuration
   */
  generateClaudeDesktopConfig() {
    return JSON.stringify({
      mcpServers: {
        "pr-buddy": {
          command: "node",
          args: [this.serverPath],
          env: {
            NODE_ENV: "production"
          }
        }
      }
    }, null, 2);
  }

  /**
   * Generate Cursor MCP configuration
   */
  generateCursorConfig() {
    return JSON.stringify({
      "mcp.servers": {
        "pr-buddy": {
          command: "node",
          args: [this.serverPath],
          env: {
            NODE_ENV: "production"
          }
        }
      }
    }, null, 2);
  }

  /**
   * Generate local MCP configuration file
   */
  generateLocalMCPConfig() {
    return JSON.stringify({
      name: "pr-buddy",
      version: "1.0.0",
      description: "GitHub CLI integration for AI assistants via MCP",
      server: {
        command: "node",
        args: ["./dist/index.js"],
        env: {
          NODE_ENV: "production"
        }
      },
      tools: {
        core_github_operations: [
          "create_pr",
          "get_pr_details",
          "list_my_prs", 
          "checkout_pr_branch",
          "add_pr_label",
          "remove_pr_label"
        ],
        review_and_analysis: [
          "generate_review_prompt",
          "generate_code_checklist", 
          "analyze_pr_complexity",
          "get_pr_diff_summary"
        ],
        statistics: [
          "get_pr_stats"
        ]
      },
      usage: {
        claude_desktop: {
          config_path: this.getClaudeDesktopConfigPath(),
          merge_with_existing: true
        },
        cursor: {
          config_path: this.getCursorConfigPath(),
          merge_with_existing: true
        }
      }
    }, null, 2);
  }

  /**
   * Get Claude Desktop config path
   */
  getClaudeDesktopConfigPath() {
    const platform = os.platform();
    
    if (platform === 'darwin') {
      return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    } else if (platform === 'win32') {
      return path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    } else {
      return path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');
    }
  }

  /**
   * Get Cursor config path
   */
  getCursorConfigPath() {
    const platform = os.platform();
    
    if (platform === 'darwin') {
      return path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'User', 'settings.json');
    } else if (platform === 'win32') {
      return path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'settings.json');
    } else {
      return path.join(os.homedir(), '.config', 'Cursor', 'User', 'settings.json');
    }
  }

  /**
   * Generate and save configurations in project directory only
   */
  generateConfigs() {
    console.log('🚀 Generating MCP configurations for pr-buddy...\n');

    // Check if server build exists
    if (!fs.existsSync(this.serverPath)) {
      console.error('❌ Error: Server build not found. Please run "npm run build" first.');
      process.exit(1);
    }

    try {
      // Generate local MCP config file
      console.log('📝 Generating local MCP configuration...');
      const mcpConfig = this.generateLocalMCPConfig();
      const mcpConfigPath = path.join(this.projectRoot, 'mcp-config.json');
      fs.writeFileSync(mcpConfigPath, mcpConfig);
      console.log(`✅ Local MCP config saved to: ${mcpConfigPath}`);

      // Generate Claude Desktop config in project
      console.log('\n📝 Generating Claude Desktop configuration template...');
      const claudeConfig = this.generateClaudeDesktopConfig();
      const claudeConfigPath = path.join(this.projectRoot, 'claude-desktop-config.json');
      fs.writeFileSync(claudeConfigPath, claudeConfig);
      console.log(`✅ Claude Desktop config template saved to: ${claudeConfigPath}`);

      // Generate Cursor config in project
      console.log('\n📝 Generating Cursor configuration template...');
      const cursorConfig = this.generateCursorConfig();
      const cursorConfigPath = path.join(this.projectRoot, 'cursor-settings.json');
      fs.writeFileSync(cursorConfigPath, cursorConfig);
      console.log(`✅ Cursor config template saved to: ${cursorConfigPath}`);

      // Generate setup instructions
      this.generateSetupInstructions();

    } catch (error) {
      console.error(`❌ Error generating configurations: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Generate setup instructions
   */
  generateSetupInstructions() {
    const instructions = `
# 🔧 pr-buddy MCP Server Setup Instructions

## Prerequisites
- Ensure you have built the project: \`npm run build\`
- Ensure GitHub CLI (\`gh\`) is installed and authenticated

## Configuration Files Generated

### Local Project Files:
- **mcp-config.json** - Complete MCP configuration
- **claude-desktop-config.json** - Template for Claude Desktop
- **cursor-settings.json** - Template for Cursor

### System Configuration Paths:
- **Claude Desktop**: ${this.getClaudeDesktopConfigPath()}
- **Cursor**: ${this.getCursorConfigPath()}

## Setup Options

### Option 1: Copy Configuration Files

#### For Claude Desktop:
\`\`\`bash
# Copy the configuration to Claude Desktop
cp claude-desktop-config.json "${this.getClaudeDesktopConfigPath()}"
\`\`\`

#### For Cursor:
\`\`\`bash
# Copy the configuration to Cursor
cp cursor-settings.json "${this.getCursorConfigPath()}"
\`\`\`

### Option 2: Manual Configuration

#### Claude Desktop:
1. Open: ${this.getClaudeDesktopConfigPath()}
2. Add the contents of \`claude-desktop-config.json\` to the \`mcpServers\` section

#### Cursor:
1. Open: ${this.getCursorConfigPath()}
2. Add the contents of \`cursor-settings.json\` to your settings

### Option 3: Use MCP Configuration Directly

The \`mcp-config.json\` file contains all necessary configuration information and can be used as a reference for manual setup.

## Next Steps

1. **Restart your AI assistant** (Claude Desktop or Cursor)
2. **Test the pr-buddy tools**:
   - "List my open PRs"
   - "Create a PR for this branch"
   - "Generate a review prompt for PR #123"

## Available Tools

### Core GitHub Operations:
- \`create_pr\` - Create PR with template and formatting
- \`get_pr_details\` - Get comprehensive PR information  
- \`list_my_prs\` - List current user's open PRs
- \`checkout_pr_branch\` - Switch to PR branch locally
- \`add_pr_label\` / \`remove_pr_label\` - Manage PR labels

### Review & Analysis Tools:
- \`generate_review_prompt\` - Create contextual review prompts
- \`generate_code_checklist\` - Create code review checklists
- \`analyze_pr_complexity\` - Assess PR size and complexity
- \`get_pr_diff_summary\` - Get condensed diff information

### Statistics:
- \`get_pr_stats\` - Get PR statistics by time period

## Troubleshooting

### Common Issues:
1. **Server not found**: Run \`npm run build\` in the pr-buddy directory
2. **GitHub CLI errors**: Run \`gh auth status\` to check authentication
3. **Config not loading**: Ensure config files are in the correct locations

### Testing the Server:
\`\`\`bash
# Test the server directly
node dist/index.js
\`\`\`

## Support
Check the GitHub repository or PRD.md for detailed documentation.
`;

    const instructionsPath = path.join(this.projectRoot, 'SETUP.md');
    fs.writeFileSync(instructionsPath, instructions.trim());
    
    console.log(`\n📖 Setup instructions saved to: ${instructionsPath}`);
    console.log('\n🎉 Configuration generation complete!');
    console.log('\n📋 Files generated in project directory:');
    console.log('- mcp-config.json (complete MCP configuration)');
    console.log('- claude-desktop-config.json (Claude Desktop template)');
    console.log('- cursor-settings.json (Cursor template)');
    console.log('- SETUP.md (setup instructions)');
    console.log('\n📋 Next steps:');
    console.log('1. Copy configuration files to your AI assistant');
    console.log('2. Restart Claude Desktop and/or Cursor');
    console.log('3. Test the pr-buddy tools');
    console.log('4. Check SETUP.md for detailed instructions');
  }
}

// Run the configuration generator
const generator = new ConfigGenerator();
generator.generateConfigs(); 