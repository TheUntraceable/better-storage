"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { CheckCircle, ImageIcon, Upload } from "lucide-react";
import { FileUploader } from "../dashboard/_components/file-uploader";
import { ImageGallery } from "../dashboard/_components/image-gallery";

export default function StorageTestPage() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">
                            Loading...
                        </CardTitle>
                        <CardDescription className="text-center">
                            Checking authentication status...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">
                            Authentication Required
                        </CardTitle>
                        <CardDescription className="text-center">
                            Please sign in to test the storage functionality.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-8 px-4 py-8">
            {/* Header */}
            <div className="space-y-4 text-center">
                <h1 className="font-bold text-4xl tracking-tight">
                    File Manager Dashboard
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    Upload, organize, and share your files. Invite others to
                    collaborate and manage your digital assets securely.
                </p>
                <div className="flex justify-center gap-2">
                    <Badge
                        className="flex items-center gap-1"
                        variant="secondary"
                    >
                        <CheckCircle className="h-3 w-3" />
                        Connected
                    </Badge>
                    <Badge
                        className="flex items-center gap-1"
                        variant="outline"
                    >
                        <Upload className="h-3 w-3" />
                        Ready to Upload
                    </Badge>
                </div>
            </div>

            {/* User Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            {session.user.name?.charAt(0) || "U"}
                        </div>
                        Welcome, {session.user.name || "User"}
                    </CardTitle>
                    <CardDescription>
                        User ID: {session.user.id} | Email: {session.user.email}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Upload Section */}
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

            {/* Files Section */}
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
