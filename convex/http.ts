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

const UNAUTHORIZED_STATUS = 401;

app.get("/hubs/:hubId", async (c) => {
    console.log("Hard ID");
    const authorization = c.req.raw.headers.get("Authorization");

    if (!authorization) {
        return c.json({ message: "Not authorized" }, UNAUTHORIZED_STATUS);
    }

    const [_, token] = authorization.split(" ");

    if (token !== process.env.INKEEP_SECRET) {
        return c.json({ message: "Not authorized" }, UNAUTHORIZED_STATUS);
    }

    const files = await c.env.runQuery(internal.hubs.getHubFiles, {
        hubId: c.req.param("hubId") as Id<"hubs">,
    });

    const documents = await Promise.all(
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
                content: base64,
                similarity: 1.0, // Default similarity since no search query provided
                uuid: `${file.uploadId}-${fileName.replace(/[^a-zA-Z0-9]/g, "-")}`,
            };
        })
    );

    // Filter out null values
    const validDocuments = documents.filter((doc) => doc !== null);

    return c.json({
        documents: validDocuments,
    });
});

app.post("/hubs/vapi", async (c) => {
    const authorization = c.req.raw.headers.get("Authorization");

    if (!authorization) {
        return c.json({ message: "Not authorized" }, UNAUTHORIZED_STATUS);
    }

    const [_, token] = authorization.split(" ");

    if (token !== process.env.INKEEP_SECRET) {
        return c.json({ message: "Not authorized" }, UNAUTHORIZED_STATUS);
    }

    const body = await c.req.json();
    const { message } = body;
    const { toolCallList } = message;
    const hubId = toolCallList[0].function.arguments.hubId as Id<"hubs">;

    const files = await c.env.runQuery(internal.hubs.getHubFiles, { hubId });

    const documents = await Promise.all(
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
            const textContent = new TextDecoder().decode(arrayBuffer);
            return {
                content: textContent,
                uuid: fileName.replace(/[^a-zA-Z0-9]/g, "-"),
            };
        })
    );

    const validDocuments = documents.filter((doc) => doc !== null);

    return c.json({
        results: [
            {
                toolCallId: toolCallList[0].id,
                result: {
                    documents: validDocuments,
                },
            },
        ],
    });
});

export default http;
