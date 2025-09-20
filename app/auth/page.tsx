import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { GithubLoginButton } from "./_components/github-login-button";

export default async function AuthPage() {
    const session = await fetchQuery(api.auth.getSession);
    if (session) {
        redirect("/dashboard");
    }
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <GithubLoginButton />
        </div>
    );
}
