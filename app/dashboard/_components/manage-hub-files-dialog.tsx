"use client";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { useMutation, useQuery } from "convex/react";
import {
    FileIcon,
    FileTextIcon,
    FolderOpen,
    ImageIcon,
    Plus,
    X,
} from "lucide-react";

// Constants
const BYTES_PER_KB = 1024;

import { useEffect, useState } from "react";

type Upload = {
    _id: Id<"uploads">;
    _creationTime: number;
    uploader: string;
    storageId: Id<"_storage">;
    link: string;
    size: number;
    contentType: string;
    name: string;
};

type Hub = {
    _id: Id<"hubs">;
    _creationTime: number;
    ownerId: string;
    name: string;
    description: string;
};

type ManageHubFilesDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    hub: Hub | null;
    uploads: Upload[];
};

export function ManageHubFilesDialog({
    isOpen,
    onClose,
    hub,
    uploads = [],
}: ManageHubFilesDialogProps) {
    const [selectedUploadId, setSelectedUploadId] = useState<string>("");
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hubFiles = useQuery(
        api.hubs.listHubFiles,
        hub ? { hubId: hub._id } : "skip"
    );
    const addFileToHub = useMutation(api.hubs.addFileToHub);
    const removeFileFromHub = useMutation(api.hubs.removeFileFromHub);

    // Reset state when dialog opens/closes or hub changes
    useEffect(() => {
        if (isOpen && hub) {
            setSelectedUploadId("");
            setError(null);
        }
    }, [isOpen, hub]);

    // Helper function to get file icon
    const getFileIcon = (upload: Upload) => {
        const contentType = upload.contentType?.toLowerCase() || "";

        if (contentType.startsWith("image/")) {
            return <ImageIcon className="h-4 w-4 text-blue-500" />;
        }
        if (
            contentType === "application/pdf" ||
            upload.name.toLowerCase().endsWith(".pdf")
        ) {
            return <FileTextIcon className="h-4 w-4 text-red-500" />;
        }
        return <FileIcon className="h-4 w-4 text-gray-500" />;
    };

    // Get uploads that are not already in this hub
    const availableUploads = uploads.filter((upload) => {
        if (!hubFiles) {
            return true;
        }
        return !hubFiles.some((hubFile) => hubFile.uploadId === upload._id);
    });

    // Get uploads that are currently in this hub
    const attachedUploads = uploads.filter((upload) => {
        if (!hubFiles) {
            return false;
        }
        return hubFiles.some((hubFile) => hubFile.uploadId === upload._id);
    });

    const handleAddFile = async () => {
        if (!selectedUploadId) {
            setError("Please select a file to add");
            return;
        }
        if (!hub) {
            setError("No hub selected");
            return;
        }

        try {
            setIsAdding(true);
            setError(null);

            await addFileToHub({
                hubId: hub._id,
                uploadId: selectedUploadId as Id<"uploads">,
            });

            showSuccessToast(
                "File Added",
                "File has been added to the hub successfully"
            );
            setSelectedUploadId("");
        } catch (addError) {
            showErrorToast("Failed to add file", "Please try again.");
            setError(
                addError instanceof Error
                    ? addError.message
                    : "Failed to add file to hub"
            );
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveFile = async (hubFileId: Id<"hubFiles">) => {
        try {
            await removeFileFromHub({ hubFileId });
            showSuccessToast(
                "File Removed",
                "File has been removed from the hub"
            );
        } catch {
            showErrorToast("Failed to remove file", "Please try again.");
        }
    };

    const handleClose = () => {
        setSelectedUploadId("");
        setError(null);
        setIsAdding(false);
        onClose();
    };

    const formatFileSize = (bytes: number): string => {
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;

        while (size >= BYTES_PER_KB && unitIndex < units.length - 1) {
            size /= BYTES_PER_KB;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    if (!hub) {
        return null;
    }

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-2xl">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Manage Hub Files
                    </DialogTitle>
                    <DialogDescription>
                        Add or remove files from "{hub.name}". Files in hubs can
                        be organized and shared as collections.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                    {/* Error Display */}
                    {error && (
                        <Alert
                            color="danger"
                            description={error}
                            title="Error"
                            variant="flat"
                        />
                    )}

                    {/* Add File Section */}
                    {availableUploads.length > 0 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">
                                    Add Files to Hub
                                </CardTitle>
                                <CardDescription>
                                    Select files to add to this hub from your
                                    uploaded files.
                                </CardDescription>
                            </CardHeader>
                            <div className="px-6 pb-6">
                                <div className="flex gap-2">
                                    <Select
                                        disabled={isAdding}
                                        onValueChange={setSelectedUploadId}
                                        value={selectedUploadId}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Choose a file to add..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUploads.map((upload) => (
                                                <SelectItem
                                                    key={upload._id}
                                                    value={upload._id}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {getFileIcon(upload)}
                                                        <span className="truncate">
                                                            {upload.name}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            (
                                                            {formatFileSize(
                                                                upload.size
                                                            )}
                                                            )
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        color="primary"
                                        disabled={!selectedUploadId || isAdding}
                                        isLoading={isAdding}
                                        onPress={handleAddFile}
                                        startContent={
                                            <Plus className="h-4 w-4" />
                                        }
                                        variant="shadow"
                                    >
                                        Add File
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Current Files Section */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">
                                Files in Hub ({attachedUploads.length})
                            </CardTitle>
                            <CardDescription>
                                Files currently attached to this hub. Click the
                                X to remove a file from the hub.
                            </CardDescription>
                        </CardHeader>
                        <div className="px-6 pb-6">
                            {attachedUploads.length > 0 ? (
                                <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                                    {attachedUploads.map((upload) => {
                                        const hubFile = hubFiles?.find(
                                            (hf) => hf.uploadId === upload._id
                                        );
                                        return (
                                            <div
                                                className="flex items-center gap-3 rounded-lg border p-3"
                                                key={upload._id}
                                            >
                                                {getFileIcon(upload)}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-sm">
                                                        {upload.name}
                                                    </p>
                                                    <p className="text-muted-foreground text-xs">
                                                        {formatFileSize(
                                                            upload.size
                                                        )}{" "}
                                                        • {upload.contentType}
                                                    </p>
                                                </div>
                                                <Button
                                                    color="danger"
                                                    isIconOnly
                                                    onPress={() =>
                                                        hubFile &&
                                                        handleRemoveFile(
                                                            hubFile._id
                                                        )
                                                    }
                                                    size="sm"
                                                    variant="light"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <FolderOpen className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                    <p className="text-sm">
                                        No files in this hub yet
                                    </p>
                                    <p className="text-xs">
                                        Add files using the section above
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* No Available Files Message */}
                    {availableUploads.length === 0 && uploads.length > 0 && (
                        <Alert
                            color="warning"
                            description="All your uploaded files are already attached to this hub."
                            title="No files available to add"
                            variant="flat"
                        />
                    )}

                    {/* No Uploads Message */}
                    {uploads.length === 0 && (
                        <Alert
                            color="primary"
                            description="Upload some files first to be able to add them to hubs."
                            title="No files uploaded yet"
                            variant="flat"
                        />
                    )}
                </div>

                <DialogFooter className="flex-shrink-0">
                    <Button onPress={handleClose} variant="bordered">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
