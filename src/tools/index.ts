/**
 * Tool name constants for pr-buddy
 * Author: Shivaraj Bakale
 */

export const TOOLS = {
  READ_FILE: "read_file",
  WRITE_FILE: "write_file",
  LIST_DIRECTORY: "list_directory",

  CREATE_PR: "create_pr",
  GET_PR_DETAILS: "get_pr_details",
  LIST_MY_PRS: "list_my_prs",
  CHECKOUT_PR_BRANCH: "checkout_pr_branch",
  ADD_PR_LABEL: "add_pr_label",
  REMOVE_PR_LABEL: "remove_pr_label",
  ENABLE_PREVIEW_ENV: "enable_preview_env",

  GENERATE_REVIEW_PROMPT: "generate_review_prompt",
  GENERATE_CODE_CHECKLIST: "generate_code_checklist",
  ANALYZE_PR_COMPLEXITY: "analyze_pr_complexity",
  GET_PR_DIFF_SUMMARY: "get_pr_diff_summary",

  GET_PR_STATS: "get_pr_stats",
} as const;
