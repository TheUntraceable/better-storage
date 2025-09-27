"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Home, LogOut, User } from "lucide-react";
import Link from "next/link";

export function NavigationHeader() {
    const { data: session } = authClient.useSession();

    return (
        <Card className="rounded-none border-b">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-6">
                    <Link
                        className="flex items-center gap-2 font-bold text-xl"
                        href="/"
                    >
                        <span className="text-primary">Better Files</span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link
                            className="flex items-center gap-1 text-sm hover:text-primary"
                            href="/"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                        {session && (
                            <Link
                                className="flex items-center gap-1 text-sm hover:text-primary"
                                href="/dashboard"
                            >
                                <User className="h-4 w-4" />
                                Dashboard
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm">
                                {session.user.name || session.user.email}
                            </span>
                            <Button
                                className="flex items-center gap-1"
                                onClick={() => authClient.signOut()}
                                size="sm"
                                variant="outline"
                            >
                                <LogOut className="h-3 w-3" />
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Link href="/auth">
                            <Button size="sm" variant="default">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
