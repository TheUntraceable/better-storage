import type { BetterAuthPlugin, Where } from "better-auth";
import { sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";
import { Client } from "better-auth/plugins";

export const overrides = () => {
    const listClients = createAuthEndpoint(
        "/oauth2/clients",
        {
            method: "GET",
            use: [sessionMiddleware],
            query: z.object({
                limit: z.number().min(1).max(100).optional(),
                offset: z.number().min(0).optional(),
                sort: z.enum(["asc", "desc"]).optional(),
            }),
        },
        async (ctx) => {
            const { user } = ctx.context.session;
            const query = {
                model: "oauthApplication",
                limit: ctx.query.limit ?? 10,
                offset: ctx.query.offset ?? 0,
                sortBy: {
                    direction: ctx.query.sort ?? "asc",
                    field: "createdAt",
                },
            };
            if (user.role === "admin") {
                const clients = await ctx.context.adapter.findMany<Client[]>(query);
                return clients;
            }
            const clients = await ctx.context.adapter.findMany<Client[]>({
                ...query,
                where: [
                    {
                        field: "userId",
                        operator: "eq",
                        value: user.id,
                    },
                ],
            });
            return clients;
        }
    );

    const deleteClient = createAuthEndpoint(
        "/oauth2/clients/:clientId",
        {
            method: "DELETE",
            use: [sessionMiddleware],
            params: z.object({
                clientId: z.string(),
            }),
        },
        async (ctx) => {
            const { user } = ctx.context.session;
            const query: Where[] = [
                {
                    field: "clientId",
                    operator: "eq",
                    value: ctx.params.clientId,
                },
            ];
            if (user.role !== "admin") {
                query[0].connector = "AND";
                query.push({
                    field: "userId",
                    operator: "eq",
                    value: user.id,
                });
            }

            const client = await ctx.context.adapter.findOne<Client>({
                model: "oauthApplication",
                where: query,
            });

            if (!client) {
                return ctx.error("NOT_FOUND", { message: "Client not found" });
            }

            await ctx.context.adapter.delete({
                model: "oauthApplication",
                where: query,
            });

            return ctx.json(
                {
                    message: "Client deleted successfully",
                },
                {
                    status: 200,
                }
            );
        }
    );

    const updateClient = createAuthEndpoint(
        "/oauth2/clients/:clientId/update",
        {
            method: "POST",
            use: [sessionMiddleware],
            body: z.object({
                client_name: z.optional(z.string()),
                metadata: z.optional(z.record(z.any(), z.any())),
            }),
        },
        async (ctx) => {
            const { clientId } = ctx.params;
            const { user } = ctx.context.session;
            const query: Where[] = [
                {
                    field: "clientId",
                    operator: "eq",
                    value: clientId,
                },
            ];
            if (user.role !== "admin") {
                query[0].connector = "AND";
                query.push({
                    field: "userId",
                    operator: "eq",
                    value: user.id,
                });
            }
            const client = await ctx.context.adapter.findOne<Client>({
                model: "oauthApplication",
                where: query,
            });
            if (!client) {
                return ctx.error("NOT_FOUND", { message: "Client not found" });
            }
            const { client_name, metadata } = ctx.body;
            const updatedClient = await ctx.context.adapter.update<Client>({
                model: "oauthApplication",
                where: query,
                update: {
                    ...(client_name ? { name: client_name } : {}),
                    ...(metadata ? { metadata } : {}),
                },
            });
            return ctx.json(updatedClient, { status: 200 });
        }
    );

    return {
        id: "overrides",
        endpoints: {
            listClients,
            deleteClient,
            updateClient
        },
    } satisfies BetterAuthPlugin;
};
