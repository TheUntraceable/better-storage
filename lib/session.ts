import { api } from "@/convex/_generated/api";
import type { Session } from "@/convex/auth";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export const requireSession = async (): Promise<Session> => {
    const session = await fetchQuery(api.auth.getSession);
    if (!session) {
        redirect("/auth");
    }
    return session;
};
