/**
 * Schema definitions for pr-buddy
 * Author: Shivaraj Bakale
 */

import { z } from "zod";

const PR_TEMPLATE = `
  <!-- In your PR title make sure to prefix with the JIRA ticket: [INCIDENT-###] PR Title Here -->
## Briefly describe what led to the creation of this PR

## Describe your changes

## Any guidance to help the reviewer review this PR?

## What manual and/or automated testing did you perform to validate this PR?

## Before/after pictures or videos

| Before | After  |
| ------ | ------ |
| value1 | value2 |

## Checklist before requesting a review

- [ ] I have prefixed my PR with the JIRA ticket.
- [ ] I have performed a self-review of my code.
- [ ] I have added thorough tests.
- [ ] I have checked that the PR does not introduce new warnings/errors

## Additional checklist for E2E Test Automation PRs

- [ ] Does the test cover the intended user journey, including both happy path and edge/negative cases?
- [ ] Are stable selectors (role, aria-label, data-testid) used over dynamic classes or visible text?
- [ ] Are assertions specific, relevant, and sufficient to validate the business outcome?
- [ ] Are smart waits, retries, and network intercepts used to avoid flaky tests?
- [ ] Is the test consistently passing in CI, including the Burn Test job?
- [ ] Is the test code clear, well-structured, and free from duplication (e.g., uses helpers or custom commands)?
- [ ] Are the test files and related resources named appropriately and placed in the correct directory?
`;

// Common repository context schema
const repositoryContextSchema = {
  repositoryUrl: z
    .string()
    .min(1, "Repository URL cannot be empty")
    .regex(
      /^(https?:\/\/)?(www\.)?github\.com[\/:][a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\.git)?$|^git@github\.com:[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\.git)?$/,
      "Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo or git@github.com:owner/repo.git"
    )
    .describe(
      "GitHub repository, please do a `git config --get remote.origin.url` to get the details about the repository and then use the output to parse the repository name"
    ),
};

// =============================================================================
// Highlight Management Tool Schema Definitions
// =============================================================================

const CREATE_HIGHLIGHT_SCHEMA = {
  name: "create_highlight",
  title: "Create Performance Highlight",
  description:
    "Create a new performance review highlight to track achievements and contributions. " +
    "Each highlight represents a significant accomplishment and can demonstrate one or more Apollo company values. " +
    "Use this to document PRs, Slack contributions, JIRA tickets, demos, meetings, or any other work artifacts.",
  inputSchema: {
    properties: {
      userId: z
        .string()
        .min(1, "User ID is required")
        .describe(
          "Developer identifier (GitHub username or email, e.g., 'shivaraj@apollo.io' or 'shivarajbakale')"
        ),
      title: z
        .string()
        .min(1, "Title is required")
        .max(255, "Title must be 255 characters or less")
        .describe(
          "Brief title of the achievement (e.g., 'Implemented MCP server with JIRA integration')"
        ),
      description: z
        .string()
        .max(2000, "Description must be 2000 characters or less")
        .optional()
        .describe(
          "Optional detailed description of the achievement and its impact"
        ),
      artifactType: z
        .enum([
          "github_pr",
          "slack_message",
          "jira_ticket",
          "document",
          "demo",
          "meeting",
          "other",
        ])
        .describe(
          "Type of artifact: github_pr, slack_message, jira_ticket, document, demo, meeting, or other"
        ),
      artifactUrl: z
        .string()
        .url("Must be a valid URL")
        .describe(
          "Link to the artifact (PR URL, Slack thread, doc link, etc.)"
        ),
      achievedAt: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date must be in ISO format (YYYY-MM-DD)"
        )
        .describe(
          "Date when the achievement happened in ISO format (YYYY-MM-DD, e.g., '2025-11-01')"
        ),
      apolloValueIds: z
        .array(z.string())
        .min(1, "At least one Apollo value is required")
        .max(6, "Maximum 6 Apollo values allowed")
        .describe(
          "Array of Apollo value IDs this highlight demonstrates. Use list_apollo_values tool to get valid IDs."
        ),
    },
  },
} as const;

