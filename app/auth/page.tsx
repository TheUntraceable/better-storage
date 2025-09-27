import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { GithubLoginButton } from "./_components/github-login-button";

export default async function AuthPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>;
}) {
    const { redirectTo } = await searchParams;

    const user = await getSession();
    if (user !== null) {
        redirect(redirectTo || "/dashboard");
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-800 dark:to-zinc-900">
            <div className="w-full max-w-md">
                <Card className="shadow-lg backdrop-blur-sm">
                    <CardHeader className="space-y-4 pb-8 text-center">
                        <CardTitle className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <GithubLoginButton redirectTo={redirectTo} />
                            <p className="max-w-xs text-center text-xs text-zinc-500 dark:text-zinc-400">
                                Don&apos;t have an account? One will be created
                                automatically when you sign in.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
