/**
 * Handlers for Highlight management tools
 * Phase 1: Core CRUD and analytics for performance review highlights
 * Author: Shivaraj Bakale
 */

import { prisma } from "../utils/prisma.js";
import type { ToolResponse } from "../types/index.js";

/**
 * Create a new performance highlight
 */
export async function handleCreateHighlight(args: {
  userId: string;
  title: string;
  description?: string;
  artifactType: string;
  artifactUrl: string;
  achievedAt: string;
  apolloValueIds: string[];
}): Promise<ToolResponse> {
  try {
    // Validate Apollo value IDs exist
    const apolloValues = await prisma.apolloValue.findMany({
      where: {
        id: {
          in: args.apolloValueIds,
        },
      },
    });

    if (apolloValues.length !== args.apolloValueIds.length) {
      const foundIds = apolloValues.map((v) => v.id);
      const missingIds = args.apolloValueIds.filter(
        (id) => !foundIds.includes(id)
      );
      return {
        content: [
          {
            type: "text",
            text: `❌ Invalid Apollo value IDs: ${missingIds.join(", ")}\n\nUse the list_apollo_values tool to see available values.`,
          },
        ],
      };
    }

    // Create the highlight
    const highlight = await prisma.highlight.create({
      data: {
        userId: args.userId,
        title: args.title,
        ...(args.description !== undefined && {
          description: args.description,
        }),
        artifactType: args.artifactType,
        artifactUrl: args.artifactUrl,
        achievedAt: new Date(args.achievedAt),
        apolloValues: {
          create: args.apolloValueIds.map((apolloValueId) => ({
            apolloValueId,
          })),
        },
      },
      include: {
        apolloValues: {
          include: {
            apolloValue: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Format output
    const valuesList = highlight.apolloValues
      .map((hav) => hav.apolloValue.title)
      .join(", ");

    let output = `✅ Highlight created successfully!\n\n`;
    output += `**Details:**\n`;
    output += `- **ID**: ${highlight.id}\n`;
    output += `- **User**: ${highlight.userId}\n`;
    output += `- **Title**: ${highlight.title}\n`;
    if (highlight.description) {
      output += `- **Description**: ${highlight.description}\n`;
    }
    output += `- **Artifact Type**: ${highlight.artifactType}\n`;
    output += `- **Artifact URL**: ${highlight.artifactUrl}\n`;
    output += `- **Achieved At**: ${highlight.achievedAt.toISOString().split("T")[0]}\n`;
    output += `- **Apollo Values**: ${valuesList}\n`;
    output += `- **Created**: ${highlight.createdAt.toISOString().split("T")[0]}\n`;

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error) {
    console.error("Error creating highlight:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating highlight: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get all highlights for a user with optional filtering
 */
export async function handleGetMyHighlights(args: {
  userId: string;
  startDate?: string;
  endDate?: string;
  apolloValue?: string;
  artifactType?: string;
}): Promise<ToolResponse> {
  try {
    // Build query filters
    const where: {
      userId: string;
      achievedAt?: { gte?: Date; lte?: Date };
      artifactType?: string;
      apolloValues?: { some: { apolloValue: { title: { contains: string } } } };
    } = {
      userId: args.userId,
    };

    // Date range filter
    if (args.startDate !== undefined || args.endDate !== undefined) {
      where.achievedAt = {};
      if (args.startDate !== undefined) {
        where.achievedAt.gte = new Date(args.startDate);
      }
      if (args.endDate !== undefined) {
        where.achievedAt.lte = new Date(args.endDate);
      }
    }

    // Artifact type filter
    if (args.artifactType !== undefined) {
      where.artifactType = args.artifactType;
    }

    // Apollo value filter
    if (args.apolloValue !== undefined) {
      where.apolloValues = {
        some: {
          apolloValue: {
            title: {
              contains: args.apolloValue,
            },
          },
        },
      };
    }

    const highlights = await prisma.highlight.findMany({
      where,
      include: {
        apolloValues: {
          include: {
            apolloValue: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { achievedAt: "desc" },
    });

    if (highlights.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No highlights found for user: ${args.userId}${args.startDate !== undefined || args.endDate !== undefined ? " in the specified date range" : ""}`,
          },
        ],
      };
    }

    // Format as table
    let output = `## Highlights for ${args.userId}\n\n`;
    if (args.startDate !== undefined || args.endDate !== undefined) {
      output += `**Period**: ${args.startDate ?? "Beginning"} to ${args.endDate ?? "Present"}\n\n`;
    }
    output += `**Total**: ${highlights.length} highlight${highlights.length !== 1 ? "s" : ""}\n\n`;

    output += `| Date | Title | Type | Apollo Values | Link |\n`;
    output += `|------|-------|------|---------------|------|\n`;

    highlights.forEach((h) => {
      const date = h.achievedAt.toISOString().split("T")[0] ?? "";
      const title = h.title.replace(/\|/g, "\\|");
      const type = h.artifactType;
      const values = h.apolloValues
        .map((hav) => hav.apolloValue.title.replace(/\|/g, "\\|"))
        .join(", ");
      const url = h.artifactUrl;

      output += `| ${date} | ${title} | ${type} | ${values} | [Link](${url}) |\n`;
    });

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error) {
    console.error("Error fetching highlights:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error fetching highlights: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get summary statistics for a user's highlights
 */
export async function handleGetHighlightSummary(args: {
  userId: string;
  startDate?: string;
  endDate?: string;
}): Promise<ToolResponse> {
  try {
    // Build query filters
    const where: {
      userId: string;
      achievedAt?: { gte?: Date; lte?: Date };
    } = {
      userId: args.userId,
    };

    if (args.startDate !== undefined || args.endDate !== undefined) {
      where.achievedAt = {};
      if (args.startDate !== undefined) {
        where.achievedAt.gte = new Date(args.startDate);
      }
      if (args.endDate !== undefined) {
        where.achievedAt.lte = new Date(args.endDate);
      }
    }

    const highlights = await prisma.highlight.findMany({
      where,
      include: {
        apolloValues: {
          include: {
            apolloValue: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { achievedAt: "desc" },
    });

    if (highlights.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No highlights found for user: ${args.userId}${args.startDate !== undefined || args.endDate !== undefined ? " in the specified date range" : ""}`,
          },
        ],
      };
    }

    // Calculate statistics
    const byApolloValue: Record<string, number> = {};
    const byArtifactType: Record<string, number> = {};

    highlights.forEach((h) => {
      // Count by Apollo value
      h.apolloValues.forEach((hav) => {
        const title = hav.apolloValue.title;
        byApolloValue[title] = (byApolloValue[title] ?? 0) + 1;
      });

      // Count by artifact type
      byArtifactType[h.artifactType] =
        (byArtifactType[h.artifactType] ?? 0) + 1;
    });

    // Format output
    let output = `## Performance Highlight Summary\n\n`;
    output += `**User**: ${args.userId}\n`;
    if (args.startDate !== undefined || args.endDate !== undefined) {
      output += `**Period**: ${args.startDate ?? "Beginning"} to ${args.endDate ?? "Present"}\n`;
    }
    output += `**Total Highlights**: ${highlights.length}\n\n`;

    // Apollo Values breakdown
    output += `### By Apollo Value\n\n`;
    output += `| Apollo Value | Count |\n`;
    output += `|--------------|-------|\n`;
    const sortedValues = Object.entries(byApolloValue).sort(
      ([, a], [, b]) => b - a
    );
    sortedValues.forEach(([value, count]) => {
      output += `| ${value.replace(/\|/g, "\\|")} | ${count} |\n`;
    });

    // Artifact Type breakdown
    output += `\n### By Artifact Type\n\n`;
    output += `| Artifact Type | Count |\n`;
    output += `|---------------|-------|\n`;
    const sortedTypes = Object.entries(byArtifactType).sort(
      ([, a], [, b]) => b - a
    );
    sortedTypes.forEach(([type, count]) => {
      output += `| ${type} | ${count} |\n`;
    });

    // Recent highlights
    output += `\n### Recent Highlights\n\n`;
    const recentHighlights = highlights.slice(0, 5);
    output += `| Date | Title | Apollo Values |\n`;
    output += `|------|-------|---------------|\n`;
    recentHighlights.forEach((h) => {
      const date = h.achievedAt.toISOString().split("T")[0] ?? "";
      const title = h.title.replace(/\|/g, "\\|");
      const values = h.apolloValues
        .map((hav) => hav.apolloValue.title.replace(/\|/g, "\\|"))
        .join(", ");
      output += `| ${date} | ${title} | ${values} |\n`;
    });

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error) {
    console.error("Error generating highlight summary:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error generating summary: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * List all available Apollo values
 */
export async function handleListApolloValues(): Promise<ToolResponse> {
  try {
    const apolloValues = await prisma.apolloValue.findMany({
      orderBy: { title: "asc" },
    });

    if (apolloValues.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No Apollo values found. Run: npm run db:seed",
          },
        ],
      };
    }

    let output = `## Apollo Company Values\n\n`;
    output += `**Total**: ${apolloValues.length} values\n\n`;
    output += `| ID | Title | Description |\n`;
    output += `|----|-------|-------------|\n`;

    apolloValues.forEach((value) => {
      const id = value.id;
      const title = value.title.replace(/\|/g, "\\|");
      const description = value.description.replace(/\|/g, "\\|");
      output += `| \`${id}\` | ${title} | ${description} |\n`;
    });

    output += `\n**Usage**: Copy the ID from the table above when creating highlights.\n`;

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error) {
    console.error("Error listing Apollo values:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error listing Apollo values: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
}
