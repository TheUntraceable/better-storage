"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import {
    ArrowUpDown,
    Download,
    Eye,
    FileIcon,
    FileTextIcon,
    Filter,
    ImageIcon,
    Search,
    Share,
    Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { InviteDialog } from "./invite-dialog";
import { showErrorToast } from "@/lib/toast";

// Constants
const FILE_SIZE_CONSTANTS = {
    BYTES_PER_KB: 1024,
    DECIMAL_PLACES: 2,
    SIZES: ["B", "KB", "MB", "GB", "TB"] as const,
} as const;

const FILE_TYPE_PATTERNS = {
    IMAGE: {
        extensions: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
        contentTypes: ["image"],
    },
    PDF: {
        extensions: /\.pdf$/i,
        contentTypes: ["pdf"],
    },
    DOCUMENT: {
        extensions: /\.(doc|docx|txt|md)$/i,
        contentTypes: ["text", "document"],
    },
} as const;

const UI_CONSTANTS = {
    STORAGE_ID_DISPLAY_LENGTH: 8,
    MIN_SEARCH_WIDTH: 200,
    FILTER_WIDTH: 150,
    LOADING_SKELETON_ROWS: 5,
    MAX_FILENAME_LENGTH: 200,
} as const;

// Types
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

type SortField = "name" | "type" | "date" | "size";
type FileType = "all" | "image" | "pdf" | "document" | "other";
type SortOrder = "asc" | "desc";

