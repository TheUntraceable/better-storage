"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { AutumnProvider } from "autumn-js/react";
import { ConvexReactClient } from "convex/react";
import { useRouter } from "next/navigation";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

export type ProvidersProps = {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;
};

declare module "@react-types/shared" {
    type RouterConfig = {
        routerOptions: NonNullable<
            Parameters<ReturnType<typeof useRouter>["push"]>[1]
        >;
    };
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
    // Optionally pause queries until the user is authenticated
    expectAuth: true,
});

export const Providers = ({ children, themeProps }: ProvidersProps) => {
    const router = useRouter();

    return (
        <AutumnProvider
            betterAuthUrl="https://dev.untraceable.dev"
            convex={convex}
            convexApi={api}
            includeCredentials
        >
            <ConvexBetterAuthProvider authClient={authClient} client={convex}>
                <HeroUIProvider navigate={router.push}>
                    <ToastProvider />
                    <NextThemesProvider {...themeProps}>
                        {children}
                    </NextThemesProvider>
                </HeroUIProvider>
            </ConvexBetterAuthProvider>
        </AutumnProvider>
    );
};
