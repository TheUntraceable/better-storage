"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Input } from "@heroui/input";
import { Progress } from "@heroui/progress";
import { useMutation } from "convex/react";
import {
    AlertCircle,
    CheckCircle,
    FileIcon,
    Loader2,
    Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const BYTES_PER_KB = 1024; // 1 KB = 1024 bytes

const FILE_LIMITS = {
    MAX_SIZE_MB: 100,
    MAX_SIZE_BYTES: 100 * BYTES_PER_KB * BYTES_PER_KB, // 100MB in bytes
    MAX_FILES: 1,
    MAX_FILENAME_LENGTH: 255,
    TEXT_PREVIEW_LENGTH: 200,
} as const;

const TIMING = {
    SUCCESS_RESET_DELAY: 3000,
    DIALOG_CLOSE_DELAY: 1500,
} as const;

const UPLOAD_PROGRESS = {
    GENERATE_LINK: 25,
    UPLOAD_FILE: 50,
    SAVE_METADATA: 75,
    COMPLETE: 100,
} as const;

const ACCEPTED_FILE_TYPES = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "text/*": [".txt", ".md"],
} as const;

const DANGEROUS_EXTENSIONS = [
    ".exe",
    ".bat",
    ".cmd",
    ".scr",
    ".vbs",
    ".js",
    ".jar",
] as const;
type UploadState = {
    isUploading: boolean;
    progress: number;
    error: string | null;
    success: boolean;
};

type FilePreview = {
    type: "image" | "text" | "other";
    url?: string;
    content?: string;
} | null;

type UploadContentProps = {
    uploadState: UploadState;
    isDragActive: boolean;
    onRetry: () => void;
};

type FilePreviewProps = {
    file: File;
    preview: FilePreview;
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

const FILE_EXTENSION_REGEX = /\.[^/.]+$/;
const removeFileExtension = (filename: string): string =>
    filename.replace(FILE_EXTENSION_REGEX, "");

const FILE_NAME_REGEX = /^[a-zA-Z0-9._\-\s()[\]{}]+$/;
const validateFileName = (name: string): string | null => {
    const trimmed = name.trim();

    if (!trimmed) {
        return "File name cannot be empty";
    }
    if (trimmed.length > FILE_LIMITS.MAX_FILENAME_LENGTH) {
        return `File name too long (max ${FILE_LIMITS.MAX_FILENAME_LENGTH} characters)`;
    }
    if (!FILE_NAME_REGEX.test(trimmed)) {
        return "File name contains invalid characters";
    }

    return null;
};

const validateFile = (file: File): string | null => {
    // Check dangerous extensions
    const extension = `.${file.name.toLowerCase().split(".").pop()}`;
    if (DANGEROUS_EXTENSIONS.includes(extension as any)) {
        return "This file type is not allowed for security reasons";
    }

    // Check file size
    if (file.size > FILE_LIMITS.MAX_SIZE_BYTES) {
        return `File too large (max ${FILE_LIMITS.MAX_SIZE_MB}MB)`;
    }
    if (file.size === 0) {
        return "File appears to be empty";
    }

    // Check file type
    const acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES);
    const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", ""));
        }
        return file.type === type;
    });

    if (!isValidType) {
        return "File type not supported";
    }

    // Check timestamp
    if (file.lastModified > Date.now()) {
        return "File has invalid timestamp";
    }

    return null;
};

function UploadContent({
    uploadState,
    isDragActive,
    onRetry,
}: UploadContentProps) {
    if (uploadState.success) {
        return (
            <div className="space-y-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                    <p className="font-medium text-green-500 text-sm">
                        Upload Successful!
                    </p>
                    <p className="text-muted-foreground text-xs">
                        File saved to storage
                    </p>
                </div>
            </div>
        );
    }

    if (uploadState.error) {
        return (
            <div className="flex flex-col items-center space-y-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                    <p className="font-medium text-destructive text-sm">
                        Error selecting file
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {uploadState.error}
                    </p>
                </div>
                <Button onPress={onRetry} size="sm" variant="bordered">
                    Try Again
                </Button>
            </div>
        );
    }

    const Icon = isDragActive ? Upload : FileIcon;
    const iconClass = isDragActive ? "text-primary" : "text-muted-foreground";

    return (
        <div className="flex flex-col items-center space-y-2">
            <Icon className={`h-8 w-8 ${iconClass}`} />
            <div>
                <p className="font-medium text-sm">
                    {isDragActive
                        ? "Drop file here"
                        : "Drop file or click to browse"}
                </p>
                <p className="text-muted-foreground text-xs">
                    Up to {FILE_LIMITS.MAX_SIZE_MB}MB
                </p>
            </div>
        </div>
    );
}

