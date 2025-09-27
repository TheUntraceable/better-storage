import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { requireSession } from "@/lib/session";
import { Progress } from "@heroui/progress";
import { Autumn as autumn } from "autumn-js";
import { preloadQuery } from "convex/nextjs";
import { ImageIcon, Mail, Upload } from "lucide-react";
import { FileUploader } from "./_components/file-uploader";
import { FilesTable } from "./_components/files-table";
import { InvitesTable } from "./_components/invites-table";

export default async function DashboardPage() {
    const user = await requireSession();

    const { data: customer } = await autumn.customers.get(user.id);

    const plan = customer?.products[0];
    const mbRemaining = customer!.features.mb_storage.balance as number;
    const totalMb = plan?.items[0].included_usage as number;

    const uploads = await preloadQuery(
        api.storage.get,
        {},
        {
            token: user.token,
        }
    );

    const invites = await preloadQuery(
        api.invites.getMyInvites,
        {},
        {
            token: user.token,
        }
    );

    return (
        <div className="flex flex-col gap-3 p-3">
            <p>Welcome to your dashboard!</p>
            <Card>
                <CardHeader>
                    <CardTitle>Usage</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row gap-2">
                    <Progress
                        formatOptions={{
                            style: "unit",
                            unit: "megabyte",
                            unitDisplay: "short",
                        }}
                        maxValue={totalMb!}
                        showValueLabel
                        value={totalMb - mbRemaining!}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Files
                    </CardTitle>
                    <CardDescription>
                        Upload and store your files securely. Share with others
                        using invite links. Supports images, documents, and more
                        up to 10MB.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploader remainingMb={mbRemaining} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Your Files
                    </CardTitle>
                    <CardDescription>
                        View, organize, and share your uploaded files. Create
                        invite links for collaboration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FilesTable preloadedUploads={uploads} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Your Invites
                    </CardTitle>
                    <CardDescription>
                        Manage the file sharing invites you've created. View who
                        has access and revoke access when needed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvitesTable preloadedInvites={invites} />
                </CardContent>
            </Card>
        </div>
    );
}
