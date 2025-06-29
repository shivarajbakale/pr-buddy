/**
 * Schema definitions for pr-buddy
 * Author: Shivaraj Bakale
 */

import { z } from "zod";

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
      title: z.string().describe("PR title"),
      body: z.string().optional().describe("PR description/body"),
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

  READ_FILE: {
    title: "Read File",
    description: "Read the contents of a file",
    inputSchema: {
      path: z.string().describe("Path to the file to read"),
    },
  },

  WRITE_FILE: {
    title: "Write File",
    description: "Write content to a file",
    inputSchema: {
      path: z.string().describe("Path to the file to write"),
      content: z.string().describe("Content to write to the file"),
    },
  },

  LIST_DIRECTORY: {
    title: "List Directory",
    description: "List the contents of a directory",
    inputSchema: {
      path: z.string().describe("Path to the directory to list"),
    },
  },
} as const;
