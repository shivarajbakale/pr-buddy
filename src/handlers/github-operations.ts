/**
 * GitHub operation handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse } from "../types/index.js";
import { GitHubCli, RepositoryContext } from "../utils/github-cli.js";

// Helper function to create GitHubCli with repository context
function createGitHubCli(context?: {
  repositoryPath?: string;
  repositoryUrl?: string;
}): GitHubCli {
  const repoContext: RepositoryContext = {
    workingDirectory: process.cwd(),
  };

  if (context?.repositoryPath) {
    repoContext.repositoryPath = context.repositoryPath;
  }
  if (context?.repositoryUrl) {
    repoContext.repositoryUrl = context.repositoryUrl;
  }

  return new GitHubCli(repoContext);
}

export async function handleCreatePR(args: {
  title: string;
  body?: string;
  template?: string;
  base?: string;
  head?: string;
  labels?: string[];
  reviewers?: string[];
  assignees?: string[];
  draft?: boolean;
  repositoryPath?: string;
  repositoryUrl?: string;
}): Promise<ToolResponse> {
  try {
    const repoContext: { repositoryPath?: string; repositoryUrl?: string } = {};
    if (args.repositoryPath) repoContext.repositoryPath = args.repositoryPath;
    if (args.repositoryUrl) repoContext.repositoryUrl = args.repositoryUrl;

    const githubCli = createGitHubCli(repoContext);
    const pr = await githubCli.createPR(args);
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
  repositoryPath?: string;
  repositoryUrl?: string;
}): Promise<ToolResponse> {
  try {
    if (!args.number) {
      throw new Error("PR number is required");
    }

    const repoContext: { repositoryPath?: string; repositoryUrl?: string } = {};
    if (args.repositoryPath) repoContext.repositoryPath = args.repositoryPath;
    if (args.repositoryUrl) repoContext.repositoryUrl = args.repositoryUrl;

    const githubCli = createGitHubCli(repoContext);
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
  repositoryPath?: string;
  repositoryUrl?: string;
}): Promise<ToolResponse> {
  try {
    const repoContext: { repositoryPath?: string; repositoryUrl?: string } = {};
    if (args.repositoryPath) repoContext.repositoryPath = args.repositoryPath;
    if (args.repositoryUrl) repoContext.repositoryUrl = args.repositoryUrl;

    const githubCli = createGitHubCli(repoContext);
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
  repositoryPath?: string;
  repositoryUrl?: string;
}): Promise<ToolResponse> {
  try {
    const repoContext: { repositoryPath?: string; repositoryUrl?: string } = {};
    if (args.repositoryPath) repoContext.repositoryPath = args.repositoryPath;
    if (args.repositoryUrl) repoContext.repositoryUrl = args.repositoryUrl;

    const githubCli = createGitHubCli(repoContext);
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

export async function handleAddPRLabel(args: {
  prNumber: number;
  labels: string[];
  repositoryPath?: string;
  repositoryUrl?: string;
}): Promise<ToolResponse> {
  try {
    const repoContext: { repositoryPath?: string; repositoryUrl?: string } = {};
    if (args.repositoryPath) repoContext.repositoryPath = args.repositoryPath;
    if (args.repositoryUrl) repoContext.repositoryUrl = args.repositoryUrl;

    const githubCli = createGitHubCli(repoContext);
    await githubCli.addLabels(args.prNumber, args.labels);
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully added labels to PR #${
            args.prNumber
          }: ${args.labels.join(", ")}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error adding labels: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleRemovePRLabel(args: {
  prNumber: number;
  labels: string[];
  repositoryPath?: string;
  repositoryUrl?: string;
}): Promise<ToolResponse> {
  try {
    const repoContext: { repositoryPath?: string; repositoryUrl?: string } = {};
    if (args.repositoryPath) repoContext.repositoryPath = args.repositoryPath;
    if (args.repositoryUrl) repoContext.repositoryUrl = args.repositoryUrl;

    const githubCli = createGitHubCli(repoContext);
    await githubCli.removeLabels(args.prNumber, args.labels);
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully removed labels from PR #${
            args.prNumber
          }: ${args.labels.join(", ")}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error removing labels: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
