import { requireSession } from "@/lib/session";
import { Autumn as autumn } from "autumn-js";
import { UpgradeSubscription } from "./_components/upgrade-subscription";

export default async function ProfilePage() {
    const session = await requireSession({
        redirectTo: "/dashboard/profile",
    });
    const { data: customer } = await autumn.customers.get(session.id);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <h1 className="font-bold text-3xl">Profile</h1>
            <UpgradeSubscription />
        </div>
    );
}
