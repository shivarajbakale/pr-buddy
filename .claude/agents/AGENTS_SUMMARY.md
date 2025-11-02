# Claude Code Agents Summary

## Overview

This directory contains two specialized expert agents for the pr-buddy project. These agents can be invoked explicitly using `@agent-name` or will be automatically routed based on the context of your request.

## Quick Reference

### 1. MCP Server Expert (`@mcp-server-expert`)

**Best For:** Building and managing Model Context Protocol servers

**Quick Examples:**
```
@mcp-server-expert Create a basic MCP server with HTTP transport
@mcp-server-expert How do I implement dynamic tool management?
@mcp-server-expert Debug this session management issue in my MCP server
```

**Core Capabilities:**
- Server architecture and design
- Tool, resource, and prompt implementation
- All transport types (HTTP, WebSocket, stdio)
- Session management and state handling
- Security (DNS rebinding, OAuth, CORS)
- Performance optimization
- Testing and debugging

**When to Use:**
- ✅ Creating new MCP servers
- ✅ Implementing MCP primitives (tools/resources/prompts)
- ✅ Transport configuration and setup
- ✅ Security hardening
- ✅ Performance tuning
- ✅ Troubleshooting MCP issues

---

### 2. Atlassian CLI Expert (`@atlassian-cli-expert`)

**Best For:** Automating Jira operations via command line

**Quick Examples:**
```
@atlassian-cli-expert Bulk assign all unassigned items in TEAM project
@atlassian-cli-expert Create 50 tasks from a CSV file
@atlassian-cli-expert Show me how to automate sprint cleanup with acli
```

**Core Capabilities:**
- Complete acli command reference
- Jira work item management
- Project administration
- User management
- Bulk operations and automation
- JQL query construction
- CI/CD integration
- Data parsing and transformation

**When to Use:**
- ✅ Managing Jira items via CLI
- ✅ Bulk operations on issues
- ✅ Automating Jira workflows
- ✅ Script integration
- ✅ Data migration
- ✅ Report generation
- ✅ JQL query help

---

## Usage Patterns

### Explicit Invocation
```bash
# Direct call to specific agent
@mcp-server-expert <your question>
@atlassian-cli-expert <your question>
```

### Natural Language (Auto-routing)
Claude Code will automatically detect and route to the appropriate agent:

```
"I need to create an MCP server with stateful sessions"
→ Routes to mcp-server-expert

"How do I bulk update Jira items with acli?"
→ Routes to atlassian-cli-expert
```

### Interactive Mode
```bash
# Use the agents command
/agents

# Then select from the list
```

---

## Agent Characteristics

### MCP Server Expert
- **Model:** Sonnet (balanced performance and quality)
- **Tools:** Read, Write, Edit, Glob, Grep, Bash, WebFetch
- **Size:** ~37KB (comprehensive MCP knowledge base)
- **Focus:** Production-ready, secure, performant MCP servers

### Atlassian CLI Expert
- **Model:** Sonnet (balanced performance and quality)
- **Tools:** Read, Write, Edit, Glob, Grep, Bash
- **Size:** ~28KB (complete acli command reference)
- **Focus:** Automation, bulk operations, integration

---

## Common Workflows

### MCP Server Development Workflow
1. **Design Phase:**
   ```
   @mcp-server-expert I need an MCP server that exposes Jira operations.
   What's the best architecture?
   ```

2. **Implementation:**
   ```
   @mcp-server-expert Show me how to implement a 'create-jira-issue' tool
   with proper validation and error handling
   ```

3. **Security:**
   ```
   @mcp-server-expert How do I secure this MCP server for local deployment?
   ```

4. **Testing:**
   ```
   @mcp-server-expert Write integration tests for my MCP tools
   ```

### Jira Automation Workflow
1. **Authentication Setup:**
   ```
   @atlassian-cli-expert How do I authenticate acli in a CI/CD pipeline?
   ```

2. **Query Building:**
   ```
   @atlassian-cli-expert Help me build a JQL query for items updated
   in the last 7 days with high priority
   ```

3. **Bulk Operations:**
   ```
   @atlassian-cli-expert I have 200 items to transition to 'Done'.
   What's the safest way?
   ```

4. **Integration:**
   ```
   @atlassian-cli-expert Integrate acli with GitHub Actions to auto-create
   Jira items from issues
   ```

---

## Tips for Best Results

### For MCP Server Expert
- Mention your use case (local tool, web service, etc.)
- Specify transport requirements (HTTP, WebSocket, stdio)
- Indicate if you need stateful or stateless operation
- Ask about security considerations upfront
- Request complete, production-ready examples

### For Atlassian CLI Expert
- Provide context about data volume (single item vs. bulk)
- Mention if you need automation/scripting
- Specify output format needs (JSON, CSV, plain text)
- Ask about error handling for resilient operations
- Request CI/CD integration patterns if needed

---

## Combining Agents

These agents can work together! Example scenario:

**Goal:** Build an MCP server that provides Jira operations via CLI

1. **First, consult Atlassian CLI Expert:**
   ```
   @atlassian-cli-expert What acli commands do I need for basic Jira
   operations: create, search, update, transition?
   ```

2. **Then, consult MCP Server Expert:**
   ```
   @mcp-server-expert Create an MCP server with tools that wrap these
   acli commands: [paste commands from step 1]
   ```

3. **Back to Atlassian CLI Expert for optimization:**
   ```
   @atlassian-cli-expert How do I handle authentication for acli in
   a long-running MCP server?
   ```

---

## File Locations

```
.claude/agents/
├── README.md                      # Comprehensive documentation
├── AGENTS_SUMMARY.md             # This file (quick reference)
├── EXAMPLE.md                     # MCP server usage examples
├── mcp-server-expert.md          # MCP Server Expert agent
└── atlassian-cli-expert.md       # Atlassian CLI Expert agent
```

---

## Getting Started

### Test the MCP Server Expert
```
@mcp-server-expert Create a simple "Hello World" MCP server with
a single tool that returns a greeting message
```

### Test the Atlassian CLI Expert
```
@atlassian-cli-expert Show me how to authenticate acli and list
all projects in my Jira instance
```

---

## Contributing

To create additional agents:
1. Create a new `.md` file in `.claude/agents/`
2. Add YAML frontmatter with `name`, `description`, `tools`, `model`
3. Write comprehensive system prompt with examples
4. Update `README.md` with the new agent's documentation

---

## Version Information

- **MCP Server Expert:** v1.0 (January 2025)
  - Based on MCP TypeScript SDK v1.13.0+
  - Covers Streamable HTTP, SSE, WebSocket, stdio transports

- **Atlassian CLI Expert:** v1.0 (January 2025)
  - Based on latest acli documentation
  - Covers Jira Cloud operations
  - Includes admin, project, work item, filter, dashboard commands

---

## Support

For issues with agents:
1. Check the agent's `.md` file for detailed documentation
2. Review `EXAMPLE.md` for usage patterns
3. Try rephrasing your question or being more specific
4. Use explicit invocation (`@agent-name`) if auto-routing isn't working

For feedback on pr-buddy or these agents:
- Open an issue in the repository
- Submit feedback via `/feedback` command in Claude Code
