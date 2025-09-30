import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    uploads: defineTable({
        uploader: v.string(),
        storageId: v.id("_storage"),
        link: v.string(),
        size: v.number(),
        contentType: v.string(),
        name: v.string(),
    })
        .index("by_uploader_and_id", ["uploader", "storageId"])
        .index("by_storageId", ["storageId"]),
    invites: defineTable({
        ownerId: v.string(),
        emails: v.array(v.string()),
        link: v.string(),
        fileName: v.string(),
    })
        .index("by_ownerId", ["ownerId"])
        .index("by_link", ["link"]),
    hubs: defineTable({
        ownerId: v.string(),
        name: v.string(),
        description: v.string(),
    }).index("by_ownerId", ["ownerId"]),
    hubFiles: defineTable({
        hubId: v.id("hubs"),
        uploadId: v.id("uploads"),
    }).index("by_hub_id", ["hubId"]),
    assistants: defineTable({
        hubId: v.id("hubs"),
        assistantId: v.string(),
    })
        .index("by_hub", ["hubId"])
        .index("by_assistant_id", ["assistantId"]),
});
