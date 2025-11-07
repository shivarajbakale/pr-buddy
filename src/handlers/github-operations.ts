/**
 * GitHub operation handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolResponse } from "../types/index.js";
import { GitHubCli } from "../utils/github-cli.js";

// Helper function to create GitHubCli with repository context
function createGitHubCli(repo: string): GitHubCli {
  return new GitHubCli(repo);
}

export async function handleCreatePR(
  args: {
    title: string;
    body: string;
    base: string;
    head: string;
    labels: string[];
    draft: boolean;
    repo?: string;
  },
  server?: McpServer
): Promise<ToolResponse> {
  try {
    let formattedTitle = args.title;

    // Check if title already has JIRA ticket format
    const hasJiraPrefix = /^\[([A-Z]+-\d+)\]-\s/.test(args.title);

    // Only elicit if:
    // 1. Server instance is provided (supports elicitation)
    // 2. Title doesn't already have JIRA prefix
    // Note: We still elicit even if title has NOTICKET prefix, to give user a chance to add ticket
    if (server && !hasJiraPrefix) {
      // Remove NOTICKET prefix if present, so we can re-add it based on user response
      const titleWithoutNoTicket = args.title.replace(/^NOTICKET-\s*/, "");
      const result = await server.server.elicitInput({
        message:
          "What JIRA ticket is this PR for? (e.g., PUX-3114, INCIDENT-1234)",
        requestedSchema: {
          type: "object",
          properties: {
            hasTicket: {
              type: "boolean",
              title: "Is there a JIRA ticket for this PR?",
              description: "Uncheck if there is no associated JIRA ticket",
              default: true,
            },
            ticketNumber: {
              type: "string",
              title: "JIRA Ticket Number",
              description:
                "Enter the ticket number (e.g., PUX-3114, INCIDENT-1234)",
              pattern: "^[A-Z]+-\\d+$",
            },
          },
          required: ["hasTicket"],
        },
      });

      // Handle user response
      if (result.action === "cancel") {
        return {
          content: [{ type: "text", text: "❌ PR creation cancelled by user" }],
          isError: true,
        };
      }

      // Format title based on response
      // Use titleWithoutNoTicket to avoid double-prefixing if user provided "NOTICKET- Title"
      if (
        result.action === "accept" &&
        result.content?.["hasTicket"] &&
        result.content?.["ticketNumber"]
      ) {
        formattedTitle = `[${result.content["ticketNumber"]}]- ${titleWithoutNoTicket}`;
      } else {
        formattedTitle = `NOTICKET- ${titleWithoutNoTicket}`;
      }

      // Second elicitation: Ask about preview environment
      const previewResult = await server.server.elicitInput({
        message: "Do you want to enable a preview environment for this PR?",
        requestedSchema: {
          type: "object",
          properties: {
            enablePreview: {
              type: "boolean",
              title: "Enable Preview Environment",
              description:
                "Enable preview environment to test changes before merging",
              default: false,
            },
          },
          required: ["enablePreview"],
        },
      });

      // Handle preview environment response
      if (previewResult.action === "cancel") {
        return {
          content: [{ type: "text", text: "❌ PR creation cancelled by user" }],
          isError: true,
        };
      }

      // Add preview environment label if user accepted
      if (
        previewResult.action === "accept" &&
        previewResult.content?.["enablePreview"]
      ) {
        // Add the Need_preview_env label if not already in labels array
        if (!args.labels.includes("Need_preview_env")) {
          args.labels.push("Need_preview_env");
        }
      }
    }
    // If title already has JIRA prefix, use it as-is (formattedTitle = args.title)

    const githubCli = createGitHubCli(args.repo || "");
    const pr = await githubCli.createPR({
      title: formattedTitle,
      body: args.body,
      base: args.base,
      head: args.head,
      labels: args.labels,
    });
    // Build success message
    let successMessage = `✅ Successfully created PR #${pr.number}: ${
      pr.title
    }\n🔗 URL: ${pr.url}\n📝 Status: ${
      pr.isDraft ? "Draft" : "Ready for Review"
    }`;

    // Add preview environment info if enabled
    if (pr.labels.includes("Need_preview_env")) {
      successMessage += "\n🚀 Preview environment: Enabled";
    }

    return {
      content: [
        {
          type: "text",
          text: successMessage,
        },
      ],
    };
  } catch (error: any) {
    console.error("Error creating PR:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating PR: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleEditPR(args: {
  number: number;
  title?: string;
  body?: string;
  base?: string;
  state?: "open" | "closed";
  addLabels?: string[];
  removeLabels?: string[];
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = createGitHubCli(args.repo || "");

    // Validate at least one field is being updated
    if (
      !args.title &&
      !args.body &&
      !args.base &&
      !args.state &&
      (!args.addLabels || args.addLabels.length === 0) &&
      (!args.removeLabels || args.removeLabels.length === 0)
    ) {
      return {
        content: [
          {
            type: "text",
            text: "❌ At least one field must be provided to edit the PR (title, body, base, state, addLabels, or removeLabels)",
          },
        ],
        isError: true,
      };
    }

    // Build params object with only defined values
    const editParams: {
      number: number;
      title?: string;
      body?: string;
      base?: string;
      state?: "open" | "closed";
      addLabels?: string[];
      removeLabels?: string[];
    } = { number: args.number };

    if (args.title !== undefined) editParams.title = args.title;
    if (args.body !== undefined) editParams.body = args.body;
    if (args.base !== undefined) editParams.base = args.base;
    if (args.state !== undefined) editParams.state = args.state;
    if (args.addLabels !== undefined) editParams.addLabels = args.addLabels;
    if (args.removeLabels !== undefined)
      editParams.removeLabels = args.removeLabels;

    const pr = await githubCli.editPR(editParams);

    // Build summary of changes
    const changes = [];
    if (args.title) changes.push(`title updated`);
    if (args.body) changes.push(`description updated`);
    if (args.base) changes.push(`base branch changed to ${args.base}`);
    if (args.state) changes.push(`state changed to ${args.state}`);
    if (args.addLabels && args.addLabels.length > 0)
      changes.push(`added labels: ${args.addLabels.join(", ")}`);
    if (args.removeLabels && args.removeLabels.length > 0)
      changes.push(`removed labels: ${args.removeLabels.join(", ")}`);

    const summary = `✅ Successfully updated PR #${
      args.number
    }\n\n📝 Changes made:\n${changes.map((c) => `  • ${c}`).join("\n")}\n\n🔗 ${
      pr.url
    }`;

    return {
      content: [
        {
          type: "text",
          text: summary,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error editing PR: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetPRDetails(args: {
  number?: number;
  url?: string;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    if (!args.number) {
      throw new Error("PR number is required");
    }

    const githubCli = createGitHubCli(args.repo || "");
    const pr = await githubCli.getPRDetails(args.number);
    const details = `
📋 **PR #${pr.number}: ${pr.title}**

👤 **Author**: ${pr.author}
🌿 **Branch**: ${pr.headRefName} → ${pr.baseRefName}
📊 **State**: ${pr.state} ${pr.isDraft ? "(Draft)" : ""}
🔗 **URL**: ${pr.url}

📈 **Changes**:
- ✅ +${pr.additions} additions
- ❌ -${pr.deletions} deletions  
- 📁 ${pr.changedFiles} files changed

🏷️ **Labels**: ${pr.labels.length > 0 ? pr.labels.join(", ") : "None"}
👥 **Reviewers**: ${pr.reviewers.length > 0 ? pr.reviewers.join(", ") : "None"}
📅 **Created**: ${new Date(pr.createdAt).toLocaleDateString()}
📅 **Updated**: ${new Date(pr.updatedAt).toLocaleDateString()}

📝 **Description**:
${pr.body || "No description provided."}
`;

    return {
      content: [
        {
          type: "text",
          text: details.trim(),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error getting PR details: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleListMyPRs(args: {
  author?: string;
  state?: string;
  isDraft?: boolean;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  includeLabels?: boolean;
  includeStats?: boolean;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    // Validate date range logic
    if (args.dateFrom && args.dateTo) {
      const fromDate = new Date(args.dateFrom);
      const toDate = new Date(args.dateTo);

      if (fromDate > toDate) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Invalid date range: dateFrom (${args.dateFrom}) must be before or equal to dateTo (${args.dateTo})`,
            },
          ],
          isError: true,
        };
      }
    }

    // Validate dates are not in the future
    const now = new Date();
    if (args.dateFrom) {
      const fromDate = new Date(args.dateFrom);
      if (fromDate > now) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ Warning: dateFrom (${args.dateFrom}) is in the future. No PRs will match this filter.`,
            },
          ],
        };
      }
    }

    const githubCli = createGitHubCli(args.repo || "");

    const prs = await githubCli.listMyPRs(
      args.author!,
      args.state!,
      args.limit!,
      args.includeStats!,
      args.isDraft,
      args.dateFrom,
      args.dateTo
    );

    if (prs.length === 0) {
      const filters = [];
      if (args.state) filters.push(`state: ${args.state}`);
      if (args.isDraft !== undefined)
        filters.push(`draft: ${args.isDraft ? "yes" : "no"}`);
      if (args.dateFrom) filters.push(`from: ${args.dateFrom}`);
      if (args.dateTo) filters.push(`to: ${args.dateTo}`);

      return {
        content: [
          {
            type: "text",
            text: `No PRs found${
              filters.length > 0 ? ` with filters: ${filters.join(", ")}` : ""
            }`,
          },
        ],
      };
    }

    const prList = prs
      .map((pr: any) => {
        let prText = `📋 **PR #${pr.number}**: ${pr.title}\n`;
        prText += `   👤 Author: ${pr.author}\n`;
        prText += `   🌿 ${pr.headRefName} → ${pr.baseRefName}\n`;
        prText += `   📊 ${pr.state} ${pr.isDraft ? "(Draft)" : ""}\n`;

        if (args.includeLabels && pr.labels.length > 0) {
          prText += `   🏷️  Labels: ${pr.labels.join(", ")}\n`;
        }

        if (args.includeStats && pr.changedFiles > 0) {
          prText += `   📈 +${pr.additions} -${pr.deletions} (~${pr.changedFiles} files)\n`;
        }

        prText += `   📅 Updated: ${new Date(
          pr.updatedAt
        ).toLocaleDateString()}\n`;
        prText += `   🔗 ${pr.url}\n`;

        return prText;
      })
      .join("\n");

    const filterSummary = [];
    if (args.author && args.author !== "@me")
      filterSummary.push(`author: ${args.author}`);
    if (args.state) filterSummary.push(args.state);
    if (args.isDraft !== undefined)
      filterSummary.push(args.isDraft ? "drafts only" : "ready only");
    if (args.dateFrom || args.dateTo) {
      const dateRange = `${args.dateFrom || "start"} to ${
        args.dateTo || "now"
      }`;
      filterSummary.push(dateRange);
    }

    const header = `🎯 **PRs${
      filterSummary.length > 0 ? ` (${filterSummary.join(", ")})` : ""
    }** - Found ${prs.length}:\n\n`;

    return {
      content: [
        {
          type: "text",
          text: header + prList,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error listing PRs: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleCheckoutPRBranch(args: {
  prNumber: number;
  createLocal?: boolean;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = createGitHubCli(args.repo || "");
    const result = await githubCli.checkoutPRBranch(
      args.prNumber,
      args.createLocal
    );
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully checked out PR #${args.prNumber} branch\n📂 Current branch: ${result}\n📝 Status: Ready`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error checking out PR branch: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleEnablePreviewEnv(args: {
  prNumber: number;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = createGitHubCli(args.repo || "");
    await githubCli.enablePreviewEnv(args.prNumber, "Need_preview_env");
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully enabled preview env for PR #${args.prNumber}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error enabling preview env: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetPRDiffSummary(args: {
  prNumber: number;
  includeFileStats?: boolean;
  maxFiles?: number;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = createGitHubCli(args.repo || "");
    const summary = await githubCli.getPRDiffSummary(
      args.prNumber,
      args.includeFileStats || true,
      args.maxFiles || 20
    );

    return {
      content: [
        {
          type: "text",
          text: summary,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting PR diff summary: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}
