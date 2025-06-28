/**
 * Review and analysis handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse } from '../types/index.js';
import { GitHubCli } from '../utils/github-cli.js';
import { PRAnalyzer } from '../utils/pr-analysis.js';

const githubCli = new GitHubCli();
const prAnalyzer = new PRAnalyzer();

export async function handleGenerateReviewPrompt(args: { 
  prNumber: number; 
  reviewType?: string; 
  focusAreas?: string[] 
}): Promise<ToolResponse> {
  try {
    const pr = await githubCli.getPRDetails(args.prNumber);
    const complexity = prAnalyzer.analyzeComplexity(pr);
    const prompt = `
🔍 **Staff Engineer Review Prompt for PR #${pr.number}**

**Title**: ${pr.title}
**Author**: ${pr.author}
**Complexity**: ${complexity.level} (Score: ${complexity.score}/100)

**Review Focus Areas**:
${args.focusAreas?.map(area => `• ${area}`).join('\n') || '• Code quality and maintainability\n• Performance implications\n• Security considerations'}

**Estimated Review Time**: ${complexity.estimatedReviewTime}
`;
    
    return {
      content: [{
        type: 'text',
        text: prompt,
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error generating review prompt: ${error.message}`,
      }],
      isError: true,
    };
  }
}

export async function handleGenerateCodeChecklist(args: { 
  prNumber: number; 
  includeSecurityChecks?: boolean; 
  includePerformanceChecks?: boolean 
}): Promise<ToolResponse> {
  try {
    const pr = await githubCli.getPRDetails(args.prNumber);
    const checklist = prAnalyzer.generateCodeChecklist(pr, args.includeSecurityChecks, args.includePerformanceChecks);
    
    const checklistText = `
🔍 **Code Review Checklist for PR #${args.prNumber}**

${checklist.map(item => `☐ ${item}`).join('\n')}

---
*Generated based on PR analysis. Adjust focus areas as needed.*
`;

    return {
      content: [{
        type: 'text',
        text: checklistText.trim(),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error generating code checklist: ${error.message}`,
      }],
      isError: true,
    };
  }
}

export async function handleAnalyzePRComplexity(args: { prNumber: number }): Promise<ToolResponse> {
  try {
    const pr = await githubCli.getPRDetails(args.prNumber);
    const analysis = prAnalyzer.analyzeComplexity(pr);
    
    const analysisText = `
🔬 **PR Complexity Analysis for #${args.prNumber}**

📊 **Overall Score**: ${analysis.score}/100 (${analysis.level})
⏱️ **Estimated Review Time**: ${analysis.estimatedReviewTime}

📈 **Change Metrics**:
- 📁 Files Changed: ${analysis.factors.filesChanged}
- ➕ Lines Added: ${analysis.factors.linesAdded}  
- ➖ Lines Deleted: ${analysis.factors.linesDeleted}
- 📏 Total Changes: ${analysis.factors.linesChanged}

💡 **Recommendations**:
${analysis.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

🎯 **Complexity**: ${analysis.factors.complexity}
`;

    return {
      content: [{
        type: 'text',
        text: analysisText.trim(),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error analyzing PR complexity: ${error.message}`,
      }],
      isError: true,
    };
  }
}

export async function handleGetPRDiffSummary(args: { 
  prNumber: number; 
  includeFileStats?: boolean; 
  maxFiles?: number 
}): Promise<ToolResponse> {
  try {
    const diffSummary = await githubCli.getPRDiffSummary(args.prNumber, args.includeFileStats, args.maxFiles);
    
    return {
      content: [{
        type: 'text',
        text: diffSummary,
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting PR diff summary: ${error.message}`,
      }],
      isError: true,
    };
  }
} 