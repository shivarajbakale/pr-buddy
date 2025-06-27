/**
 * PR Analysis utilities for pr-buddy
 * Author: Shivaraj Bakale
 */

import { PRComplexityAnalysis, ReviewPrompt, GitHubPR } from '../types/index.js';

export class PRAnalyzer {
  /**
   * Analyze PR complexity based on metrics
   */
  analyzeComplexity(pr: GitHubPR): PRComplexityAnalysis {
    const { additions, deletions, changedFiles } = pr;
    const totalChanges = additions + deletions;
    
    // Calculate complexity score (0-100)
    let score = 0;
    
    // File count factor (0-30 points)
    if (changedFiles <= 3) score += 5;
    else if (changedFiles <= 10) score += 15;
    else if (changedFiles <= 20) score += 25;
    else score += 30;
    
    // Lines changed factor (0-40 points)
    if (totalChanges <= 50) score += 5;
    else if (totalChanges <= 200) score += 15;
    else if (totalChanges <= 500) score += 25;
    else if (totalChanges <= 1000) score += 35;
    else score += 40;
    
    // Ratio factor (0-30 points) - balanced changes are less complex
    const ratio = additions > 0 ? deletions / additions : 0;
    if (ratio >= 0.3 && ratio <= 3) score += 10; // Balanced changes
    else if (ratio < 0.1 || ratio > 10) score += 30; // Heavily skewed
    else score += 20;
    
    // Determine complexity level
    let level: 'simple' | 'moderate' | 'complex' | 'very-complex';
    if (score <= 25) level = 'simple';
    else if (score <= 50) level = 'moderate';
    else if (score <= 75) level = 'complex';
    else level = 'very-complex';
    
    // Generate recommendations
    const suggestions: string[] = [];
    if (changedFiles > 15) {
      suggestions.push('Consider breaking this PR into smaller, focused changes');
    }
    if (totalChanges > 500) {
      suggestions.push('Large PR - ensure comprehensive testing and multiple reviewers');
    }
    if (ratio > 5) {
      suggestions.push('Mostly additions - verify no duplicate functionality');
    } else if (ratio < 0.2) {
      suggestions.push('Mostly deletions - ensure no functionality is lost');
    }
    if (pr.isDraft) {
      suggestions.push('Draft PR - mark as ready for review when complete');
    }
    
    // Estimate review time
    let reviewTime: string;
    if (level === 'simple') reviewTime = '15-30 minutes';
    else if (level === 'moderate') reviewTime = '30-60 minutes';
    else if (level === 'complex') reviewTime = '1-2 hours';
    else reviewTime = '2+ hours (consider scheduling dedicated review session)';
    
    return {
      score,
      level,
      factors: {
        fileCount: changedFiles,
        linesChanged: totalChanges,
        additionDeletionRatio: additions > 0 ? deletions / additions : 0,
        filesChanged: changedFiles,
        linesAdded: additions,
        linesDeleted: deletions,
        complexity: this.getComplexityDescription(level, totalChanges, changedFiles),
      },
      risks: [],
      recommendations: suggestions,
      estimatedReviewTime: reviewTime,
      recommendedReviewTime: reviewTime,
      suggestions,
    };
  }
  
