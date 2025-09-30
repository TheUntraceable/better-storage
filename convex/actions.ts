"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { VapiClient } from "@vapi-ai/server-sdk";
import { Autumn } from "autumn-js";
import { APIError } from "better-auth";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";
import { authComponent } from "./auth";

export const scrape = action({
    args: {
        url: v.string(),
    },
    handler: async (ctx, { url }) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) {
            throw new APIError("UNAUTHORIZED", {
                message: "Not authenticated",
            });
        }

        if (!url.trim()) {
            throw new APIError("BAD_REQUEST", { message: "Missing url" });
        }

        const autumn = new Autumn({
            secretKey: process.env.AUTUMN_SECRET_KEY!,
        });

        const canUse = await autumn.check({
            customer_id: user._id,
            feature_id: "scrapes",
            required_balance: 1,
        });

        if (!canUse.data?.allowed) {
            throw new APIError("PAYMENT_REQUIRED", {
                message: "Insufficient scrapes available",
            });
        }

        const firecrawl = new Firecrawl({
            apiKey: process.env.FIRECRAWL_API_KEY!,
        });

        const document = await firecrawl.scrape(url, { formats: ["markdown"] });

        if (!document) {
            throw new APIError("NOT_FOUND", {
                message: "Failed to scrape URL",
            });
        }
        await autumn.track({
            customer_id: user._id,
            feature_id: "scrapes",
            value: (document.metadata?.creditsUsed as number) || 1,
        });
        return document;
    },
});

export const createAssistant = internalAction({
    args: {
        hubId: v.id("hubs"),
    },
    handler: async (ctx, { hubId }) => {
        const vapi = new VapiClient({
            token: process.env.VAPI_API_KEY!,
        });
        const mainAgent = await vapi.assistants.get(
            "c02184bb-9971-4ee2-b1c0-007814852d29"
        );
        const {
            id: _id,
            orgId: _orgId,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            // @ts-expect-error Property does not exist on type
            isServerUrlSecretSet: _isServerUrlSecretSet,
            ...assistantData
        } = mainAgent;

        const assistant = await vapi.assistants.create({
            ...assistantData,
        });

        await ctx.runMutation(internal.hubs.storeAssistant, {
            hubId,
            assistantId: assistant.id,
        });
    },
});

export const attachFileToAssistant = internalAction({
    args: {
        hubId: v.id("hubs"),
        uploadId: v.id("uploads"),
    },
    handler: async (ctx, { hubId, uploadId }) => {
        const hub = await ctx.runQuery(internal.hubs.getHub, { hubId });
        if (!hub) {
            throw new APIError("NOT_FOUND", { message: "Hub not found" });
        }
        const assistant = await ctx.runQuery(internal.hubs.getAssistantByHub, {
            hubId,
        });
        if (!assistant) {
            throw new APIError("NOT_FOUND", {
                message: "Assistant not found for hub",
            });
        }
        const upload = await ctx.runQuery(internal.storage.getUpload, {
            uploadId
        })
        if (!upload) {
            throw new APIError("NOT_FOUND", { message: "Upload not found" });
        }
        const vapi = new VapiClient({
            token: process.env.VAPI_API_KEY!,
        });
        const file = await ctx.storage.get(upload.storageId);
        if (!file) {
            throw new APIError("NOT_FOUND", { message: "File not found in storage" });
        }
        const arrayBuffer = await file.arrayBuffer();
        const textContent = new TextDecoder().decode(arrayBuffer);
        await vapi.files.create({
            file: {
                name: upload.name,
                content: textContent,
            }
        })
    },
});