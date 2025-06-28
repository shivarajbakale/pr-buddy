/**
 * Review and analysis handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse } from '../types/index.js';
import { GitHubCli } from '../utils/github-cli.js';
import { PromptGenerator } from '../prompts/prompt-generator.js';

const githubCli = new GitHubCli();
const promptGenerator = new PromptGenerator();

/**
 * Generate a review prompt for a PR
 */
export async function handleGenerateReviewPrompt(args: { 
  prNumber: number; 
  type?: 'staff-engineer' | 'security' | 'performance' | 'architecture' | 'junior-dev';
  focusAreas?: string[];
}): Promise<ToolResponse> {
  try {
    const pr = await githubCli.getPRDetails(args.prNumber);
    const config = {
      type: args.type || 'staff-engineer',
      focusAreas: args.focusAreas || [],
      includeComplexityAnalysis: true,
      includeTimeEstimate: true,
    };
    
    const prompt = promptGenerator.generateReviewPromptFromPR(pr, config);
    
    return {
      content: [
        {
          type: 'text',
          text: prompt,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error generating review prompt: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Generate a code review checklist for a PR
 */
export async function handleGenerateCodeChecklist(args: { 
  prNumber: number; 
  includeSecurityChecks?: boolean; 
  includePerformanceChecks?: boolean 
}): Promise<ToolResponse> {
  try {
    const pr = await githubCli.getPRDetails(args.prNumber);
    const config = {
      includeGeneral: true,
      includeSecurity: args.includeSecurityChecks || false,
      includePerformance: args.includePerformanceChecks || false,
      includeAccessibility: false,
      includeTesting: true,
      includeDocumentation: true,
    };
    
    const checklist = promptGenerator.generateChecklistFromPR(pr, config);
    
    return {
      content: [
        {
          type: 'text',
          text: checklist,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error generating code checklist: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Analyze PR complexity
 */
export async function handleAnalyzePRComplexity(args: { 
  prNumber: number; 
  includeRecommendations?: boolean 
}): Promise<ToolResponse> {
  try {
    const pr = await githubCli.getPRDetails(args.prNumber);
    
    // Create a simple complexity analysis
    const filesChanged = pr.changedFiles || 0;
    const linesAdded = pr.additions || 0;
    const linesDeleted = pr.deletions || 0;
    const totalLines = linesAdded + linesDeleted;
    
    let complexity = 'Low';
    let score = 0;
    
    // Simple scoring
    if (filesChanged > 10) score += 30;
    else if (filesChanged > 5) score += 15;
    else score += filesChanged * 3;
    
    if (totalLines > 500) score += 40;
    else if (totalLines > 200) score += 25;
    else if (totalLines > 50) score += 15;
    else score += totalLines / 10;
    
    if (pr.isDraft) score += 10;
    
    if (score >= 70) complexity = 'Very High';
    else if (score >= 50) complexity = 'High';
    else if (score >= 30) complexity = 'Medium';
    
    let analysis = `# 📊 PR Complexity Analysis: #${args.prNumber}\n\n`;
    analysis += `**${pr.title}** by @${pr.author}\n\n`;
    analysis += `## Complexity: ${complexity} (${Math.round(score)}/100)\n\n`;
    analysis += `### Metrics\n`;
    analysis += `- **Files Changed:** ${filesChanged}\n`;
    analysis += `- **Lines Added:** +${linesAdded}\n`;
    analysis += `- **Lines Deleted:** -${linesDeleted}\n`;
    analysis += `- **Total Changes:** ${totalLines} lines\n`;
    analysis += `- **Draft Status:** ${pr.isDraft ? 'Yes' : 'No'}\n\n`;
    
    if (args.includeRecommendations) {
      analysis += `### Recommendations\n`;
      if (complexity === 'Very High') {
        analysis += `- 🚨 Consider breaking this into smaller PRs\n`;
        analysis += `- 🚨 Assign multiple reviewers\n`;
        analysis += `- 🚨 Plan extra time for testing\n`;
      } else if (complexity === 'High') {
        analysis += `- ⚠️ Request thorough review\n`;
        analysis += `- ⚠️ Ensure good test coverage\n`;
      } else if (complexity === 'Medium') {
        analysis += `- ✅ Standard review process should suffice\n`;
        analysis += `- ✅ Verify test coverage\n`;
      } else {
        analysis += `- ✅ Quick review should be sufficient\n`;
        analysis += `- ✅ Focus on code quality and style\n`;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: analysis,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error analyzing PR complexity: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get PR diff summary
 */
export async function handleGetPRDiffSummary(args: { 
  prNumber: number; 
  includeFileStats?: boolean; 
  maxFiles?: number 
}): Promise<ToolResponse> {
  try {
    const summary = await githubCli.getPRDiffSummary(
      args.prNumber, 
      args.includeFileStats || true, 
      args.maxFiles || 20
    );
    
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting PR diff summary: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
} 