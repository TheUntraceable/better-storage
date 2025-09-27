"use client";

import { Button } from "@heroui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const SignOutButton = () => {
    return (
        <Button
            className="flex items-center gap-1"
            onPress={() => authClient.signOut()}
            size="sm"
            variant="bordered"
        >
            <LogOut className="h-3 w-3" />
            Sign Out
        </Button>
    );
};
