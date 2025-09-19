"use client";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { useRouter } from "next/navigation";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
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
