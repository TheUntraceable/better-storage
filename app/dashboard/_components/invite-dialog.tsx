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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/toast";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { useMutation } from "convex/react";
import {
    AlertCircle,
    FileIcon,
    FileTextIcon,
    ImageIcon,
    Plus,
    Share,
    Users,
} from "lucide-react";
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

type InviteDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    uploads: Upload[];
    selectedUpload?: Upload | null;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COPY_FEEDBACK_DURATION = 2000;

// Success state component to reduce complexity
function InviteSuccessState({
    createdInvite,
    emailList,
    selectedUpload,
    copied,
    onCopyLink,
}: {
    createdInvite: string;
    emailList: string[];
    selectedUpload: Upload;
    copied: boolean;
    onCopyLink: () => void;
}) {
    return (
        <div className="space-y-4">
            <Card className="flex items-center justify-center gap-3 rounded-lg p-2 text-center">
                <CardHeader className="space-y-1">
                    <CardTitle className="font-semibold text-sm text-success">
                        Invite Created Successfully!
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400">
                        {emailList.length} recipient
                        {emailList.length !== 1 ? "s" : ""} will receive access
                        to {selectedUpload.name}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Invite Link Section */}
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-medium text-sm">
                        <Share className="h-4 w-4" />
                        Shareable Link
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            className="font-mono text-xs"
                            isReadOnly
                            onClick={(e) => e.currentTarget.select()}
                            placeholder="Loading..."
                            value={createdInvite}
                            variant="bordered"
                        />
                        <Button
                            color={copied ? "success" : "primary"}
                            onPress={onCopyLink}
                            size="sm"
                            variant={copied ? "flat" : "shadow"}
                        >
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>

                {/* Recipients List */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-medium text-sm">
                        <Users className="h-4 w-4" />
                        Invited Recipients
                    </Label>
                    <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto">
                        {emailList.map((email) => (
                            <Chip
                                color="success"
                                key={email}
                                radius="sm"
                                size="sm"
                                variant="dot"
                            >
                                {email}
                            </Chip>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function InviteDialog({
    isOpen,
    onClose,
    uploads = [],
    selectedUpload,
}: InviteDialogProps) {
    const [emails, setEmails] = useState<string>("");
    const [emailList, setEmailList] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [createdInvite, setCreatedInvite] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUpload, setCurrentUpload] = useState<Upload | null>(
        selectedUpload || null
    );
    const createInvite = useMutation(api.invites.create);

    // Reset currentUpload when selectedUpload changes or when dialog opens
    useEffect(() => {
        if (isOpen) {
            setCurrentUpload(selectedUpload || null);
        }
    }, [selectedUpload, isOpen]);

    // Helper function to get file icon
    const getFileIcon = (upload: Upload) => {
        const contentType = upload.contentType?.toLowerCase() || "";

        if (contentType.startsWith("image/")) {
            return <ImageIcon className="h-4 w-4" />;
        }
        if (
            contentType === "application/pdf" ||
            upload.name.toLowerCase().endsWith(".pdf")
        ) {
            return <FileTextIcon className="h-4 w-4" />;
        }
        return <FileIcon className="h-4 w-4" />;
    };

    const handleAddEmail = () => {
        const email = emails.trim();
        if (!email) {
            return;
        }

        if (!emailRegex.test(email)) {
            return;
        }

        if (emailList.includes(email)) {
            setError("Email already added");
            return;
        }

        setEmailList((prev) => [...prev, email]);
        setEmails("");
        setError(null);
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmailList((prev) => prev.filter((email) => email !== emailToRemove));
    };

    const handleCreateInvite = async () => {
        if (emailList.length === 0) {
            setError("Please add at least one email address");
            return;
        }

        if (!currentUpload) {
            setError("Please select a file to share");
            return;
        }

        try {
            setIsCreating(true);
            setError(null);

            const inviteId = await createInvite({
                storageId: currentUpload.storageId,
                emails: emailList,
                link: currentUpload.link,
                fileName: currentUpload.name,
            });

            const inviteLink =
                typeof window !== "undefined"
                    ? `${window.location.origin}/invite/${inviteId}`
                    : `/invite/${inviteId}`;
            setCreatedInvite(inviteLink);
        } catch (createError) {
            showErrorToast("Failed to create invite", "Please try again.");
            setError(
                createError instanceof Error
                    ? createError.message
                    : "Failed to create invite"
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyLink = () => {
        if (!createdInvite) {
            return;
        }

        try {
            copyToClipboard(createdInvite, "Invite copied!");
            setCopied(true);
            setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
            // await navigator.clipboard.writeText(createdInvite);
        } catch {
            setError("Failed to copy link to clipboard");
        }
    };

    const handleClose = () => {
        // Reset state when closing
        setEmails("");
        setEmailList([]);
        setCreatedInvite(null);
        setCopied(false);
        setError(null);
        setIsCreating(false);
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddEmail();
        }
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Share File
                    </DialogTitle>
                    <DialogDescription>
                        {currentUpload
                            ? `Invite others to access "${currentUpload.name}" by email. They'll receive a secure link to view the file.`
                            : "Select a file and invite others to access it by email. They'll receive a secure link to view the file."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-danger text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {createdInvite ? (
                        <InviteSuccessState
                            copied={copied}
                            createdInvite={createdInvite}
                            emailList={emailList}
                            onCopyLink={handleCopyLink}
                            selectedUpload={currentUpload!}
                        />
                    ) : (
                        <>
                            {/* File Selection */}
                            {uploads.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="font-medium text-sm">
                                        Select File to Share
                                    </Label>
                                    <Select
                                        disabled={isCreating}
                                        onValueChange={(value) => {
                                            const selected = uploads.find(
                                                (u) => u._id === value
                                            );
                                            setCurrentUpload(selected || null);
                                        }}
                                        value={currentUpload?._id || ""}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    selectedUpload
                                                        ? selectedUpload.name
                                                        : "Choose a file..."
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {uploads.map((upload) => (
                                                <SelectItem
                                                    key={upload._id}
                                                    value={upload._id}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {getFileIcon(upload)}
                                                        <span className="truncate">
                                                            {upload.name}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex flex-row items-end gap-2">
                                    <Input
                                        id="email"
                                        isDisabled={isCreating}
                                        label="Add Email Address"
                                        onKeyDown={handleKeyPress}
                                        onValueChange={setEmails}
                                        placeholder="user@example.com"
                                        radius="sm"
                                        size="sm"
                                        type="email"
                                        value={emails}
                                        variant="faded"
                                    />
                                    <Button
                                        color={
                                            !emails.trim() ||
                                            isCreating ||
                                            !emailRegex.test(emails.trim())
                                                ? "default"
                                                : "primary"
                                        }
                                        isDisabled={
                                            !emails.trim() ||
                                            isCreating ||
                                            !emailRegex.test(emails.trim())
                                        }
                                        isIconOnly
                                        onPress={handleAddEmail}
                                        size="sm"
                                        variant={
                                            !emails.trim() ||
                                            isCreating ||
                                            !emailRegex.test(emails.trim())
                                                ? "bordered"
                                                : "shadow"
                                        }
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Email List */}
                            {emailList.length > 0 && (
                                <div className="space-y-2">
                                    <Label>
                                        Invited emails ({emailList.length})
                                    </Label>
                                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                                        {emailList.map((email) => (
                                            <Chip
                                                color="primary"
                                                key={email}
                                                onClose={() =>
                                                    handleRemoveEmail(email)
                                                }
                                                radius="sm"
                                                size="sm"
                                                variant="dot"
                                            >
                                                {email}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    {createdInvite ? (
                        <Button className="w-full" onPress={handleClose}>
                            Done
                        </Button>
                    ) : (
                        <>
                            <Button
                                isDisabled={isCreating}
                                onPress={handleClose}
                                variant="bordered"
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                isDisabled={
                                    emailList.length === 0 ||
                                    isCreating ||
                                    !currentUpload
                                }
                                isLoading={isCreating}
                                onPress={handleCreateInvite}
                                startContent={<Share className="h-4 w-4" />}
                                variant="shadow"
                            >
                                {isCreating
                                    ? "Creating invite..."
                                    : `Create Invite (${emailList.length})`}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
