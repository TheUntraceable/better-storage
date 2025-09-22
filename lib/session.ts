import { api } from "@/convex/_generated/api";
import { getToken, type Session } from "@/convex/auth";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export const requireSession = async (): Promise<Session["user"]> => {
    const token = await getToken();
    const user = await fetchQuery(
        api.auth.getCurrentUser,
        {},
        {
            token,
        }
    );
    if (!user) {
        redirect("/auth");
    }
    return user as Session["user"];
};