const GET_MY_HIGHLIGHTS_SCHEMA = {
  name: "get_my_highlights",
  title: "Get My Highlights",
  description:
    "Get all performance highlights for a specific user with optional filtering. " +
    "Returns highlights in a table format sorted by achievement date (most recent first). " +
    "Use filters to narrow down results by date range, Apollo value, or artifact type.",
  inputSchema: {
    properties: {
      userId: z
        .string()
        .min(1, "User ID is required")
        .describe(
          "Developer identifier (GitHub username or email, e.g., 'shivaraj@apollo.io')"
        ),
      startDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date must be in ISO format (YYYY-MM-DD)"
        )
        .optional()
        .describe(
          "Optional start date filter in ISO format (YYYY-MM-DD, e.g., '2025-01-01'). Includes highlights from this date onwards."
        ),
      endDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date must be in ISO format (YYYY-MM-DD)"
        )
        .optional()
        .describe(
          "Optional end date filter in ISO format (YYYY-MM-DD, e.g., '2025-03-31'). Includes highlights up to this date."
        ),
      apolloValue: z
        .string()
        .optional()
        .describe(
          "Optional Apollo value filter. Partial match supported (e.g., 'Ownership' will match 'Take Extreme Ownership')."
        ),
      artifactType: z
        .enum([
          "github_pr",
          "slack_message",
          "jira_ticket",
          "document",
          "demo",
          "meeting",
          "other",
        ])
        .optional()
        .describe(
          "Optional artifact type filter: github_pr, slack_message, jira_ticket, document, demo, meeting, or other"
        ),
    },
  },
} as const;

const GET_HIGHLIGHT_SUMMARY_SCHEMA = {
  name: "get_highlight_summary",
  title: "Get Highlight Summary",
  description:
    "Get a comprehensive summary of performance highlights for a user including statistics and breakdowns. " +
    "Shows total highlights, counts by Apollo value, counts by artifact type, and recent highlights. " +
    "Perfect for performance reviews, quarterly retrospectives, and personal progress tracking.",
  inputSchema: {
    properties: {
      userId: z
        .string()
        .min(1, "User ID is required")
        .describe(
          "Developer identifier (GitHub username or email, e.g., 'shivaraj@apollo.io')"
        ),
      startDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date must be in ISO format (YYYY-MM-DD)"
        )
        .optional()
        .describe(
          "Optional start date for summary period in ISO format (YYYY-MM-DD, e.g., '2025-01-01')"
        ),
      endDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date must be in ISO format (YYYY-MM-DD)"
        )
        .optional()
        .describe(
          "Optional end date for summary period in ISO format (YYYY-MM-DD, e.g., '2025-03-31')"
        ),
    },
  },
} as const;

const LIST_APOLLO_VALUES_SCHEMA = {
  name: "list_apollo_values",
  title: "List Apollo Values",
  description:
    "List all available Apollo company values with their IDs and descriptions. " +
    "Use this tool to get valid Apollo value IDs when creating highlights. " +
    "Returns a table with ID, title, and description for each value.",
  inputSchema: {
    properties: {},
  },
} as const;

