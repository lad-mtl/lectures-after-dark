import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    pages: defineTable({
        slug: v.string(),
        content: v.string(), // JSON string of the Craft.js state
    }).index("by_slug", ["slug"]),
});
