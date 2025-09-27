import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { requireSession } from "@/lib/session";
import { Progress } from "@heroui/progress";
import { Autumn as autumn } from "autumn-js";
import { ImageIcon, Upload } from "lucide-react";
import { FileUploader } from "../storage-test/_components/file-uploader";
import { ImageGallery } from "../storage-test/_components/image-gallery";

export default async function DashboardPage() {
    const user = await requireSession();
    const { data: customer } = await autumn.customers.get(user.id);
    const plan = customer?.products[0];
    const mb_remaining = customer!.features.mb_storage.balance as number
    const mb_total = plan?.items[0].included_usage as number

    return (
        <div className="flex flex-col gap-3 p-3">
            <p>Welcome to your dashboard!</p>
            <Card>
                <CardHeader>
                    <CardTitle>Usage</CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress maxValue={mb_total!} value={mb_total - mb_remaining!} />
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
                    <FileUploader />
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
                    <ImageGallery />
                </CardContent>
            </Card>
        </div>
    );
}
