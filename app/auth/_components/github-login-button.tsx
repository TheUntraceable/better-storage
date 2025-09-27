"use client";

import { GithubIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useLoadingCallback } from "@/lib/hooks/use-loading-callback";

export function GithubLoginButton({ redirectTo }: { redirectTo?: string }) {
    const [handleSignIn, isLoading] = useLoadingCallback(async () => {
        try {
            await authClient.signIn.social({
                provider: "github",
                callbackURL: redirectTo || "/dashboard",
            });
        } catch {
            // Silent error handling - user will see if sign-in fails
        }
    });

    return (
        <Button
            className="w-full bg-zinc-900 font-medium text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            disabled={isLoading}
            onClick={handleSignIn}
            size="lg"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <GithubIcon className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Signing in..." : "Continue with GitHub"}
        </Button>
    );
}
