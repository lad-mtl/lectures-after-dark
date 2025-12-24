import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPage = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const page = await ctx.db
            .query("pages")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        return page;
    },
});

export const savePage = mutation({
    args: { slug: v.string(), layout: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("pages")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { layout: args.layout });
        } else {
            await ctx.db.insert("pages", { slug: args.slug, layout: args.layout });
        }
    },
});

export const deletePage = mutation({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("pages")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

export const initializePages = mutation({
    args: {},
    handler: async (ctx) => {
        const pages = ["home", "bars", "speakers", "about"];

        for (const slug of pages) {
            const existing = await ctx.db
                .query("pages")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .first();

            if (!existing) {
                await ctx.db.insert("pages", {
                    slug,
                    layout: JSON.stringify({})
                });
            }
        }

        return { success: true, message: "Pages initialized" };
    },
});

export const listPages = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("pages").collect();
    },
});
