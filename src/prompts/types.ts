/**
 * Prompt-specific types for pr-buddy
 * Author: Shivaraj Bakale
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'review' | 'checklist' | 'analysis';
}

export interface ReviewPromptConfig {
  type: 'staff-engineer' | 'security' | 'performance' | 'architecture' | 'junior-dev';
  focusAreas: string[];
  includeComplexityAnalysis: boolean;
  includeTimeEstimate: boolean;
  customQuestions?: string[];
}

export interface ChecklistConfig {
  includeGeneral: boolean;
  includeSecurity: boolean;
  includePerformance: boolean;
  includeAccessibility: boolean;
  includeTesting: boolean;
  includeDocumentation: boolean;
  customItems?: string[];
}

export interface PromptContext {
  prNumber: number;
  title: string;
  author: string;
  complexity: {
    score: number;
    level: string;
    estimatedTime: string;
  };
  metrics: {
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
  };
  labels: string[];
  isDraft: boolean;
} 