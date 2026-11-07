import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'

type ServerOptions = ConstructorParameters<typeof McpServer>[1] & {
  serverInfo?: ConstructorParameters<typeof McpServer>[0]
}

const DEFAULT_SERVER_INFO = { name: 'lectures-after-dark-cms', version: '1.0.0' }

function jsonRpcError(status: number, message: string) {
  return Response.json({ error: { code: -32000, message }, id: null, jsonrpc: '2.0' }, { status })
}

// Drop-in replacement for `mcp-handler`'s createMcpHandler, which @payloadcms/plugin-mcp calls
// once per request. `mcp-handler` pipes the response through a fake Node ServerResponse, and on
// Cloudflare Workers that conversion never resolves, so the runtime cancels the request as hung.
// This version stays on web APIs: one stateless server per request, answered with plain JSON.
// next.config.ts aliases `mcp-handler` to this module.
export function createMcpHandler(
  initializeServer: (server: McpServer) => Promise<void> | void,
  serverOptions: ServerOptions = {},
  _config: unknown = {},
) {
  const { serverInfo = DEFAULT_SERVER_INFO, ...options } = serverOptions

  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return jsonRpcError(405, 'Method not allowed.')
    }

    const server = new McpServer(serverInfo, options)
    await initializeServer(server)

    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      sessionIdGenerator: undefined,
    })
    await server.connect(transport)

    try {
      return await transport.handleRequest(request)
    } finally {
      await server.close()
    }
  }
}
