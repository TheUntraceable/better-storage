import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
    const session = await requireSession()
    return <div>Dashboard for {session.user.email}</div>
}