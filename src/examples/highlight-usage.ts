/**
 * Example usage patterns for the Highlight model
 * This file demonstrates common operations with performance highlights
 */

import { prisma } from "../utils/prisma.js";
import type { HighlightInput } from "../types/highlight.js";

// Example 1: Create a new highlight
export async function createHighlight(input: HighlightInput) {
  return await prisma.highlight.create({
    data: {
      userId: input.userId,
      title: input.title,
      ...(input.description !== undefined && { description: input.description }),
      artifactType: input.artifactType,
      artifactUrl: input.artifactUrl,
      achievedAt: input.achievedAt,
      apolloValues: {
        create: input.apolloValueIds.map((apolloValueId) => ({
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
              description: true,
            },
          },
        },
      },
    },
  });
}

// Example 2: Get all highlights for a user
export async function getUserHighlights(userId: string) {
  return await prisma.highlight.findMany({
    where: { userId },
    include: {
      apolloValues: {
        include: {
          apolloValue: true,
        },
      },
    },
    orderBy: { achievedAt: "desc" },
  });
}

// Example 3: Get highlights by date range
export async function getHighlightsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return await prisma.highlight.findMany({
    where: {
      userId,
      achievedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      apolloValues: {
        include: {
          apolloValue: true,
        },
      },
    },
    orderBy: { achievedAt: "desc" },
  });
}

// Example 4: Get highlights demonstrating a specific Apollo value
export async function getHighlightsByApolloValue(
  userId: string,
  apolloValueTitle: string
) {
  return await prisma.highlight.findMany({
    where: {
      userId,
      apolloValues: {
        some: {
          apolloValue: {
            title: {
              contains: apolloValueTitle,
            },
          },
        },
      },
    },
    include: {
      apolloValues: {
        include: {
          apolloValue: true,
        },
      },
    },
    orderBy: { achievedAt: "desc" },
  });
}

// Example 5: Get highlight statistics for a user
export async function getUserHighlightStats(userId: string) {
  const highlights = await prisma.highlight.findMany({
    where: { userId },
    include: {
      apolloValues: {
        include: {
          apolloValue: true,
        },
      },
    },
  });

  const totalHighlights = highlights.length;

  // Count by Apollo value
  const byApolloValue: Record<string, number> = {};
  highlights.forEach((h) => {
    h.apolloValues.forEach((hav) => {
      const title = hav.apolloValue.title;
      byApolloValue[title] = (byApolloValue[title] ?? 0) + 1;
    });
  });

  // Count by artifact type
  const byArtifactType: Record<string, number> = {};
  highlights.forEach((h) => {
    byArtifactType[h.artifactType] =
      (byArtifactType[h.artifactType] ?? 0) + 1;
  });

  return {
    totalHighlights,
    byApolloValue,
    byArtifactType,
    recentHighlights: highlights.slice(0, 5),
  };
}

// Example 6: Update a highlight
export async function updateHighlight(
  highlightId: string,
  updates: {
    title?: string;
    description?: string;
    apolloValueIds?: string[];
  }
) {
  // If updating Apollo values, delete existing and create new ones
  if (updates.apolloValueIds) {
    await prisma.highlightApolloValue.deleteMany({
      where: { highlightId },
    });
  }

  return await prisma.highlight.update({
    where: { id: highlightId },
    data: {
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.apolloValueIds && {
        apolloValues: {
          create: updates.apolloValueIds.map((apolloValueId) => ({
            apolloValueId,
          })),
        },
      }),
    },
    include: {
      apolloValues: {
        include: {
          apolloValue: true,
        },
      },
    },
  });
}

// Example 7: Delete a highlight
export async function deleteHighlight(highlightId: string) {
  return await prisma.highlight.delete({
    where: { id: highlightId },
  });
}

// Example 8: Get all Apollo values (for selection UI)
export async function getAllApolloValues() {
  return await prisma.apolloValue.findMany({
    select: {
      id: true,
      title: true,
      description: true,
    },
    orderBy: { title: "asc" },
  });
}
