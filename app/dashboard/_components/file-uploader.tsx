"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import {
    AlertCircle,
    CheckCircle,
    FileIcon,
    Loader2,
    Upload,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// Constants
const FILE_SIZE_CONSTANTS = {
    BYTES_PER_KB: 1024,
    KB_PER_MB: 1024,
    MAX_SIZE_MB: 100,
} as const;

const UPLOAD_CONFIG = {
    MAX_FILE_SIZE:
        FILE_SIZE_CONSTANTS.MAX_SIZE_MB *
        FILE_SIZE_CONSTANTS.KB_PER_MB *
        FILE_SIZE_CONSTANTS.BYTES_PER_KB,
    MAX_FILES: 1,
    SUCCESS_RESET_DELAY: 3000,
    ACCEPTED_FILE_TYPES: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        "application/pdf": [".pdf"],
        "text/*": [".txt", ".md"],
    },
} as const;

const UPLOAD_STEPS = {
    GENERATE_LINK: 25,
    UPLOAD_FILE: 50,
    SAVE_METADATA: 75,
    COMPLETE: 100,
} as const;

// Helper function to convert bytes to MB
const bytesToMB = (bytes: number): number =>
    bytes / (FILE_SIZE_CONSTANTS.BYTES_PER_KB * FILE_SIZE_CONSTANTS.KB_PER_MB);

// Types
type UploadState = {
    isUploading: boolean;
    progress: number;
    error: string | null;
    success: boolean;
};

export function FileUploader() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        success: false,
    });

    const generateUploadLink = useMutation(api.storage.generateLink);
    const storeFile = useMutation(api.storage.store);

    const updateProgress = useCallback((progress: number) => {
        setUploadState((prev) => ({ ...prev, progress }));
    }, []);

    const resetUploadState = useCallback(() => {
        setUploadState({
            isUploading: false,
            progress: 0,
            error: null,
            success: false,
        });
    }, []);

    const handleUpload = useCallback(
        async (file: File) => {
            if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: `File is too large. Maximum size is ${FILE_SIZE_CONSTANTS.MAX_SIZE_MB}MB`,
                    success: false,
                });
                return;
            }
            try {
                // Initialize upload state
                setUploadState({
                    isUploading: true,
                    progress: 0,
                    error: null,
                    success: false,
                });

                // Step 1: Generate upload link
                updateProgress(UPLOAD_STEPS.GENERATE_LINK);
                const uploadUrl = await generateUploadLink();

                // Step 2: Upload file to Convex storage
                updateProgress(UPLOAD_STEPS.UPLOAD_FILE);

                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (!result.ok) {
                    const errorText = await result
                        .text()
                        .catch(() => result.statusText);
                    throw new Error(
                        `Upload failed (${result.status}): ${errorText}`
                    );
                }

                const { storageId } = await result.json();

                // Step 3: Save metadata to database
                updateProgress(UPLOAD_STEPS.SAVE_METADATA);
                await storeFile({
                    storageId,
                    name: file.name,
                });

                // Step 4: Complete
                setUploadState({
                    isUploading: false,
                    progress: UPLOAD_STEPS.COMPLETE,
                    error: null,
                    success: true,
                });

                // Reset success state after delay
                setTimeout(resetUploadState, UPLOAD_CONFIG.SUCCESS_RESET_DELAY);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred during upload";

                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: errorMessage,
                    success: false,
                });
            }
        },
        [generateUploadLink, storeFile, updateProgress, resetUploadState]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                handleUpload(file);
            }
        },
        [handleUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: UPLOAD_CONFIG.MAX_FILES,
        maxSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
        accept: UPLOAD_CONFIG.ACCEPTED_FILE_TYPES,
        onDropRejected: (rejectedFiles) => {
            const rejection = rejectedFiles[0];
            if (rejection?.errors[0]) {
                const error = rejection.errors[0];
                let message = "File rejected";

                if (error.code === "file-too-large") {
                    message = `File is too large. Maximum size is ${bytesToMB(UPLOAD_CONFIG.MAX_FILE_SIZE)}MB`;
                } else if (error.code === "file-invalid-type") {
                    message =
                        "File type not supported. Please use images, PDFs, or text files";
                } else if (error.code === "too-many-files") {
                    message = "Please upload only one file at a time";
                }

                setUploadState((prev) => ({ ...prev, error: message }));
            }
        },
    });

    return (
        <div className="space-y-4">
            <Card
                {...getRootProps()}
                className={`cursor-pointer border-2 border-dashed transition-colors ${
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                } ${uploadState.isUploading ? "pointer-events-none opacity-50" : ""}`}
            >
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <input {...getInputProps()} />

                    <UploadContent
                        isDragActive={isDragActive}
                        onRetry={() =>
                            setUploadState((prev) => ({ ...prev, error: null }))
                        }
                        uploadState={uploadState}
                    />
                </CardContent>
            </Card>

            {/* Upload Info */}
            <div className="space-y-1 text-muted-foreground text-xs">
                <p>
                    <strong>Max size:</strong>{" "}
                    {bytesToMB(UPLOAD_CONFIG.MAX_FILE_SIZE)}MB
                </p>
            </div>
        </div>
    );
}

// Extracted component for upload content states
type UploadContentProps = {
    uploadState: UploadState;
    isDragActive: boolean;
    onRetry: () => void;
};

function UploadContent({
    uploadState,
    isDragActive,
    onRetry,
}: UploadContentProps) {
    if (uploadState.isUploading) {
        return (
            <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="space-y-2">
                    <p className="font-medium">Uploading...</p>
                    <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                            aria-valuemax={100}
                            aria-valuemin={0}
                            aria-valuenow={uploadState.progress}
                            className="h-2 rounded-full bg-primary transition-all duration-300"
                            role="progressbar"
                            style={{ width: `${uploadState.progress}%` }}
                        />
                    </div>
                    <p
                        aria-live="polite"
                        className="text-muted-foreground text-sm"
                    >
                        {uploadState.progress}%
                    </p>
                </div>
            </div>
        );
    }

    if (uploadState.success) {
        return (
            <div className="space-y-4">
                <CheckCircle
                    aria-hidden="true"
                    className="h-12 w-12 text-green-500"
                />
                <div>
                    <p className="font-medium text-green-500">
                        Upload Successful!
                    </p>
                    <p className="text-muted-foreground text-sm">
                        File has been saved to your storage
                    </p>
                </div>
            </div>
        );
    }

    if (uploadState.error) {
        return (
            <div className="space-y-4">
                <AlertCircle
                    aria-hidden="true"
                    className="h-12 w-12 text-destructive"
                />
                <div>
                    <p className="font-medium text-destructive">
                        Upload Failed
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {uploadState.error}
                    </p>
                </div>
                <Button onClick={onRetry} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                {isDragActive ? (
                    <Upload
                        aria-hidden="true"
                        className="h-12 w-12 text-primary"
                    />
                ) : (
                    <FileIcon
                        aria-hidden="true"
                        className="h-12 w-12 text-muted-foreground"
                    />
                )}
            </div>
            <div>
                <p className="font-medium">
                    {isDragActive
                        ? "Drop the file here"
                        : "Drop files here or click to browse"}
                </p>
                <p className="text-muted-foreground text-sm">
                    Supports images, PDFs, and text files up to{" "}
                    {bytesToMB(UPLOAD_CONFIG.MAX_FILE_SIZE)}MB
                </p>
            </div>
        </div>
    );
}
