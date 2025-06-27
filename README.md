# pr-buddy

A Model Context Protocol Server in TypeScript

## Overview

This is a Model Context Protocol (MCP) Server built with TypeScript.


## MCP Server Features

This server provides the following MCP capabilities:

- **Tools**: Functions that LLMs can call to perform actions
- **Resources**: Data sources that LLMs can read from
- **Prompts**: Template prompts for common use cases

## Usage

### Running the Server

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Connecting to the Server

This MCP server can be used with any MCP-compatible client. To connect:

1. **Claude Desktop**: Add the server to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "pr-buddy": {
      "command": "node",
      "args": ["path/to/your/server/dist/index.js"]
    }
  }
}
```

2. **Other MCP Clients**: Use the server's stdio transport to connect.



## Development

### Project Structure

```
src/
├── index.ts          # Main entry point
├── types.ts          # TypeScript type definitions
└── ...
```

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Run in development mode with hot reload
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm start` - Start the application

## MCP Protocol

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). Learn more at [modelcontextprotocol.io](https://modelcontextprotocol.io/).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 