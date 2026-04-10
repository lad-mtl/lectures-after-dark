import { handleContentRequest } from "./content";

interface Env {
  ASSETS?: Fetcher;
  CONTENT_CACHE?: KVNamespace;
  STRAPI_CONTENT_API_URL: string;
  STRAPI_CONTENT_API_TOKEN?: string;
  STRAPI_TIMEOUT_MS?: string;
  EVENTBRITE_API_BASE_URL?: string;
  EVENTBRITE_PRIVATE_TOKEN?: string;
  EVENTBRITE_ORGANIZER_ID?: string;
  EVENTBRITE_TIMEOUT_MS?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/content/")) {
      const contentResponse = await handleContentRequest(request, env);

      if (contentResponse) {
        return contentResponse;
      }
    }

    if (!env.ASSETS) {
      return new Response("Static assets binding is not configured.", {
        status: 500,
      });
    }

    // Serve static assets
    const assetResponse = await env.ASSETS.fetch(request);

    // SPA fallback: if asset not found and path has no file extension, serve index.html
    if (
      assetResponse.status === 404 &&
      !url.pathname.includes(".") &&
      request.method === "GET"
    ) {
      const indexRequest = new Request(new URL("/index.html", request.url), {
        method: "GET",
        headers: request.headers,
      });
      return env.ASSETS.fetch(indexRequest);
    }

    return assetResponse;
  },
};
