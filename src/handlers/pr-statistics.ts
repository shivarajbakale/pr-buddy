/**
 * PR statistics handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse } from "../types/index.js";
import { GitHubCli } from "../utils/github-cli.js";

// Helper function to create GitHubCli with repository context
function createGitHubCli(repo: string): GitHubCli {
  return new GitHubCli(repo);
}

export async function handleGetPRStats(args: {
  period: "day" | "week" | "month";
  repo?: string;
}): Promise<ToolResponse> {
  try {
    const githubCli = createGitHubCli(args.repo || "");
    const stats = await githubCli.getPRStats(args.period || "day");

    const statsText = `
📊 **PR Statistics for ${args.period?.toUpperCase()}**

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
