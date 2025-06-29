/**
 * Prompt-specific types for pr-buddy
 * Author: Shivaraj Bakale
 */

type PromptType = "review" | "checklist" | "analysis";
type ReviewType =
  | "staff-engineer"
  | "security"
  | "performance"
  | "architecture"
  | "junior-dev";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: PromptType;
}

export interface ReviewPromptConfig {
  type: ReviewType;
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
