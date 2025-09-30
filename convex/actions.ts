"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { Autumn } from "autumn-js";
import { APIError } from "better-auth";
import { v } from "convex/values";
import Scorecard from "scorecard-ai";
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

export const createScorecardProject = internalAction({
    args: {
        hubId: v.id("hubs"),
    },
    handler: async (ctx, { hubId }) => {
        const client = new Scorecard({
            apiKey: process.env.SCORECARD_API_KEY!,
        });
        const project = await client.projects.create({
            description: `Project for Hub ${hubId}`,
            name: `Hub ${hubId}`,
        });
        const testset = await client.testsets.create(project.id, {
            name: "Hub File Comprehension (Multiple Files)",
            description:
                "Tests the AI's ability to answer questions using multiple files from a user's hub.",
            jsonSchema: {
                type: "object",
                properties: {
                    inputs: {
                        type: "object",
                        properties: {
                            user_question: { type: "string" },
                            file_contents: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        file_name: { type: "string" },
                                        content: { type: "string" },
                                    },
                                    required: ["file_name", "content"],
                                },
                            },
                        },
                        required: ["user_question", "file_contents"],
                    },
                    expected: {
                        type: "object",
                        properties: {
                            ideal_answer: { type: "string" },
                        },
                        required: ["ideal_answer"],
                    },
                },
                required: ["inputs", "expected"],
            },
            fieldMapping: {
                inputs: ["inputs"],
                expected: ["expected"],
                metadata: [],
            },
        });
        await ctx.runMutation(internal.hubs.storeScorecardProject, {
            hubId,
            projectId: project.id,
            testsetId: testset.id,
        });
    },
});
