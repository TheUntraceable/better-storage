"use client";

import { authClient } from "@/lib/auth-client";
import { useLoadingCallback } from "@/lib/hooks/use-loading-callback";
import { Button } from "@heroui/button";
import { GithubIcon } from "lucide-react";

export function GithubLoginButton() {
    const [handleSignIn, isLoading] = useLoadingCallback(async () => {
        try {
            await authClient.signIn.social({
                provider: "github",
                callbackURL: "/dashboard",
            });
        } catch (error) {
            console.error("GitHub sign-in failed:", error);
        }
    });
    return (
        <Button
            color="default"
            isLoading={isLoading}
            onPress={handleSignIn}
            radius="sm"
            startContent={<GithubIcon />}
            variant="shadow"
        >
            Login with Github
        </Button>
    );
}
