/**
 * PR Comments handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse, PRComment, PRCommentsResponse } from "../types/index.js";
import { GitHubCli } from "../utils/github-cli.js";

export async function handleGetPRComments(args: {
  prNumber: number;
  includeGeneralComments?: boolean;
  includeReviewComments?: boolean;
  includeInlineComments?: boolean;
  includeResolved?: boolean;
  filterByAuthor?: string;
  groupBy?: "type" | "author" | "file" | "chronological";
  maxComments?: number;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = new GitHubCli(args.repo || "");

    // Fetch comments
    const comments = await githubCli.getPRComments({
      prNumber: args.prNumber,
      ...(args.includeGeneralComments !== undefined && {
        includeGeneralComments: args.includeGeneralComments,
      }),
      ...(args.includeReviewComments !== undefined && {
        includeReviewComments: args.includeReviewComments,
      }),
      ...(args.includeInlineComments !== undefined && {
        includeInlineComments: args.includeInlineComments,
      }),
      ...(args.includeResolved !== undefined && {
        includeResolved: args.includeResolved,
      }),
      ...(args.filterByAuthor !== undefined && {
        filterByAuthor: args.filterByAuthor,
      }),
      ...(args.maxComments !== undefined && {
        maxComments: args.maxComments,
      }),
    });

    // Calculate breakdown
    const breakdown = {
      general: comments.filter((c) => c.type === "general").length,
      reviews: comments.filter((c) => c.type === "review").length,
      inline: comments.filter((c) => c.type === "inline").length,
      resolved: comments.filter((c) => c.isResolved === true).length,
      unresolved: comments.filter((c) => c.isResolved === false).length,
    };

    // Get unique authors and files
    const authors = [...new Set(comments.map((c) => c.author.login))];
    const files = [
      ...new Set(comments.filter((c) => c.path).map((c) => c.path!)),
    ];

    // Group comments based on preference
    const groupedComments = groupComments(
      comments,
      args.groupBy || "chronological"
    );

    // Build response
    const response: PRCommentsResponse = {
      prNumber: args.prNumber,
      totalComments: comments.length,
      breakdown,
      comments: groupedComments,
      authors,
      files,
    };

    // Format output
    const output = formatCommentsOutput(response);

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error fetching PR comments: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

function groupComments(
  comments: PRComment[],
  groupBy: "type" | "author" | "file" | "chronological"
): PRComment[] {
  switch (groupBy) {
    case "chronological":
      return comments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    case "type":
      return comments.sort((a, b) => {
        const order = { general: 0, review: 1, inline: 2 };
        return order[a.type] - order[b.type];
      });

    case "author":
      return comments.sort((a, b) =>
        a.author.login.localeCompare(b.author.login)
      );

    case "file":
      return comments.sort((a, b) => {
        if (!a.path && !b.path) return 0;
        if (!a.path) return 1;
        if (!b.path) return -1;
        return a.path.localeCompare(b.path);
      });

    default:
      return comments;
  }
}

function formatCommentsOutput(response: PRCommentsResponse): string {
  let output = `📝 Comments on PR #${response.prNumber}\n\n`;

  // Summary
  output += `📊 Summary:\n`;
  output += `  Total: ${response.totalComments} comments\n`;
  output += `  💬 General: ${response.breakdown.general}\n`;
  output += `  ⭐ Reviews: ${response.breakdown.reviews}\n`;
  output += `  💻 Inline: ${response.breakdown.inline}\n`;

  if (response.breakdown.resolved > 0 || response.breakdown.unresolved > 0) {
    output += `  ✅ Resolved: ${response.breakdown.resolved}\n`;
    output += `  🔴 Unresolved: ${response.breakdown.unresolved}\n`;
  }

  output += `\n👥 Authors: ${response.authors.join(", ")}\n`;

  if (response.files.length > 0) {
    output += `\n📁 Files with comments: ${response.files.length}\n`;
    response.files.slice(0, 10).forEach((file) => {
      output += `  • ${file}\n`;
    });
    if (response.files.length > 10) {
      output += `  ... and ${response.files.length - 10} more\n`;
    }
  }

  output += `\n${"=".repeat(60)}\n\n`;

  // Comments
  response.comments.forEach((comment, index) => {
    output += formatSingleComment(comment, index + 1);
    output += `\n${"-".repeat(60)}\n\n`;
  });

  return output;
}

function formatSingleComment(comment: PRComment, index: number): string {
  let output = `[${index}] `;

  // Type icon
  const icons = { general: "💬", review: "⭐", inline: "💻" };
  output += `${icons[comment.type]} `;

  // Author and timestamp
  output += `@${comment.author.login} `;
  output += `(${new Date(comment.createdAt).toLocaleString()})\n`;

  // Review state
  if (comment.reviewState) {
    const stateEmoji = {
      APPROVED: "✅",
      CHANGES_REQUESTED: "❌",
      COMMENTED: "💭",
      DISMISSED: "🚫",
    };
    output += `${stateEmoji[comment.reviewState]} ${comment.reviewState}\n`;
  }

  // File and line info
  if (comment.path) {
    output += `📄 ${comment.path}`;
    if (comment.line) {
      output += `:${comment.line}`;
    }
    output += `\n`;
  }

  // Resolution status
  if (comment.isResolved !== undefined) {
    output += comment.isResolved ? "✅ Resolved\n" : "🔴 Unresolved\n";
  }

  // Comment body
  output += `\n${comment.body}\n`;

  // URL
  if (comment.url) {
    output += `\n🔗 ${comment.url}\n`;
  }

  return output;
}
