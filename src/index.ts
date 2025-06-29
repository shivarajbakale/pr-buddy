#!/usr/bin/env node

/**
 * pr-buddy: MCP Server with GitHub CLI Integration
 * Author: Shivaraj Bakale
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { ToolResponse } from "./types/index.js";

import { TOOLS } from "./tools/index.js";
import { SCHEMAS } from "./schemas/index.js";
import {
  handleCreatePR,
  handleGetPRDetails,
  handleListMyPRs,
  handleCheckoutPRBranch,
  handleAddPRLabel,
  handleRemovePRLabel,
  handleGenerateReviewPrompt,
  handleGenerateCodeChecklist,
  handleAnalyzePRComplexity,
  handleGetPRDiffSummary,
  handleGetPRStats,
} from "./handlers/index.js";

class PRBuddyServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "pr-buddy",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Core GitHub Operations
        {
          name: TOOLS.CREATE_PR,
          description: SCHEMAS.CREATE_PR.description,
          inputSchema: {
            type: "object",
            properties: {
              ticketNumber: SCHEMAS.CREATE_PR.inputSchema.ticketNumber,
              body: SCHEMAS.CREATE_PR.inputSchema.body,
              base: SCHEMAS.CREATE_PR.inputSchema.base.default("master"),
              head: SCHEMAS.CREATE_PR.inputSchema.head,
              draft: SCHEMAS.CREATE_PR.inputSchema.draft,
              repo: SCHEMAS.CREATE_PR.inputSchema.repositoryUrl,
            },
            required: ["ticketNumber", "body", "base", "head", "repo"],
          },
        },
        {
          name: TOOLS.GET_PR_DETAILS,
          description: SCHEMAS.GET_PR_DETAILS.description,
          inputSchema: {
            type: "object",
            properties: {
              number: SCHEMAS.GET_PR_DETAILS.inputSchema.number,
              repo: SCHEMAS.GET_PR_DETAILS.inputSchema.repositoryUrl,
            },
            required: ["number", "repo"],
          },
        },
        {
          name: TOOLS.LIST_MY_PRS,
          description: SCHEMAS.LIST_MY_PRS.description,
          inputSchema: {
            type: "object",
            properties: {
              state: SCHEMAS.LIST_MY_PRS.inputSchema.state,
              limit: SCHEMAS.LIST_MY_PRS.inputSchema.limit,
              repo: SCHEMAS.LIST_MY_PRS.inputSchema.repositoryUrl,
            },
            required: ["repo"],
          },
        },
        {
          name: TOOLS.CHECKOUT_PR_BRANCH,
          description: SCHEMAS.CHECKOUT_PR_BRANCH.description,
          inputSchema: {
            type: "object",
            properties: {
              prNumber: SCHEMAS.CHECKOUT_PR_BRANCH.inputSchema.prNumber,
              createLocal: SCHEMAS.CHECKOUT_PR_BRANCH.inputSchema.createLocal,
              repo: SCHEMAS.CHECKOUT_PR_BRANCH.inputSchema.repositoryUrl,
            },
            required: ["prNumber", "repo"],
          },
        },

        // Review & Analysis Tools
        {
          name: TOOLS.GENERATE_REVIEW_PROMPT,
          description: SCHEMAS.GENERATE_REVIEW_PROMPT.description,
          inputSchema: {
            type: "object",
            properties: {
              prNumber: SCHEMAS.GENERATE_REVIEW_PROMPT.inputSchema.prNumber,
              reviewType: SCHEMAS.GENERATE_REVIEW_PROMPT.inputSchema.reviewType,
              repo: SCHEMAS.GENERATE_REVIEW_PROMPT.inputSchema.repositoryUrl,
            },
            required: ["prNumber", "reviewType", "repo"],
          },
        },
        {
          name: TOOLS.ANALYZE_PR_COMPLEXITY,
          description: SCHEMAS.ANALYZE_PR_COMPLEXITY.description,
          inputSchema: {
            type: "object",
            properties: {
              prNumber: SCHEMAS.ANALYZE_PR_COMPLEXITY.inputSchema.prNumber,
              includeRecommendations:
                SCHEMAS.ANALYZE_PR_COMPLEXITY.inputSchema
                  .includeRecommendations,
              repo: SCHEMAS.ANALYZE_PR_COMPLEXITY.inputSchema.repositoryUrl,
            },
            required: ["prNumber", "includeRecommendations", "repo"],
          },
        },

        // PR Statistics
        {
          name: TOOLS.GET_PR_STATS,
          description: SCHEMAS.GET_PR_STATS.description,
          inputSchema: {
            type: "object",
            properties: {
              period: SCHEMAS.GET_PR_STATS.inputSchema.period,
              repo: SCHEMAS.GET_PR_STATS.inputSchema.repositoryUrl,
            },
            required: ["period", "repo"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        let result: ToolResponse;

        switch (name) {
          case TOOLS.CREATE_PR:
            result = await handleCreatePR(
              args as {
                title: string;
                body?: string;
                template?: string;
                base?: string;
                head?: string;
                labels?: string[];
                reviewers?: string[];
                assignees?: string[];
                draft?: boolean;
              }
            );
            break;
          case TOOLS.GET_PR_DETAILS:
            result = await handleGetPRDetails(
              args as { number?: number; url?: string }
            );
            break;
          case TOOLS.LIST_MY_PRS:
            result = await handleListMyPRs(
              args as { state?: string; limit?: number }
            );
            break;
          case TOOLS.CHECKOUT_PR_BRANCH:
            result = await handleCheckoutPRBranch(
              args as { prNumber: number; createLocal?: boolean }
            );
            break;
          case TOOLS.ADD_PR_LABEL:
            result = await handleAddPRLabel(
              args as { prNumber: number; labels: string[] }
            );
            break;
          case TOOLS.REMOVE_PR_LABEL:
            result = await handleRemovePRLabel(
              args as { prNumber: number; labels: string[] }
            );
            break;
          case TOOLS.GENERATE_REVIEW_PROMPT:
            result = await handleGenerateReviewPrompt(
              args as { prNumber: number; reviewType?: string }
            );
            break;
          case TOOLS.GENERATE_CODE_CHECKLIST:
            result = await handleGenerateCodeChecklist(
              args as {
                prNumber: number;
                includeSecurityChecks?: boolean;
                includePerformanceChecks?: boolean;
              }
            );
            break;
          case TOOLS.ANALYZE_PR_COMPLEXITY:
            result = await handleAnalyzePRComplexity(
              args as { prNumber: number; includeRecommendations?: boolean }
            );
            break;
          case TOOLS.GET_PR_DIFF_SUMMARY:
            result = await handleGetPRDiffSummary(
              args as {
                prNumber: number;
                includeFileStats?: boolean;
                maxFiles?: number;
              }
            );
            break;
          case TOOLS.GET_PR_STATS:
            result = await handleGetPRStats(
              args as { period: "day" | "week" | "month" }
            );
            break;

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        return {
          content: result.content,
          isError: result.isError,
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error}`
        );
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error("[MCP Error]", error);
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
