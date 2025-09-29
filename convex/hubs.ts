import { APIError } from "better-auth";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalQuery, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getHubFiles = internalQuery({
    args: {
        hubId: v.id("hubs"),
    },
    handler: async (ctx, { hubId }) => {
        return await ctx.db
            .query("hubFiles")
            .withIndex("by_hub_id", (q) => q.eq("hubId", hubId))
            .collect();
    },
});

export const listHubFiles = query({
    args: { hubId: v.id("hubs") },
    handler: async (ctx, { hubId }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        const hub = await ctx.db.get(hubId);
        if (!hub) {
            throw new APIError("NOT_FOUND", { message: "Hub not found" });
        }
        if (hub.ownerId !== user._id) {
            throw new APIError("FORBIDDEN", { message: "Not authorized" });
        }
        const files: {
            _id: Id<"hubFiles">;
            _creationTime: number;
            hubId: Id<"hubs">;
            uploadId: Id<"uploads">;
        }[] = await ctx.runQuery(internal.hubs.getHubFiles, { hubId });
        return files;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
    },
    handler: async (ctx, { name, description }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        return await ctx.db.insert("hubs", {
            name,
            description,
            ownerId: user._id,
        });
    },
});

export const deleteHub = mutation({
    args: {
        hubId: v.id("hubs"),
    },
    handler: async (ctx, { hubId }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        const hub = await ctx.db.get(hubId);
        if (!hub) {
            throw new APIError("NOT_FOUND", { message: "Hub not found" });
        }
        if (hub.ownerId !== user._id) {
            throw new APIError("FORBIDDEN", { message: "Not authorized" });
        }
        await ctx.db.delete(hubId);
        const hubFiles = await ctx.runQuery(internal.hubs.getHubFiles, {
            hubId,
        });
        for (const file of hubFiles) {
            await ctx.db.delete(file._id);
        }
    },
});

export const addFileToHub = mutation({
    args: {
        hubId: v.id("hubs"),
        uploadId: v.id("uploads"),
    },
    handler: async (ctx, { hubId, uploadId }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        const hub = await ctx.db.get(hubId);
        if (!hub) {
            throw new APIError("NOT_FOUND", { message: "Hub not found" });
        }
        if (hub.ownerId !== user._id) {
            throw new APIError("FORBIDDEN", { message: "Not authorized" });
        }
        await ctx.db.insert("hubFiles", {
            hubId,
            uploadId,
        });
    },
});

export const removeFileFromHub = mutation({
    args: {
        hubFileId: v.id("hubFiles"),
    },
    handler: async (ctx, { hubFileId }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        const hubFile = await ctx.db.get(hubFileId);
        if (!hubFile) {
            throw new APIError("NOT_FOUND", { message: "Hub file not found" });
        }
        const hub = await ctx.db.get(hubFile.hubId);
        if (!hub) {
            throw new APIError("NOT_FOUND", { message: "Hub not found" });
        }
        if (hub.ownerId !== user._id) {
            throw new APIError("FORBIDDEN", { message: "Not authorized" });
        }
        await ctx.db.delete(hubFileId);
    },
});
