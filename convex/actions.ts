"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { Autumn } from "autumn-js";
import { APIError } from "better-auth";
import { v } from "convex/values";
import { action } from "./_generated/server";
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
