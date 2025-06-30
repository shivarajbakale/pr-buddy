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
    .describe(
      "GitHub repository, please do a `git config --get remote.origin.url` to get the details about the repository and then use the output to parse the repository name"
    ),
};

export const SCHEMAS = {
  CREATE_PR: {
    title: "Create Pull Request",
    description: "Create a new pull request with template formatting",
    inputSchema: {
      title: z.string().describe(
        `PR title, please ask the user to provide the JIRA ticket number if not provided. If the user does not provide the JIRA ticket number, please use the default value "NOTICKET".
          The format for creating the title should be '[JIRA_TICKET-NUMBER]- PR Title'. For the PR title, please understand the changes in the PR after doing a diff with the base branch. 
          IF no ticket is specified then use the default to :  'NOTICKET - PR Title'.
          `
      ),
      body: z
        .string()
        .optional()
        .describe(
          `Please use the following format to create the PR: ${PR_TEMPLATE}. 
          Please do a diff with the base branch to understand the changes in the PR and then use the diff to create the PR body.
          Make sure its very simple and easy to understand. Do not complicate with too many technical details.
          `
        ),
      base: z
        .string()
        .optional()
        .describe("Base branch (defaults to master)")
        .default("master"),
      head: z
        .string()
        .optional()
        .describe(
          "Head branch (defaults to current branch). Get the branch using `git branch --show-current`"
        ),
      labels: z
        .array(z.string())
        .optional()
        .describe(
          "Labels to add to the PR. If the user specifies that they want to enable preview environment, add the label `Need_preview_env`"
        ),
      draft: z.boolean().optional().describe("Create as draft PR"),
      ...repositoryContextSchema,
    },
  },

  GET_PR_DETAILS: {
    title: "Get PR Details",
    description: "Get comprehensive information about a pull request",
    inputSchema: {
      number: z
        .number()
        .describe(
          "PR number, use git branch --show-current to get the branch name and then use the `list_my_prs` tool to get the PR number"
        ),
      ...repositoryContextSchema,
    },
  },

  ENABLE_PREVIEW_ENV: {
    title: "Enable Preview Environment",
    description: "Enable preview environment for a pull request",
    inputSchema: {
      prNumber: z
        .number()
        .describe(
          "The PR number to enable preview env for. Please use the `get_pr_details` tool to get the PR number"
        ),
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

  GENERATE_REVIEW_PROMPT: {
    title: "Generate Review Prompt",
    description: "Create a staff engineer-level review prompt for a PR",
    inputSchema: {
      prNumber: z.number().describe("PR number"),
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
