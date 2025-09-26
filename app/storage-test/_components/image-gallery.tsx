"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
    Download,
    Eye,
    FileIcon,
    FileTextIcon,
    ImageIcon,
    Trash2,
} from "lucide-react";
import { useState } from "react";

interface DeleteState {
    deleting: Id<"_storage"> | null;
    error: string | null;
}

const IMAGE_FILE_EXTENSION_REGEX = /\.(jpg|jpeg|png|gif|webp)$/i;
const PDF_FILE_EXTENSION_REGEX = /\.pdf$/i;

export function ImageGallery() {
    const uploads = useQuery(api.storage.get);
    const deleteUpload = useMutation(api.storage.deleteUpload);
    const [deleteState, setDeleteState] = useState<DeleteState>({
        deleting: null,
        error: null,
    });

    const handleDelete = async (storageId: Id<"_storage">) => {
        try {
            setDeleteState({ deleting: storageId, error: null });
            await deleteUpload({ storageId });
            setDeleteState({ deleting: null, error: null });
        } catch (error) {
            setDeleteState({
                deleting: null,
                error: error instanceof Error ? error.message : "Delete failed",
            });
        }
    };

    const getFileIcon = (url: string) => {
        if (url.includes("image") || IMAGE_FILE_EXTENSION_REGEX.test(url)) {
            return <ImageIcon className="h-4 w-4" />;
        }
        if (url.includes("pdf") || PDF_FILE_EXTENSION_REGEX.test(url)) {
            return <FileTextIcon className="h-4 w-4" />;
        }
        return <FileIcon className="h-4 w-4" />;
    };

    const isImage = (url: string) => {
        return url.includes("image") || IMAGE_FILE_EXTENSION_REGEX.test(url);
    };

    if (uploads === undefined) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card className="animate-pulse" key={i}>
                            <CardContent className="p-4">
                                <div className="mb-3 aspect-square rounded-lg bg-muted" />
                                <div className="space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-muted" />
                                    <div className="h-3 w-1/2 rounded bg-muted" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (uploads.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <FileIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-medium">No uploads yet</h3>
                    <p className="text-muted-foreground text-sm">
                        Upload some files using the uploader above to see them
                        here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {deleteState.error && (
                <Card className="border-destructive">
                    <CardContent className="p-4">
                        <p className="text-destructive text-sm">
                            {deleteState.error}
                        </p>
                        <Button
                            className="mt-2"
                            onClick={() =>
                                setDeleteState((prev) => ({
                                    ...prev,
                                    error: null,
                                }))
                            }
                            size="sm"
                            variant="outline"
                        >
                            Dismiss
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {uploads.map((upload) => {
                    const isDeleting =
                        deleteState.deleting === upload.storageId;

                    return (
                        <Card
                            className={isDeleting ? "opacity-50" : ""}
                            key={upload._id}
                        >
                            <CardContent className="p-4">
                                {/* File Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className="text-xs"
                                            variant="secondary"
                                        >
                                            {upload.storageId.slice(-8)}
                                        </Badge>
                                    </div>

                                    <div className="text-muted-foreground text-xs">
                                        <p>
                                            Uploaded:{" "}
                                            {new Date(
                                                upload._creationTime
                                            ).toLocaleString()}
                                        </p>
                                        <p>ID: {upload._id}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        asChild
                                        className="flex-1"
                                        size="sm"
                                        variant="outline"
                                    >
                                        <a
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <Eye className="mr-1 h-3 w-3" />
                                            View
                                        </a>
                                    </Button>

                                    <Button
                                        asChild
                                        className="flex-1"
                                        size="sm"
                                        variant="outline"
                                    >
                                        Download
                                    </Button>

                                    <Button
                                        disabled={isDeleting}
                                        onClick={() =>
                                            handleDelete(upload.storageId)
                                        }
                                        size="sm"
                                        variant="destructive"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="text-muted-foreground text-xs">
                <p>
                    <strong>Testing:</strong> get query for retrieval,
                    deleteUpload mutation for removal
                </p>
                <p>
                    <strong>Total uploads:</strong> {uploads.length}
                </p>
            </div>
        </div>
    );
}
