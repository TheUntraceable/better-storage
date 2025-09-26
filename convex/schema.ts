import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    uploads: defineTable({
        uploader: v.string(),
        storageId: v.id("_storage"),
        link: v.string(),
        size: v.number(),
        contentType: v.string()
    })
        .index("by_uploader_and_id", ["uploader", "storageId"])
        .index("by_storageId", ["storageId"]),
    invites: defineTable({
        ownerId: v.string(),
        emails: v.array(v.string()),
        link: v.string(),
    }).index("by_ownerId", ["ownerId"]),
});