export function FilesTable({
    preloadedUploads,
}: {
    preloadedUploads: Preloaded<typeof api.storage.get>;
}) {
    const uploads = usePreloadedQuery(preloadedUploads);
    const deleteFile = useMutation(api.storage.remove);

    // State for filtering and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [fileTypeFilter, setFileTypeFilter] = useState<FileType>("all");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [deletingIds, setDeletingIds] = useState<Set<Id<"_storage">>>(
        new Set()
    );
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [selectedFileForInvite, setSelectedFileForInvite] =
        useState<Upload | null>(null);

    // Helper functions
    const getFileType = useCallback(
        (url: string, contentType?: string): FileType => {
            // Check content type first if available
            if (contentType?.includes("image")) {
                return "image";
            }
            if (contentType?.includes("pdf")) {
                return "pdf";
            }
            if (
                contentType?.includes("text") ||
                contentType?.includes("document")
            ) {
                return "document";
            }

            // Fallback to URL pattern matching
            if (
                FILE_TYPE_PATTERNS.IMAGE.extensions.test(url) ||
                url.includes("image")
            ) {
                return "image";
            }
            if (
                FILE_TYPE_PATTERNS.PDF.extensions.test(url) ||
                url.includes("pdf")
            ) {
                return "pdf";
            }
            if (FILE_TYPE_PATTERNS.DOCUMENT.extensions.test(url)) {
                return "document";
            }

            return "other";
        },
        []
    );

    const getFileIcon = useCallback(
        (url: string, contentType?: string) => {
            const type = getFileType(url, contentType);

            if (type === "image") {
                return <ImageIcon className="h-4 w-4 text-blue-500" />;
            }
            if (type === "pdf") {
                return <FileTextIcon className="h-4 w-4 text-red-500" />;
            }
            if (type === "document") {
                return <FileTextIcon className="h-4 w-4 text-green-500" />;
            }
            return <FileIcon className="h-4 w-4 text-gray-500" />;
        },
        [getFileType]
    );

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) {
            return `0 ${FILE_SIZE_CONSTANTS.SIZES[0]}`;
        }

        const k = FILE_SIZE_CONSTANTS.BYTES_PER_KB;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = bytes / k ** i;
        const formattedSize = Number.parseFloat(
            size.toFixed(FILE_SIZE_CONSTANTS.DECIMAL_PLACES)
        );

        return `${formattedSize} ${FILE_SIZE_CONSTANTS.SIZES[i] || FILE_SIZE_CONSTANTS.SIZES.at(-1)}`;
    };

    // Filtered and sorted data
    const filteredAndSortedUploads = useMemo(() => {
        if (!uploads) {
            return [];
        }

        // Filter uploads
        const filtered = uploads.filter((upload) => {
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch =
                searchTerm === "" ||
                upload.name.toLowerCase().includes(searchLower) ||
                upload.storageId.toLowerCase().includes(searchLower) ||
                upload.contentType?.toLowerCase().includes(searchLower);

            const fileType = getFileType(upload.link, upload.contentType);
            const matchesType =
                fileTypeFilter === "all" || fileType === fileTypeFilter;

            return matchesSearch && matchesType;
        });

        // Sort the filtered results
        return filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "name": {
                    comparison = a.name.localeCompare(b.name, undefined, {
                        numeric: true,
                        sensitivity: "base",
                    });
                    break;
                }
                case "type": {
                    const typeA = getFileType(a.link, a.contentType);
                    const typeB = getFileType(b.link, b.contentType);
                    comparison = typeA.localeCompare(typeB);
                    break;
                }
                case "date":
                    comparison = a._creationTime - b._creationTime;
                    break;
                case "size":
                    comparison = a.size - b.size;
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [
        uploads,
        searchTerm,
        fileTypeFilter,
        sortField,
        sortOrder,
        getFileType,
    ]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleDelete = async (storageId: Id<"_storage">) => {
        try {
            setDeletingIds((prev) => new Set(prev).add(storageId));
            await deleteFile({ storageId });
        } catch {
            showErrorToast("Failed to delete file. Please try again.");
        } finally {
            setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(storageId);
                return newSet;
            });
        }
    };

    const handleOpenInviteDialog = (upload: Upload) => {
        setSelectedFileForInvite(upload);
        setInviteDialogOpen(true);
    };

    const handleCloseInviteDialog = () => {
        setInviteDialogOpen(false);
        setSelectedFileForInvite(null);
    };

    if (uploads === undefined) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 rounded bg-muted" />
                        <div className="space-y-2">
                            {Array.from(
                                { length: UI_CONSTANTS.LOADING_SKELETON_ROWS },
                                (_, i) => {
                                    const key = `skeleton-row-${i}`;
                                    return (
                                        <div
                                            className="h-12 rounded bg-muted"
                                            key={key}
                                        />
                                    );
                                }
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (uploads.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <FileIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-medium">No files yet</h3>
                    <p className="text-muted-foreground text-sm">
                        Upload some files using the uploader above to see them
                        here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>Files ({filteredAndSortedUploads.length})</span>
                        <Badge variant="secondary">
                            {uploads.length} total
                        </Badge>
                    </CardTitle>

                    <div className="flex flex-wrap gap-4">
                        <div
                            className={`relative min-w-[${UI_CONSTANTS.MIN_SEARCH_WIDTH}px] flex-1`}
                        >
                            <Input
                                onValueChange={setSearchTerm}
                                placeholder="Search files..."
                                startContent={
                                    <Search className="h-4 w-4 transform text-muted-foreground" />
                                }
                                value={searchTerm}
                                variant="faded"
                            />
                        </div>

                        <Select
                            onValueChange={(value: FileType) =>
                                setFileTypeFilter(value)
                            }
                            value={fileTypeFilter}
                        >
                            <SelectTrigger
                                className={`w-[${UI_CONSTANTS.FILTER_WIDTH}px]`}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                                <SelectItem value="pdf">PDFs</SelectItem>
                                <SelectItem value="document">
                                    Documents
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        Type
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            className="h-auto p-0 font-medium"
                                            onPress={() => handleSort("name")}
                                            radius="sm"
                                            startContent={
                                                <ArrowUpDown className="h-3 w-3" />
                                            }
                                            variant="ghost"
                                        >
                                            Name
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[100px]">
                                        <Button
                                            className="h-auto p-0 font-medium"
                                            onPress={() => handleSort("type")}
                                            radius="sm"
                                            startContent={
                                                <ArrowUpDown className="h-3 w-3" />
                                            }
                                            variant="ghost"
                                        >
                                            Type
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        <Button
                                            className="h-auto p-0 font-medium"
                                            onPress={() => handleSort("size")}
                                            radius="sm"
                                            startContent={
                                                <ArrowUpDown className="h-3 w-3" />
                                            }
                                            variant="ghost"
                                        >
                                            Size
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        <Button
                                            className="h-auto p-0 font-medium"
                                            onPress={() => handleSort("date")}
                                            radius="sm"
                                            startContent={
                                                <ArrowUpDown className="ml-2 h-3 w-3" />
                                            }
                                            variant="ghost"
                                        >
                                            Date
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[150px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedUploads.map((upload) => {
                                    const isDeleting = deletingIds.has(
                                        upload.storageId
                                    );
                                    const fileName = upload.name;
                                    const fileType = getFileType(
                                        upload.link,
                                        upload.contentType
                                    );

                                    return (
                                        <TableRow
                                            className={
                                                isDeleting ? "opacity-50" : ""
                                            }
                                            key={upload._id}
                                        >
                                            <TableCell>
                                                {getFileIcon(
                                                    upload.link,
                                                    upload.contentType
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span
                                                        className={`max-w-[${UI_CONSTANTS.MAX_FILENAME_LENGTH}px] truncate`}
                                                        title={fileName}
                                                    >
                                                        {fileName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className="capitalize"
                                                    variant="outline"
                                                >
                                                    {fileType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatFileSize(upload.size)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(
                                                    upload._creationTime
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Link
                                                        className={buttonStyles(
                                                            {
                                                                size: "sm",
                                                                variant:
                                                                    "faded",
                                                                isIconOnly: true,
                                                            }
                                                        )}
                                                        href={upload.link}
                                                        isDisabled={isDeleting}
                                                        title="Preview file"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Link>

                                                    <Button
                                                        isIconOnly
                                                        onPress={async () => {
                                                            const blob =
                                                                await fetch(
                                                                    upload.link
                                                                ).then((res) =>
                                                                    res.blob()
                                                                );

                                                            const link =
                                                                document.createElement(
                                                                    "a"
                                                                );
                                                            link.href =
                                                                URL.createObjectURL(
                                                                    blob
                                                                );
                                                            link.download =
                                                                upload.name;

                                                            document.body.appendChild(
                                                                link
                                                            );

                                                            link.click();

                                                            document.body.removeChild(
                                                                link
                                                            );
                                                        }}
                                                        size="sm"
                                                        title="Download file"
                                                        variant="faded"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                    </Button>

                                                    <Button
                                                        isIconOnly
                                                        onPress={() =>
                                                            handleOpenInviteDialog(
                                                                upload
                                                            )
                                                        }
                                                        size="sm"
                                                        title="Share file"
                                                        variant="faded"
                                                    >
                                                        <Share className="h-3 w-3" />
                                                    </Button>

                                                    <Button
                                                        className="text-destructive hover:text-destructive"
                                                        color="danger"
                                                        isDisabled={isDeleting}
                                                        isIconOnly
                                                        onPress={() =>
                                                            handleDelete(
                                                                upload.storageId
                                                            )
                                                        }
                                                        size="sm"
                                                        title="Delete file"
                                                        variant="faded"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-danger" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {selectedFileForInvite && (
                <InviteDialog
                    fileName={selectedFileForInvite.name}
                    isOpen={inviteDialogOpen}
                    onClose={handleCloseInviteDialog}
                    upload={selectedFileForInvite}
                />
            )}
        </>
    );
}