  /**
   * Generate staff engineer review prompt
   */
  generateStaffEngineerPrompt(pr: GitHubPR): ReviewPrompt {
    const complexity = this.analyzeComplexity(pr);
    
    let prompt = `# Staff Engineer Review: PR #${pr.number}\n\n`;
    prompt += `**Title:** ${pr.title}\n`;
    prompt += `**Author:** ${pr.author}\n`;
    prompt += `**Complexity:** ${complexity.level.toUpperCase()} (${complexity.score}/100)\n`;
    prompt += `**Estimated Review Time:** ${complexity.recommendedReviewTime}\n\n`;
    
    prompt += `## 📋 Review Focus Areas\n\n`;
    
    // Architecture & Design
    prompt += `### 🏗️ Architecture & Design\n`;
    prompt += `- Does this change align with our system architecture?\n`;
    prompt += `- Are the abstractions appropriate and maintainable?\n`;
    prompt += `- Does it follow established patterns and conventions?\n`;
    prompt += `- Are there any potential scalability concerns?\n\n`;
    
    // Code Quality
    prompt += `### 💎 Code Quality\n`;
    prompt += `- Is the code readable and well-documented?\n`;
    prompt += `- Are naming conventions consistent and clear?\n`;
    prompt += `- Are there appropriate tests for the changes?\n`;
    prompt += `- Is error handling robust and appropriate?\n\n`;
    
    // Performance & Security
    prompt += `### ⚡ Performance & Security\n`;
    prompt += `- Are there any performance implications?\n`;
    prompt += `- Are security best practices followed?\n`;
    prompt += `- Are there any potential vulnerabilities?\n`;
    prompt += `- Is data handling secure and compliant?\n\n`;
    
    // Complexity-specific guidance
    if (complexity.level === 'complex' || complexity.level === 'very-complex') {
      prompt += `### 🚨 High Complexity Alert\n`;
      prompt += `This PR has high complexity (${complexity.score}/100). Please pay special attention to:\n`;
      complexity.suggestions.forEach(suggestion => {
        prompt += `- ${suggestion}\n`;
      });
      prompt += `\n`;
    }
    
    prompt += `## 🎯 Key Questions\n`;
    prompt += `1. Does this change solve the right problem in the right way?\n`;
    prompt += `2. Will this be maintainable 6 months from now?\n`;
    prompt += `3. Are there simpler alternatives that achieve the same goal?\n`;
    prompt += `4. What are the risks and how are they mitigated?\n`;
    prompt += `5. How will we know if this change is successful?\n\n`;
    
    prompt += `## 📝 Recommendation\n`;
    prompt += `[ ] **APPROVE** - Ready to merge\n`;
    prompt += `[ ] **REQUEST CHANGES** - Issues need to be addressed\n`;
    prompt += `[ ] **COMMENT** - Suggestions for improvement\n`;
    prompt += `[ ] **NEEDS ARCHITECTURE REVIEW** - Escalate to architecture team\n\n`;
    
    const checklist = [
      'Architecture alignment verified',
      'Code quality standards met',
      'Security implications assessed',
      'Performance impact evaluated',
      'Testing coverage adequate',
      'Documentation updated',
      'Breaking changes documented',
      'Deployment plan reviewed',
    ];
    
    const focusAreas = [
      'System Architecture',
      'Code Maintainability', 
      'Security & Compliance',
      'Performance Impact',
      'Testing Strategy',
    ];
    
    return {
      type: 'staff-engineer',
      prompt,
      checklist,
      focusAreas,
    };
  }
  
  /**
   * Generate code review checklist
   */
  generateCodeChecklist(pr: GitHubPR, includeSecurityChecks: boolean = true, includePerformanceChecks: boolean = true): string[] {
    const checklist: string[] = [
      // General code quality
      '✅ Code follows team coding standards',
      '✅ Variable and function names are descriptive',
      '✅ Code is properly commented where necessary',
      '✅ No commented-out code left behind',
      '✅ No console.log or debug statements in production code',
      
      // Logic & Functionality
      '✅ Logic is clear and easy to follow',
      '✅ Edge cases are handled appropriately',
      '✅ Error handling is comprehensive',
      '✅ Input validation is present where needed',
      '✅ Function complexity is reasonable',
      
      // Testing
      '✅ Unit tests added for new functionality',
      '✅ Existing tests still pass',
      '✅ Test coverage is adequate',
      '✅ Integration tests added if applicable',
      
      // Documentation
      '✅ README updated if needed',
      '✅ API documentation updated',
      '✅ Breaking changes documented',
      '✅ Migration guide provided if needed',
    ];
    
    if (includeSecurityChecks) {
      checklist.push(
        // Security checks
        '🔒 No hardcoded secrets or credentials',
        '🔒 Input sanitization implemented',
        '🔒 Authentication/authorization checked',
        '🔒 SQL injection prevention verified',
        '🔒 XSS prevention measures in place',
        '🔒 HTTPS used for external calls',
        '🔒 Sensitive data properly encrypted',
      );
    }
    
    if (includePerformanceChecks) {
      checklist.push(
        // Performance checks
        '⚡ No obvious performance bottlenecks',
        '⚡ Database queries are optimized',
        '⚡ Memory usage is reasonable',
        '⚡ Large loops/iterations optimized',
        '⚡ Caching implemented where appropriate',
        '⚡ Resource cleanup implemented',
      );
    }
    
    // Add complexity-specific items
    const complexity = this.analyzeComplexity(pr);
    if (complexity.level === 'high' || complexity.level === 'very-high') {
      checklist.push(
        '🚨 Multiple reviewers assigned',
        '🚨 Deployment plan discussed',
        '🚨 Rollback strategy defined',
        '🚨 Monitoring/alerting updated',
      );
    }
    
    return checklist;
  }
  
  /**
   * Get complexity description
   */
  private getComplexityDescription(level: string, totalChanges: number, changedFiles: number): string {
    switch (level) {
      case 'simple':
        return `Simple complexity change with ${totalChanges} lines across ${changedFiles} files`;
      case 'moderate':
        return `Moderate complexity change with ${totalChanges} lines across ${changedFiles} files`;
      case 'complex':
        return `Complex change with ${totalChanges} lines across ${changedFiles} files - requires careful review`;
      case 'very-complex':
        return `Very complex change with ${totalChanges} lines across ${changedFiles} files - consider breaking into smaller PRs`;
      default:
        return `Unknown complexity level`;
    }
  }
} 