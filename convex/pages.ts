import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const savePage = mutation({
    args: {
        slug: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("pages")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { content: args.content });
        } else {
            await ctx.db.insert("pages", { slug: args.slug, content: args.content });
        }
    },
});

export const getPage = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("pages")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});
