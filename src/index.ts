#!/usr/bin/env node

/**
 * pr-buddy: MCP Server with GitHub CLI Integration
 * Author: Shivaraj Bakale
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { ToolResponse } from './types/index.js';

import { TOOLS } from './tools/index.js';
import { SCHEMAS } from './schemas/index.js';
import {
  handleReadFile,
  handleWriteFile,
  handleListDirectory,
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
} from './handlers/index.js';

class PRBuddyServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'pr-buddy',
        version: '2.0.0',
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
        // File Operations
        {
          name: TOOLS.READ_FILE,
          description: SCHEMAS.READ_FILE.description,
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file to read',
              },
            },
            required: ['path'],
          },
        },
        {
          name: TOOLS.WRITE_FILE,
          description: SCHEMAS.WRITE_FILE.description,
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file to write',
              },
              content: {
                type: 'string',
                description: 'Content to write to the file',
              },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: TOOLS.LIST_DIRECTORY,
          description: SCHEMAS.LIST_DIRECTORY.description,
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the directory to list',
              },
            },
            required: ['path'],
          },
        },

        // Core GitHub Operations
        {
          name: TOOLS.CREATE_PR,
          description: SCHEMAS.CREATE_PR.description,
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'PR title',
              },
              body: {
                type: 'string',
                description: 'PR description/body',
              },
              template: {
                type: 'string',
                description: 'PR template type (feature, bugfix, hotfix, docs, refactor)',
                enum: ['feature', 'bugfix', 'hotfix', 'docs', 'refactor'],
              },
              base: {
                type: 'string',
                description: 'Base branch (defaults to main)',
              },
              head: {
                type: 'string',
                description: 'Head branch (defaults to current branch)',
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'Labels to add to the PR',
              },
              reviewers: {
                type: 'array',
                items: { type: 'string' },
                description: 'Reviewers to assign',
              },
              assignees: {
                type: 'array',
                items: { type: 'string' },
                description: 'Assignees for the PR',
              },
              draft: {
                type: 'boolean',
                description: 'Create as draft PR',
              },
            },
            required: ['title'],
          },
        },
        {
          name: TOOLS.GET_PR_DETAILS,
          description: SCHEMAS.GET_PR_DETAILS.description,
          inputSchema: {
            type: 'object',
            properties: {
              number: {
                type: 'number',
                description: 'PR number',
              },
              url: {
                type: 'string',
                description: 'PR URL (alternative to number)',
              },
            },
          },
        },
        {
          name: TOOLS.LIST_MY_PRS,
          description: SCHEMAS.LIST_MY_PRS.description,
          inputSchema: {
            type: 'object',
            properties: {
              state: {
                type: 'string',
                description: 'PR state filter',
                enum: ['open', 'closed', 'merged', 'all'],
              },
              limit: {
                type: 'number',
                description: 'Maximum number of PRs to return',
                minimum: 1,
                maximum: 100,
              },
            },
          },
        },
        {
          name: TOOLS.CHECKOUT_PR_BRANCH,
          description: SCHEMAS.CHECKOUT_PR_BRANCH.description,
          inputSchema: {
            type: 'object',
            properties: {
              prNumber: {
                type: 'number',
                description: 'PR number to checkout',
              },
              createLocal: {
                type: 'boolean',
                description: 'Create local branch if it doesn\'t exist',
              },
            },
            required: ['prNumber'],
          },
        },
        {
          name: TOOLS.ADD_PR_LABEL,
          description: SCHEMAS.ADD_PR_LABEL.description,
          inputSchema: {
            type: 'object',
            properties: {
              prNumber: {
                type: 'number',
                description: 'PR number',
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'Labels to add',
              },
            },
            required: ['prNumber', 'labels'],
          },
        },
        {
          name: TOOLS.REMOVE_PR_LABEL,
          description: SCHEMAS.REMOVE_PR_LABEL.description,
          inputSchema: {
            type: 'object',
            properties: {
              prNumber: {
                type: 'number',
                description: 'PR number',
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'Labels to remove',
              },
            },
            required: ['prNumber', 'labels'],
          },
        },

        // Review & Analysis Tools
        {
          name: TOOLS.GENERATE_REVIEW_PROMPT,
          description: SCHEMAS.GENERATE_REVIEW_PROMPT.description,
          inputSchema: {
            type: 'object',
            properties: {
              prNumber: {
                type: 'number',
                description: 'PR number',
              },
              reviewType: {
                type: 'string',
                description: 'Type of review prompt',
                enum: ['staff-engineer', 'security', 'performance'],
              },
            },
            required: ['prNumber'],
          },
        },
        {
          name: TOOLS.GENERATE_CODE_CHECKLIST,
          description: SCHEMAS.GENERATE_CODE_CHECKLIST.description,
          inputSchema: {
            type: 'object',
            properties: {
              prNumber: {
                type: 'number',
                description: 'PR number',
              },
              includeSecurityChecks: {
                type: 'boolean',
                description: 'Include security-focused checklist items',
              },
              includePerformanceChecks: {
                type: 'boolean',
                description: 'Include performance-focused checklist items',
              },
            },
            required: ['prNumber'],
          },
        },
        {
          name: TOOLS.ANALYZE_PR_COMPLEXITY,
          description: SCHEMAS.ANALYZE_PR_COMPLEXITY.description,
          inputSchema: {
            type: 'object',
            properties: {
              prNumber: {
                type: 'number',
                description: 'PR number',
              },
              includeRecommendations: {
                type: 'boolean',
                description: 'Include improvement recommendations',
              },
            },
            required: ['prNumber'],
          },
        },
        {
          name: TOOLS.GET_PR_DIFF_SUMMARY,
          description: SCHEMAS.GET_PR_DIFF_SUMMARY.description,
          inputSchema: {
            type: 'object',
            properties: {
              prNumber: {
                type: 'number',
                description: 'PR number',
              },
              includeFileStats: {
                type: 'boolean',
                description: 'Include per-file statistics',
              },
              maxFiles: {
                type: 'number',
                description: 'Maximum number of files to show',
                minimum: 1,
                maximum: 100,
              },
            },
            required: ['prNumber'],
          },
        },

        // PR Statistics
        {
          name: TOOLS.GET_PR_STATS,
          description: SCHEMAS.GET_PR_STATS.description,
          inputSchema: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                description: 'Time period for statistics',
                enum: ['day', 'week', 'month'],
              },
            },
            required: ['period'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        let result: ToolResponse;

        switch (name) {
          // File Operations
          case TOOLS.READ_FILE:
            result = await handleReadFile(args as { path: string });
            break;
          case TOOLS.WRITE_FILE:
            result = await handleWriteFile(args as { path: string; content: string });
            break;
          case TOOLS.LIST_DIRECTORY:
            result = await handleListDirectory(args as { path: string });
            break;

          // Core GitHub Operations
          case TOOLS.CREATE_PR:
            result = await handleCreatePR(args as {
              title: string;
              body?: string;
              template?: string;
              base?: string;
              head?: string;
              labels?: string[];
              reviewers?: string[];
              assignees?: string[];
              draft?: boolean;
            });
            break;
          case TOOLS.GET_PR_DETAILS:
            result = await handleGetPRDetails(args as { number?: number; url?: string });
            break;
          case TOOLS.LIST_MY_PRS:
            result = await handleListMyPRs(args as { state?: string; limit?: number });
            break;
          case TOOLS.CHECKOUT_PR_BRANCH:
            result = await handleCheckoutPRBranch(args as { prNumber: number; createLocal?: boolean });
            break;
          case TOOLS.ADD_PR_LABEL:
            result = await handleAddPRLabel(args as { prNumber: number; labels: string[] });
            break;
          case TOOLS.REMOVE_PR_LABEL:
            result = await handleRemovePRLabel(args as { prNumber: number; labels: string[] });
            break;

          // Review & Analysis Tools
          case TOOLS.GENERATE_REVIEW_PROMPT:
            result = await handleGenerateReviewPrompt(args as { prNumber: number; reviewType?: string });
            break;
          case TOOLS.GENERATE_CODE_CHECKLIST:
            result = await handleGenerateCodeChecklist(args as { 
              prNumber: number; 
              includeSecurityChecks?: boolean; 
              includePerformanceChecks?: boolean; 
            });
            break;
          case TOOLS.ANALYZE_PR_COMPLEXITY:
            result = await handleAnalyzePRComplexity(args as { prNumber: number; includeRecommendations?: boolean });
            break;
          case TOOLS.GET_PR_DIFF_SUMMARY:
            result = await handleGetPRDiffSummary(args as { prNumber: number; includeFileStats?: boolean; maxFiles?: number });
            break;

          // PR Statistics
          case TOOLS.GET_PR_STATS:
            result = await handleGetPRStats(args as { period: 'day' | 'week' | 'month' });
            break;

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        return {
          content: result.content,
          isError: result.isError
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
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('pr-buddy MCP server running on stdio');
  }
}

const server = new PRBuddyServer();
server.run().catch((error) => {
  console.error('Failed to run server:', error);
  process.exit(1);
}); 