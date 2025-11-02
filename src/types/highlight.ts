/**
 * Type definitions for Highlight (performance review) models
 * Author: Shivaraj Bakale
 */

export type ArtifactType =
  | "github_pr"
  | "slack_message"
  | "jira_ticket"
  | "document"
  | "demo"
  | "meeting"
  | "other";

export interface HighlightInput {
  userId: string;
  title: string;
  description?: string;
  artifactType: ArtifactType;
  artifactUrl: string;
  achievedAt: Date;
  apolloValueIds: string[]; // Array of Apollo value IDs to link
}

export interface HighlightWithValues {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  artifactType: string;
  artifactUrl: string;
  achievedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  apolloValues: {
    id: string;
    apolloValue: {
      id: string;
      title: string;
      description: string;
    };
  }[];
}

export interface HighlightSummary {
  totalHighlights: number;
  byApolloValue: Record<string, number>;
  byArtifactType: Record<string, number>;
  recentHighlights: HighlightWithValues[];
}
