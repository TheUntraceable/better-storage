"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Download,
    Eye,
    FileIcon,
    FileTextIcon,
    ImageIcon,
    Search,
    Share,
    Trash2,
    ArrowUpDown,
    Filter,
} from "lucide-react";

interface Upload {
    _id: Id<"uploads">;
    _creationTime: number;
    uploader: string;
    storageId: Id<"_storage">;
    link: string;
}

type SortField = "name" | "type" | "date" | "size";
type FileType = "all" | "image" | "pdf" | "document" | "other";

export function FilesTable() {
    const uploads = useQuery(api.storage.get);
    const deleteFile = useMutation(api.storage.remove);
    
    // State for filtering and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [fileTypeFilter, setFileTypeFilter] = useState<FileType>("all");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [deletingIds, setDeletingIds] = useState<Set<Id<"_storage">>>(new Set());

    // Helper functions
    const getFileType = (url: string): FileType => {
        if (url.includes("image") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) {
            return "image";
        }
        if (url.includes("pdf") || /\.pdf$/i.test(url)) {
            return "pdf";
        }
        if (/\.(doc|docx|txt|md)$/i.test(url)) {
            return "document";
        }
        return "other";
    };

    const getFileIcon = (url: string) => {
        const type = getFileType(url);
        switch (type) {
            case "image":
                return <ImageIcon className="h-4 w-4 text-blue-500" />;
            case "pdf":
                return <FileTextIcon className="h-4 w-4 text-red-500" />;
            case "document":
                return <FileTextIcon className="h-4 w-4 text-green-500" />;
            default:
                return <FileIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    const getFileName = (url: string, storageId: string) => {
        // Try to extract filename from URL, fallback to storage ID
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        return lastPart.includes('.') ? lastPart : `file-${storageId.slice(-8)}`;
    };

    const formatFileSize = (url: string) => {
        // This is a placeholder - in real app you'd store file size
        return "-- KB";
    };

    // Filtered and sorted data
    const filteredAndSortedUploads = useMemo(() => {
        if (!uploads) return [];

        let filtered = uploads.filter((upload) => {
            const fileName = getFileName(upload.link, upload.storageId);
            const matchesSearch = fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                upload.storageId.toLowerCase().includes(searchTerm.toLowerCase());
            
            const fileType = getFileType(upload.link);
            const matchesType = fileTypeFilter === "all" || fileType === fileTypeFilter;
            
            return matchesSearch && matchesType;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case "name":
                    comparison = getFileName(a.link, a.storageId)
                        .localeCompare(getFileName(b.link, b.storageId));
                    break;
                case "type":
                    comparison = getFileType(a.link).localeCompare(getFileType(b.link));
                    break;
                case "date":
                    comparison = a._creationTime - b._creationTime;
                    break;
                case "size":
                    // Placeholder comparison
                    comparison = 0;
                    break;
            }
            
            return sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
    }, [uploads, searchTerm, fileTypeFilter, sortField, sortOrder]);

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
            setDeletingIds(prev => new Set(prev).add(storageId));
            await deleteFile({ storageId });
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(storageId);
                return newSet;
            });
        }
    };

    if (uploads === undefined) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-muted rounded" />
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-muted rounded" />
                            ))}
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
                        Upload some files using the uploader above to see them here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            {/* Search and Filter Header */}
            <CardHeader className="space-y-4">
                <CardTitle className="flex items-center justify-between">
                    <span>Files ({filteredAndSortedUploads.length})</span>
                    <Badge variant="secondary">
                        {uploads.length} total
                    </Badge>
                </CardTitle>
                
                <div className="flex gap-4 flex-wrap">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    {/* File Type Filter */}
                    <Select value={fileTypeFilter} onValueChange={(value: FileType) => setFileTypeFilter(value)}>
                        <SelectTrigger className="w-[150px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="pdf">PDFs</SelectItem>
                            <SelectItem value="document">Documents</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            {/* Table */}
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Type</TableHead>
                                <TableHead>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleSort("name")}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Name
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[100px]">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleSort("type")}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Type
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[80px]">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleSort("size")}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Size
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleSort("date")}
                                        className="h-auto p-0 font-medium"
                                    >
                                        Date
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedUploads.map((upload) => {
                                const isDeleting = deletingIds.has(upload.storageId);
                                const fileName = getFileName(upload.link, upload.storageId);
                                const fileType = getFileType(upload.link);
                                
                                return (
                                    <TableRow 
                                        key={upload._id} 
                                        className={isDeleting ? "opacity-50" : ""}
                                    >
                                        <TableCell>
                                            {getFileIcon(upload.link)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[200px]" title={fileName}>
                                                    {fileName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {upload.storageId.slice(-8)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {fileType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatFileSize(upload.link)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(upload._creationTime).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    title="Preview file"
                                                >
                                                    <a 
                                                        href={upload.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    title="Download file"
                                                >
                                                    <a href={upload.link} download>
                                                        <Download className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Share file"
                                                >
                                                    <Share className="h-3 w-3" />
                                                </Button>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isDeleting}
                                                    onClick={() => handleDelete(upload.storageId)}
                                                    title="Delete file"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
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
    );
}