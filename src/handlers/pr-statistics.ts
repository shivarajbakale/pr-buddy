/**
 * PR statistics handlers for pr-buddy
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

export async function handleGetPRStats(args: {
  period: "day" | "week" | "month";
  repositoryPath?: string;
  repositoryUrl?: string;
}): Promise<ToolResponse> {
  try {
    const repoContext: { repositoryPath?: string; repositoryUrl?: string } = {};
    if (args.repositoryPath) repoContext.repositoryPath = args.repositoryPath;
    if (args.repositoryUrl) repoContext.repositoryUrl = args.repositoryUrl;

    const githubCli = createGitHubCli(repoContext);
    const stats = await githubCli.getPRStats(args.period);

    const statsText = `
📊 **PR Statistics for ${args.period.toUpperCase()}**

🎯 **Summary**:
- 🔀 Total Merged PRs: ${stats.totalMerged}
- 📅 Period: ${stats.period}

🏢 **Top Repositories**:
${stats.topRepositories
  .map((repo: any) => `• ${repo.repo}: ${repo.count} PRs (${repo.percentage}%)`)
  .join("\n")}

📈 **Daily Activity**:
• See GitHub insights for detailed daily breakdown

${
  stats.totalMerged === 0
    ? "💡 No PRs merged in this period."
    : `🎉 Great work! You've been productive with ${stats.totalMerged} merged PRs.`
}
`;

    return {
      content: [
        {
          type: "text",
          text: statsText.trim(),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error getting PR statistics: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
