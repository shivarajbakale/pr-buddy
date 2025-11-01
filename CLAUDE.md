# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

pr-buddy is a Model Context Protocol (MCP) Server that integrates with GitHub CLI (`gh`) to provide AI assistants with powerful PR management, review, and analysis capabilities. The server exposes tools for creating PRs, analyzing complexity, generating review prompts, and gathering PR statistics.

## Essential Commands

### Development
```bash
npm run build        # Compile TypeScript to dist/
npm run dev          # Watch mode compilation
npm start            # Run the compiled server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm test             # Run tests (Jest)
npm run test:watch   # Run tests in watch mode
npm run clean        # Remove dist/ directory
npm run setup        # Generate configuration files
```

### Testing the MCP Server
```bash
# Test server directly via stdio
node dist/index.js

# Check GitHub CLI authentication (required dependency)
gh auth status

# Get current git repository URL (needed for repo parameter)
git config --get remote.origin.url
```

## Architecture

### Core Components

**Entry Point** ([src/index.ts](src/index.ts))
- `PRBuddyServer` class initializes MCP server with stdio transport
- Registers all tool handlers via `setupToolHandlers()`
- Handles tool execution routing in `CallToolRequestSchema` handler
- All tools require a `repo` parameter (GitHub repository URL)

**GitHub CLI Integration** ([src/utils/github-cli.ts](src/utils/github-cli.ts))
- `GitHubCli` class wraps all `gh` CLI commands
- Constructor takes repository URL to set context for all operations
- Uses `executeGhCommand()` for error handling and repo context injection
- All commands automatically append `--repo ${this.repo}` flag
- Returns typed responses via JSON parsing of `gh` output

**Tool Handlers** ([src/handlers/](src/handlers/))
- `github-operations.ts` - PR CRUD operations (create, get, list, checkout, enable preview)
- `review-analysis.ts` - Review prompts, checklists, complexity analysis, diff summaries
- `pr-statistics.ts` - Time-based PR metrics (day/week/month)

**Type System** ([src/types/index.ts](src/types/index.ts))
- `GitHubPR` - Core PR data structure
- `PRComplexityAnalysis` - Complexity scoring with recommendations
- `PRStats` - Time-period statistics with repository breakdown
- `ToolResponse` - Standard MCP tool response format

**Validation** ([src/schemas/index.ts](src/schemas/index.ts))
- Zod schemas for all tool inputs
- Repository context schema pattern used across all tools
- PR template embedded for standardized PR body generation

### Key Design Patterns

1. **Repository Context Pattern**: Every tool requires `repo` parameter obtained via `git config --get remote.origin.url`. The `GitHubCli` class is instantiated per-operation with this context.

2. **GitHub CLI Wrapper**: All GitHub operations use `gh` CLI, not direct API calls. This leverages user's existing authentication and permissions.

3. **Template-Driven PRs**: PR creation uses embedded template ([src/schemas/index.ts:8-40](src/schemas/index.ts#L8-L40)) that includes JIRA ticket format, checklist items, and E2E test considerations.

4. **Type-Safe Tool Routing**: Tool names from [src/tools/index.ts](src/tools/index.ts) are used as constants for type-safe dispatch in [src/index.ts](src/index.ts).

## Critical Implementation Details

### PR Creation Flow
1. User provides title, body, base/head branches
2. Schema validation enforces JIRA ticket format: `[TICKET-###] Title` or defaults to `NOTICKET - Title`
3. Tool performs `git diff` between base and head to understand changes
4. Creates PR using `gh pr create` with template-formatted body
5. Adds labels via separate `gh pr edit --add-label` command
6. Returns full PR details via `gh pr view --json`

### Repository Parameter Handling
All tools expect `repo` parameter in format from `git config --get remote.origin.url`. The server documentation instructs AI to run this command to obtain the value. The `GitHubCli` class then appends `--repo` flag to all `gh` commands.

### Complexity Analysis Algorithm
[src/utils/pr-analysis.ts](src/utils/pr-analysis.ts) calculates complexity score (0-100) based on:
- Files changed (weight: 20%)
- Lines changed (weight: 40%)
- Addition/deletion ratio (weight: 20%)
- Changed files distribution (weight: 20%)

Thresholds: 0-30 (simple), 31-60 (moderate), 61-80 (complex), 81-100 (very-complex)

### Preview Environment Workflow
The `enable_preview_env` tool adds the `Need_preview_env` label to a PR, which triggers preview environment creation in the CI/CD pipeline. This is a project-specific convention referenced in schemas.

## TypeScript Configuration

Strict mode enabled with comprehensive flags ([tsconfig.json](tsconfig.json)):
- ES2022 target with ESNext modules
- All strict type-checking flags enabled
- `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`
- `noUncheckedIndexedAccess` - always check array access
- Output: `dist/` with source maps and declarations

## MCP Tool Implementation Pattern

When adding new tools:
1. Define tool name constant in [src/tools/index.ts](src/tools/index.ts)
2. Add Zod schema to [src/schemas/index.ts](src/schemas/index.ts) with repository context
3. Implement handler function returning `ToolResponse` type
4. Export handler from [src/handlers/index.ts](src/handlers/index.ts)
5. Register in `setupToolHandlers()` in [src/index.ts](src/index.ts):
   - Add to `tools` array in `ListToolsRequestSchema` handler
   - Add case to switch statement in `CallToolRequestSchema` handler
6. Import and type handler arguments explicitly

## Dependencies

**Runtime**:
- `@modelcontextprotocol/sdk` (1.13.0) - MCP protocol implementation
- `zod` (^3.22.4) - Schema validation
- `gh` CLI - Must be installed and authenticated

**Development**:
- TypeScript 5.x with strict configuration
- ESLint with TypeScript plugin
- Jest with ts-jest for testing

## Known Conventions

- Default base branch is `master` (configurable per-call)
- JIRA ticket format: `[INCIDENT-###]` or `[TICKET-###]` prefix
- Preview environment triggered by `Need_preview_env` label
- PR templates include E2E test automation checklist
- All error messages logged to stderr via `console.error()`
- Server logs startup message: "pr-buddy MCP server running on stdio"

## Status

Current version: 1.0.1 (package.json) / 2.0.0 (server metadata in code)

Phase 1 (Core GitHub Operations): COMPLETE
Phase 2 (Review & Analysis): COMPLETE
Phase 3+ (Advanced features, batch operations): See [PRD.md](PRD.md) for roadmap

## General Guidelines for Claude Code

### Documentation and File Creation
- **NEVER** proactively create documentation files (*.md, README.md, etc.) unless explicitly requested by the user
- Do NOT create summary documents, overview files, or reference guides without explicit user request
- Only create files that are essential for the functionality being implemented (code files, configs, tests)
- If you think documentation would be helpful, **ASK FIRST** before creating it
- Exception: Update existing documentation when code changes require it

### When Creating Files
- Only create files that are directly needed for the task at hand
- Prefer editing existing files over creating new ones
- If creating a new file, ensure it's a core component (source code, test, configuration)
- Avoid "helpful" supplementary files like guides, examples, or summaries unless requested

### Examples
✅ **DO create** (without asking):
- Source code files (`.ts`, `.js`, `.py`, etc.)
- Test files that accompany new features
- Configuration files for new tools/services
- Type definition files for new modules

❌ **DON'TNNOT create** (without asking first):
- README files
- Documentation files (SUMMARY.md, GUIDE.md, etc.)
- Example files (EXAMPLE.md, USAGE.md, etc.)
- Reference documentation
- Tutorial or getting started guides

**When in doubt**: Focus on implementation, not documentation.
