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

interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
    success: boolean;
}

export function FileUploader() {
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        success: false,
    });

    const generateUploadLink = useMutation(api.storage.generateUploadLink);
    const uploadImage = useMutation(api.storage.uploadImage);

    const handleUpload = useCallback(
        async (file: File) => {
            try {
                setUploadState({
                    isUploading: true,
                    progress: 0,
                    error: null,
                    success: false,
                });

                // Step 1: Generate upload link
                setUploadState((prev) => ({ ...prev, progress: 25 }));
                const uploadUrl = await generateUploadLink();

                // Step 2: Upload file to Convex storage
                setUploadState((prev) => ({ ...prev, progress: 50 }));
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (!result.ok) {
                    throw new Error(`Upload failed: ${result.statusText}`);
                }

                const { storageId } = await result.json();

                // Step 3: Save metadata to database
                setUploadState((prev) => ({ ...prev, progress: 75 }));
                await uploadImage({ storageId });

                // Step 4: Complete
                setUploadState({
                    isUploading: false,
                    progress: 100,
                    error: null,
                    success: true,
                });

                // Reset success state after 3 seconds
                setTimeout(() => {
                    setUploadState((prev) => ({
                        ...prev,
                        success: false,
                        progress: 0,
                    }));
                }, 3000);
            } catch (error) {
                console.error("Upload error:", error);
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Upload failed",
                    success: false,
                });
            }
        },
        [generateUploadLink, uploadImage]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                handleUpload(acceptedFiles[0]);
            }
        },
        [handleUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
            "application/pdf": [".pdf"],
            "text/*": [".txt", ".md"],
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

                    {uploadState.isUploading ? (
                        <div className="space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <div className="space-y-2">
                                <p className="font-medium">Uploading...</p>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div
                                        className="h-2 rounded-full bg-primary transition-all duration-300"
                                        style={{
                                            width: `${uploadState.progress}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {uploadState.progress}%
                                </p>
                            </div>
                        </div>
                    ) : uploadState.success ? (
                        <div className="space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <div>
                                <p className="font-medium text-green-500">
                                    Upload Successful!
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    File has been saved to your storage
                                </p>
                            </div>
                        </div>
                    ) : uploadState.error ? (
                        <div className="space-y-4">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <div>
                                <p className="font-medium text-destructive">
                                    Upload Failed
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {uploadState.error}
                                </p>
                            </div>
                            <Button
                                onClick={() =>
                                    setUploadState((prev) => ({
                                        ...prev,
                                        error: null,
                                    }))
                                }
                                variant="outline"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center">
                                {isDragActive ? (
                                    <Upload className="h-12 w-12 text-primary" />
                                ) : (
                                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium">
                                    {isDragActive
                                        ? "Drop the file here"
                                        : "Drop files here or click to browse"}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Supports images, PDFs, and text files up to
                                    10MB
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload Info */}
            <div className="space-y-1 text-muted-foreground text-xs">
                <p>
                    <strong>Testing:</strong> generateUploadLink → fetch upload
                    → uploadImage
                </p>
                <p>
                    <strong>Max size:</strong> 10MB | <strong>Formats:</strong>{" "}
                    Images, PDF, Text
                </p>
            </div>
        </div>
    );
}
