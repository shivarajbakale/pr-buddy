# pr-buddy 🤖

**Your AI-powered assistant for GitHub PRs, JIRA tickets, and performance tracking.**

A comprehensive Model Context Protocol (MCP) Server that integrates GitHub CLI, Atlassian JIRA, and performance highlights tracking to supercharge your development workflow with AI.

[![MCP](https://img.shields.io/badge/MCP-1.13.0-blue)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---
<img width="4251" height="2934" alt="Mermaid Chart - Create complex, visual diagrams with text -2025-11-07-145910" src="https://github.com/user-attachments/assets/98a1c887-e8c2-4723-922b-a69fce96ccf6" />

<img width="3005" height="1518" alt="Mermaid Chart - Create complex, visual diagrams with text -2025-11-07-145936" src="https://github.com/user-attachments/assets/6ec29f60-9b53-4ea9-9176-f34e3365fc20" />

## 🎯 Overview

pr-buddy is a powerful MCP server that provides **19 tools** across three main domains:

- **🐙 GitHub Operations**: Create PRs, manage labels, view comments, track statistics
- **🎫 JIRA Integration**: Create tickets, manage sprints, update status, track work
- **⭐ Performance Highlights**: Track and summarize your achievements for reviews

Built for developers who use AI assistants like Claude Desktop and want seamless integration with their daily tools.

---

## ✨ Features

### GitHub Tools (9 tools)
- ✅ **Create PRs** with JIRA ticket elicitation and template formatting
- ✅ **Manage PRs**: Edit, list, checkout branches, enable preview environments
- ✅ **PR Analytics**: View comments (grouped by type), diff summaries, time-based statistics
- ✅ **Smart Elicitation**: Interactive prompts for JIRA tickets and preview environments

### JIRA Tools (6 tools)
- ✅ **Create Tickets** with preview/confirm flow (prevents accidents!)
- ✅ **List Your Tickets** with clickable URLs to Apollo JIRA
- ✅ **Sprint Management**: View sprint details, tickets, and progress
- ✅ **Status Updates**: Transition tickets through workflow states
- ✅ **Boards**: List and filter JIRA boards
- ✅ **Apollo Integration**: Hardcoded for `apollopde.atlassian.net`

### Performance Highlights (4 tools)
- ✅ **Track Achievements**: Save highlights mapped to Apollo values
- ✅ **Retrieve Highlights**: Filter by date range
- ✅ **Generate Summaries**: Aggregate by Apollo values for performance reviews
- ✅ **SQLite Storage**: Local database with Prisma ORM

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **GitHub CLI (`gh`)** installed and authenticated:
   ```bash
   gh auth login
   ```
3. **Atlassian CLI (`acli`)** installed and authenticated:
   ```bash
   npm install -g @atlassian/acli
   acli login
   ```

### Installation

```bash
# Clone the repository
git clone https://github.com/shivarajbakale/pr-buddy.git
cd pr-buddy

# Install dependencies
npm install

# Build the project
npm run build

# Optional: Initialize database for highlights
npm run db:generate
npm run db:push
```

### Configure Claude Desktop

Add pr-buddy to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pr-buddy": {
      "command": "node",
      "args": ["/absolute/path/to/pr-buddy/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

Restart Claude Desktop, and pr-buddy tools will appear!

---

## 🛠️ Available Tools

### GitHub Tools

| Tool | Description |
|------|-------------|
| `create_pr` | Create a new PR with JIRA ticket elicitation. Title should NOT include ticket numbers. |
| `get_pr_details` | Get comprehensive information about a PR including status, labels, and metadata. |
| `edit_pr` | Update PR title, body, or base branch. |
| `list_my_prs` | List your open/closed PRs with filtering options. |
| `checkout_pr_branch` | Switch to a PR's branch locally. |
| `enable_preview_env` | Add `Need_preview_env` label to enable preview environment. |
| `get_pr_comments` | Fetch and group PR comments (general, review, inline). |
| `get_pr_diff_summary` | Get file changes and diff summary. |
| `get_pr_stats` | Time-based PR statistics (day/week/month). |

### JIRA Tools

| Tool | Description |
|------|-------------|
| `create_jira_ticket` | Create JIRA ticket with **preview/confirm flow**. Description should be SHORT (2-3 sentences) and PLAIN TEXT only - no markdown! |
| `get_my_jira_tickets` | List tickets assigned to you with **clickable URLs** to Apollo JIRA. |
| `get_jira_sprint_details` | View sprint details, tickets, and progress with clickable ticket links. |
| `get_jira_sprints` | List sprints for a board (active/future/closed). |
| `get_jira_boards` | List JIRA boards with filtering by project and type. |
| `update_jira_ticket_status` | Transition ticket status (e.g., "To Do" → "In Progress" → "Done"). |

### Highlight Tools

| Tool | Description |
|------|-------------|
| `create_highlight` | Save a performance highlight mapped to Apollo values. |
| `get_my_highlights` | Retrieve highlights filtered by date range. |
| `get_highlight_summary` | Aggregate highlights by Apollo value for performance reviews. |
| `list_apollo_values` | List all available Apollo values. |

---

## 📝 Usage Examples

### Creating a PR

```
You: "Create a PR for my current branch fixing the login bug"

Claude uses: create_pr
- Prompts for JIRA ticket number (or NOTICKET)
- Asks about preview environment
- Creates PR with formatted title: [PUX-123]- Fix login bug
```

**Important**: Provide the PR title WITHOUT JIRA ticket numbers. The tool will automatically elicit the ticket number and format it as `[TICKET-###]- Title` or `NOTICKET- Title`.

### Creating a JIRA Ticket (Two-Step Flow)

```
You: "Create a JIRA ticket for the login bug"

Claude: Uses create_jira_ticket with confirm=false
- Shows preview of ticket details
- Asks you to confirm

You: "Looks good, create it"

Claude: Uses create_jira_ticket with confirm=true
- Actually creates the ticket
- Returns clickable URL to Apollo JIRA
```

**Important**: Keep descriptions SHORT (2-3 sentences) and use PLAIN TEXT only. No markdown or bullet points!

### Managing JIRA Tickets

```
You: "Show my open JIRA tickets"
Claude: Uses get_my_jira_tickets
- Returns table with clickable ticket keys: [PUX-123](https://apollopde.atlassian.net/browse/PUX-123)

You: "Move PUX-123 to In Progress"
Claude: Uses update_jira_ticket_status
- Transitions ticket status
- Shows before/after with clickable link
```

### Tracking Performance Highlights

```
You: "Save a highlight: Improved API response time by 40%"
Claude: Uses create_highlight
- Maps to Apollo value (e.g., "Move Fast")
- Stores in local database

You: "Show my highlights from last quarter"
Claude: Uses get_my_highlights
- Filters by date range
- Returns all highlights

You: "Summarize my highlights for review"
Claude: Uses get_highlight_summary
- Groups by Apollo value
- Perfect for performance reviews
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│  AI Assistant   │ (Claude Desktop, etc.)
└────────┬────────┘
         │ MCP Protocol (stdio)
┌────────▼────────┐
│  PRBuddyServer  │ (Main MCP Server)
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┐
    │         │         │          │
┌───▼──┐  ┌──▼──┐  ┌───▼───┐  ┌──▼──┐
│ GH   │  │JIRA │  │Prisma │  │Zod  │
│ CLI  │  │ CLI │  │  ORM  │  │Valid│
└───┬──┘  └──┬──┘  └───┬───┘  └─────┘
    │        │         │
┌───▼──┐  ┌──▼──┐  ┌──▼───┐
│GitHub│  │JIRA │  │SQLite│
│ API  │  │Cloud│  │  DB  │
└──────┘  └─────┘  └──────┘
```

### Key Design Patterns

1. **CLI Wrapper Pattern**: Uses `gh` and `acli` CLIs instead of direct APIs (leverages user's auth)
2. **Elicitation Pattern**: Interactive prompts for JIRA tickets, preview environments
3. **Preview/Confirm Flow**: Two-step ticket creation prevents accidental submissions
4. **Clickable URLs**: All JIRA tickets link to `https://apollopde.atlassian.net/browse/{KEY}`
5. **Type Safety**: Zod validation + TypeScript strict mode

---

## 🧪 Development

### Project Structure

```
src/
├── index.ts                    # Main MCP server
├── handlers/                   # Tool handler functions
│   ├── github-operations.ts    # GitHub PR tools
│   ├── pr-comments.ts          # PR comment tools
│   ├── pr-statistics.ts        # PR analytics
│   ├── jira-sprints.ts         # JIRA tools
│   └── highlights.ts           # Performance highlights
├── utils/                      # CLI wrappers
│   ├── github-cli.ts           # GitHub CLI wrapper
│   ├── jira-cli.ts             # JIRA CLI wrapper
│   └── prisma.ts               # Database client
├── schemas/                    # Zod validation schemas
│   └── index.ts                # All tool schemas
├── types/                      # TypeScript types
│   ├── jira.ts                 # JIRA types
│   └── highlight.ts            # Highlight types
├── tools/                      # Tool name constants
│   └── index.ts
└── templates/                  # PR templates
    └── pull_request_template.ts
```

### Available Scripts

```bash
# Development
npm run dev              # Watch mode compilation
npm run build            # Build TypeScript
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm test                 # Run tests
npm run clean            # Remove dist/

# Running
npm start                # Start the server
npm run playground       # Run with MCP inspector

# Database (Highlights)
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
```

### Testing with MCP Inspector

```bash
npm run inspector
# Opens MCP Inspector to test tools interactively
```

---

## 🔧 Configuration

### Environment Variables

No environment variables needed! pr-buddy uses:
- Your `gh` CLI authentication for GitHub
- Your `acli` login session for JIRA
- Local SQLite database for highlights

### JIRA Configuration

pr-buddy is configured for Apollo JIRA:
- **Site**: `https://apollopde.atlassian.net`
- **URL Pattern**: `https://apollopde.atlassian.net/browse/{TICKET-KEY}`

To change this, update `APOLLO_JIRA_SITE` constant in `src/utils/jira-cli.ts`.

### Database Configuration

Highlights are stored in a local SQLite database:
- **Location**: `./prisma/dev.db`
- **Schema**: See `prisma/schema.prisma`
- **ORM**: Prisma

---

## 📚 API Reference

### Tool Input Schemas

All tools use Zod for input validation. Key parameters:

**GitHub Tools**
- `repo`: Repository URL (from `git config --get remote.origin.url`)
- `title`: PR title WITHOUT JIRA ticket numbers
- `base`: Base branch (default: `master`)
- `head`: Head branch (default: current branch)

**JIRA Tools**
- `site`: JIRA site URL (optional, defaults to ACLI config)
- `project`: Project key (e.g., `PUX`, `INCIDENT`)
- `summary`: Brief title (max 255 chars)
- `description`: SHORT (2-3 sentences), PLAIN TEXT only
- `confirm`: Boolean for two-step creation (default: `false`)

**Highlight Tools**
- `highlight`: Description of achievement
- `apolloValue`: Apollo value (from predefined list)
- `dateFrom`/`dateTo`: Date range for filtering

---

## 🎯 Best Practices

### PR Creation
1. ✅ Provide plain title without ticket numbers
2. ✅ Let the tool elicit JIRA ticket number
3. ✅ Use template format for PR body
4. ✅ Run `git diff` to understand changes first

### JIRA Tickets
1. ✅ Use preview mode first (`confirm=false`)
2. ✅ Keep descriptions SHORT (2-3 sentences max)
3. ✅ Use PLAIN TEXT - no markdown or formatting
4. ✅ Example: "Users cannot log in after password reset. The login button becomes unresponsive. Steps: 1. Reset password 2. Try to log in 3. Button does not work."
5. ✅ Confirm creation after reviewing preview

### Performance Highlights
1. ✅ Save highlights regularly (weekly recommended)
2. ✅ Map to specific Apollo values
3. ✅ Include quantifiable achievements when possible
4. ✅ Generate summaries quarterly for reviews

---

## 🐛 Troubleshooting

### "ACLI not found"
```bash
npm install -g @atlassian/acli
acli login
```

### "gh: command not found"
Install GitHub CLI: https://cli.github.com/

### "Authentication failed"
Re-authenticate:
```bash
gh auth login
acli login
```

### "Ticket URLs not clickable"
Ensure your MCP client supports markdown links. Claude Desktop does!

### Database issues
```bash
npm run clean
npm run db:generate
npm run db:push
```

---

## 🚢 Changelog

### v1.2.0 (Latest - feature/improvements branch)
**New Features:**
- ✨ Two-step ticket creation with preview/confirm flow
- ✨ Clickable JIRA ticket URLs in all outputs
- ✨ Updated PR title guidance (no ticket numbers)
- ✨ Short description guidance for JIRA tickets

**Improvements:**
- 📝 Clear documentation for all tool inputs
- 🔗 All JIRA tickets link to Apollo JIRA
- ⚡ formatTicketsTable now shows clickable keys
- 🎯 Better elicitation flow for PR creation

**Bug Fixes:**
- 🐛 Fixed missing URL in getSprintDetails tickets
- 🐛 Fixed formatTicketsTable not using clickable URLs

### v1.1.0
- ✨ Added `update_jira_ticket_status` tool
- ✨ Added clickable URLs to JIRA outputs
- 🔗 Hardcoded Apollo JIRA site for consistency

### v1.0.1
- 🐛 Bug fixes and stability improvements

### v1.0.0
- 🎉 Initial release
- ✅ GitHub PR operations
- ✅ JIRA sprint management
- ✅ Performance highlights tracking

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Run linting: `npm run lint:fix`
6. Commit: `git commit -m "feat: Add amazing feature"`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Commit Convention

We use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `chore:` Maintenance tasks
- `refactor:` Code refactoring

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [GitHub CLI](https://cli.github.com/)
- Integrated with [Atlassian CLI](https://developer.atlassian.com/platform/atlassian-cli/)
- Database with [Prisma](https://www.prisma.io/)
- Validation with [Zod](https://zod.dev/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/shivarajbakale/pr-buddy/issues)
- **Documentation**: [MCP Docs](https://modelcontextprotocol.io/)
- **Author**: Shivaraj Bakale

---

**Made with ❤️ for developers who love AI-powered workflows**
