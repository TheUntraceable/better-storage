import { APIError } from "better-auth";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const create = mutation({
    args: {
        storageId: v.id("_storage"),
        emails: v.array(v.string()),
        link: v.string(),
    },
    handler: async (ctx, { storageId, emails, link }) => {
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
        const storageItem = await ctx.db
            .query("uploads")
            .withIndex("by_uploader_and_id", (q) =>
                q.eq("uploader", user._id as string).eq("storageId", storageId)
            )
            .first();
        if (!storageItem) {
            throw new APIError("FORBIDDEN", {
                message: "You do not have access to this storage item",
            });
        }
        await ctx.db.insert("invites", {
            ownerId: user._id,
            emails: [...new Set(emails), user.email],
            link,
        });
    },
});

export const get = query({
    args: {
        inviteId: v.id("invites"),
    },
    handler: async (ctx, { inviteId }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated.",
            });
        }
        const invite = await ctx.db
            .query("invites")
            .withIndex("by_id", (q) => q.eq("_id", inviteId))
            .first();
        if (!invite) {
            throw new APIError("NOT_FOUND", {
                message: "Invite not found.",
            });
        }
        return invite;
    },
});
