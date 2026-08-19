import { handleContentRequest } from "./content";
import { handleContactRequest } from "./contact";
import { handleNewsletterRequest } from "./newsletter/api";
import { handleEventbriteWebhook } from "./newsletter/eventbrite";
import { dispatchDueCampaigns, handleNewsletterQueue } from "./newsletter/queue";
import type { NewsletterEnv } from "./newsletter/types";

interface Env extends NewsletterEnv {
  ASSETS?: Fetcher;
  CONTENT_CACHE?: KVNamespace;
  STRAPI_CONTENT_API_URL: string;
  STRAPI_CONTENT_API_TOKEN?: string;
  STRAPI_TIMEOUT_MS?: string;
  CONTACT_RATE_LIMITER?: RateLimit;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_CORE_EMAIL?: string;
  CONTACT_MARKETING_EMAIL?: string;
  CONTACT_REQUIRE_RATE_LIMIT?: string;
  CONTACT_REQUIRE_TURNSTILE?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/content/")) {
      const contentResponse = await handleContentRequest(request, env);

      if (contentResponse) {
        return contentResponse;
      }
    }

    if (url.pathname === "/api/contact") {
      const contactResponse = await handleContactRequest(request, env);

      if (contactResponse) {
        return contactResponse;
      }
    }

    if (url.pathname.startsWith("/api/newsletter/")) {
      const newsletterResponse = await handleNewsletterRequest(request, env, ctx);

      if (newsletterResponse) {
        return newsletterResponse;
      }
    }

    if (url.pathname.startsWith("/api/webhooks/eventbrite/")) {
      const webhookResponse = await handleEventbriteWebhook(request, env);

      if (webhookResponse) {
        return webhookResponse;
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

  async queue(batch: MessageBatch<unknown>, env: Env): Promise<void> {
    await handleNewsletterQueue(batch, env);
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await dispatchDueCampaigns(env);
  },
};
