import { APIError } from "better-auth";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const create = mutation({
    args: {
        storageId: v.id("_storage"),
        emails: v.array(v.string()),
        link: v.string(),
        fileName: v.string(),
    },
    handler: async (ctx, { storageId, emails, link, fileName }) => {
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
        const inviteId = await ctx.db.insert("invites", {
            ownerId: user._id,
            emails: [...new Set(emails)],
            link,
            fileName,
        });

        await ctx.runMutation(internal.emails.sendInviteEmail, {
            to: emails,
            from: user.email,
            inviteId,
            fileName,
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

        if (
            !invite.emails.includes(user.email) ||
            invite.ownerId !== user._id
        ) {
            throw new APIError("FORBIDDEN", {
                message: "You are not invited to this file.",
            });
        }
        return invite;
    },
});

export const getMyInvites = query({
    args: {},
    handler: async (ctx) => {
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

        return await ctx.db
            .query("invites")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
            .collect();
    },
});

export const remove = mutation({
    args: {
        inviteId: v.id("invites"),
    },
    handler: async (ctx, { inviteId }) => {
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

        const invite = await ctx.db
            .query("invites")
            .withIndex("by_id", (q) => q.eq("_id", inviteId))
            .first();

        if (!invite) {
            throw new APIError("NOT_FOUND", {
                message: "Invite not found",
            });
        }

        if (invite.ownerId !== user._id) {
            throw new APIError("FORBIDDEN", {
                message: "You can only delete your own invites",
            });
        }

        await ctx.db.delete(inviteId);
    },
});
