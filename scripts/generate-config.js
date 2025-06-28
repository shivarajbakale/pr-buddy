#!/usr/bin/env node

/**
 * Configuration Generator for pr-buddy MCP Server
 * Generates config files for Cursor and Claude Desktop
 * Author: Shivaraj Bakale
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

class ConfigGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.serverPath = path.join(this.projectRoot, 'dist', 'index.js');
  }

  /**
   * Generate Claude Desktop configuration
   */
  generateClaudeDesktopConfig() {
    const config = {
      mcpServers: {
        "pr-buddy": {
          command: "node",
          args: [this.serverPath],
          env: {
            NODE_ENV: "production"
          }
        }
      }
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Generate Cursor configuration
   */
  generateCursorConfig() {
    const config = {
      "mcp": {
        "servers": {
          "pr-buddy": {
            "command": "node",
            "args": [this.serverPath],
            "env": {
              "NODE_ENV": "production"
            }
          }
        }
      }
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Get Claude Desktop config path based on OS
   */
  getClaudeDesktopConfigPath() {
    const platform = os.platform();
    const homeDir = os.homedir();

    switch (platform) {
      case 'darwin': // macOS
        return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
      case 'win32': // Windows
        return path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
      case 'linux': // Linux
        return path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Get Cursor config path based on OS
   */
  getCursorConfigPath() {
    const platform = os.platform();
    const homeDir = os.homedir();

    switch (platform) {
      case 'darwin': // macOS
        return path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'settings.json');
      case 'win32': // Windows
        return path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'settings.json');
      case 'linux': // Linux
        return path.join(homeDir, '.config', 'Cursor', 'User', 'settings.json');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Merge configuration with existing file
   */
  mergeWithExistingConfig(configPath, newConfig) {
    let existingConfig = {};
    
    try {
      if (fs.existsSync(configPath)) {
        const existingContent = fs.readFileSync(configPath, 'utf8');
        existingConfig = JSON.parse(existingContent);
      }
    } catch (error) {
      console.warn(`Warning: Could not read existing config at ${configPath}: ${error.message}`);
    }

    // Deep merge the configurations
    const mergedConfig = this.deepMerge(existingConfig, JSON.parse(newConfig));
    return JSON.stringify(mergedConfig, null, 2);
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Create directory if it doesn't exist
   */
  ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Generate and save configurations
   */
  generateConfigs() {
    console.log('🚀 Generating MCP configurations for pr-buddy...\n');

    // Check if server build exists
    if (!fs.existsSync(this.serverPath)) {
      console.error('❌ Error: Server build not found. Please run "npm run build" first.');
      process.exit(1);
    }

    try {
      // Generate Claude Desktop config
      console.log('📝 Generating Claude Desktop configuration...');
      const claudeConfig = this.generateClaudeDesktopConfig();
      const claudeConfigPath = this.getClaudeDesktopConfigPath();
      
      this.ensureDirectoryExists(claudeConfigPath);
      const mergedClaudeConfig = this.mergeWithExistingConfig(claudeConfigPath, claudeConfig);
      fs.writeFileSync(claudeConfigPath, mergedClaudeConfig);
      
      console.log(`✅ Claude Desktop config saved to: ${claudeConfigPath}`);

      // Generate Cursor config
      console.log('\n📝 Generating Cursor configuration...');
      const cursorConfig = this.generateCursorConfig();
      const cursorConfigPath = this.getCursorConfigPath();
      
      this.ensureDirectoryExists(cursorConfigPath);
      const mergedCursorConfig = this.mergeWithExistingConfig(cursorConfigPath, cursorConfig);
      fs.writeFileSync(cursorConfigPath, mergedCursorConfig);
      
      console.log(`✅ Cursor config saved to: ${cursorConfigPath}`);

      // Generate example configs in project directory
      console.log('\n📁 Generating example configs in project directory...');
      
      const examplesDir = path.join(this.projectRoot, 'config-examples');
      this.ensureDirectoryExists(path.join(examplesDir, 'dummy'));
      
      fs.writeFileSync(
        path.join(examplesDir, 'claude-desktop-config.json'),
        claudeConfig
      );
      
      fs.writeFileSync(
        path.join(examplesDir, 'cursor-settings.json'),
        cursorConfig
      );

      console.log(`✅ Example configs saved to: ${examplesDir}`);

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

### Claude Desktop
- **Config Path**: ${this.getClaudeDesktopConfigPath()}
- **Status**: ✅ Configuration merged with existing settings

### Cursor
- **Config Path**: ${this.getCursorConfigPath()}
- **Status**: ✅ Configuration merged with existing settings

## Next Steps

### For Claude Desktop:
1. Restart Claude Desktop application
2. The pr-buddy server should now be available in your conversations
3. Test with: "List my open PRs" or "Create a PR with template feature"

### For Cursor:
1. Restart Cursor application
2. Open Command Palette (Cmd/Ctrl + Shift + P)
3. Look for MCP-related commands or pr-buddy tools
4. Test with: "Use pr-buddy to list my PRs"

## Available Tools

### Core GitHub Operations:
- \`create_pr\` - Create PR with template and formatting
- \`get_pr_details\` - Get comprehensive PR information
- \`list_my_prs\` - List current user's open PRs
- \`checkout_pr_branch\` - Switch to PR branch locally
- \`add_pr_label\` - Add labels to PR (including Need_preview_env)
- \`remove_pr_label\` - Remove labels from PR

### Review & Analysis Tools:
- \`generate_review_prompt\` - Create staff engineer review prompt
- \`generate_code_checklist\` - Create code review checklist
- \`analyze_pr_complexity\` - Assess PR size and complexity
- \`get_pr_diff_summary\` - Get condensed diff information

### PR Statistics:
- \`get_pr_stats\` - Get PR statistics by time period (day/week/month)

## Troubleshooting

### Common Issues:
1. **Server not found**: Ensure you've run \`npm run build\` in the pr-buddy directory
2. **GitHub CLI errors**: Run \`gh auth status\` to check authentication
3. **Permission errors**: Ensure the config directories are writable

### Testing the Server:
\`\`\`bash
# Test the server directly
node ${this.serverPath}
\`\`\`

### Manual Configuration:
If automatic configuration fails, copy the example configs from:
- \`config-examples/claude-desktop-config.json\`
- \`config-examples/cursor-settings.json\`

## Support
For issues, check the GitHub repository or PRD.md file for detailed documentation.
`;

    const instructionsPath = path.join(this.projectRoot, 'SETUP.md');
    fs.writeFileSync(instructionsPath, instructions.trim());
    
    console.log(`\n📖 Setup instructions saved to: ${instructionsPath}`);
    console.log('\n🎉 Configuration generation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart Claude Desktop and/or Cursor');
    console.log('2. Test the pr-buddy tools in your AI assistant');
    console.log('3. Check SETUP.md for detailed instructions');
  }
}

// Run the configuration generator
// Run the script if called directly
const generator = new ConfigGenerator();
generator.generateConfigs(); 