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
          "PR title. If already formatted as '[TICKET-###]- Title', it will be used as-is. Otherwise (including 'NOTICKET- Title'), the tool will prompt for JIRA ticket number and format automatically."
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
    description: "Edit an existing pull request - update title, body, base branch, or state",
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
            return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
          },
          { message: "Invalid date. Must be a valid calendar date (e.g., 2025-01-15)" }
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
            return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
          },
          { message: "Invalid date. Must be a valid calendar date (e.g., 2025-01-31)" }
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

  GENERATE_REVIEW_PROMPT: {
    title: "Generate Review Prompt",
    description: "Create a staff engineer-level review prompt for a PR",
    inputSchema: {
      prNumber: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe("PR number"),
      reviewType: z
        .enum([
          "staff-engineer",
          "security",
          "performance",
          "architecture",
          "junior-dev",
        ])
        .optional()
        .describe("Type of review prompt"),
      ...repositoryContextSchema,
    },
  },

  GENERATE_CODE_CHECKLIST: {
    title: "Generate Code Checklist",
    description: "Create a comprehensive code review checklist",
    inputSchema: {
      prNumber: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe("PR number"),
      includeSecurityChecks: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include security-focused checklist items (default: true)"),
      includePerformanceChecks: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include performance-focused checklist items (default: true)"),
      ...repositoryContextSchema,
    },
  },

  ANALYZE_PR_COMPLEXITY: {
    title: "Analyze PR Complexity",
    description: "Assess the complexity and review requirements of a PR",
    inputSchema: {
      prNumber: z
        .number()
        .int("PR number must be a whole number")
        .positive("PR number must be positive")
        .describe("PR number"),
      includeRecommendations: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include improvement recommendations (default: true)"),
      ...repositoryContextSchema,
    },
  },

  GET_PR_DIFF_SUMMARY: {
    title: "Get PR Diff Summary",
    description: "Get a detailed summary of changes in a pull request with file statistics",
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
        .describe("Maximum number of files to include in the summary (default: 20)"),
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
} as const;
