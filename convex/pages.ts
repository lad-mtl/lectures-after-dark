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
        const pages = ["home", "bars", "speakers", "about", "events"];

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

export const archiveAndUpdateHomePage = mutation({
    args: {},
    handler: async (ctx) => {
        // Get the current home page
        const homePage = await ctx.db
            .query("pages")
            .withIndex("by_slug", (q) => q.eq("slug", "home"))
            .first();

        if (!homePage) {
            throw new Error("Home page not found");
        }

        // Create archive slug with timestamp
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const archiveSlug = `home_archive_${timestamp}`;

        // Save the current version as an archive
        await ctx.db.insert("pages", {
            slug: archiveSlug,
            layout: homePage.layout
        });

        // Parse the layout JSON
        let layoutObj;
        try {
            layoutObj = JSON.parse(homePage.layout);
        } catch {
            throw new Error("Failed to parse layout JSON");
        }

        // Function to recursively remove padding from all nodes in the layout
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const removePaddingFromAllNodes = (nodesObj: any) => {
            if (!nodesObj || typeof nodesObj !== 'object') {
                return;
            }

            // Iterate through all node IDs in the object
            for (const nodeId in nodesObj) {
                const node = nodesObj[nodeId];

                // Check if this node has props with style containing padding
                if (node && node.props && node.props.style && node.props.style.padding === '20px') {
                    // Remove the padding property
                    delete node.props.style.padding;
                }
            }
        };

        // Remove padding from all nodes in the layout object
        removePaddingFromAllNodes(layoutObj);

        // Save the updated layout
        const updatedLayout = JSON.stringify(layoutObj);
        await ctx.db.patch(homePage._id, { layout: updatedLayout });

        return {
            success: true,
            message: `Home page archived as '${archiveSlug}' and updated without padding`,
            archivedSlug: archiveSlug
        };
    },
});
