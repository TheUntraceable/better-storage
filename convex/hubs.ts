import { APIError } from "better-auth";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
    internalMutation,
    internalQuery,
    mutation,
    query,
} from "./_generated/server";
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

export const getMyHubs = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }
        return await ctx.db
            .query("hubs")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
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

export const update = mutation({
    args: {
        hubId: v.id("hubs"),
        name: v.string(),
        description: v.string(),
    },
    handler: async (ctx, { hubId, name, description }) => {
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
        await ctx.db.patch(hubId, {
            name,
            description,
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

export const getUploadData = internalQuery({
    args: {
        uploadId: v.id("uploads"),
    },
    handler: async (ctx, { uploadId }) => {
        const upload = await ctx.db.get(uploadId);
        if (!upload) {
            throw new APIError("NOT_FOUND", { message: "upload not found" });
        }
        return { storageId: upload.storageId, fileName: upload.name };
    },
});

export const storeAssistant = internalMutation({
    args: {
        hubId: v.id("hubs"),
        assistantId: v.string(),
    },
    handler: async (ctx, { assistantId, hubId }) => {
        await ctx.db.insert("assistants", {
            assistantId,
            hubId,
        });
    },
});

export const storeScorecardProject = internalMutation({
    args: {
        hubId: v.id("hubs"),
        projectId: v.string(),
    },
    handler: async (ctx, { projectId, hubId }) => {
        await ctx.db.insert("scorecardProjects", {
            projectId,
            hubId,
        });
    },
});
