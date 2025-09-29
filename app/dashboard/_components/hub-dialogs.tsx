"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

type CreateHubDialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function CreateHubDialog({ isOpen, onClose }: CreateHubDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const createHub = useMutation(api.hubs.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            showErrorToast("Validation Error", "Hub name is required");
            return;
        }

        try {
            setIsCreating(true);
            await createHub({
                name: name.trim(),
                description: description.trim(),
            });

            showSuccessToast(
                "Hub Created",
                "Your hub has been created successfully"
            );
            setName("");
            setDescription("");
            onClose();
        } catch {
            showErrorToast("Failed to create hub", "Please try again");
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            setName("");
            setDescription("");
            onClose();
        }
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Hub</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Input
                            id="hub-name"
                            isDisabled={isCreating}
                            isRequired
                            label="Hub Name"
                            onValueChange={setName}
                            placeholder="Enter hub name"
                            value={name}
                            variant="faded"
                        />
                    </div>
                    <div className="space-y-2">
                        <Textarea
                            id="hub-description"
                            isDisabled={isCreating}
                            onValueChange={setDescription}
                            placeholder="Enter hub description (optional)"
                            value={description}
                            variant="bordered"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            isDisabled={isCreating}
                            onPress={handleClose}
                            variant="bordered"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            isLoading={isCreating || !name.trim()}
                            type="submit"
                            variant="shadow"
                        >
                            {isCreating ? "Creating..." : "Create Hub"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type EditHubDialogProps = {
    hub: {
        _id: Id<"hubs">;
        name: string;
        description: string;
        ownerId: string;
        _creationTime: number;
    } | null;
    isOpen: boolean;
    onClose: () => void;
};

export function EditHubDialog({ hub, isOpen, onClose }: EditHubDialogProps) {
    const [name, setName] = useState(hub?.name || "");
    const [description, setDescription] = useState(hub?.description || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const updateHub = useMutation(api.hubs.update);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hub) {
            showErrorToast("Validation Error", "No hub selected");
            return;
        }

        if (!name.trim()) {
            showErrorToast("Validation Error", "Hub name is required");
            return;
        }

        try {
            setIsUpdating(true);
            await updateHub({
                hubId: hub._id,
                name: name.trim(),
                description: description.trim(),
            });

            showSuccessToast(
                "Hub Updated",
                "Your hub has been updated successfully"
            );
            onClose();
        } catch {
            showErrorToast("Failed to update hub", "Please try again");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = () => {
        if (!isUpdating) {
            setName(hub?.name || "");
            setDescription(hub?.description || "");
            onClose();
        }
    };

    // Update form when hub changes
    useEffect(() => {
        if (hub) {
            setName(hub.name);
            setDescription(hub.description);
        }
    }, [hub]);

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Hub</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Input
                            id="edit-hub-name"
                            isDisabled={isUpdating}
                            isRequired
                            onValueChange={setName}
                            placeholder="Enter hub name"
                            value={name}
                            variant="faded"
                        />
                    </div>
                    <div className="space-y-2">
                        <Textarea
                            id="edit-hub-description"
                            isDisabled={isUpdating}
                            onValueChange={setDescription}
                            placeholder="Enter hub description (optional)"
                            value={description}
                            variant="faded"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            isDisabled={isUpdating}
                            onPress={handleClose}
                            variant="bordered"
                        >
                            Cancel
                        </Button>
                        <Button
                            isDisabled={isUpdating || !name.trim()}
                            type="submit"
                        >
                            {isUpdating ? "Updating..." : "Update Hub"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