export const SCHEMAS = {
  CREATE_PR: {
    title: "Create Pull Request",
    description: "Create a new pull request with template formatting",
    inputSchema: {
      title: z
        .string({ required_error: "PR title is required" })
        .min(1, "PR title cannot be empty")
        .max(256, "PR title cannot exceed 256 characters")
        .describe(
          "PR title WITHOUT the JIRA ticket number. Do NOT include ticket numbers like '[PUX-123]-' or 'NOTICKET-' prefixes. Just provide the plain title (e.g., 'Fix login bug', 'Add dark mode'). The tool will automatically prompt for the JIRA ticket number and format the title as '[TICKET-###]- Title' or 'NOTICKET- Title'."
        ),
      body: z
        .string({ required_error: "PR body is required" })
        .min(1, "PR body cannot be empty")
        .describe(
          `Please use the following format to create the PR: ${PR_TEMPLATE}.
          Please do a diff with the base branch to understand the changes in the PR and then use the diff to create the PR body.
          Make sure its very simple and easy to understand. Do not complicate with too many technical details.
          `
        ),
      base: z
        .string()
        .min(1, "Base branch cannot be empty")
        .regex(
          /^[a-zA-Z0-9][a-zA-Z0-9._\/-]*$/,
          "Invalid branch name format. Branch names must start with alphanumeric and can contain ., _, /, -"
        )
        .optional()
        .describe("Base branch (defaults to master)")
        .default("master"),
      head: z
        .string()
        .min(1, "Head branch cannot be empty")
        .regex(
          /^[a-zA-Z0-9][a-zA-Z0-9._\/-]*$/,
          "Invalid branch name format. Branch names must start with alphanumeric and can contain ., _, /, -"
        )
        .optional()
        .describe(
          "Head branch (defaults to current branch). Get the branch using `git branch --show-current`"
        ),
      labels: z
        .array(
          z
            .string()
            .min(1, "Label cannot be empty")
            .max(50, "Label cannot exceed 50 characters")
        )
        .max(20, "Cannot add more than 20 labels")
        .optional()
        .default([])
        .describe(
          "Labels to add to the PR. If the user specifies that they want to enable preview environment, add the label `Need_preview_env` (default: [])"
        ),
      draft: z
        .boolean()
        .optional()
        .default(false)
        .describe("Create as draft PR (default: false)"),
      ...repositoryContextSchema,
    },
  },

  GET_PR_DETAILS: {
    title: "Get PR Details",
    description: "Get comprehensive information about a pull request",
    inputSchema: {
      number: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe(
          "PR number, use git branch --show-current to get the branch name and then use the `list_my_prs` tool to get the PR number"
        ),
      ...repositoryContextSchema,
    },
  },

  EDIT_PR: {
    title: "Edit Pull Request",
    description:
      "Edit an existing pull request - update title, body, base branch, or state",
    inputSchema: {
      number: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe("PR number to edit"),
      title: z
        .string()
        .min(1, "PR title cannot be empty")
        .max(256, "PR title cannot exceed 256 characters")
        .optional()
        .describe("New PR title (optional)"),
      body: z
        .string()
        .min(1, "PR body cannot be empty")
        .optional()
        .describe("New PR body/description (optional)"),
      base: z
        .string()
        .min(1, "Base branch cannot be empty")
        .regex(
          /^[a-zA-Z0-9][a-zA-Z0-9._\/-]*$/,
          "Invalid branch name format. Branch names must start with alphanumeric and can contain ., _, /, -"
        )
        .optional()
        .describe("New base branch (optional)"),
      state: z
        .enum(["open", "closed"])
        .optional()
        .describe("Change PR state: open or closed (optional)"),
      addLabels: z
        .array(
          z
            .string()
            .min(1, "Label cannot be empty")
            .max(50, "Label cannot exceed 50 characters")
        )
        .max(20, "Cannot add more than 20 labels at once")
        .optional()
        .default([])
        .describe("Labels to add to the PR (default: [])"),
      removeLabels: z
        .array(
          z
            .string()
            .min(1, "Label cannot be empty")
            .max(50, "Label cannot exceed 50 characters")
        )
        .max(20, "Cannot remove more than 20 labels at once")
        .optional()
        .default([])
        .describe("Labels to remove from the PR (default: [])"),
      ...repositoryContextSchema,
    },
  },

  ENABLE_PREVIEW_ENV: {
    title: "Enable Preview Environment",
    description: "Enable preview environment for a pull request",
    inputSchema: {
      prNumber: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe(
          "The PR number to enable preview env for. Please use the `get_pr_details` tool to get the PR number"
        ),
      ...repositoryContextSchema,
    },
  },

  LIST_MY_PRS: {
    title: "List My PRs",
    description: "List pull requests with versatile filtering options",
    inputSchema: {
      author: z
        .string()
        .min(1, "Author username cannot be empty")
        .max(39, "GitHub usernames cannot exceed 39 characters")
        .regex(
          /^@me$|^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
          'Invalid GitHub username format. Use "@me" or a valid GitHub username (alphanumeric and hyphens, cannot start/end with hyphen)'
        )
        .optional()
        .default("@me")
        .describe(
          'Filter by author username. Use "@me" for your own PRs (default: "@me")'
        ),
      state: z
        .enum(["open", "closed", "merged", "all"])
        .optional()
        .default("open")
        .describe("PR state filter (default: open)"),
      isDraft: z
        .boolean()
        .optional()
        .describe(
          "Filter by draft status: true for only drafts, false for only ready PRs, undefined for all"
        ),
      dateFrom: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date must be in ISO format: YYYY-MM-DD (e.g., 2025-01-15)"
        )
        .refine(
          (date) => {
            const parsed = new Date(date);
            return (
              !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
            );
          },
          {
            message:
              "Invalid date. Must be a valid calendar date (e.g., 2025-01-15)",
          }
        )
        .optional()
        .describe(
          "Filter PRs created/updated after this date (ISO format: YYYY-MM-DD)"
        ),
      dateTo: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date must be in ISO format: YYYY-MM-DD (e.g., 2025-01-31)"
        )
        .refine(
          (date) => {
            const parsed = new Date(date);
            return (
              !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
            );
          },
          {
            message:
              "Invalid date. Must be a valid calendar date (e.g., 2025-01-31)",
          }
        )
        .optional()
        .describe(
          "Filter PRs created/updated before this date (ISO format: YYYY-MM-DD)"
        ),
      limit: z
        .number()
        .int("Limit must be a whole number")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .optional()
        .default(10)
        .describe("Maximum number of PRs to return (default: 10)"),
      includeLabels: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include labels in output (default: true)"),
      includeStats: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Include addition/deletion/file change statistics (default: false)"
        ),
      ...repositoryContextSchema,
    },
  },

  CHECKOUT_PR_BRANCH: {
    title: "Checkout PR Branch",
    description: "Switch to the branch of a specific pull request",
    inputSchema: {
      prNumber: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe("PR number to checkout"),
      createLocal: z
        .boolean()
        .optional()
        .default(true)
        .describe("Create local branch if it doesn't exist (default: true)"),
      ...repositoryContextSchema,
    },
  },

  GET_PR_COMMENTS: {
    title: "Get PR Comments",
    description:
      "Retrieve all comments from a pull request with filtering and grouping options",
    inputSchema: {
      prNumber: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe("PR number"),
      includeGeneralComments: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include general PR comments (default: true)"),
      includeReviewComments: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include review comments (default: true)"),
      includeInlineComments: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include inline code comments (default: true)"),
      includeResolved: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include resolved comments (default: true)"),
      filterByAuthor: z
        .string()
        .min(1, "Author username cannot be empty")
        .optional()
        .describe("Filter comments by author username (optional)"),
      groupBy: z
        .enum(["type", "author", "file", "chronological"])
        .optional()
        .default("chronological")
        .describe(
          "Group comments by type, author, file, or chronological order (default: chronological)"
        ),
      maxComments: z
        .number()
        .int("Max comments must be a whole number")
        .min(1, "Max comments must be at least 1")
        .max(500, "Max comments cannot exceed 500")
        .optional()
        .default(100)
        .describe("Maximum number of comments to return (default: 100)"),
      ...repositoryContextSchema,
    },
  },

  GET_PR_DIFF_SUMMARY: {
    title: "Get PR Diff Summary",
    description:
      "Get a detailed summary of changes in a pull request with file statistics",
    inputSchema: {
      prNumber: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe("PR number"),
      includeFileStats: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include detailed file-level statistics (default: true)"),
      maxFiles: z
        .number()
        .int("Max files must be a whole number")
        .min(1, "Max files must be at least 1")
        .max(100, "Max files cannot exceed 100")
        .optional()
        .default(20)
        .describe(
          "Maximum number of files to include in the summary (default: 20)"
        ),
      ...repositoryContextSchema,
    },
  },

  GET_PR_STATS: {
    title: "Get PR Statistics",
    description:
      "Get statistics about your merged PRs for different time periods",
    inputSchema: {
      period: z
        .enum(["day", "week", "month"])
        .describe("Time period for statistics"),
      includeRepoBreakdown: z
        .boolean()
        .optional()
        .describe("Include breakdown by repository"),
      includeDailyBreakdown: z
        .boolean()
        .optional()
        .describe("Include day-by-day breakdown"),
      ...repositoryContextSchema,
    },
  },

  // JIRA Tools
  GET_JIRA_SPRINTS: {
    title: "Get JIRA Sprints",
    description:
      "List JIRA sprints with filtering options. Requires ACLI to be installed and authenticated (run 'acli login').",
    inputSchema: {
      site: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .describe(
          "JIRA site URL (e.g., 'https://yourcompany.atlassian.net'). If not provided, uses default from ACLI config."
        ),
      boardId: z
        .number()
        .int("Board ID must be an integer")
        .positive("Board ID must be positive")
        .optional()
        .describe(
          "Filter sprints by board ID. Use get_jira_boards to find board IDs."
        ),
      state: z
        .enum(["future", "active", "closed", "all"])
        .optional()
        .default("all")
        .describe(
          "Filter by sprint state: future (not started), active (in progress), closed (completed), or all (default: all)"
        ),
      maxResults: z
        .number()
        .int("Max results must be an integer")
        .min(1, "Must return at least 1 result")
        .max(100, "Cannot exceed 100 results")
        .optional()
        .default(50)
        .describe("Maximum number of sprints to return (default: 50)"),
      includeTickets: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Include detailed ticket information for each sprint (default: false). Note: This makes the request slower."
        ),
    },
  },

  GET_JIRA_SPRINT_DETAILS: {
    title: "Get JIRA Sprint Details",
    description:
      "Get detailed information about a specific sprint including all tickets, progress stats, and burndown data.",
    inputSchema: {
      site: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .describe(
          "JIRA site URL (e.g., 'https://yourcompany.atlassian.net'). If not provided, uses default from ACLI config."
        ),
      sprintId: z
        .number()
        .int("Sprint ID must be an integer")
        .positive("Sprint ID must be positive")
        .describe("The sprint ID to get details for"),
      groupBy: z
        .enum(["status", "assignee", "type", "priority"])
        .optional()
        .default("status")
        .describe(
          "Group tickets by: status, assignee, type, or priority (default: status)"
        ),
      includeSubtasks: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include subtasks in the ticket list (default: false)"),
    },
  },

  GET_JIRA_BOARDS: {
    title: "Get JIRA Boards",
    description: "List JIRA boards for a project or site",
    inputSchema: {
      site: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .describe(
          "JIRA site URL (e.g., 'https://yourcompany.atlassian.net'). If not provided, uses default from ACLI config."
        ),
      projectKey: z
        .string()
        .min(1, "Project key cannot be empty")
        .regex(
          /^[A-Z][A-Z0-9]*$/,
          "Project key must be uppercase alphanumeric (e.g., 'PUX', 'INCIDENT')"
        )
        .optional()
        .describe("Filter boards by project key (e.g., 'PUX')"),
      type: z
        .enum(["scrum", "kanban"])
        .optional()
        .describe("Filter by board type: scrum or kanban"),
      maxResults: z
        .number()
        .int("Max results must be an integer")
        .min(1, "Must return at least 1 result")
        .max(100, "Cannot exceed 100 results")
        .optional()
        .default(50)
        .describe("Maximum number of boards to return (default: 50)"),
    },
  },

  GET_MY_JIRA_TICKETS: {
    title: "Get My JIRA Tickets",
    description:
      "Get all JIRA tickets assigned to you with filtering options. Uses JQL: 'assignee = currentUser()'",
    inputSchema: {
      site: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .describe(
          "JIRA site URL (e.g., 'https://yourcompany.atlassian.net'). If not provided, uses default from ACLI config."
        ),
      status: z
        .string()
        .min(1, "Status cannot be empty")
        .optional()
        .describe(
          "Filter by ticket status (e.g., 'To Do', 'In Progress', 'Done', 'In Review'). Case-sensitive."
        ),
      sprint: z
        .enum(["open", "closed", "all"])
        .optional()
        .describe(
          "Filter by sprint: 'open' (active/future sprints), 'closed' (completed sprints), 'all' (no sprint filter)"
        ),
      maxResults: z
        .number()
        .int("Max results must be an integer")
        .min(1, "Must return at least 1 result")
        .max(100, "Cannot exceed 100 results")
        .optional()
        .default(50)
        .describe("Maximum number of tickets to return (default: 50)"),
      groupBy: z
        .enum(["status", "priority", "type"])
        .optional()
        .default("status")
        .describe(
          "Group tickets in table by: status, priority, or type (default: status)"
        ),
    },
  },

  CREATE_JIRA_TICKET: {
    title: "Create JIRA Ticket",
    description:
      "Create a new JIRA ticket (work item) with summary, description, assignee, and labels. Supports creating bugs, tasks, stories, and subtasks. Use confirm=false first to preview, then confirm=true to create.",
    inputSchema: {
      site: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .describe(
          "JIRA site URL (e.g., 'https://yourcompany.atlassian.net'). If not provided, uses default from ACLI config."
        ),
      project: z
        .string()
        .min(1, "Project key cannot be empty")
        .max(10, "Project key cannot exceed 10 characters")
        .regex(
          /^[A-Z][A-Z0-9]*$/,
          "Project key must be uppercase alphanumeric (e.g., 'PUX', 'INCIDENT', 'TEAM')"
        )
        .describe("REQUIRED: Project key where ticket will be created (e.g., 'PUX', 'INCIDENT')"),
      type: z
        .enum(["Task", "Bug", "Story", "Epic", "Subtask"])
        .describe(
          "REQUIRED: Ticket type. Common types: Task (general work), Bug (defect), Story (user story), Epic (large initiative), Subtask (child task)"
        ),
      summary: z
        .string()
        .min(1, "Summary cannot be empty")
        .max(255, "Summary cannot exceed 255 characters")
        .describe(
          "REQUIRED: Brief title/summary of the ticket (e.g., 'Fix login bug', 'Implement dark mode')"
        ),
      description: z
        .string()
        .max(32000, "Description cannot exceed 32000 characters")
        .optional()
        .describe(
          "Description of the ticket. IMPORTANT: Keep it SHORT and concise (2-3 sentences max). Use PLAIN TEXT ONLY - do NOT use markdown, bullet points, or special formatting. ACLI/JIRA may not handle markdown properly. Example: 'Users are unable to log in after password reset. The login button becomes unresponsive. Steps: 1. Reset password 2. Try to log in 3. Button does not work.'"
        ),
      assignee: z
        .string()
        .optional()
        .describe(
          "Assign ticket to user by email (e.g., 'user@company.com'), account ID, or '@me' for self-assignment. Defaults to '@me' if not specified."
        ),
      labels: z
        .array(z.string().min(1, "Label cannot be empty"))
        .optional()
        .describe(
          "Array of labels to add to the ticket (e.g., ['bug', 'urgent', 'backend']). Labels help categorize and filter tickets."
        ),
      priority: z
        .enum(["Highest", "High", "Medium", "Low", "Lowest"])
        .optional()
        .describe(
          "Ticket priority level. Defaults to 'Medium' if not specified."
        ),
      parent: z
        .string()
        .regex(
          /^[A-Z]+-\d+$/,
          "Parent must be a valid ticket key (e.g., 'PUX-123')"
        )
        .optional()
        .describe(
          "Parent ticket key for creating subtasks (e.g., 'PUX-123'). Only use when creating a Subtask type."
        ),
      confirm: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Set to true to create the ticket. If false (default), shows a preview for user review. Two-step flow: (1) call with confirm=false to preview, (2) call with confirm=true to create."
        ),
    },
  },

  UPDATE_JIRA_TICKET_STATUS: {
    title: "Update JIRA Ticket Status",
    description:
      "Transition a JIRA ticket to a new status (e.g., 'To Do' → 'In Progress' → 'Done'). " +
      "This updates the ticket's workflow status. Common statuses include: To Do, In Progress, Done, Blocked, In Review.",
    inputSchema: {
      site: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .describe(
          "JIRA site URL (e.g., 'https://yourcompany.atlassian.net'). If not provided, uses default from ACLI config."
        ),
      ticketKey: z
        .string()
        .min(1, "Ticket key is required")
        .regex(
          /^[A-Z]+-\d+$/,
          "Ticket key must be in format 'PROJECT-123' (e.g., 'PUX-456', 'INCIDENT-789')"
        )
        .describe(
          "REQUIRED: JIRA ticket key to update (e.g., 'PUX-123', 'INCIDENT-456')"
        ),
      status: z
        .string()
        .min(1, "Status is required")
        .describe(
          "REQUIRED: Target status to transition to (e.g., 'In Progress', 'Done', 'Blocked', 'In Review'). Must be a valid status in your JIRA workflow."
        ),
    },
  },

  // Highlight Management Tools
  CREATE_HIGHLIGHT: {
    title: "Create Performance Highlight",
    description: CREATE_HIGHLIGHT_SCHEMA.description,
    inputSchema: {
      userId: CREATE_HIGHLIGHT_SCHEMA.inputSchema.properties.userId,
      title: CREATE_HIGHLIGHT_SCHEMA.inputSchema.properties.title,
      description: CREATE_HIGHLIGHT_SCHEMA.inputSchema.properties.description,
      artifactType: CREATE_HIGHLIGHT_SCHEMA.inputSchema.properties.artifactType,
      artifactUrl: CREATE_HIGHLIGHT_SCHEMA.inputSchema.properties.artifactUrl,
      achievedAt: CREATE_HIGHLIGHT_SCHEMA.inputSchema.properties.achievedAt,
      apolloValueIds: CREATE_HIGHLIGHT_SCHEMA.inputSchema.properties.apolloValueIds,
    },
  },

  GET_MY_HIGHLIGHTS: {
    title: "Get My Highlights",
    description: GET_MY_HIGHLIGHTS_SCHEMA.description,
    inputSchema: {
      userId: GET_MY_HIGHLIGHTS_SCHEMA.inputSchema.properties.userId,
      startDate: GET_MY_HIGHLIGHTS_SCHEMA.inputSchema.properties.startDate,
      endDate: GET_MY_HIGHLIGHTS_SCHEMA.inputSchema.properties.endDate,
      apolloValue: GET_MY_HIGHLIGHTS_SCHEMA.inputSchema.properties.apolloValue,
      artifactType: GET_MY_HIGHLIGHTS_SCHEMA.inputSchema.properties.artifactType,
    },
  },

  GET_HIGHLIGHT_SUMMARY: {
    title: "Get Highlight Summary",
    description: GET_HIGHLIGHT_SUMMARY_SCHEMA.description,
    inputSchema: {
      userId: GET_HIGHLIGHT_SUMMARY_SCHEMA.inputSchema.properties.userId,
      startDate: GET_HIGHLIGHT_SUMMARY_SCHEMA.inputSchema.properties.startDate,
      endDate: GET_HIGHLIGHT_SUMMARY_SCHEMA.inputSchema.properties.endDate,
    },
  },

  LIST_APOLLO_VALUES: {
    title: "List Apollo Values",
    description: LIST_APOLLO_VALUES_SCHEMA.description,
    inputSchema: {},
  },
} as const;
