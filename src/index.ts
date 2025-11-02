#!/usr/bin/env node

/**
 * pr-buddy: MCP Server with GitHub CLI Integration
 * Author: Shivaraj Bakale
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { ToolResponse } from "./types/index.js";
import { TOOLS } from "./tools/index.js";
import { SCHEMAS } from "./schemas/index.js";
import {
  handleCreatePR,
  handleEditPR,
  handleGetPRDetails,
  handleListMyPRs,
  handleCheckoutPRBranch,
  handleEnablePreviewEnv,
  handleGetPRComments,
  handleGetPRDiffSummary,
  handleGetPRStats,
  handleGetJiraSprints,
  handleGetJiraSprintDetails,
  handleGetJiraBoards,
  handleGetMyJiraTickets,
  handleCreateJiraTicket,
} from "./handlers/index.js";

class PRBuddyServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: "pr-buddy",
      version: "2.0.0",
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Converts ToolResponse to MCP protocol response format
   */
  private convertToolResponse(response: ToolResponse) {
    return {
      content: response.content,
      isError: response.isError,
    };
  }

  private setupToolHandlers(): void {
    // Core GitHub Operations

    // CREATE_PR - with elicitation support
    this.server.registerTool(
      TOOLS.CREATE_PR,
      {
        title: SCHEMAS.CREATE_PR.title,
        description: SCHEMAS.CREATE_PR.description,
        inputSchema: {
          title: SCHEMAS.CREATE_PR.inputSchema.title,
          body: SCHEMAS.CREATE_PR.inputSchema.body,
          base: SCHEMAS.CREATE_PR.inputSchema.base,
          head: SCHEMAS.CREATE_PR.inputSchema.head,
          labels: SCHEMAS.CREATE_PR.inputSchema.labels,
          draft: SCHEMAS.CREATE_PR.inputSchema.draft,
          repo: SCHEMAS.CREATE_PR.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleCreatePR(args as any, this.server);
        return this.convertToolResponse(response);
      }
    );

    // GET_PR_DETAILS
    this.server.registerTool(
      TOOLS.GET_PR_DETAILS,
      {
        title: SCHEMAS.GET_PR_DETAILS.title,
        description: SCHEMAS.GET_PR_DETAILS.description,
        inputSchema: {
          number: SCHEMAS.GET_PR_DETAILS.inputSchema.number,
          repo: SCHEMAS.GET_PR_DETAILS.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleGetPRDetails(args as any);
        return this.convertToolResponse(response);
      }
    );

    // EDIT_PR
    this.server.registerTool(
      TOOLS.EDIT_PR,
      {
        title: SCHEMAS.EDIT_PR.title,
        description: SCHEMAS.EDIT_PR.description,
        inputSchema: {
          number: SCHEMAS.EDIT_PR.inputSchema.number,
          title: SCHEMAS.EDIT_PR.inputSchema.title,
          body: SCHEMAS.EDIT_PR.inputSchema.body,
          base: SCHEMAS.EDIT_PR.inputSchema.base,
          state: SCHEMAS.EDIT_PR.inputSchema.state,
          addLabels: SCHEMAS.EDIT_PR.inputSchema.addLabels,
          removeLabels: SCHEMAS.EDIT_PR.inputSchema.removeLabels,
          repo: SCHEMAS.EDIT_PR.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleEditPR(args as any);
        return this.convertToolResponse(response);
      }
    );

    // LIST_MY_PRS
    this.server.registerTool(
      TOOLS.LIST_MY_PRS,
      {
        title: SCHEMAS.LIST_MY_PRS.title,
        description: SCHEMAS.LIST_MY_PRS.description,
        inputSchema: {
          author: SCHEMAS.LIST_MY_PRS.inputSchema.author,
          state: SCHEMAS.LIST_MY_PRS.inputSchema.state,
          isDraft: SCHEMAS.LIST_MY_PRS.inputSchema.isDraft,
          dateFrom: SCHEMAS.LIST_MY_PRS.inputSchema.dateFrom,
          dateTo: SCHEMAS.LIST_MY_PRS.inputSchema.dateTo,
          limit: SCHEMAS.LIST_MY_PRS.inputSchema.limit,
          includeLabels: SCHEMAS.LIST_MY_PRS.inputSchema.includeLabels,
          includeStats: SCHEMAS.LIST_MY_PRS.inputSchema.includeStats,
          repo: SCHEMAS.LIST_MY_PRS.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleListMyPRs(args as any);
        return this.convertToolResponse(response);
      }
    );

    // CHECKOUT_PR_BRANCH
    this.server.registerTool(
      TOOLS.CHECKOUT_PR_BRANCH,
      {
        title: SCHEMAS.CHECKOUT_PR_BRANCH.title,
        description: SCHEMAS.CHECKOUT_PR_BRANCH.description,
        inputSchema: {
          prNumber: SCHEMAS.CHECKOUT_PR_BRANCH.inputSchema.prNumber,
          createLocal: SCHEMAS.CHECKOUT_PR_BRANCH.inputSchema.createLocal,
          repo: SCHEMAS.CHECKOUT_PR_BRANCH.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleCheckoutPRBranch(args as any);
        return this.convertToolResponse(response);
      }
    );

    // ENABLE_PREVIEW_ENV
    this.server.registerTool(
      TOOLS.ENABLE_PREVIEW_ENV,
      {
        title: SCHEMAS.ENABLE_PREVIEW_ENV.title,
        description: SCHEMAS.ENABLE_PREVIEW_ENV.description,
        inputSchema: {
          prNumber: SCHEMAS.ENABLE_PREVIEW_ENV.inputSchema.prNumber,
          repo: SCHEMAS.ENABLE_PREVIEW_ENV.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleEnablePreviewEnv(args as any);
        return this.convertToolResponse(response);
      }
    );

    // GET_PR_COMMENTS
    this.server.registerTool(
      TOOLS.GET_PR_COMMENTS,
      {
        title: SCHEMAS.GET_PR_COMMENTS.title,
        description: SCHEMAS.GET_PR_COMMENTS.description,
        inputSchema: {
          prNumber: SCHEMAS.GET_PR_COMMENTS.inputSchema.prNumber,
          includeGeneralComments:
            SCHEMAS.GET_PR_COMMENTS.inputSchema.includeGeneralComments,
          includeReviewComments:
            SCHEMAS.GET_PR_COMMENTS.inputSchema.includeReviewComments,
          includeInlineComments:
            SCHEMAS.GET_PR_COMMENTS.inputSchema.includeInlineComments,
          includeResolved: SCHEMAS.GET_PR_COMMENTS.inputSchema.includeResolved,
          filterByAuthor: SCHEMAS.GET_PR_COMMENTS.inputSchema.filterByAuthor,
          groupBy: SCHEMAS.GET_PR_COMMENTS.inputSchema.groupBy,
          maxComments: SCHEMAS.GET_PR_COMMENTS.inputSchema.maxComments,
          repo: SCHEMAS.GET_PR_COMMENTS.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleGetPRComments(args as any);
        return this.convertToolResponse(response);
      }
    );

    // GET_PR_DIFF_SUMMARY
    this.server.registerTool(
      TOOLS.GET_PR_DIFF_SUMMARY,
      {
        title: SCHEMAS.GET_PR_DIFF_SUMMARY.title,
        description: SCHEMAS.GET_PR_DIFF_SUMMARY.description,
        inputSchema: {
          prNumber: SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.prNumber,
          includeFileStats:
            SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.includeFileStats,
          maxFiles: SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.maxFiles,
          repo: SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleGetPRDiffSummary(args as any);
        return this.convertToolResponse(response);
      }
    );

    // PR Statistics

    // GET_PR_STATS
    this.server.registerTool(
      TOOLS.GET_PR_STATS,
      {
        title: SCHEMAS.GET_PR_STATS.title,
        description: SCHEMAS.GET_PR_STATS.description,
        inputSchema: {
          period: SCHEMAS.GET_PR_STATS.inputSchema.period,
          repo: SCHEMAS.GET_PR_STATS.inputSchema.repositoryUrl,
        },
      },
      async (args) => {
        const response = await handleGetPRStats(args as any);
        return this.convertToolResponse(response);
      }
    );

    // JIRA Tools

    // GET_JIRA_SPRINTS
    this.server.registerTool(
      TOOLS.GET_JIRA_SPRINTS,
      {
        title: SCHEMAS.GET_JIRA_SPRINTS.title,
        description: SCHEMAS.GET_JIRA_SPRINTS.description,
        inputSchema: {
          site: SCHEMAS.GET_JIRA_SPRINTS.inputSchema.site,
          boardId: SCHEMAS.GET_JIRA_SPRINTS.inputSchema.boardId,
          state: SCHEMAS.GET_JIRA_SPRINTS.inputSchema.state,
          maxResults: SCHEMAS.GET_JIRA_SPRINTS.inputSchema.maxResults,
          includeTickets: SCHEMAS.GET_JIRA_SPRINTS.inputSchema.includeTickets,
        },
      },
      async (args) => {
        const response = await handleGetJiraSprints(args as any);
        return this.convertToolResponse(response);
      }
    );

    // GET_JIRA_SPRINT_DETAILS
    this.server.registerTool(
      TOOLS.GET_JIRA_SPRINT_DETAILS,
      {
        title: SCHEMAS.GET_JIRA_SPRINT_DETAILS.title,
        description: SCHEMAS.GET_JIRA_SPRINT_DETAILS.description,
        inputSchema: {
          site: SCHEMAS.GET_JIRA_SPRINT_DETAILS.inputSchema.site,
          sprintId: SCHEMAS.GET_JIRA_SPRINT_DETAILS.inputSchema.sprintId,
          groupBy: SCHEMAS.GET_JIRA_SPRINT_DETAILS.inputSchema.groupBy,
          includeSubtasks: SCHEMAS.GET_JIRA_SPRINT_DETAILS.inputSchema.includeSubtasks,
        },
      },
      async (args) => {
        const response = await handleGetJiraSprintDetails(args as any);
        return this.convertToolResponse(response);
      }
    );

    // GET_JIRA_BOARDS
    this.server.registerTool(
      TOOLS.GET_JIRA_BOARDS,
      {
        title: SCHEMAS.GET_JIRA_BOARDS.title,
        description: SCHEMAS.GET_JIRA_BOARDS.description,
        inputSchema: {
          site: SCHEMAS.GET_JIRA_BOARDS.inputSchema.site,
          projectKey: SCHEMAS.GET_JIRA_BOARDS.inputSchema.projectKey,
          type: SCHEMAS.GET_JIRA_BOARDS.inputSchema.type,
          maxResults: SCHEMAS.GET_JIRA_BOARDS.inputSchema.maxResults,
        },
      },
      async (args) => {
        const response = await handleGetJiraBoards(args as any);
        return this.convertToolResponse(response);
      }
    );

    // GET_MY_JIRA_TICKETS
    this.server.registerTool(
      TOOLS.GET_MY_JIRA_TICKETS,
      {
        title: SCHEMAS.GET_MY_JIRA_TICKETS.title,
        description: SCHEMAS.GET_MY_JIRA_TICKETS.description,
        inputSchema: {
          site: SCHEMAS.GET_MY_JIRA_TICKETS.inputSchema.site,
          status: SCHEMAS.GET_MY_JIRA_TICKETS.inputSchema.status,
          sprint: SCHEMAS.GET_MY_JIRA_TICKETS.inputSchema.sprint,
          maxResults: SCHEMAS.GET_MY_JIRA_TICKETS.inputSchema.maxResults,
          groupBy: SCHEMAS.GET_MY_JIRA_TICKETS.inputSchema.groupBy,
        },
      },
      async (args) => {
        const response = await handleGetMyJiraTickets(args as any);
        return this.convertToolResponse(response);
      }
    );

    // CREATE_JIRA_TICKET
    this.server.registerTool(
      TOOLS.CREATE_JIRA_TICKET,
      {
        title: SCHEMAS.CREATE_JIRA_TICKET.title,
        description: SCHEMAS.CREATE_JIRA_TICKET.description,
        inputSchema: {
          site: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.site,
          project: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.project,
          type: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.type,
          summary: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.summary,
          description: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.description,
          assignee: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.assignee,
          labels: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.labels,
          priority: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.priority,
          parent: SCHEMAS.CREATE_JIRA_TICKET.inputSchema.parent,
        },
      },
      async (args) => {
        const response = await handleCreateJiraTicket(args as any);
        return this.convertToolResponse(response);
      }
    );
  }

  private setupErrorHandling(): void {
    // Handle process termination
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("pr-buddy MCP server running on stdio");
  }
}

const server = new PRBuddyServer();

server.run().catch((error) => {
  console.error("Failed to run server:", error);
  process.exit(1);
});
