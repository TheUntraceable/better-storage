import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { adminClient, oidcClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    plugins: [convexClient(), adminClient()],
});
