import { api } from "@/convex/_generated/api";
import { getToken, type Session } from "@/convex/auth";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export const requireSession = async (): Promise<
    Session["user"] & {
        token: string;
    }
> => {
    try {
        const token = await getToken();
        if (!token) {
            redirect("/auth");
        }
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
        return {
            id: user._id,
            createdAt: new Date(user._creationTime),
            updatedAt: new Date(user.updatedAt),
            email: user.email,
            emailVerified: user.emailVerified,
            name: user.name,
            image: user.image,
            userId: user.userId,
            banned: user.banned,
            role: user.role,
            banReason: user.banReason,
            banExpires: user.banExpires,
            token,
        } as Session["user"] & { token: string };
    } catch (error) {
        console.error("Error fetching user, redirecting to /auth", error);
        redirect("/auth");
    }
};
