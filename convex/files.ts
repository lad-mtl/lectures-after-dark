import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a temporary upload URL that expires in 1 hour
// This URL allows the client to upload a file directly to Convex storage
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// Convert a storage ID to a publicly accessible URL
export const getFileUrl = mutation({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});
