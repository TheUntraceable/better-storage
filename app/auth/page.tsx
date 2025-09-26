import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/convex/auth";
import { GithubLoginButton } from "./_components/github-login-button";

export default async function AuthPage() {
    const token = await getToken();

    try {
        const user = await fetchQuery(api.auth.getCurrentUser, {}, { token });
        if (user) {
            redirect("/dashboard");
        }
    } catch {
        // User is not authenticated, continue to show login button
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <GithubLoginButton />
        </div>
    );
}
