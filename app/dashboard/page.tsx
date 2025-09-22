import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
    const user = await requireSession();
    return <div>Dashboard for {user.email}</div>;
}
