/**
 * Type definitions for pr-buddy
 * Author: Shivaraj Bakale
 */

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;  
  }>;
  isError?: boolean;
}

// GitHub CLI Types
export interface GitHubPR {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  url: string;
  headRefName: string;
  baseRefName: string;
  createdAt: string;
  updatedAt: string;
  mergeable: string;
  labels: string[];
  assignees: string[];
  reviewers: string[];
  isDraft: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface PRTemplate {
  type: 'feature' | 'bugfix' | 'hotfix' | 'docs' | 'refactor';
  title: string;
  body: string;
  labels?: string[];
  reviewers?: string[];
  assignees?: string[];
}

export interface PRComplexityAnalysis {
  score: number;
  level: 'simple' | 'moderate' | 'complex' | 'very-complex';
  factors: {
    fileCount: number;
    linesChanged: number;
    additionDeletionRatio: number;
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
    complexity: string;
  };
  risks: string[];
  recommendations: string[];
  estimatedReviewTime: string;
  recommendedReviewTime: string;
  suggestions: string[];
}

export interface ReviewPrompt {
  type: string;
  title: string;
  prompt: string;
  sections: Array<{
    heading: string;
    questions: string[];
    focusAreas: string[];
  }>;
  checklistItems: string[];
  timeEstimate: string;
}

export interface PRStats {
  period: 'day' | 'week' | 'month';
  totalMerged: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  totalFilesChanged: number;
  averagePRSize: number;
  topRepositories: Array<{
    repo: string;
    count: number;
    percentage: number;
  }>;
  prsByDay: Array<{
    date: string;
    count: number;
  }>;
  periodStart: string;
  periodEnd: string;
}

// Error Types
export class GitHubCliError extends Error {
  public exitCode?: number;
  public stderr?: string;

  constructor(message: string) {
    super(message);
    this.name = 'GitHubCliError';
  }
}

// Input Types for Tools
export interface CreatePRInput {
  title: string;
  body?: string;
  template?: 'feature' | 'bugfix' | 'hotfix' | 'docs' | 'refactor';
  base?: string;
  head?: string;
  labels?: string[];
  reviewers?: string[];
  assignees?: string[];
  draft?: boolean;
}

export interface PRIdentifier {
  number?: number;
  url?: string;
}

export interface LabelOperation {
  prNumber: number;
  labels: string[];
}

export interface BranchCheckout {
  prNumber: number;
  createLocal?: boolean;
} 