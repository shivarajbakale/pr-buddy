/**
 * GitHub operation handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse } from "../types/index.js";
import { GitHubCli } from "../utils/github-cli.js";

// Helper function to create GitHubCli with repository context
function createGitHubCli(repo: string): GitHubCli {
  return new GitHubCli(repo);
}

export async function handleCreatePR(args: {
  title: string;
  body: string;
  base: string;
  head: string;
  labels: string[];
  draft: boolean;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = createGitHubCli(args.repo || "");
    const pr = await githubCli.createPR({
      title: args.title,
      body: args.body,
      base: args.base,
      head: args.head,
      labels: args.labels,
    });
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully created PR #${pr.number}: ${
            pr.title
          }\n🔗 URL: ${pr.url}\n📝 Status: ${
            pr.isDraft ? "Draft" : "Ready for Review"
          }`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating PR: ${error.message}`,
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
  state?: string;
  limit?: number;
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = createGitHubCli(args.repo || "");
    const prs = await githubCli.listMyPRs(args.state, args.limit);

    if (prs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No PRs found with state: ${args.state || "open"}`,
          },
        ],
      };
    }

    const prList = prs
      .map(
        (pr: any) =>
          `📋 **PR #${pr.number}**: ${pr.title}\n` +
          `   🌿 ${pr.headRefName} → ${pr.baseRefName}\n` +
          `   📊 ${pr.state} ${pr.isDraft ? "(Draft)" : ""}\n` +
          `   📅 ${new Date(pr.updatedAt).toLocaleDateString()}\n` +
          `   🔗 ${pr.url}\n`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `🎯 **Your PRs (${args.state || "open"})**:\n\n${prList}`,
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
