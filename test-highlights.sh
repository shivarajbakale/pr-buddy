#!/bin/bash

# Quick test script for highlight tools
# Tests the MCP server directly

echo "Testing Highlight Tools..."
echo ""

# Test 1: List Apollo Values
echo "=== Test 1: List Apollo Values ==="
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_apollo_values","arguments":{}}}' | node dist/index.js | tail -n 1 | jq -r '.result.content[0].text'

echo ""
echo "Press Enter to continue to next test..."
read

# Test 2: Create a Highlight
echo "=== Test 2: Create Highlight ==="
# First get an Apollo value ID
APOLLO_ID=$(sqlite3 prisma/dev.db "SELECT id FROM ApolloValue LIMIT 1;")
echo "Using Apollo Value ID: $APOLLO_ID"

echo "{
  \"jsonrpc\":\"2.0\",
  \"id\":2,
  \"method\":\"tools/call\",
  \"params\":{
    \"name\":\"create_highlight\",
    \"arguments\":{
      \"userId\":\"shivaraj@apollo.io\",
      \"title\":\"Implemented MCP Highlight Management System\",
      \"description\":\"Built complete Phase 1 of highlight management with 4 tools for performance reviews\",
      \"artifactType\":\"github_pr\",
      \"artifactUrl\":\"https://github.com/apollo/pr-buddy/pull/1\",
      \"achievedAt\":\"2025-11-02\",
      \"apolloValueIds\":[\"$APOLLO_ID\"]
    }
  }
}" | node dist/index.js | tail -n 1 | jq -r '.result.content[0].text'

echo ""
echo "Press Enter to continue to next test..."
read

# Test 3: Get My Highlights
echo "=== Test 3: Get My Highlights ==="
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_my_highlights","arguments":{"userId":"shivaraj@apollo.io"}}}' | node dist/index.js | tail -n 1 | jq -r '.result.content[0].text'

echo ""
echo "Press Enter to continue to next test..."
read

# Test 4: Get Highlight Summary
echo "=== Test 4: Get Highlight Summary ==="
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_highlight_summary","arguments":{"userId":"shivaraj@apollo.io"}}}' | node dist/index.js | tail -n 1 | jq -r '.result.content[0].text'

echo ""
echo "✅ All tests completed!"
