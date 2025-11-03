/**
 * JIRA CLI utility functions for pr-buddy
 * Uses Atlassian CLI (ACLI) for JIRA operations
 * Author: Shivaraj Bakale
 */

import { exec } from "child_process";
import { promisify } from "util";
import {
  JiraSprint,
  JiraTicket,
  JiraCliError,
  JiraBoard,
} from "../types/jira.js";

const execAsync = promisify(exec);

// Apollo JIRA site URL - always use this for constructing ticket URLs
const APOLLO_JIRA_SITE = "https://apollopde.atlassian.net";

export interface JiraContext {
  site?: string | undefined; // JIRA site URL (e.g., "yourcompany.atlassian.net")
  project?: string | undefined; // Default project key (e.g., "PUX")
}

export class JiraCli {
  private site?: string | undefined;

  constructor(context: JiraContext) {
    this.site = context.site;
  }

  /**
   * Build JIRA ticket URL using Apollo site
   * Always uses Apollo's JIRA site URL
   */
  private buildTicketUrl(ticketKey: string): string {
    return `${APOLLO_JIRA_SITE}/browse/${ticketKey}`;
  }

  /**
   * Execute ACLI command
   */
  private async executeAcliCommand(command: string): Promise<string> {
    try {
      // Add site context if available
      let fullCommand = `acli ${command}`;
      if (this.site) {
        fullCommand += ` --site ${this.site}`;
      }

      const { stdout, stderr } = await execAsync(fullCommand);

      if (stderr && !stdout) {
        throw new JiraCliError(`ACLI error: ${stderr}`);
      }
      return stdout.trim();
    } catch (error: any) {
      const acliError = new JiraCliError(
        `ACLI command failed: ${error.message}`
      );
      acliError.exitCode = error.code || 1;
      acliError.stderr = error.stderr || "";
      throw acliError;
    }
  }

  /**
   * Check if ACLI is installed and authenticated
   */
  async checkAuth(): Promise<boolean> {
    try {
      await execAsync("acli --version");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List sprints for a board
   */
  async listSprints(params: {
    boardId?: number;
    state?: "future" | "active" | "closed" | "all";
    maxResults?: number;
  }): Promise<JiraSprint[]> {
    try {
      // Build command - using jira sprint list
      let command = "jira sprint list --output json";

      if (params.boardId) {
        command += ` --board-id ${params.boardId}`;
      }

      if (params.state && params.state !== "all") {
        command += ` --state ${params.state}`;
      }

      // Note: ACLI doesn't support --max-results, we'll limit client-side

      const result = await this.executeAcliCommand(command);
      let sprints = JSON.parse(result);

      // Apply client-side limit if maxResults is specified
      if (params.maxResults && sprints.length > params.maxResults) {
        sprints = sprints.slice(0, params.maxResults);
      }

      return sprints.map((sprint: any) => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state?.toLowerCase() || "unknown",
        boardId: sprint.originBoardId || params.boardId || 0,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        completeDate: sprint.completeDate,
        goal: sprint.goal || "",
      }));
    } catch (error: any) {
      throw new JiraCliError(`Failed to list sprints: ${error.message}`);
    }
  }

