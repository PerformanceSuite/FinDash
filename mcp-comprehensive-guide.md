# Model Context Protocol (MCP): The Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
   - [Architecture](#architecture)
   - [Components](#components)
   - [Communication Flow](#communication-flow)
3. [MCP Primitives](#mcp-primitives)
   - [Resources](#resources)
   - [Tools](#tools)
   - [Prompts](#prompts)
   - [Sampling](#sampling)
   - [Roots](#roots)
4. [Transports](#transports)
   - [STDIO Transport](#stdio-transport)
   - [SSE Transport](#sse-transport)
   - [Custom Transports](#custom-transports)
5. [For Server Developers](#for-server-developers)
   - [Getting Started](#getting-started-with-server-development)
   - [Server Capabilities](#server-capabilities)
   - [Error Handling](#server-error-handling)
6. [For Client Developers](#for-client-developers)
   - [Getting Started](#getting-started-with-client-development)
   - [Client Capabilities](#client-capabilities)
   - [Error Handling](#client-error-handling)
7. [Using Claude for Desktop with MCP](#using-claude-for-desktop-with-mcp)
8. [SDKs and Implementation](#sdks-and-implementation)
   - [TypeScript SDK](#typescript-sdk)
   - [Python SDK](#python-sdk)
   - [Java SDK](#java-sdk)
9. [Example Servers](#example-servers)
   - [Reference Implementations](#reference-implementations)
   - [Official Integrations](#official-integrations)
   - [Community Servers](#community-servers)
10. [Debugging and Testing](#debugging-and-testing)
    - [MCP Inspector](#mcp-inspector)
    - [Debugging Techniques](#debugging-techniques)
11. [Best Practices](#best-practices)
12. [Security Considerations](#security-considerations)
13. [Future Roadmap](#future-roadmap)
14. [Resources](#resources)

## Introduction

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). Similar to how USB-C provides a standardized way to connect devices to various peripherals, MCP provides a standardized way to connect AI models to different data sources and tools.

MCP helps build agents and complex workflows on top of LLMs by providing:

- A growing list of pre-built integrations that LLMs can directly use
- Flexibility to switch between LLM providers and vendors
- Best practices for securing data within your infrastructure
- A standardized way for applications to interact with LLMs

The protocol enables LLMs to access data and functionality from external systems while maintaining security and control. By implementing MCP, developers can create powerful AI integrations that work across different platforms and models.

## Core Concepts

### Architecture

MCP follows a client-server architecture where:

```
flowchart LR
    subgraph "Your Computer"
        Host["Host with MCP Client\n(Claude, IDEs, Tools)"]
        S1["MCP Server A"]
        S2["MCP Server B"]
        S3["MCP Server C"]
        Host <-->|"MCP Protocol"| S1
        Host <-->|"MCP Protocol"| S2
        Host <-->|"MCP Protocol"| S3
        S1 <--> D1[("Local\nData Source A")]
        S2 <--> D2[("Local\nData Source B")]
    end
    subgraph "Internet"
        S3 <-->|"Web APIs"| D3[("Remote\nService C")]
    end
```

### Components

The primary components of MCP are:

- **Hosts**: LLM applications (like Claude Desktop or IDEs) that initiate connections
- **Clients**: Components that maintain 1:1 connections with servers
- **Servers**: Provide context, tools, and prompts to clients
- **Transport Layer**: Handles communication between clients and servers

### Communication Flow

The typical flow of communication in MCP is:

1. **Initialization**: Client connects to server and negotiates capabilities
2. **Discovery**: Client discovers available resources, tools, and prompts
3. **Interaction**: Client requests data or functionality from the server
4. **Execution**: Server processes requests and returns results
5. **Termination**: Client or server closes the connection

The protocol uses JSON-RPC 2.0 for message formatting and supports bidirectional communication.

## MCP Primitives

MCP defines several core primitives that enable integration between LLMs and external systems:

### Resources

Resources are data sources that servers expose to clients. They represent static or dynamic content that LLMs can read and analyze.

**Key characteristics**:
- Identified by URIs (e.g., `file:///home/user/documents/report.pdf`)
- Can contain text or binary data
- Support MIME types to indicate content format
- Can be discovered through resource templates
- Designed to be **application-controlled** (client decides usage)

**Resource discovery**:
```javascript
// List resources request
{
  method: "resources/list"
}

// Response
{
  resources: [
    {
      uri: "file:///logs/app.log",
      name: "Application Logs",
      mimeType: "text/plain"
    }
  ]
}
```

**Resource reading**:
```javascript
// Read resource request
{
  method: "resources/read",
  params: {
    uri: "file:///logs/app.log"
  }
}

// Response
{
  contents: [
    {
      uri: "file:///logs/app.log",
      text: "2024-03-14 15:32:11 ERROR...",
      mimeType: "text/plain"
    }
  ]
}
```

Resources support real-time updates through subscriptions and change notifications.

### Tools

Tools are executable functions that servers expose to clients, allowing LLMs to perform actions in external systems.

**Key characteristics**:
- Identified by names and descriptions
- Accept structured input parameters
- Return formatted results
- Support JSON Schema for parameter validation
- Designed to be **model-controlled** (LLM can invoke them)

**Tool discovery**:
```javascript
// List tools request
{
  method: "tools/list"
}

// Response
{
  tools: [{
    name: "calculate_sum",
    description: "Add two numbers together",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" }
      },
      required: ["a", "b"]
    }
  }]
}
```

**Tool execution**:
```javascript
// Call tool request
{
  method: "tools/call",
  params: {
    name: "calculate_sum",
    arguments: {
      a: 5,
      b: 7
    }
  }
}

// Response
{
  content: [
    {
      type: "text",
      text: "12"
    }
  ]
}
```

Tools enable LLMs to interact with databases, APIs, file systems, and other external services.

### Prompts

Prompts are reusable templates that servers can define to guide LLM interactions.

**Key characteristics**:
- Named templates with descriptions
- Accept dynamic arguments
- Can include context from resources
- Support chaining multiple interactions
- Can surface as UI elements (like slash commands)

**Prompt discovery**:
```javascript
// List prompts request
{
  method: "prompts/list"
}

// Response
{
  prompts: [
    {
      name: "analyze-code",
      description: "Analyze code for potential improvements",
      arguments: [
        {
          name: "language",
          description: "Programming language",
          required: true
        }
      ]
    }
  ]
}
```

**Prompt execution**:
```javascript
// Get prompt request
{
  method: "prompts/get",
  params: {
    name: "analyze-code",
    arguments: {
      language: "python"
    }
  }
}

// Response
{
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: "Please analyze the following Python code..."
      }
    }
  ]
}
```

Prompts help standardize common LLM interactions and workflows.

### Sampling

Sampling enables servers to request LLM completions through the client, allowing for sophisticated agentic behaviors while maintaining security and privacy.

**Key characteristics**:
- Servers can request LLM to generate content
- Client controls what the LLM sees and generates
- Supports both text and image-based content
- Allows clients to modify prompts and completions

**Sampling request**:
```javascript
// Sampling request
{
  method: "sampling/createMessage",
  params: {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "What files are in the current directory?"
        }
      }
    ],
    systemPrompt: "You are a helpful file system assistant.",
    includeContext: "thisServer",
    maxTokens: 100
  }
}
```

Sampling enables servers to leverage LLM capabilities without exposing API keys or sensitive data.

### Roots

Roots define the boundaries where servers can operate. They provide a way for clients to inform servers about relevant resources and their locations.

**Key characteristics**:
- URIs that clients suggest servers should focus on
- Can represent file paths, API endpoints, or other locations
- Clients can notify servers when roots change
- Helps organize and structure resource access

```javascript
// Roots example
{
  roots: [
    {
      uri: "file:///home/user/projects/frontend",
      name: "Frontend Repository"
    },
    {
      uri: "https://api.example.com/v1",
      name: "API Endpoint"
    }
  ]
}
```

Roots help servers understand what resources are relevant and accessible.

## Transports

The transport layer in MCP handles the communication between clients and servers. MCP supports multiple transport mechanisms to accommodate different use cases.

### STDIO Transport

STDIO transport uses standard input/output for communication, making it ideal for local process-based integration.

**Key characteristics**:
- Uses stdin/stdout for message exchange
- Simple to implement and debug
- Works well for local processes
- Lightweight and efficient

**Implementation example**:
```javascript
// TypeScript
const transport = new StdioServerTransport();
await server.connect(transport);
```

### SSE Transport

Server-Sent Events (SSE) transport uses HTTP with SSE for server-to-client messaging and HTTP POST for client-to-server communication.

**Key characteristics**:
- Works over standard HTTP
- Supports unidirectional server-to-client streaming
- Compatible with most network environments
- Good for remote connections

**Implementation example**:
```javascript
// TypeScript (server)
app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

// TypeScript (client)
const transport = new SSEClientTransport(
  new URL("http://localhost:3000/sse")
);
await client.connect(transport);
```

### Custom Transports

Developers can implement custom transports to meet specific needs, such as WebSockets, custom network protocols, or integration with existing systems.

**Transport interface**:
```typescript
interface Transport {
  start(): Promise<void>;
  send(message: JSONRPCMessage): Promise<void>;
  close(): Promise<void>;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
}
```

## For Server Developers

### Getting Started with Server Development

Developing an MCP server involves several key steps:

1. **Choose an SDK**: Select the appropriate SDK for your language (Python, TypeScript, Java)
2. **Define server capabilities**: Determine what resources, tools, and prompts to expose
3. **Implement handlers**: Create handlers for resource access, tool execution, and prompt generation
4. **Configure transport**: Set up the communication transport
5. **Handle errors**: Implement proper error handling and reporting

Here's a basic example of creating a server in Python:

```python
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("my-server")

@mcp.tool()
async def get_weather(latitude: float, longitude: float) -> str:
    """Get weather forecast for a location.

    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
    """
    # Implementation...
    return "Weather forecast..."

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
```

And in TypeScript:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "my-server",
  version: "1.0.0",
});

// Register tool
server.tool(
  "get-weather",
  "Get weather forecast for a location",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
  },
  async ({ latitude, longitude }) => {
    // Implementation...
    return {
      content: [
        {
          type: "text",
          text: "Weather forecast...",
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Server running on stdio");
}

main();
```

### Server Capabilities

Servers can support various capabilities:

```javascript
var capabilities = ServerCapabilities.builder()
    .resources(true)     // Resource support
    .tools(true)         // Tool support
    .prompts(true)       // Prompt support
    .logging()           // Logging support
    .build();
```

These capabilities determine what features the server exposes to clients.

### Server Error Handling

Proper error handling is essential for MCP servers:

```javascript
try {
  // Tool operation
  const result = performOperation();
  return {
    content: [
      {
        type: "text",
        text: `Operation successful: ${result}`
      }
    ]
  };
} catch (error) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: `Error: ${error.message}`
      }
    ]
  };
}
```

Errors should include clear messages to help clients and users understand what went wrong.

## For Client Developers

### Getting Started with Client Development

Developing an MCP client involves:

1. **Choose an SDK**: Select the appropriate SDK for your language
2. **Initialize client**: Create and configure the client
3. **Connect to servers**: Establish connections with MCP servers
4. **Discover capabilities**: Query servers for available resources, tools, and prompts
5. **Handle interactions**: Process user requests and server responses

Here's a basic example in Python:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPClient:
    async def connect_to_server(self, server_script_path: str):
        # Setup server connection...
        
    async def process_query(self, query: str) -> str:
        # Send query to LLM, process tool calls, etc.

    async def chat_loop(self):
        # Interactive chat UI
```

And in TypeScript:

```typescript
import { ClientSession } from "@modelcontextprotocol/sdk/client/session.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "./server",
    args: ["--option", "value"]
  });
  
  const client = new ClientSession(transport);
  await client.initialize();
  
  // Process user queries...
}
```

### Client Capabilities

Clients can support various capabilities:

```javascript
var capabilities = ClientCapabilities.builder()
    .roots(true)      // Enable roots capability
    .sampling()       // Enable sampling capability
    .build();
```

These capabilities determine what features the client can use when interacting with servers.

### Client Error Handling

Clients should handle various error scenarios:

```javascript
try {
  const response = await client.callTool("get_weather", {
    latitude: 40.7128,
    longitude: -74.0060
  });
  // Process response...
} catch (error) {
  if (error instanceof McpError) {
    console.error(`MCP error: ${error.message}`);
    // Handle specific error types...
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

## Using Claude for Desktop with MCP

Claude for Desktop is one of the primary MCP hosts, providing a user-friendly interface for interacting with MCP servers.

### Configuration

To use MCP servers with Claude for Desktop:

1. Create or modify the configuration file at:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add server configurations:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop",
        "/Users/username/Downloads"
      ]
    }
  }
}
```

3. Restart Claude for Desktop to load the new configuration

### Interacting with Servers

Once configured, you'll see:
- A hammer icon for available tools
- A plug icon for resources and prompts

Claude will automatically use appropriate tools based on user queries, asking for permission before executing actions.

## SDKs and Implementation

### TypeScript SDK

The [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) provides a JavaScript/TypeScript implementation of MCP.

**Key features**:
- Comprehensive client and server implementations
- Support for all MCP primitives
- Multiple transport options
- Type-safe interfaces and validation

**Installation**:
```bash
npm install @modelcontextprotocol/sdk
```

**Simple server example**:
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0",
});

// Setup server...
```

### Python SDK

The [Python SDK](https://github.com/modelcontextprotocol/python-sdk) provides a Python implementation of MCP.

**Key features**:
- Async/await support
- FastMCP for simplified development
- Type hints and validation
- Comprehensive error handling

**Installation**:
```bash
pip install mcp
```

**Simple server example**:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("example-server")

@mcp.tool()
async def hello(name: str) -> str:
    """Say hello to a person.

    Args:
        name: The name of the person to greet
    """
    return f"Hello, {name}!"

if __name__ == "__main__":
    mcp.run(transport='stdio')
```

### Java SDK

The Java SDK provides a Java implementation of MCP, including support for both synchronous and asynchronous programming models.

**Key features**:
- Support for both synchronous and asynchronous APIs
- Multiple transport implementations
- Spring framework integration
- Comprehensive error handling

**Installation**:
```xml
<dependency>
    <groupId>io.modelcontextprotocol.sdk</groupId>
    <artifactId>mcp</artifactId>
</dependency>
```

**Simple server example**:
```java
// Create a sync server
McpSyncServer syncServer = McpServer.sync(transport)
    .serverInfo("my-server", "1.0.0")
    .capabilities(ServerCapabilities.builder()
        .tools(true)
        .build())
    .build();

// Register tool
syncServer.addTool(new McpServerFeatures.SyncToolRegistration(
    new Tool("calculator", "Basic calculator", Map.of(
        "operation", "string",
        "a", "number",
        "b", "number"
    )),
    arguments -> {
        // Tool implementation
        return new CallToolResult(result, false);
    }
));
```

## Example Servers

### Reference Implementations

Official reference servers demonstrate core MCP features:

**Data and file systems**:
- **[Filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)**: Secure file operations
- **[PostgreSQL](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)**: Database access
- **[SQLite](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)**: Database interaction
- **[Google Drive](https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive)**: File access

**Development tools**:
- **[Git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)**: Repository operations
- **[GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/github)**: GitHub API integration
- **[GitLab](https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab)**: GitLab integration
- **[Sentry](https://github.com/modelcontextprotocol/servers/tree/main/src/sentry)**: Issue analysis

**Web and browser automation**:
- **[Brave Search](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search)**: Web search
- **[Fetch](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)**: Web content fetching
- **[Puppeteer](https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer)**: Browser automation

**Productivity and communication**:
- **[Slack](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)**: Messaging
- **[Google Maps](https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps)**: Location services
- **[Memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)**: Knowledge graph

**AI and specialized tools**:
- **[EverArt](https://github.com/modelcontextprotocol/servers/tree/main/src/everart)**: AI image generation
- **[Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)**: Problem-solving

### Official Integrations

These MCP servers are maintained by companies:

- **[Axiom](https://github.com/axiomhq/mcp-server-axiom)**: Log analysis
- **[Browserbase](https://github.com/browserbase/mcp-server-browserbase)**: Browser automation
- **[Cloudflare](https://github.com/cloudflare/mcp-server-cloudflare)**: Resource management
- **[E2B](https://github.com/e2b-dev/mcp-server)**: Code execution
- **[Neon](https://github.com/neondatabase/mcp-server-neon)**: Postgres platform
- **[Qdrant](https://github.com/qdrant/mcp-server-qdrant/)**: Vector search
- **[Stripe](https://github.com/stripe/agent-toolkit)**: Payment processing

### Community Servers

Community-developed servers extend MCP's capabilities:

- **[Docker](https://github.com/ckreiling/mcp-server-docker)**: Container management
- **[Kubernetes](https://github.com/Flux159/mcp-server-kubernetes)**: Pod management
- **[Linear](https://github.com/jerhadf/linear-mcp-server)**: Project management
- **[Snowflake](https://github.com/datawiz168/mcp-snowflake-service)**: Database integration
- **[Spotify](https://github.com/varunneal/spotify-mcp)**: Music control
- **[Todoist](https://github.com/abhiz123/todoist-mcp-server)**: Task management

## Debugging and Testing

### MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is an interactive tool for testing and debugging MCP servers.

**Key features**:
- Interactive UI for server exploration
- Resource content inspection
- Tool testing with custom inputs
- Prompt template testing
- Connection diagnostics

**Basic usage**:
```bash
npx @modelcontextprotocol/inspector <command>
```

**Examples**:
```bash
# Test an NPM package
npx -y @modelcontextprotocol/inspector npx server-postgres postgres://127.0.0.1/testdb

# Test a Python package
npx @modelcontextprotocol/inspector uvx mcp-server-git --repository ~/code/project.git
```

### Debugging Techniques

When debugging MCP:

**Claude Desktop logs**:
```bash
# Follow logs in real-time
tail -n 20 -F ~/Library/Logs/Claude/mcp*.log
```

**Chrome DevTools**:
```bash
# Enable DevTools
echo '{"allowDevTools": true}' > ~/Library/Application\ Support/Claude/developer_settings.json
```

**Common issues**:
- Working directory problems
- Environment variable issues
- Initialization failures
- Connection problems

## Best Practices

When implementing MCP:

### For Resource Management
- Use clear, descriptive resource names and URIs
- Include helpful descriptions
- Set appropriate MIME types
- Implement resource templates for dynamic content
- Use subscriptions for changing resources

### For Tool Development
- Keep tools focused and atomic
- Provide detailed descriptions and schemas
- Implement proper validation
- Handle errors gracefully
- Document expected return values

### For Prompt Templates
- Use clear, descriptive names
- Document all arguments
- Validate required arguments
- Handle missing arguments
- Consider versioning templates

### For Transport Implementation
- Handle connection lifecycle properly
- Implement error handling
- Clean up resources
- Use appropriate timeouts
- Validate messages

## Security Considerations

When implementing MCP:

### Input Validation
- Validate all parameters
- Sanitize file paths
- Validate URLs
- Check parameter sizes
- Prevent injection attacks

### Access Control
- Implement authentication
- Use appropriate authorization
- Audit operations
- Rate limit requests
- Monitor for abuse

### Data Security
- Use TLS for network transport
- Encrypt sensitive data
- Validate integrity
- Implement size limits
- Sanitize inputs

## Future Roadmap

The MCP roadmap for H1 2025 includes:

### Remote MCP Support
- Authentication & Authorization
- Service Discovery
- Stateless Operations

### Reference Implementations
- Client Examples
- Protocol Drafting

### Distribution & Discovery
- Package Management
- Installation Tools
- Sandboxing
- Server Registry

### Agent Support
- Hierarchical Agent Systems
- Interactive Workflows
- Streaming Results

### Broader Ecosystem
- Community-Led Standards
- Additional Modalities
- Standardization

## Resources

- [MCP Website](https://modelcontextprotocol.io/)
- [GitHub Organization](https://github.com/modelcontextprotocol)
- [Specification](https://spec.modelcontextprotocol.io/)
- [Example Servers](https://github.com/modelcontextprotocol/servers)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Java SDK](https://github.com/modelcontextprotocol/java-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Claude Desktop](https://claude.ai/download)
