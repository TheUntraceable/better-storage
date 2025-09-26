import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs";
import { convex } from "@convex-dev/better-auth/plugins";
import { autumn } from "autumn-js/better-auth";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;

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
            // oidcProvider({
            //     loginPage: "/auth/login",
            // }),
            admin(),
            autumn({
                secretKey: process.env.AUTUMN_SECRET_KEY!,
                
            }),
        ],
        socialProviders: {
            github: {
                clientId: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
                redirectURI: "https://dev.untraceable.dev/api/auth/callback/github",
            },
        },
    });
};

export const getCurrentUser = query({
    handler: async (ctx) => {
        return await authComponent.getAuthUser(ctx);
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

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];

export const getToken = () => {
    return getTokenNextjs(createAuth);
};
