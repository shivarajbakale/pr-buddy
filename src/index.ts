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
  handleEditPR,
  handleGetPRDetails,
  handleListMyPRs,
  handleCheckoutPRBranch,
  handleEnablePreviewEnv,
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
              title: SCHEMAS.CREATE_PR.inputSchema.title,
              body: SCHEMAS.CREATE_PR.inputSchema.body,
              base: SCHEMAS.CREATE_PR.inputSchema.base.default("master"),
              head: SCHEMAS.CREATE_PR.inputSchema.head,
              draft: SCHEMAS.CREATE_PR.inputSchema.draft,
              repo: SCHEMAS.CREATE_PR.inputSchema.repositoryUrl,
            },
            required: ["title", "body", "base", "head", "repo"],
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
          name: TOOLS.EDIT_PR,
          description: SCHEMAS.EDIT_PR.description,
          inputSchema: {
            type: "object",
            properties: {
              number: SCHEMAS.EDIT_PR.inputSchema.number,
              title: SCHEMAS.EDIT_PR.inputSchema.title,
              body: SCHEMAS.EDIT_PR.inputSchema.body,
              base: SCHEMAS.EDIT_PR.inputSchema.base,
              state: SCHEMAS.EDIT_PR.inputSchema.state,
              addLabels: SCHEMAS.EDIT_PR.inputSchema.addLabels,
              removeLabels: SCHEMAS.EDIT_PR.inputSchema.removeLabels,
              repo: SCHEMAS.EDIT_PR.inputSchema.repositoryUrl,
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
        {
          name: TOOLS.GENERATE_CODE_CHECKLIST,
          description: SCHEMAS.GENERATE_CODE_CHECKLIST.description,
          inputSchema: {
            type: "object",
            properties: {
              prNumber: SCHEMAS.GENERATE_CODE_CHECKLIST.inputSchema.prNumber,
              includeSecurityChecks:
                SCHEMAS.GENERATE_CODE_CHECKLIST.inputSchema
                  .includeSecurityChecks,
              includePerformanceChecks:
                SCHEMAS.GENERATE_CODE_CHECKLIST.inputSchema
                  .includePerformanceChecks,
              repo: SCHEMAS.GENERATE_CODE_CHECKLIST.inputSchema.repositoryUrl,
            },
            required: ["prNumber", "repo"],
          },
        },
        {
          name: TOOLS.GET_PR_DIFF_SUMMARY,
          description: SCHEMAS.GET_PR_DIFF_SUMMARY.description,
          inputSchema: {
            type: "object",
            properties: {
              prNumber: SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.prNumber,
              includeFileStats:
                SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.includeFileStats,
              maxFiles: SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.maxFiles,
              repo: SCHEMAS.GET_PR_DIFF_SUMMARY.inputSchema.repositoryUrl,
            },
            required: ["prNumber", "repo"],
          },
        },
        {
          name: TOOLS.ENABLE_PREVIEW_ENV,
          description: SCHEMAS.ENABLE_PREVIEW_ENV.description,
          inputSchema: {
            type: "object",
            properties: {
              prNumber: SCHEMAS.ENABLE_PREVIEW_ENV.inputSchema.prNumber,
              repo: SCHEMAS.ENABLE_PREVIEW_ENV.inputSchema.repositoryUrl,
            },
            required: ["prNumber", "repo"],
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
                body: string;
                base: string;
                head: string;
                labels: string[];
                draft: boolean;
                repo?: string;
              }
            );
            break;
          case TOOLS.GET_PR_DETAILS:
            result = await handleGetPRDetails(args as { number: number });
            break;
          case TOOLS.EDIT_PR:
            result = await handleEditPR(
              args as {
                number: number;
                title?: string;
                body?: string;
                base?: string;
                state?: "open" | "closed";
                addLabels?: string[];
                removeLabels?: string[];
                repo?: string;
              }
            );
            break;
          case TOOLS.LIST_MY_PRS:
            result = await handleListMyPRs(
              args as {
                author?: string;
                state?: string;
                isDraft?: boolean;
                dateFrom?: string;
                dateTo?: string;
                limit?: number;
                includeLabels?: boolean;
                includeStats?: boolean;
                repo?: string;
              }
            );
            break;
          case TOOLS.CHECKOUT_PR_BRANCH:
            result = await handleCheckoutPRBranch(
              args as { prNumber: number; createLocal?: boolean; repo?: string }
            );
            break;
          case TOOLS.ENABLE_PREVIEW_ENV:
            result = await handleEnablePreviewEnv(
              args as { prNumber: number; repo?: string }
            );
            break;
          case TOOLS.GENERATE_REVIEW_PROMPT:
            result = await handleGenerateReviewPrompt(
              args as { prNumber: number; reviewType?: string; repo?: string }
            );
            break;
          case TOOLS.GENERATE_CODE_CHECKLIST:
            result = await handleGenerateCodeChecklist(
              args as {
                prNumber: number;
                includeSecurityChecks?: boolean;
                includePerformanceChecks?: boolean;
                repo?: string;
              }
            );
            break;
          case TOOLS.ANALYZE_PR_COMPLEXITY:
            result = await handleAnalyzePRComplexity(
              args as {
                prNumber: number;
                includeRecommendations?: boolean;
                repo?: string;
              }
            );
            break;
          case TOOLS.GET_PR_DIFF_SUMMARY:
            result = await handleGetPRDiffSummary(
              args as {
                prNumber: number;
                includeFileStats?: boolean;
                maxFiles?: number;
                repo?: string;
              }
            );
            break;
          case TOOLS.GET_PR_STATS:
            result = await handleGetPRStats(
              args as { period: "day" | "week" | "month"; repo?: string }
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
