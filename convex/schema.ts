import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    uploads: defineTable({
        uploader: v.string(),
        storageId: v.id("_storage"),
    })
        .index("by_uploader_and_id", ["uploader", "storageId"])
        .index("by_uploader", ["uploader"])
        .index("by_storageId", ["storageId"]),
});
