"use client";

import { useMutation } from "convex/react";
import { AlertCircle, Check, Copy, Mail, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface InviteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    upload: {
        _id: Id<"uploads">;
        storageId: Id<"_storage">;
        link: string;
    };
    fileName: string;
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
        if (!email) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
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
            });

            // Create a shareable link (you'd replace this with your actual domain)
            const inviteLink = `${window.location.origin}/invite/${inviteId}`;
            setCreatedInvite(inviteLink);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create invite"
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyLink = async () => {
        if (!createdInvite) return;

        try {
            await navigator.clipboard.writeText(createdInvite);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
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
                        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {createdInvite ? (
                        /* Created Invite Link */
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-green-500" />
                                <span className="font-medium text-sm">
                                    Invite Created Successfully!
                                </span>
                                <Badge
                                    className="text-green-600"
                                    variant="outline"
                                >
                                    {emailList.length} recipient
                                    {emailList.length !== 1 ? "s" : ""}
                                </Badge>
                            </div>

                            <div className="space-y-3 rounded-lg bg-muted p-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Share this link:
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            className="font-mono text-xs"
                                            onClick={(e) =>
                                                e.currentTarget.select()
                                            }
                                            readOnly
                                            value={createdInvite}
                                        />
                                        <Button
                                            onClick={handleCopyLink}
                                            size="sm"
                                            variant="outline"
                                        >
                                            {copied ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="text-muted-foreground text-xs">
                                    <p>📧 Invited: {emailList.join(", ")}</p>
                                    <p>
                                        🔗 Anyone with this link can access the
                                        file
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Add email addresses
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        disabled={isCreating}
                                        id="email"
                                        onChange={(e) =>
                                            setEmails(e.target.value)
                                        }
                                        onKeyPress={handleKeyPress}
                                        placeholder="user@example.com"
                                        type="email"
                                        value={emails}
                                    />
                                    <Button
                                        disabled={!emails.trim() || isCreating}
                                        onClick={handleAddEmail}
                                        size="sm"
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
                                            <Badge
                                                className="flex items-center gap-1"
                                                key={email}
                                                variant="secondary"
                                            >
                                                {email}
                                                <button
                                                    className="ml-1 hover:text-destructive"
                                                    disabled={isCreating}
                                                    onClick={() =>
                                                        handleRemoveEmail(email)
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    {createdInvite ? (
                        <Button className="w-full" onClick={handleClose}>
                            Done
                        </Button>
                    ) : (
                        <>
                            <Button
                                disabled={isCreating}
                                onClick={handleClose}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={emailList.length === 0 || isCreating}
                                onClick={handleCreateInvite}
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
