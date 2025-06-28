/**
 * Simple and focused prompt generator for pr-buddy
 * Author: Shivaraj Bakale
 */

import { GitHubPR } from '../types/index.js';
import { 
  PromptContext, 
  ReviewPromptConfig, 
  ChecklistConfig
} from './types.js';
import { 
  REVIEW_TEMPLATES, 
  generateReviewPrompt 
} from './review-templates.js';
import { 
  generateChecklist
} from './checklist-templates.js';

export class PromptGenerator {
  /**
   * Generate a review prompt from PR data
   */
  generateReviewPromptFromPR(
    pr: GitHubPR, 
    config: ReviewPromptConfig
  ): string {
    const context = this.createPromptContext(pr);
    return generateReviewPrompt(config.type, context);
  }

  /**
   * Generate a checklist from PR data
   */
  generateChecklistFromPR(
    pr: GitHubPR, 
    config: ChecklistConfig
  ): string {
    return generateChecklist(config, pr.number, pr.title, pr.author);
  }

  /**
   * Get available review templates
   */
  getAvailableReviewTemplates(): string[] {
    return Object.keys(REVIEW_TEMPLATES);
  }

  /**
   * Create prompt context from PR data
   */
  private createPromptContext(pr: GitHubPR): PromptContext {
    const complexityScore = this.calculateComplexityScore(pr);
    const complexityLevel = this.getComplexityLevel(complexityScore);
    const estimatedTime = this.estimateReviewTime(complexityScore);

    return {
      prNumber: pr.number,
      title: pr.title,
      author: pr.author,
      complexity: {
        score: complexityScore,
        level: complexityLevel,
        estimatedTime: estimatedTime,
      },
      metrics: {
        filesChanged: pr.changedFiles || 0,
        linesAdded: pr.additions || 0,
        linesDeleted: pr.deletions || 0,
      },
      labels: pr.labels || [],
      isDraft: pr.isDraft || false,
    };
  }

  /**
   * Calculate complexity score (0-100)
   */
  private calculateComplexityScore(pr: GitHubPR): number {
    let score = 0;

    // File count impact (0-30 points)
    const fileCount = pr.changedFiles || 0;
    score += Math.min(fileCount * 2, 30);

    // Line changes impact (0-40 points)
    const totalLines = (pr.additions || 0) + (pr.deletions || 0);
    score += Math.min(totalLines / 50, 40);

    // Draft status impact (0-10 points)
    if (pr.isDraft) score += 10;
    
    // Label-based complexity (0-20 points)
    const labels = pr.labels?.map(l => l.toLowerCase()) || [];
    if (labels.includes('breaking-change')) score += 15;
    if (labels.includes('major')) score += 10;
    if (labels.includes('refactor')) score += 8;
    if (labels.includes('security')) score += 5;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Get complexity level from score
   */
  private getComplexityLevel(score: number): string {
    if (score >= 80) return 'very-complex';
    if (score >= 60) return 'complex';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'simple';
    return 'trivial';
  }

  /**
   * Estimate review time based on complexity
   */
  private estimateReviewTime(score: number): string {
    if (score >= 80) return '2+ hours';
    if (score >= 60) return '1-2 hours';
    if (score >= 40) return '30-60 min';
    if (score >= 20) return '15-30 min';
    return '5-15 min';
  }
} 