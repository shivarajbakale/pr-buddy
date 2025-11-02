/**
 * JIRA type definitions for pr-buddy
 * Author: Shivaraj Bakale
 */

export interface JiraSprint {
  id: number;
  name: string;
  state: "future" | "active" | "closed" | "unknown";
  boardId: number;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  goal?: string;
}

export interface JiraTicket {
  key: string;
  summary: string;
  status: string;
  assignee: string;
  priority: string;
  type: string;
  storyPoints?: number;
  labels: string[];
  created: string;
  updated: string;
  prLink?: string;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: "scrum" | "kanban";
  projectKey: string;
}

export interface JiraSprintDetails {
  sprint: JiraSprint;
  tickets: JiraTicket[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    storyPoints?: number;
    completedPoints?: number;
  };
}

// Error Types
export class JiraCliError extends Error {
  public exitCode?: number;
  public stderr?: string;

  constructor(message: string) {
    super(message);
    this.name = "JiraCliError";
  }
}
