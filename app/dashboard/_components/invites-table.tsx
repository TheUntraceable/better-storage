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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import {
    ArrowUpDown,
    Copy,
    ExternalLink,
    Mail,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// Constants
const UI_CONSTANTS = {
    MIN_SEARCH_WIDTH: 200,
    LOADING_SKELETON_ROWS: 5,
    MAX_EMAIL_LIST_LENGTH: 100,
} as const;

// Types
type SortField = "date" | "emails" | "link";
type SortOrder = "asc" | "desc";

export function InvitesTable({
    preloadedInvites,
}: {
    preloadedInvites: Preloaded<typeof api.invites.getMyInvites>;
}) {
    const invites = usePreloadedQuery(preloadedInvites);
    const deleteInvite = useMutation(api.invites.remove);

    // State for filtering and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [deletingIds, setDeletingIds] = useState<Set<Id<"invites">>>(
        new Set()
    );

    // Helper functions
    const getInviteLink = useCallback((inviteId: Id<"invites">) => {
        if (typeof window !== "undefined") {
            return `${window.location.origin}/invite/${inviteId}`;
        }
        return `/invite/${inviteId}`;
    }, []);

    const getFileNameFromLink = useCallback((link: string): string => {
        try {
            const url = new URL(link);
            const pathParts = url.pathname.split("/");
            return pathParts.at(-1) || "Unknown file";
        } catch {
            return "Unknown file";
        }
    }, []);

    // Filtered and sorted data
    const filteredAndSortedInvites = useMemo(() => {
        if (!invites) {
            return [];
        }

        // Filter invites
        const filtered = invites.filter((invite) => {
            const searchLower = searchTerm.toLowerCase();
            const fileName = getFileNameFromLink(invite.link);

            const matchesSearch =
                searchTerm === "" ||
                invite.emails.some((email) =>
                    email.toLowerCase().includes(searchLower)
                ) ||
                fileName.toLowerCase().includes(searchLower) ||
                invite._id.toLowerCase().includes(searchLower);

            return matchesSearch;
        });

        // Sort the filtered results
        return filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "emails": {
                    const emailCountA = a.emails.length;
                    const emailCountB = b.emails.length;
                    comparison = emailCountA - emailCountB;
                    break;
                }
                case "link": {
                    const fileA = getFileNameFromLink(a.link);
                    const fileB = getFileNameFromLink(b.link);
                    comparison = fileA.localeCompare(fileB, undefined, {
                        numeric: true,
                        sensitivity: "base",
                    });
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
    }, [invites, searchTerm, sortField, sortOrder, getFileNameFromLink]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleDelete = async (inviteId: Id<"invites">) => {
        try {
            setDeletingIds((prev) => new Set(prev).add(inviteId));
            await deleteInvite({ inviteId });
        } catch {
            showErrorToast("Failed to delete invite.", "Please try again.");
        } finally {
            setDeletingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(inviteId);
                return newSet;
            });
        }
    };

    if (invites === undefined) {
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

    if (invites.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-medium">No invites yet</h3>
                    <p className="text-muted-foreground text-sm">
                        Share some files to create invites and see them here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Show filtered empty state when no invites match the current search
    if (filteredAndSortedInvites.length === 0) {
        return (
            <Card>
                <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>Invites (0)</span>
                        <Badge variant="secondary">
                            {invites.length} total
                        </Badge>
                    </CardTitle>

                    <div className="flex flex-wrap gap-4">
                        <div
                            className={`relative min-w-[${UI_CONSTANTS.MIN_SEARCH_WIDTH}px] flex-1`}
                        >
                            <Input
                                onValueChange={setSearchTerm}
                                placeholder="Search invites..."
                                startContent={
                                    <Search className="h-4 w-4 transform text-muted-foreground" />
                                }
                                value={searchTerm}
                                variant="faded"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 font-medium">
                            No matching invites
                        </h3>
                        <p className="max-w-md text-muted-foreground text-sm">
                            No invites found matching "{searchTerm}". Try
                            adjusting your search terms.
                        </p>
                        <Button
                            className="mt-4"
                            onPress={() => setSearchTerm("")}
                            variant="ghost"
                        >
                            Clear search
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="space-y-4">
                <CardTitle className="flex items-center justify-between">
                    <span>Invites ({filteredAndSortedInvites.length})</span>
                    <Badge variant="secondary">{invites.length} total</Badge>
                </CardTitle>

                <div className="flex flex-wrap gap-4">
                    <div
                        className={`relative min-w-[${UI_CONSTANTS.MIN_SEARCH_WIDTH}px] flex-1`}
                    >
                        <Input
                            onValueChange={setSearchTerm}
                            placeholder="Search invites..."
                            startContent={
                                <Search className="h-4 w-4 transform text-muted-foreground" />
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
                                <TableHead className="w-[50px]">File</TableHead>
                                <TableHead>
                                    <Button
                                        className="font-medium"
                                        onPress={() => handleSort("link")}
                                        radius="sm"
                                        size="sm"
                                        startContent={
                                            <ArrowUpDown className="h-4 w-4" />
                                        }
                                        variant="ghost"
                                    >
                                        File Name
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        className="font-medium"
                                        onPress={() => handleSort("emails")}
                                        radius="sm"
                                        size="sm"
                                        startContent={
                                            <ArrowUpDown className="h-4 w-4" />
                                        }
                                        variant="ghost"
                                    >
                                        Invited Users
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    <Button
                                        className="font-medium"
                                        onPress={() => handleSort("date")}
                                        radius="sm"
                                        size="sm"
                                        startContent={
                                            <ArrowUpDown className="h-4 w-4" />
                                        }
                                        variant="ghost"
                                    >
                                        Created
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[200px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedInvites.map((invite) => {
                                const isDeleting = deletingIds.has(invite._id);
                                const fileName = getFileNameFromLink(
                                    invite.link
                                );
                                const inviteLink = getInviteLink(invite._id);

                                return (
                                    <TableRow
                                        className={
                                            isDeleting ? "opacity-50" : ""
                                        }
                                        key={invite._id}
                                    >
                                        <TableCell>
                                            <ExternalLink className="h-4 w-4 text-blue-500" />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span
                                                    className="max-w-[200px] truncate"
                                                    title={fileName}
                                                >
                                                    {fileName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {invite.emails.length}
                                                </span>
                                                <div className="max-w-[150px] truncate text-muted-foreground text-xs">
                                                    {invite.emails.join(", ")}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(
                                                invite._creationTime
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Link
                                                    className={buttonStyles({
                                                        size: "sm",
                                                        variant: "faded",
                                                        isIconOnly: true,
                                                    })}
                                                    href={invite.link}
                                                    isDisabled={isDeleting}
                                                    title="View file"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </Link>

                                                <Button
                                                    isIconOnly
                                                    onPress={() => {
                                                        copyToClipboard(
                                                            invite.link
                                                        );
                                                        showSuccessToast(
                                                            "Link Copied!",
                                                            "Be careful. Anyone with this link can access the file."
                                                        );
                                                    }}
                                                    size="sm"
                                                    title="Copy invite link"
                                                    variant="faded"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>

                                                <Button
                                                    className="text-destructive hover:text-destructive"
                                                    color="danger"
                                                    isDisabled={isDeleting}
                                                    isIconOnly
                                                    onPress={() =>
                                                        handleDelete(invite._id)
                                                    }
                                                    size="sm"
                                                    title="Delete invite"
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
    );
}
