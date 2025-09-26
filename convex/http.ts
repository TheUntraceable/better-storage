import {
    type HonoWithConvex,
    HttpRouterWithHono,
} from "convex-helpers/server/hono";
import { Hono } from "hono";
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

app.get("/uploads/:uploadId", async (c) => {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });
    if (!session) {
        return new Response("Not authenticated", { status: 401 });
    }
    const { uploadId } = c.req.param();
    if (!uploadId) {
        return new Response("Missing storageId", { status: 400 });
    }
    
})

export default http;
