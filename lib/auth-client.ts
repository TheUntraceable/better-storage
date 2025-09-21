import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { adminClient, oidcClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { overrideClient } from "./plugins/override/client";

export const authClient = createAuthClient({
    plugins: [convexClient(), adminClient(), oidcClient(), overrideClient()],
});
