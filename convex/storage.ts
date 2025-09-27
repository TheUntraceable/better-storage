import { APIError } from "better-auth";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { autumn } from "./autumn";
import type { Id } from "./betterAuth/_generated/dataModel";

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

export const trackUsage = internalAction({
    args: {
        size: v.number(),
        customerEmail: v.string(),
        userId: v.string()
    },
    handler: async (ctx, { size, customerEmail, userId }) => {
        await autumn.track(
            { ...ctx, user: { subject: userId, email: customerEmail } }, {
            featureId: "mb_storage",
            value: size / (1024 * 1024), // size in MB
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
            userId: user._id
        })
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

        if (!existing) {
            throw new APIError("NOT_FOUND", {
                message: "Upload not found",
            });
        }

        await ctx.db.delete(existing[0]._id);
    },
});
