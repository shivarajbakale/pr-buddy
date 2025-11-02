/**
 * Test script to demonstrate Highlight model usage
 * Shows how to create highlights and query them
 */

import { prisma } from "../src/utils/prisma.js";

async function main() {
  console.log("\n📝 Testing Highlight Model\n");

  // 1. Get Apollo values to link
  const apolloValues = await prisma.apolloValue.findMany({
    select: { id: true, title: true },
  });

  if (apolloValues.length === 0) {
    console.log("❌ No Apollo values found. Run: npm run db:seed");
    return;
  }

  console.log(`✓ Found ${apolloValues.length} Apollo values\n`);

  // 2. Create a sample highlight
  const highlight = await prisma.highlight.create({
    data: {
      userId: "shivaraj@apollo.io",
      title: "Implemented MCP server with JIRA integration",
      description:
        "Built a complete Model Context Protocol server integrating GitHub CLI and Atlassian CLI for seamless PR and JIRA management",
      artifactType: "github_pr",
      artifactUrl: "https://github.com/apollo/pr-buddy/pull/1",
      achievedAt: new Date("2025-11-01"),
      apolloValues: {
        create: [
          { apolloValueId: apolloValues[0]?.id ?? "" }, // Be "All for One"
          { apolloValueId: apolloValues[1]?.id ?? "" }, // Take Extreme Ownership
        ],
      },
    },
    include: {
      apolloValues: {
        include: {
          apolloValue: true,
        },
      },
    },
  });

  console.log("✓ Created highlight:");
  console.log(`  ID: ${highlight.id}`);
  console.log(`  Title: ${highlight.title}`);
  console.log(`  User: ${highlight.userId}`);
  console.log(`  Artifact: ${highlight.artifactUrl}`);
  console.log(`  Apollo Values:`);
  highlight.apolloValues.forEach((hav) => {
    console.log(`    - ${hav.apolloValue.title}`);
  });

  // 3. Query highlights by user
  console.log(`\n📊 Querying highlights for user: ${highlight.userId}\n`);

  const userHighlights = await prisma.highlight.findMany({
    where: { userId: highlight.userId },
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

  console.log(`✓ Found ${userHighlights.length} highlight(s)\n`);

  // 4. Get summary statistics
  const totalCount = await prisma.highlight.count();
  const byType = await prisma.highlight.groupBy({
    by: ["artifactType"],
    _count: true,
  });

  console.log("📈 Summary Statistics:");
  console.log(`  Total Highlights: ${totalCount}`);
  console.log(`  By Type:`);
  byType.forEach((type) => {
    console.log(`    - ${type.artifactType}: ${type._count}`);
  });

  // 5. Find highlights by Apollo value
  const ownership = apolloValues.find((v) =>
    v.title.includes("Take Extreme Ownership")
  );
  if (ownership) {
    const ownershipHighlights = await prisma.highlight.findMany({
      where: {
        apolloValues: {
          some: {
            apolloValueId: ownership.id,
          },
        },
      },
      select: {
        title: true,
        userId: true,
      },
    });

    console.log(
      `\n🎯 Highlights demonstrating "Take Extreme Ownership": ${ownershipHighlights.length}`
    );
    ownershipHighlights.forEach((h) => {
      console.log(`  - ${h.title} (${h.userId})`);
    });
  }

  console.log("\n✅ Highlight model test completed!\n");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
