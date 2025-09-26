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
import { FileUploader } from "./_components/file-uploader";
import { ImageGallery } from "./_components/image-gallery";

export default function StorageTestPage() {
    const { data: session, isPending } = authClient.useSession();

    console.log("Session state:", { session, isPending });

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
                    Storage MVP Test
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    Test your Convex storage setup with file uploads, viewing,
                    and deletion. This MVP demonstrates all the core
                    functionality from your storage.ts file.
                </p>
                <div className="flex justify-center gap-2">
                    <Badge
                        className="flex items-center gap-1"
                        variant="secondary"
                    >
                        <CheckCircle className="h-3 w-3" />
                        Authentication: Active
                    </Badge>
                    <Badge
                        className="flex items-center gap-1"
                        variant="outline"
                    >
                        <Upload className="h-3 w-3" />
                        Upload Ready
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
                        File Upload
                    </CardTitle>
                    <CardDescription>
                        Upload files to test the generateUploadLink and
                        uploadImage mutations. Supports images and documents up
                        to 10MB.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploader />
                </CardContent>
            </Card>

            {/* Gallery Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Your Uploads
                    </CardTitle>
                    <CardDescription>
                        View and manage all your uploaded files. Tests the get
                        query and deleteUpload mutation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ImageGallery />
                </CardContent>
            </Card>

            {/* API Testing Info */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="font-medium text-sm">
                        Storage API Functions Being Tested
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <Badge variant="outline">generateUploadLink</Badge>
                            <p className="text-muted-foreground">
                                Creates secure upload URLs
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Badge variant="outline">uploadImage</Badge>
                            <p className="text-muted-foreground">
                                Saves file metadata to DB
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Badge variant="outline">get</Badge>
                            <p className="text-muted-foreground">
                                Retrieves user uploads
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Badge variant="outline">deleteUpload</Badge>
                            <p className="text-muted-foreground">
                                Removes files and metadata
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
