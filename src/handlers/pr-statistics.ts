/**
 * PR statistics handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse } from '../types/index.js';
import { GitHubCli } from '../utils/github-cli.js';

const githubCli = new GitHubCli();

export async function handleGetPRStats(args: { period: 'day' | 'week' | 'month' }): Promise<ToolResponse> {
  try {
    const stats = await githubCli.getPRStats(args.period);
    
    const statsText = `
📊 **PR Statistics for ${args.period.toUpperCase()}**

🎯 **Summary**:
- 🔀 Total Merged PRs: ${stats.totalMerged}
- 📅 Period: ${stats.period}

🏢 **Top Repositories**:
${stats.topRepositories.map(repo => 
  `• ${repo.repo}: ${repo.count} PRs (${repo.percentage}%)`
).join('\n')}

📈 **Daily Activity**:
• See GitHub insights for detailed daily breakdown

${stats.totalMerged === 0 ? '💡 No PRs merged in this period.' : `🎉 Great work! You've been productive with ${stats.totalMerged} merged PRs.`}
`;

    return {
      content: [{
        type: 'text',
        text: statsText.trim(),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting PR statistics: ${error.message}`,
      }],
      isError: true,
    };
  }
} 