import type { BetterAuthClientPlugin } from "better-auth";
import type { overrides } from ".";

export const overrideClient = () => {
    return {
        id: "overrides",
        $InferServerPlugin: {} as ReturnType<typeof overrides>,
    } satisfies BetterAuthClientPlugin;
};
