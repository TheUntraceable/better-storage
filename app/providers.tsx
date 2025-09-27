"use client";

import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { AutumnProvider } from "autumn-js/react";
import { ConvexReactClient } from "convex/react";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import type * as React from "react";

export type ProvidersProps = {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
};

declare module "@react-types/shared" {
    // biome-ignore lint/nursery/useConsistentTypeDefinitions: Needed.
    interface RouterConfig {
        routerOptions: NonNullable<
            Parameters<ReturnType<typeof useRouter>["push"]>[1]
        >;
    }
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
    // Optionally pause queries until the user is authenticated
    expectAuth: true,
});

export const Providers = ({ children, themeProps }: ProvidersProps) => {
    const router = useRouter();

    return (
        <ConvexBetterAuthProvider authClient={authClient} client={convex}>
            <AutumnProvider
                // betterAuthUrl="https://dev.untraceable.dev"
                convex={convex}
                convexApi={api.autumn}
                includeCredentials
            >
                <HeroUIProvider navigate={router.push}>
                    <ToastProvider />
                    <NextThemesProvider {...themeProps}>
                        {children}
                    </NextThemesProvider>
                </HeroUIProvider>
            </AutumnProvider>
        </ConvexBetterAuthProvider>
    );
};