  /**
   * Get sprint details including tickets
   */
  async getSprintDetails(sprintId: number): Promise<{
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
  }> {
    try {
      // Get sprint info
      const sprintCommand = `jira sprint get ${sprintId} --output json`;
      const sprintResult = await this.executeAcliCommand(sprintCommand);
      const sprintData = JSON.parse(sprintResult);

      // Get tickets in sprint
      const ticketsCommand = `jira workitem list --sprint ${sprintId} --output json`;
      const ticketsResult = await this.executeAcliCommand(ticketsCommand);
      const ticketsData = JSON.parse(ticketsResult);

      // Map sprint data
      const sprint: JiraSprint = {
        id: sprintData.id,
        name: sprintData.name,
        state: sprintData.state?.toLowerCase() || "unknown",
        boardId: sprintData.originBoardId || 0,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
        completeDate: sprintData.completeDate,
        goal: sprintData.goal || "",
      };

      // Map tickets
      const tickets: JiraTicket[] = ticketsData.map((ticket: any) => ({
        key: ticket.key,
        summary: ticket.fields?.summary || "",
        status: ticket.fields?.status?.name || "Unknown",
        assignee: ticket.fields?.assignee?.displayName || "Unassigned",
        priority: ticket.fields?.priority?.name || "None",
        type: ticket.fields?.issuetype?.name || "Task",
        storyPoints: ticket.fields?.customfield_10016 || 0, // Common story points field
        labels: ticket.fields?.labels || [],
        created: ticket.fields?.created,
        updated: ticket.fields?.updated,
        url: this.buildTicketUrl(ticket.key),
      }));

      // Calculate stats
      const stats = {
        total: tickets.length,
        completed: tickets.filter((t) =>
          ["Done", "Closed", "Resolved"].includes(t.status)
        ).length,
        inProgress: tickets.filter((t) =>
          ["In Progress", "In Review", "In QA"].includes(t.status)
        ).length,
        todo: tickets.filter((t) =>
          ["To Do", "Open", "Backlog"].includes(t.status)
        ).length,
        storyPoints: tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0),
        completedPoints: tickets
          .filter((t) => ["Done", "Closed", "Resolved"].includes(t.status))
          .reduce((sum, t) => sum + (t.storyPoints || 0), 0),
      };

      return { sprint, tickets, stats };
    } catch (error: any) {
      throw new JiraCliError(`Failed to get sprint details: ${error.message}`);
    }
  }

  /**
   * List boards
   */
  async listBoards(params: {
    projectKey?: string;
    type?: "scrum" | "kanban";
    maxResults?: number;
  }): Promise<JiraBoard[]> {
    try {
      let command = "jira board list --output json";

      if (params.projectKey) {
        command += ` --project-key ${params.projectKey}`;
      }

      if (params.type) {
        command += ` --type ${params.type}`;
      }

      // Note: ACLI doesn't support --max-results, we'll limit client-side

      const result = await this.executeAcliCommand(command);
      let boards = JSON.parse(result);

      // Apply client-side limit if maxResults is specified
      if (params.maxResults && boards.length > params.maxResults) {
        boards = boards.slice(0, params.maxResults);
      }

      return boards.map((board: any) => ({
        id: board.id,
        name: board.name,
        type: board.type?.toLowerCase() || "scrum",
        projectKey: board.location?.projectKey || "",
      }));
    } catch (error: any) {
      throw new JiraCliError(`Failed to list boards: ${error.message}`);
    }
  }

  /**
   * Get active sprint for a board
   */
  async getActiveSprint(boardId: number): Promise<JiraSprint | null> {
    try {
      const sprints = await this.listSprints({
        boardId,
        state: "active",
        maxResults: 1,
      });

      return sprints.length > 0 ? sprints[0]! : null;
    } catch (error: any) {
      throw new JiraCliError(`Failed to get active sprint: ${error.message}`);
    }
  }

  /**
   * Search for tickets using JQL
   */
  async searchTickets(params: {
    jql: string;
    maxResults?: number;
    fields?: string[];
  }): Promise<JiraTicket[]> {
    try {
      let command = `jira workitem search --jql "${params.jql.replace(
        /"/g,
        '\\"'
      )}" --json`;

      // Note: ACLI doesn't support --max-results flag, we'll limit results after fetching

      const result = await this.executeAcliCommand(command);
      let tickets = JSON.parse(result);

      // Apply client-side limit if maxResults is specified
      if (params.maxResults && tickets.length > params.maxResults) {
        tickets = tickets.slice(0, params.maxResults);
      }

      return tickets.map((ticket: any) => ({
        key: ticket.key,
        summary: ticket.fields?.summary || "",
        status: ticket.fields?.status?.name || "Unknown",
        assignee: ticket.fields?.assignee?.displayName || "Unassigned",
        priority: ticket.fields?.priority?.name || "None",
        type: ticket.fields?.issuetype?.name || "Task",
        storyPoints: ticket.fields?.customfield_10016 || 0,
        labels: ticket.fields?.labels || [],
        created: ticket.fields?.created,
        updated: ticket.fields?.updated,
        url: this.buildTicketUrl(ticket.key),
      }));
    } catch (error: any) {
      throw new JiraCliError(`Failed to search tickets: ${error.message}`);
    }
  }

  /**
   * Get tickets assigned to current user
   */
  async getMyTickets(params: {
    status?: string; // "To Do", "In Progress", "Done", etc.
    sprint?: "open" | "closed" | "all";
    maxResults?: number;
  }): Promise<JiraTicket[]> {
    try {
      // Build JQL query
      let jql = "assignee = currentUser()";

      // Add sprint filter
      if (params.sprint === "open") {
        jql += " AND sprint in openSprints()";
      } else if (params.sprint === "closed") {
        jql += " AND sprint in closedSprints()";
      }

      // Add status filter
      if (params.status) {
        jql += ` AND status = "${params.status}"`;
      }

      // Order by created date
      jql += " ORDER BY created DESC";

      return await this.searchTickets({
        jql,
        maxResults: params.maxResults || 50,
      });
    } catch (error: any) {
      throw new JiraCliError(`Failed to get my tickets: ${error.message}`);
    }
  }

  /**
   * Create a new JIRA ticket
   */
  async createTicket(params: {
    project: string;
    type: string;
    summary: string;
    description?: string;
    assignee?: string; // email, account ID, or "@me"
    labels?: string[];
    priority?: string;
    parent?: string; // For subtasks
  }): Promise<JiraTicket> {
    try {
      // Build command
      let command = `jira workitem create --project "${
        params.project
      }" --type "${params.type}" --summary "${params.summary.replace(
        /"/g,
        '\\"'
      )}"`;

      // Add description if provided
      if (params.description) {
        command += ` --description "${params.description.replace(
          /"/g,
          '\\"'
        )}"`;
      }

      // Add assignee (default to @me if not specified)
      const assignee = params.assignee || "@me";
      command += ` --assignee "${assignee}"`;

      // Add labels
      if (params.labels && params.labels.length > 0) {
        const labelsString = params.labels.join(",");
        command += ` --label "${labelsString}"`;
      }

      // Add parent for subtasks
      if (params.parent) {
        command += ` --parent "${params.parent}"`;
      }

      // Add JSON output flag
      command += " --json";

      const result = await this.executeAcliCommand(command);
      const ticketData = JSON.parse(result);

      // Return created ticket details
      return {
        key: ticketData.key,
        summary: params.summary,
        status: ticketData.fields?.status?.name || "To Do",
        assignee: ticketData.fields?.assignee?.displayName || assignee,
        priority:
          ticketData.fields?.priority?.name || params.priority || "Medium",
        type: params.type,
        storyPoints: 0,
        labels: params.labels || [],
        created: ticketData.fields?.created || new Date().toISOString(),
        updated: ticketData.fields?.updated || new Date().toISOString(),
        url: this.buildTicketUrl(ticketData.key),
      };
    } catch (error: any) {
      throw new JiraCliError(`Failed to create ticket: ${error.message}`);
    }
  }

  /**
   * Transition a ticket to a new status
   * @param ticketKey - Ticket key (e.g., "PROJ-123")
   * @param status - Target status (e.g., "In Progress", "Done")
   * @returns Updated ticket details
   */
  async transitionTicket(params: {
    ticketKey: string;
    status: string;
  }): Promise<{
    ticketKey: string;
    previousStatus: string;
    newStatus: string;
    url: string;
  }> {
    try {
      // First, get the current ticket to know previous status
      const getTicketCommand = `jira workitem search --jql "key = ${params.ticketKey}" --json`;
      const currentTicketResult = await this.executeAcliCommand(
        getTicketCommand
      );
      const currentTickets = JSON.parse(currentTicketResult);

      if (!currentTickets || currentTickets.length === 0) {
        throw new JiraCliError(`Ticket ${params.ticketKey} not found`);
      }

      const previousStatus =
        currentTickets[0]?.fields?.status?.name || "Unknown";

      // Transition the ticket
      let command = `jira workitem transition --key "${params.ticketKey}" --status "${params.status}" --yes`;

      await this.executeAcliCommand(command);

      // Return transition details
      return {
        ticketKey: params.ticketKey,
        previousStatus: previousStatus,
        newStatus: params.status,
        url: this.buildTicketUrl(params.ticketKey),
      };
    } catch (error: any) {
      throw new JiraCliError(`Failed to transition ticket: ${error.message}`);
    }
  }
}
