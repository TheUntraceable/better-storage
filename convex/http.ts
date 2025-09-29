import {
    type HonoWithConvex,
    HttpRouterWithHono,
} from "convex-helpers/server/hono";
import { Hono } from "hono";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";
import { createAuth } from "./auth";

const app: HonoWithConvex<ActionCtx> = new Hono();

const http = new HttpRouterWithHono(app);
app.get("/.well-known/openid-configuration", (c) => {
    return c.redirect("/api/auth/convex/.well-known/openid-configuration");
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
});

app.get("/hubs/:hubId", async (c) => {
    const authorization = c.req.raw.headers.get("Authorization");

    if (!authorization) {
        return c.json({ message: "Not authorized" }, 401);
    }

    const [_, token] = authorization.split(" ");

    if (token !== process.env.INKEEP_SECRET) {
        return c.json({ message: "Not authorized" }, 401);
    }

    const files = await c.env.runQuery(internal.hubs.getHubFiles, {
        hubId: c.req.param("hubId") as Id<"hubs">,
    });

    const fileContents = await Promise.all(
        files.map(async (file) => {
            const { storageId, fileName } = await c.env.runQuery(
                internal.hubs.getUploadData,
                {
                    uploadId: file.uploadId,
                }
            );
            if (!storageId) {
                return null;
            }
            const storageObject = await c.env.storage.get(storageId);
            if (!storageObject) {
                return null;
            }
            const arrayBuffer = await storageObject.arrayBuffer();
            const base64 = btoa(
                String.fromCharCode(...new Uint8Array(arrayBuffer))
            );
            return {
                fileName,
                content: base64,
            };
        })
    );

    return c.json(fileContents);
});

export default http;
