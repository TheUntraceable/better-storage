"use client";

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
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { useMutation } from "convex/react";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

type Invite = {
    _id: Id<"invites">;
    _creationTime: number;
    ownerId: string;
    emails: string[];
    link: string;
    fileName: string;
};

type EditInviteDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    invite: Invite | null;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EditInviteDialog({
    isOpen,
    onClose,
    invite,
}: EditInviteDialogProps) {
    const [emails, setEmails] = useState<string>("");
    const [emailList, setEmailList] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const updateInvite = useMutation(api.invites.update);

    // Initialize email list when invite changes or dialog opens
    useEffect(() => {
        if (isOpen && invite) {
            setEmailList([...invite.emails]);
            setEmails("");
            setError(null);
        }
    }, [isOpen, invite]);

    const handleAddEmail = () => {
        const email = emails.trim();
        if (!email) {
            return;
        }

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
        setError(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddEmail();
        }
    };

    const isAddButtonDisabled = () => {
        const trimmedEmail = emails.trim();

        if (!trimmedEmail) {
            return true;
        }

        if (!emailRegex.test(trimmedEmail)) {
            return true;
        }

        if (emailList.includes(trimmedEmail)) {
            return true;
        }

        return isUpdating;
    };

    const handleUpdateInvite = async () => {
        if (!invite) {
            return;
        }

        if (emailList.length === 0) {
            setError("At least one email is required");
            return;
        }

        try {
            setIsUpdating(true);
            setError(null);

            await updateInvite({
                inviteId: invite._id,
                emails: emailList,
            });

            showSuccessToast(
                "Invite updated successfully!",
                "New emails will receive an invitation email."
            );
            onClose();
        } catch {
            setError("Failed to update invite. Please try again.");
            showErrorToast("Failed to update invite.", "Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = () => {
        if (!isUpdating) {
            onClose();
        }
    };

    if (!invite) {
        return null;
    }

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Invite</DialogTitle>
                    <DialogDescription>
                        Update the email addresses for "{invite.fileName}". New
                        emails will receive an invitation email.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <Label htmlFor="email-input">Add Email Address</Label>
                        <div className="flex gap-2">
                            <Input
                                className="flex-1"
                                id="email-input"
                                isDisabled={isUpdating}
                                onKeyDown={handleKeyPress}
                                onValueChange={setEmails}
                                placeholder="Enter email address"
                                type="email"
                                value={emails}
                                variant="faded"
                            />
                            <Button
                                color="primary"
                                isDisabled={isAddButtonDisabled()}
                                isIconOnly
                                onPress={handleAddEmail}
                                variant="faded"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert className="mb-4" color="danger" variant="faded">
                            {error}
                        </Alert>
                    )}

                    {/* Email List */}
                    <div className="space-y-2">
                        <Label>Invited Emails ({emailList.length})</Label>
                        {emailList.length > 0 ? (
                            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-md border p-2">
                                {emailList.map((email) => (
                                    <Chip
                                        color="primary"
                                        endContent={
                                            <button
                                                className="ml-1 rounded-full p-0.5 hover:bg-default-200"
                                                disabled={isUpdating}
                                                onClick={() =>
                                                    handleRemoveEmail(email)
                                                }
                                                type="button"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        }
                                        key={email}
                                        onClose={() => handleRemoveEmail(email)}
                                        variant="flat"
                                    >
                                        {email}
                                    </Chip>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm">No emails added yet</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        isDisabled={isUpdating}
                        onPress={handleClose}
                        variant="ghost"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        isDisabled={emailList.length === 0}
                        isLoading={isUpdating}
                        onPress={handleUpdateInvite}
                    >
                        Update Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
