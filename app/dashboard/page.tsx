import { requireSession } from "@/lib/session";
import { Autumn as autumn } from "autumn-js";

export default async function DashboardPage() {
    const user = await requireSession();
    const customer = await autumn.customers.get(user.id);

    return (
        <div className="flex flex-col gap-1">
            {JSON.stringify(customer)}
            <p>Welcome to your dashboard!</p>
        </div>
    );
}
