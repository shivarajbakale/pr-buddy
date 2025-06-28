# 🔧 pr-buddy MCP Server Setup Instructions

## Prerequisites
- Ensure you have built the project: `npm run build`
- Ensure GitHub CLI (`gh`) is installed and authenticated

## Configuration Files Generated

### Local Project Files:
- **mcp-config.json** - Complete MCP configuration
- **claude-desktop-config.json** - Template for Claude Desktop
- **cursor-settings.json** - Template for Cursor
- **package.json** - Updated with MCP configuration

### System Configuration Paths:
- **Claude Desktop**: /Users/shivarajbakale/Library/Application Support/Claude/claude_desktop_config.json
- **Cursor**: /Users/shivarajbakale/Library/Application Support/Cursor/User/settings.json

## Setup Options

### Option 1: Use Local Configuration Files

#### For Claude Desktop:
```bash
# Copy the configuration to Claude Desktop
cp claude-desktop-config.json "/Users/shivarajbakale/Library/Application Support/Claude/claude_desktop_config.json"
```

#### For Cursor:
```bash
# Copy the configuration to Cursor
cp cursor-settings.json "/Users/shivarajbakale/Library/Application Support/Cursor/User/settings.json"
```

### Option 2: Manual Configuration

#### Claude Desktop:
1. Open: /Users/shivarajbakale/Library/Application Support/Claude/claude_desktop_config.json
2. Add the contents of `claude-desktop-config.json` to the `mcpServers` section

#### Cursor:
1. Open: /Users/shivarajbakale/Library/Application Support/Cursor/User/settings.json
2. Add the contents of `cursor-settings.json` to your settings

### Option 3: Use MCP Configuration Directly

The `mcp-config.json` file contains all necessary configuration information and can be used as a reference for manual setup.

## Next Steps

1. **Restart your AI assistant** (Claude Desktop or Cursor)
2. **Test the pr-buddy tools**:
   - "List my open PRs"
   - "Create a PR for this branch"
   - "Generate a review prompt for PR #123"

## Available Tools

### Core GitHub Operations:
- `create_pr` - Create PR with template and formatting
- `get_pr_details` - Get comprehensive PR information  
- `list_my_prs` - List current user's open PRs
- `checkout_pr_branch` - Switch to PR branch locally
- `add_pr_label` / `remove_pr_label` - Manage PR labels

### Review & Analysis Tools:
- `generate_review_prompt` - Create contextual review prompts
- `generate_code_checklist` - Create code review checklists
- `analyze_pr_complexity` - Assess PR size and complexity
- `get_pr_diff_summary` - Get condensed diff information

### Statistics:
- `get_pr_stats` - Get PR statistics by time period

## Troubleshooting

### Common Issues:
1. **Server not found**: Run `npm run build` in the pr-buddy directory
2. **GitHub CLI errors**: Run `gh auth status` to check authentication
3. **Config not loading**: Ensure config files are in the correct locations

### Testing the Server:
```bash
# Test the server directly
node dist/index.js
```

## Support
Check the GitHub repository or PRD.md for detailed documentation.