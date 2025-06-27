#!/usr/bin/env node

/**
 * pr-buddy - Professional Filesystem MCP Server
 * A Model Context Protocol Server in TypeScript
 * 
 * Author: Shivaraj Bakale
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { TOOLS } from './tools/index.js';
import { SCHEMAS } from './schemas/index.js';
import { handleReadFile, handleWriteFile, handleListDirectory } from './handlers/index.js';

const server = new McpServer({
  name: 'pr-buddy',
  version: '1.0.0',
});

server.registerTool(TOOLS.READ_FILE, SCHEMAS.READ_FILE, handleReadFile);
server.registerTool(TOOLS.WRITE_FILE, SCHEMAS.WRITE_FILE, handleWriteFile);
server.registerTool(TOOLS.LIST_DIRECTORY, SCHEMAS.LIST_DIRECTORY, handleListDirectory);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('pr-buddy MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
}); 