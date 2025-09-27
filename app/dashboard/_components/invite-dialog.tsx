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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/toast";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { useMutation } from "convex/react";
import { AlertCircle, Plus, Share, Users } from "lucide-react";
import { useState } from "react";

type InviteDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    upload: {
        _id: Id<"uploads">;
        storageId: Id<"_storage">;
        link: string;
    };
    fileName: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COPY_FEEDBACK_DURATION = 2000;

// Success state component to reduce complexity
function InviteSuccessState({
    createdInvite,
    emailList,
    fileName,
    copied,
    onCopyLink,
}: {
    createdInvite: string;
    emailList: string[];
    fileName: string;
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
    upload,
    fileName,
}: InviteDialogProps) {
    const [emails, setEmails] = useState<string>("");
    const [emailList, setEmailList] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [createdInvite, setCreatedInvite] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const createInvite = useMutation(api.invites.create);

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

        try {
            setIsCreating(true);
            setError(null);

            const inviteId = await createInvite({
                storageId: upload.storageId,
                emails: emailList,
                link: upload.link,
                fileName,
            });

            // Create a shareable link (you'd replace this with your actual domain)
            const inviteLink =
                // typeof window !== "undefined"
                //     ? `${window.location.origin}/invite/${inviteId}`
                `/invite/${inviteId}`;
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
                        Invite others to access "{fileName}" by email. They'll
                        receive a secure link to view the file.
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
                            fileName={fileName}
                            onCopyLink={handleCopyLink}
                        />
                    ) : (
                        <>
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
                                            !emails.trim() || isCreating
                                                ? "default"
                                                : "primary"
                                        }
                                        isDisabled={
                                            !emails.trim() || isCreating
                                        }
                                        isIconOnly
                                        onPress={handleAddEmail}
                                        size="sm"
                                        variant={
                                            !emails.trim() || isCreating
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
                                    emailList.length === 0 || isCreating
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
