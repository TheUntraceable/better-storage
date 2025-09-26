import { APIError } from "better-auth";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Id } from "./betterAuth/_generated/dataModel";

export const generateUploadLink = mutation({
    async handler(ctx) {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        return await ctx.storage.generateUploadUrl();
    },
});

export const generateGetLink = mutation({
    args: {
        storageId: v.id("_storage"),
        emails: v.array(v.string()),
    },
    async handler(ctx, { storageId, emails }) {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        const upload = await ctx.db
            .query("uploads")
            .withIndex("by_uploader_and_id", (q) => {
                return q
                    .eq("uploader", user._id as Id<"user">)
                    .eq("storageId", storageId);
            })
            .collect();
        if (!upload) {
            throw new APIError("NOT_FOUND", {
                message: "Upload not found",
            });
        }
        const link = await ctx.storage.getUrl(storageId);
        return { upload, link };
    },
});

export const uploadImage = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    async handler(ctx, { storageId }) {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        if (!user._id) {
            throw new APIError("UNAUTHORIZED", {
                message: "User ID not found",
            });
        }
        await ctx.db.insert("uploads", {
            uploader: user._id,
            storageId,
        });
    },
});

export const get = query({
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated.",
            });
        }
        const uploads = await ctx.db
            .query("uploads")
            .withIndex("by_uploader", (q) =>
                q.eq("uploader", user._id as Id<"user">)
            )
            .collect();
        return uploads;
    },
});

export const deleteUpload = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, { storageId }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        const existing = await ctx.db
            .query("uploads")
            .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
            .collect();
        if (!existing || existing.length === 0) {
            throw new APIError("NOT_FOUND", {
                message: "Upload not found",
            });
        }
        await ctx.db.delete(existing[0]._id);
    },
});
