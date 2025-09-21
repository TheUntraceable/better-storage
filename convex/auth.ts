import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { admin, oidcProvider } from "better-auth/plugins";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;
// if (!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)) {
//     throw new Error(
//         "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set in environment variables"
//     );
// }

export const authComponent = createClient<DataModel, typeof authSchema>(
    components.betterAuth,
    {
        local: {
            schema: authSchema,
        },
    }
);

export const createAuth = (
    ctx: GenericCtx<DataModel>,
    { optionsOnly } = { optionsOnly: false }
) => {
    return betterAuth({
        logger: {
            disabled: optionsOnly,
        },
        trustedOrigins: [
            "http://localhost:3000",
            siteUrl,
            "https://dev.untraceable.dev",
        ],
        baseURL: siteUrl,
        database: authComponent.adapter(ctx),
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
        plugins: [
            convex(),
            oidcProvider({
                loginPage: "/auth/login",
            }),
            admin(),
        ],
        socialProviders: {
            github: {
                clientId: "Ov23lioPWH4a9k19wn0h",
                clientSecret: "62f2f5ce39765bedcd18579d3b5286821c87bb39",
            },
        },
    });
};

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        return await authComponent.getAuthUser(ctx);
    },
});

export const getSession = query({
    args: {},
    handler: async (ctx) => {
        const headers = await authComponent.getHeaders(ctx);
        return await createAuth(ctx, { optionsOnly: true }).api.getSession({
            headers,
        });
    },
});

export const createAdmin = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
        secret: v.string(),
    },
    async handler(ctx, { email, password, name, secret }) {
        if (secret !== process.env.ADMIN_CREATION_SECRET) {
            throw new Error("Invalid secret for admin creation");
        }
        const auth = createAuth(ctx);
        const existingUser = await (
            await auth.$context
        ).internalAdapter.findUserByEmail(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        return await auth.api.createUser({
            body: {
                email,
                password,
                name,
                role: "admin",
            },
        });
    },
});
