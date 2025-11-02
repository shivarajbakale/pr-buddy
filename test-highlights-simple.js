/**
 * Simple test for highlight tools
 */

import { prisma } from "./dist/src/utils/prisma.js";
import {
  handleListApolloValues,
  handleCreateHighlight,
  handleGetMyHighlights,
  handleGetHighlightSummary,
} from "./dist/src/handlers/index.js";

async function test() {
  console.log("🧪 Testing Highlight Tools (Phase 1)\n");

  try {
    // Test 1: List Apollo Values
    console.log("=== Test 1: List Apollo Values ===");
    const valuesResult = await handleListApolloValues();
    console.log(valuesResult.content[0].text);
    console.log("\n✅ Test 1 passed!\n");

    // Get first Apollo value ID for next test
    const apolloValues = await prisma.apolloValue.findMany({ take: 2 });
    const apolloValueIds = apolloValues.map((v) => v.id);

    // Test 2: Create Highlight
    console.log("=== Test 2: Create Highlight ===");
    const createResult = await handleCreateHighlight({
      userId: "shivaraj@apollo.io",
      title: "Implemented MCP Highlight Management System",
      description:
        "Built complete Phase 1 of highlight management with 4 tools for performance reviews",
      artifactType: "github_pr",
      artifactUrl: "https://github.com/apollo/pr-buddy/pull/1",
      achievedAt: "2025-11-02",
      apolloValueIds: apolloValueIds,
    });
    console.log(createResult.content[0].text);
    console.log("\n✅ Test 2 passed!\n");

    // Test 3: Get My Highlights
    console.log("=== Test 3: Get My Highlights ===");
    const getResult = await handleGetMyHighlights({
      userId: "shivaraj@apollo.io",
    });
    console.log(getResult.content[0].text);
    console.log("\n✅ Test 3 passed!\n");

    // Test 4: Get Highlight Summary
    console.log("=== Test 4: Get Highlight Summary ===");
    const summaryResult = await handleGetHighlightSummary({
      userId: "shivaraj@apollo.io",
    });
    console.log(summaryResult.content[0].text);
    console.log("\n✅ Test 4 passed!\n");

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
