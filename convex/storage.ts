import { APIError } from "better-auth";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
    internalAction,
    internalMutation,
    mutation,
    query,
} from "./_generated/server";
import { authComponent } from "./auth";
import { autumn } from "./autumn";
import type { Id } from "./betterAuth/_generated/dataModel";

const BYTES_PER_KB = 1024;
const KB_PER_MB = 1024;
const BYTES_TO_MB = BYTES_PER_KB * KB_PER_MB;

export const generateLink = mutation({
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

export const cleanupUpload = internalMutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, { storageId }) => {
        try {
            await ctx.storage.delete(storageId);
            const upload = await ctx.db
                .query("uploads")
                .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
                .take(1);
            if (upload) {
                await ctx.db.delete(upload[0]._id);
            }
        } catch (_error) {
            // Storage deletion failed - this is expected in some cases
            // Continue execution as this is a cleanup operation
        }
    },
});

export const trackUsage = internalAction({
    args: {
        size: v.number(),
        customerEmail: v.string(),
        userId: v.string(),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, { size, customerEmail, userId, storageId }) => {
        const modifiedCtx = {
            ...ctx,
            user: { subject: userId, email: customerEmail },
        };
        const { data: canUse } = await autumn.check(modifiedCtx, {
            featureId: "mb_storage",
            requiredBalance: size / BYTES_TO_MB, // size in MB
            customerData: {
                email: customerEmail,
            },
        });
        if (!canUse?.allowed) {
            try {
                await ctx.runMutation(internal.storage.cleanupUpload, {
                    storageId,
                });
            } catch (_error) {
                // Cleanup failed but we still need to reject the upload
                // This is acceptable as the main goal is to prevent storage usage
            }
            return;
        }
        await autumn.track(modifiedCtx, {
            featureId: "mb_storage",
            value: size / BYTES_TO_MB, // size in MB
            customerData: {
                email: customerEmail,
            },
        });
    },
});

export const store = mutation({
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

        const link = await ctx.storage.getUrl(storageId);
        const metadata = await ctx.db.system.get(storageId);

        if (!(link && metadata)) {
            throw new APIError("NOT_FOUND", {
                message: "Storage ID not found",
            });
        }

        await ctx.db.insert("uploads", {
            uploader: user._id,
            storageId,
            link,
            size: metadata.size || 0,
            contentType: metadata.contentType || "",
        });

        await ctx.scheduler.runAfter(0, internal.storage.trackUsage, {
            size: metadata.size,
            customerEmail: user.email,
            userId: user._id,
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
            .withIndex("by_uploader_and_id", (q) =>
                q.eq("uploader", user._id as Id<"user">)
            )
            .collect();
        return uploads;
    },
});

export const remove = mutation({
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
            .withIndex("by_uploader_and_id", (q) => {
                return q
                    .eq("uploader", user._id as Id<"user">)
                    .eq("storageId", storageId);
            })
            .take(1);

        if (!existing || existing.length === 0) {
            throw new APIError("NOT_FOUND", {
                message: "Upload not found",
            });
        }
        await ctx.storage.delete(storageId);
        await ctx.db.delete(existing[0]._id);
    },
});
