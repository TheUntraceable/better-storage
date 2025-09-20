"use client";

import { authClient } from "@/lib/auth-client";
import { convex } from "@convex-dev/better-auth/dist/commonjs/plugins";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import type * as React from "react";

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

export const Providers = ({ children, themeProps }: ProvidersProps) => {
    const router = useRouter();

    return (
        <ConvexBetterAuthProvider authClient={authClient} client={convex}>
            <HeroUIProvider navigate={router.push}>
                <ToastProvider />
                <NextThemesProvider {...themeProps}>
                    {children}
                </NextThemesProvider>
            </HeroUIProvider>
        </ConvexBetterAuthProvider>
    );
};
