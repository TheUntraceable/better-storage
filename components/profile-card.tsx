import type { Session } from "@/convex/auth";

export const ProfileCard = ({ session }: { session: Session["user"] }) => {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-accent/30 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground text-sm shadow-md">
                {(session.name || session.email || "??")
                    .split(" ")
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-foreground text-sm">
                    {session.name || session.email}
                </span>
            </div>
        </div>
    );
};
