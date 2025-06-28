# 🔧 pr-buddy MCP Server Setup Instructions

## Prerequisites
- Ensure you have built the project: `npm run build`
- Ensure GitHub CLI (`gh`) is installed and authenticated

## Configuration Files Generated

### Claude Desktop
- **Config Path**: /Users/shivarajbakale/Library/Application Support/Claude/claude_desktop_config.json
- **Status**: ✅ Configuration merged with existing settings

### Cursor
- **Config Path**: /Users/shivarajbakale/Library/Application Support/Cursor/User/settings.json
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
- `create_pr` - Create PR with template and formatting
- `get_pr_details` - Get comprehensive PR information
- `list_my_prs` - List current user's open PRs
- `checkout_pr_branch` - Switch to PR branch locally
- `add_pr_label` - Add labels to PR (including Need_preview_env)
- `remove_pr_label` - Remove labels from PR

### Review & Analysis Tools:
- `generate_review_prompt` - Create staff engineer review prompt
- `generate_code_checklist` - Create code review checklist
- `analyze_pr_complexity` - Assess PR size and complexity
- `get_pr_diff_summary` - Get condensed diff information

### PR Statistics:
- `get_pr_stats` - Get PR statistics by time period (day/week/month)

## Troubleshooting

### Common Issues:
1. **Server not found**: Ensure you've run `npm run build` in the pr-buddy directory
2. **GitHub CLI errors**: Run `gh auth status` to check authentication
3. **Permission errors**: Ensure the config directories are writable

### Testing the Server:
```bash
# Test the server directly
node /Users/shivarajbakale/Projects/MCP/Projects/pr-buddy/dist/index.js
```

### Manual Configuration:
If automatic configuration fails, copy the example configs from:
- `config-examples/claude-desktop-config.json`
- `config-examples/cursor-settings.json`

## Support
For issues, check the GitHub repository or PRD.md file for detailed documentation.