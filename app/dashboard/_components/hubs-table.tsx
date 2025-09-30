"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import VapiCallButton from "@/components/vapi-widget";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Edit,
    FileIcon,
    FolderOpen,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { CreateHubDialog, EditHubDialog } from "./hub-dialogs";
import { ManageHubFilesDialog } from "./manage-hub-files-dialog";

// Constants
const UI_CONSTANTS = {
    MIN_SEARCH_WIDTH: 200,
    LOADING_SKELETON_ROWS: 5,
} as const;

// Types
type Hub = {
    _id: Id<"hubs">;
    _creationTime: number;
    ownerId: string;
    name: string;
    description: string;
};

type SortField = "name" | "description" | "date";
type SortOrder = "asc" | "desc";

export function HubsTable({
    preloadedHubs,
    preloadedUploads,
}: {
    preloadedHubs: Preloaded<typeof api.hubs.getMyHubs>;
    preloadedUploads: Preloaded<typeof api.storage.get>;
}) {
    const hubs = usePreloadedQuery(preloadedHubs);
    const uploads = usePreloadedQuery(preloadedUploads);
    const deleteHub = useMutation(api.hubs.deleteHub);

    // State for filtering and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [deletingIds, setDeletingIds] = useState<Set<Id<"hubs">>>(new Set());
    const [createHubDialogOpen, setCreateHubDialogOpen] = useState(false);
    const [editingHub, setEditingHub] = useState<Hub | null>(null);
    const [managingFilesHub, setManagingFilesHub] = useState<Hub | null>(null);

    // Filtered and sorted data
    const filteredAndSortedHubs = useMemo(() => {
        if (!hubs) {
            return [];
        }

        // Filter hubs
        const filtered = hubs.filter((hub) => {
            const searchLower = searchTerm.toLowerCase();

            const matchesSearch =
                searchTerm === "" ||
                hub.name.toLowerCase().includes(searchLower) ||
                hub.description.toLowerCase().includes(searchLower) ||
                hub._id.toLowerCase().includes(searchLower);

            return matchesSearch;
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
                case "description": {
                    comparison = a.description.localeCompare(
                        b.description,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base",
                        }
                    );
                    break;
                }
                case "date":
                    comparison = a._creationTime - b._creationTime;
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [hubs, searchTerm, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleDelete = async (hubId: Id<"hubs">) => {
        try {
            setDeletingIds((prev) => new Set(prev).add(hubId));
            await deleteHub({ hubId });
            showSuccessToast(
                "Hub Deleted",
                "Hub has been deleted successfully"
            );
        } catch {
            showErrorToast("Failed to delete hub.", "Please try again.");
        } finally {
            setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(hubId);
                return newSet;
            });
        }
    };

    const getSortIcon = useCallback(
        (field: SortField) => {
            if (sortField !== field) {
                return <ArrowUpDown className="h-4 w-4" />;
            }
            return sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
            ) : (
                <ChevronDown className="h-4 w-4" />
            );
        },
        [sortField, sortOrder]
    );

    const formatDate = useCallback((timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, []);

    if (hubs === undefined) {
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

    if (hubs.length === 0) {
        return (
            <>
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <FolderOpen className="mb-4 h-12 w-12" />
                        <h3 className="mb-2 font-medium">No hubs yet</h3>
                        <p className="mb-4 text-sm">
                            Create your first hub to organize and group your
                            files.
                        </p>
                        <Button
                            color="primary"
                            onPress={() => setCreateHubDialogOpen(true)}
                            startContent={<Plus className="h-4 w-4" />}
                            variant="shadow"
                        >
                            Create Your First Hub
                        </Button>
                    </CardContent>
                </Card>
                <CreateHubDialog
                    isOpen={createHubDialogOpen}
                    onClose={() => setCreateHubDialogOpen(false)}
                />
            </>
        );
    }

    // Show filtered empty state when no hubs match the current search
    if (filteredAndSortedHubs.length === 0) {
        return (
            <Card>
                <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>Hubs (0)</span>
                        <Badge variant="secondary">{hubs.length} total</Badge>
                    </CardTitle>

                    <div className="flex flex-wrap gap-4">
                        <div
                            className={`relative min-w-[${UI_CONSTANTS.MIN_SEARCH_WIDTH}px] flex-1`}
                        >
                            <Input
                                onValueChange={setSearchTerm}
                                placeholder="Search hubs..."
                                startContent={
                                    <Search className="h-4 w-4 transform" />
                                }
                                value={searchTerm}
                                variant="faded"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Search className="mb-4 h-12 w-12" />
                        <h3 className="mb-2 font-medium">No matching hubs</h3>
                        <p className="max-w-md text-sm">
                            No hubs found matching "{searchTerm}". Try adjusting
                            your search terms.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Button
                                onPress={() => setSearchTerm("")}
                                variant="ghost"
                            >
                                Clear search
                            </Button>
                            <Button
                                color="primary"
                                onPress={() => setCreateHubDialogOpen(true)}
                                startContent={<Plus className="h-4 w-4" />}
                                variant="shadow"
                            >
                                Create Hub
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>Hubs ({filteredAndSortedHubs.length})</span>
                        <div className="flex items-center gap-2">
                            <Button
                                color="primary"
                                onPress={() => setCreateHubDialogOpen(true)}
                                size="sm"
                                startContent={<Plus className="h-4 w-4" />}
                                variant="shadow"
                            >
                                Create Hub
                            </Button>
                            <Badge variant="secondary">
                                {hubs.length} total
                            </Badge>
                        </div>
                    </CardTitle>

                    <div className="flex flex-wrap gap-4">
                        <div
                            className={`relative min-w-[${UI_CONSTANTS.MIN_SEARCH_WIDTH}px] flex-1`}
                        >
                            <Input
                                onValueChange={setSearchTerm}
                                placeholder="Search hubs..."
                                startContent={
                                    <Search className="h-4 w-4 transform" />
                                }
                                value={searchTerm}
                                variant="faded"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            className="font-semibold"
                                            onPress={() => handleSort("name")}
                                            radius="sm"
                                            size="sm"
                                            variant="ghost"
                                        >
                                            Name
                                            {getSortIcon("name")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            className="font-semibold"
                                            onPress={() =>
                                                handleSort("description")
                                            }
                                            radius="sm"
                                            size="sm"
                                            variant="ghost"
                                        >
                                            Description
                                            {getSortIcon("description")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            className="font-semibold"
                                            onPress={() => handleSort("date")}
                                            radius="sm"
                                            size="sm"
                                            variant="ghost"
                                        >
                                            Created
                                            {getSortIcon("date")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[140px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedHubs.map((hub) => (
                                    <TableRow key={hub._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FolderOpen className="h-4 w-4 text-primary" />
                                                <span className="truncate">
                                                    {hub.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="truncate">
                                                {hub.description ||
                                                    "No description"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="">
                                            {formatDate(hub._creationTime)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Tooltip content="Talk with">
                                                    <VapiCallButton
                                                        apiKey="796acfab-e24f-47cb-802f-aaac07888052"
                                                        hubId={hub._id}
                                                        hubName={hub.name}
                                                    />
                                                </Tooltip>
                                                <Tooltip content="Edit hub">
                                                    <Button
                                                        className="h-8 w-8 p-0"
                                                        isIconOnly
                                                        onPress={() =>
                                                            setEditingHub(hub)
                                                        }
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Edit hub
                                                        </span>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Manage files">
                                                    <Button
                                                        className="h-8 w-8 p-0"
                                                        isIconOnly
                                                        onPress={() =>
                                                            setManagingFilesHub(
                                                                hub
                                                            )
                                                        }
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        <FileIcon className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Manage files
                                                        </span>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Delete hub">
                                                    <Button
                                                        className="h-8 w-8 p-0 text-danger hover:text-danger"
                                                        isDisabled={deletingIds.has(
                                                            hub._id
                                                        )}
                                                        isIconOnly
                                                        onPress={() =>
                                                            handleDelete(
                                                                hub._id
                                                            )
                                                        }
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Delete hub
                                                        </span>
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Hub Dialog */}
            <CreateHubDialog
                isOpen={createHubDialogOpen}
                onClose={() => setCreateHubDialogOpen(false)}
            />

            {/* Edit Hub Dialog */}
            <EditHubDialog
                hub={editingHub}
                isOpen={!!editingHub}
                onClose={() => setEditingHub(null)}
            />

            {/* Manage Hub Files Dialog */}
            <ManageHubFilesDialog
                hub={managingFilesHub}
                isOpen={!!managingFilesHub}
                onClose={() => setManagingFilesHub(null)}
                uploads={uploads || []}
            />
        </>
    );
}
