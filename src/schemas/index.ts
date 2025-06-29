/**
 * Schema definitions for pr-buddy
 * Author: Shivaraj Bakale
 */

import { z } from "zod";

// PR Template in markdown format
const PR_TEMPLATE = `<!-- In your PR title make sure to prefix with the JIRA ticket: [INCIDENT-###] PR Title Here -->

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

## AI Tooling Contribution

Please provide an impact score (0-5 scale) for using AI Code Editor tools (e.g., Cursor, GitHub Copilot, Windsurf, etc.) in the relevant phases of this PR, where 0 = no usage and 5 = 100% generated/greatest help.

- **ai_speed_boost_impact**: \\__ [e.g., 3] (Impact during the coding phase - coding, debugging, test generation etc.)_

- **ai_ideation_help_impact**: \\__ [e.g., 2] (Impact during the ideation phase - PRD/ERD drafting, Solution brainstorming, documentation, etc.)_

- **What worked well?** \\__ [e.g., Cursor generated 90% of the unit tests for X component, saving 2 hours of manual work. OR Bugbot helped finding a critical bug & solving it quickly OR AI tool helped draft initial RCA outline very fast.]_`;

// Common repository context schema
const repositoryContextSchema = {
  repositoryUrl: z
    .string()
    .describe(
      "GitHub repository, please do a `git config --get remote.origin.url` to get the details about the repository and then use the output to parse the repository name"
    ),
};

export const SCHEMAS = {
  CREATE_PR: {
    title: "Create the PR",
    description: "Create a new pull request with template formatting",
    inputSchema: {
      title: z
        .string()
        .describe(
          "Please prefix the title with the JIRA ticket: [INCIDENT-###] - PR Title Here, if no ticket is provided, please use `NOTICKET`- PR Title Here"
        ),
      body: z
        .string()
        .optional()
        .describe(
          `Please do a diff with the base branch (master) and provide the new changes in the PR description/body and then generatre the description using the following template :\n\n${PR_TEMPLATE}`
        ),
      template: z
        .enum(["feature", "bugfix", "hotfix", "docs", "refactor"])
        .optional()
        .describe("PR template type"),
      base: z.string().optional().describe("Base branch (defaults to main)"),
      head: z
        .string()
        .optional()
        .describe("Head branch (defaults to current branch)"),
      labels: z
        .array(z.string())
        .optional()
        .describe("Labels to add to the PR"),
      reviewers: z.array(z.string()).optional().describe("Reviewers to assign"),
      assignees: z
        .array(z.string())
        .optional()
        .describe("Assignees for the PR"),
      draft: z.boolean().optional().describe("Create as draft PR"),
      ...repositoryContextSchema,
    },
  },

  GET_PR_DETAILS: {
    title: "Get PR Details",
    description: "Get comprehensive information about a pull request",
    inputSchema: {
      number: z.number().optional().describe("PR number"),
      url: z.string().optional().describe("PR URL (alternative to number)"),
      ...repositoryContextSchema,
    },
  },

  LIST_MY_PRS: {
    title: "List My PRs",
    description: "List current user's pull requests",
    inputSchema: {
      state: z
        .enum(["open", "closed", "merged", "all"])
        .optional()
        .describe("PR state filter"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of PRs to return"),
      ...repositoryContextSchema,
    },
  },

  CHECKOUT_PR_BRANCH: {
    title: "Checkout PR Branch",
    description: "Switch to the branch of a specific pull request",
    inputSchema: {
      prNumber: z.number().describe("PR number to checkout"),
      createLocal: z
        .boolean()
        .optional()
        .describe("Create local branch if it doesn't exist"),
      ...repositoryContextSchema,
    },
  },

  ADD_PR_LABEL: {
    title: "Add PR Label",
    description: "Add labels to a pull request (including Need_preview_env)",
    inputSchema: {
      prNumber: z.number().describe("PR number"),
      labels: z.array(z.string()).describe("Labels to add"),
      ...repositoryContextSchema,
    },
  },

  REMOVE_PR_LABEL: {
    title: "Remove PR Label",
    description: "Remove labels from a pull request",
    inputSchema: {
      prNumber: z.number().describe("PR number"),
      labels: z.array(z.string()).describe("Labels to remove"),
      ...repositoryContextSchema,
    },
  },

  GENERATE_REVIEW_PROMPT: {
    title: "Generate Review Prompt",
    description: "Create a staff engineer-level review prompt for a PR",
    inputSchema: {
      prNumber: z.number().describe("PR number"),
      reviewType: z
        .enum(["staff-engineer", "security", "performance"])
        .optional()
        .describe("Type of review prompt"),
      ...repositoryContextSchema,
    },
  },

  GENERATE_CODE_CHECKLIST: {
    title: "Generate Code Checklist",
    description: "Create a comprehensive code review checklist",
    inputSchema: {
      prNumber: z.number().describe("PR number"),
      includeSecurityChecks: z
        .boolean()
        .optional()
        .describe("Include security-focused checklist items"),
      includePerformanceChecks: z
        .boolean()
        .optional()
        .describe("Include performance-focused checklist items"),
      ...repositoryContextSchema,
    },
  },

  ANALYZE_PR_COMPLEXITY: {
    title: "Analyze PR Complexity",
    description: "Assess the complexity and review requirements of a PR",
    inputSchema: {
      prNumber: z.number().describe("PR number"),
      includeRecommendations: z
        .boolean()
        .optional()
        .describe("Include improvement recommendations"),
      ...repositoryContextSchema,
    },
  },

  GET_PR_DIFF_SUMMARY: {
    title: "Get PR Diff Summary",
    description: "Get a condensed summary of PR changes and statistics",
    inputSchema: {
      prNumber: z.number().describe("PR number"),
      includeFileStats: z
        .boolean()
        .optional()
        .describe("Include per-file statistics"),
      maxFiles: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of files to show"),
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

  ENABLE_PREVIEW_ENV: {
    title: "Enable Preview Environment",
    description: "Enable the preview environment for a repository",
    inputSchema: {
      ...repositoryContextSchema,
    },
  },
} as const;
