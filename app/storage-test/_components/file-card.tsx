"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
    Download,
    Eye,
    FileIcon,
    FileTextIcon,
    ImageIcon,
    Share,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import { InviteManager } from "./invite-manager";

interface Upload {
    _id: Id<"uploads">;
    _creationTime: number;
    uploader: string;
    storageId: Id<"_storage">;
    link: string;
}

interface FileCardProps {
    upload: Upload;
}

const PDF_EXTENSIONS = /\.pdf$/i;

export function FileCard({ upload }: FileCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showInviteManager, setShowInviteManager] = useState(false);
    const deleteFile = useMutation(api.storage.remove);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteFile({ storageId: upload.storageId });
        } catch (error) {
            console.error("Delete failed:", error);
            setIsDeleting(false);
        }
    };

    const getFileIcon = (url: string) => {
        if (
            url.includes("image") ||
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
        ) {
            return <ImageIcon className="h-8 w-8" />;
        }
        if (url.includes("pdf") || PDF_EXTENSIONS.test(url)) {
            return <FileTextIcon className="h-8 w-8" />;
        }
        return <FileIcon className="h-8 w-8" />;
    };

    return (
        <Card className={isDeleting ? "opacity-50" : ""}>
            <CardContent className="p-1">
                {/* File Icon */}
                <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-muted">
                    <div className="flex flex-col items-center text-muted-foreground">
                        {getFileIcon(upload.link)}
                        <p className="mt-2 text-center text-xs">
                            Click Preview to view
                        </p>
                    </div>
                </div>

                {/* File Info */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                        {getFileIcon(upload.link)}
                        <Badge className="text-xs" variant="secondary">
                            {upload.storageId.slice(-8)}
                        </Badge>
                    </div>

                    <div className="text-muted-foreground text-xs">
                        <p>
                            Uploaded:{" "}
                            {new Date(upload._creationTime).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        asChild
                        className="flex-1"
                        size="sm"
                        variant="outline"
                    >
                        <a
                            href={upload.link}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                        </a>
                    </Button>

                    <Button
                        asChild
                        className="flex-1"
                        size="sm"
                        variant="outline"
                    >
                        <a download href={upload.link}>
                            <Download className="mr-1 h-3 w-3" />
                            Download
                        </a>
                    </Button>

                    <Button
                        onClick={() => setShowInviteManager(!showInviteManager)}
                        size="sm"
                        title="Share file"
                        variant="outline"
                    >
                        <Share className="h-3 w-3" />
                    </Button>

                    <Button
                        disabled={isDeleting}
                        onClick={handleDelete}
                        size="sm"
                        title="Delete file"
                        variant="destructive"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>

                {/* Invite Manager */}
                {showInviteManager && (
                    <div className="mt-4 border-t pt-4">
                        <InviteManager
                            fileLink={upload.link}
                            storageId={upload.storageId}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
