import {
    type HonoWithConvex,
    HttpRouterWithHono,
} from "convex-helpers/server/hono";
import type { FunctionReturnType } from "convex/server";
import { Hono } from "hono";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";
import { createAuth } from "./auth";

const app: HonoWithConvex<ActionCtx> = new Hono();

// authComponent.registerRoutes(app, createAuth);

// http.route({
//     pathPrefix: "/uploads/",
//     method: "GET",
//     handler: httpAction(async (ctx, request) => {
//         const auth = createAuth(ctx);
//         const session = await auth.api.getSession({
//             headers: request.headers,
//         });
//         if (!session) {
//             return new Response("Not authenticated", { status: 401 });
//         }
//         const url = new URL(request.url);
//         const storageId = url.pathname.replace("/uploads/", "");

//         if (!storageId) {
//             return new Response("Missing storageId", { status: 400 });
//         }

//         const blob = await ctx.storage.get(storageId);

//         if (!blob) {
//             return new Response("File not found", { status: 404 });
//         }
//         return new Response(blob);
//     }),
// });

// Add your routes to `app`. See below

const http = new HttpRouterWithHono(app);
app.get("/.well-known/openid-configuration", (c) => {
    return c.redirect("/api/auth/convex/.well-known/openid-configuration");
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
});

app.get("/invites/:inviteId", async (c) => {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });
    if (!session) {
        return new Response("Not authenticated", { status: 401 });
    }
    const { inviteId } = c.req.param();
    if (!inviteId) {
        return new Response("Missing inviteId", { status: 400 });
    }
    let invite: FunctionReturnType<typeof api.invites.get> | null = null;
    try {
        invite = await c.env.runQuery(api.invites.get, {
            inviteId: inviteId as Id<"invites">,
        });
    } catch {
        return new Response("Could not fetch invite", { status: 400 });
    }
    if (!invite) {
        return new Response("Invite not found", { status: 404 });
    }
    return c.json(invite);
});

export default http;