function FilePreviewComponent({ file, preview }: FilePreviewProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-4">
                {/* Preview Thumbnail */}
                <div className="flex-shrink-0">
                    {preview?.type === "image" && preview.url ? (
                        <div className="h-16 w-16 overflow-hidden rounded-lg border">
                            <Image
                                alt="Preview"
                                className="h-full w-full object-cover"
                                height={64}
                                src={preview.url}
                                width={64}
                            />
                        </div>
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted">
                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                    <p
                        className="truncate font-medium text-sm"
                        title={file.name}
                    >
                        {file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function FileUploader({ remainingMb }: { remainingMb: number }) {
    // State
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        success: false,
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [fileName, setFileName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<FilePreview>(null);
    const [fileNameError, setFileNameError] = useState<string | null>(null);

    // Mutations
    const generateUploadLink = useMutation(api.storage.generateLink);
    const storeFile = useMutation(api.storage.store);

    // Reset functions
    const resetUploadState = useCallback(() => {
        setUploadState({
            isUploading: false,
            progress: 0,
            error: null,
            success: false,
        });
    }, []);

    const resetDialog = useCallback(() => {
        setDialogOpen(false);
        setFileName("");
        setSelectedFile(null);
        setFilePreview(null);
        setFileNameError(null);
        resetUploadState();
    }, [resetUploadState]);

    // File handling
    const generateFilePreview = useCallback(
        (file: File): Promise<FilePreview> => {
            // Only generate previews for images (media files)
            if (file.type.startsWith("image/")) {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) =>
                        resolve({
                            type: "image",
                            url: e.target?.result as string,
                        });
                    reader.onerror = () => resolve({ type: "other" });
                    reader.readAsDataURL(file);
                });
            }

            // For all other file types (text, PDF, etc.), just return 'other'
            return Promise.resolve({ type: "other" });
        },
        []
    );

    const handleUpload = useCallback(
        async (file: File, customFileName: string) => {
            // Validate
            const fileError = validateFile(file);
            const nameError = validateFileName(customFileName);

            if (fileError || nameError) {
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: fileError || nameError,
                    success: false,
                });
                return;
            }
            if (file.size > remainingMb * BYTES_PER_KB * BYTES_PER_KB) {
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: `Insufficient storage space. You have ${remainingMb}MB remaining.`,
                    success: false,
                });
                return;
            }

            try {
                setUploadState({
                    isUploading: true,
                    progress: UPLOAD_PROGRESS.GENERATE_LINK,
                    error: null,
                    success: false,
                });

                // Generate upload URL
                const uploadUrl = await generateUploadLink();

                // Upload file
                setUploadState((prev) => ({
                    ...prev,
                    progress: UPLOAD_PROGRESS.UPLOAD_FILE,
                }));
                const response = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (!response.ok) {
                    const errorText = await response
                        .text()
                        .catch(() => response.statusText);
                    throw new Error(
                        `Upload failed (${response.status}): ${errorText}`
                    );
                }

                const { storageId } = await response.json();

                setUploadState((prev) => ({
                    ...prev,
                    progress: UPLOAD_PROGRESS.SAVE_METADATA,
                }));

                await storeFile({
                    storageId,
                    name: customFileName.trim(),
                });

                setUploadState({
                    isUploading: false,
                    progress: UPLOAD_PROGRESS.COMPLETE,
                    error: null,
                    success: true,
                });

                showSuccessToast("Upload Successful", "File uploaded!");

                resetDialog();
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Upload failed";
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: message,
                    success: false,
                });
                showErrorToast("Upload Failed", message);
            }
        },
        [generateUploadLink, storeFile, resetDialog, remainingMb]
    );

    // Dropzone handlers
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) {
                return;
            }

            const file = acceptedFiles[0];
            setSelectedFile(file);

            if (!fileName) {
                setFileName(removeFileExtension(file.name));
            }

            try {
                const preview = await generateFilePreview(file);
                setFilePreview(preview);
            } catch {
                setFilePreview({ type: "other" });
            }
        },
        [fileName, generateFilePreview]
    );

    const onDropRejected = useCallback((rejectedFiles: any[]) => {
        const rejection = rejectedFiles[0];
        if (!rejection?.errors[0]) {
            return;
        }

        const error = rejection.errors[0];
        const errorMessages: Record<string, string> = {
            "file-too-large": `File too large (max ${FILE_LIMITS.MAX_SIZE_MB}MB)`,
            "file-invalid-type": "File type not supported",
            "too-many-files": "Please upload only one file at a time",
        };

        const message = errorMessages[error.code] || "File rejected";
        showErrorToast("Upload Error", message);
        setUploadState((prev) => ({ ...prev, error: message }));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        maxFiles: FILE_LIMITS.MAX_FILES,
        maxSize: FILE_LIMITS.MAX_SIZE_BYTES,
        accept: ACCEPTED_FILE_TYPES,
    });

    // Event handlers
    const handleFileNameChange = useCallback((value: string) => {
        setFileName(value);
        setFileNameError(validateFileName(value));
    }, []);

    const handleDialogUpload = useCallback(() => {
        if (selectedFile && fileName.trim() && !fileNameError) {
            handleUpload(selectedFile, fileName);
        }
    }, [selectedFile, fileName, fileNameError, handleUpload]);

    // Effects
    useEffect(() => {
        if (uploadState.success && dialogOpen) {
            const timer = setTimeout(resetDialog, TIMING.DIALOG_CLOSE_DELAY);
            return () => clearTimeout(timer);
        }
    }, [uploadState.success, dialogOpen, resetDialog]);

    return (
        <div className="space-y-4">
            <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
                <DialogTrigger asChild>
                    <Button color="primary" fullWidth variant="shadow">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* File name input */}
                        <div className="space-y-2">
                            <Input
                                className={
                                    fileNameError ? "border-destructive" : ""
                                }
                                id="fileName"
                                isDisabled={uploadState.isUploading}
                                label="File Name"
                                onValueChange={handleFileNameChange}
                                placeholder="Enter file name..."
                                value={fileName}
                                variant="faded"
                            />
                            {fileNameError && (
                                <p className="text-destructive text-sm">
                                    {fileNameError}
                                </p>
                            )}
                        </div>

                        {/* Drop zone */}
                        <Card
                            {...getRootProps()}
                            className={`cursor-pointer border-2 border-dashed transition-colors ${
                                isDragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-primary/50"
                            }
                                ${uploadState.isUploading ? "pointer-events-none opacity-50" : ""}
                            `}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <input {...getInputProps()} />
                                {selectedFile && filePreview ? (
                                    <FilePreviewComponent
                                        file={selectedFile}
                                        preview={filePreview}
                                    />
                                ) : (
                                    <UploadContent
                                        isDragActive={isDragActive}
                                        onRetry={() =>
                                            setUploadState((prev) => ({
                                                ...prev,
                                                error: null,
                                            }))
                                        }
                                        uploadState={uploadState}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Error message */}
                        {uploadState.error && (
                            <div className="text-destructive text-sm">
                                {uploadState.error}
                            </div>
                        )}

                        {uploadState.isUploading && (
                            <Progress
                                formatOptions={{
                                    style: "percent",
                                }}
                                label={`${uploadState.progress}%`}
                                maxValue={100}
                                minValue={0}
                                value={uploadState.progress}
                            />
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                color="primary"
                                isDisabled={
                                    !(selectedFile && fileName.trim()) ||
                                    uploadState.isUploading ||
                                    !!fileNameError
                                }
                                isLoading={uploadState.isUploading}
                                onPress={handleDialogUpload}
                                startContent={
                                    uploadState.isUploading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )
                                }
                                variant="shadow"
                            >
                                {uploadState.isUploading
                                    ? "Uploading..."
                                    : "Upload"}
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={uploadState.isUploading}
                                onPress={resetDialog}
                                variant="bordered"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Upload info */}
            <div className="space-y-1 text-muted-foreground text-xs">
                <p>
                    <strong>Max size:</strong> {FILE_LIMITS.MAX_SIZE_MB}MB
                </p>
                <p>
                    <strong>Supported:</strong> Images, PDFs, and text files
                </p>
            </div>
        </div>
    );
}
