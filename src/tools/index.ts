/**
 * Tool name constants for pr-buddy
 * Author: Shivaraj Bakale
 */

export const TOOLS = {
  // GitHub/PR Tools
  CREATE_PR: "create_pr",
  GET_PR_DETAILS: "get_pr_details",
  EDIT_PR: "edit_pr",
  LIST_MY_PRS: "list_my_prs",
  CHECKOUT_PR_BRANCH: "checkout_pr_branch",
  ENABLE_PREVIEW_ENV: "enable_preview_env",
  GET_PR_COMMENTS: "get_pr_comments",
  GET_PR_DIFF_SUMMARY: "get_pr_diff_summary",
  GET_PR_STATS: "get_pr_stats",

  // JIRA Tools
  GET_JIRA_SPRINTS: "get_jira_sprints",
  GET_JIRA_SPRINT_DETAILS: "get_jira_sprint_details",
  GET_JIRA_BOARDS: "get_jira_boards",
  GET_MY_JIRA_TICKETS: "get_my_jira_tickets",
  CREATE_JIRA_TICKET: "create_jira_ticket",

  // Highlight Management Tools (Performance Reviews)
  CREATE_HIGHLIGHT: "create_highlight",
  GET_MY_HIGHLIGHTS: "get_my_highlights",
  GET_HIGHLIGHT_SUMMARY: "get_highlight_summary",
  LIST_APOLLO_VALUES: "list_apollo_values",
} as const;
