"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@heroui/input";
import { useMutation } from "convex/react";
import { Mail, Plus, Users } from "lucide-react";
import { useState } from "react";

interface InviteManagerProps {
    storageId: Id<"_storage">;
    fileLink: string;
}

export function InviteManager({ storageId, fileLink }: InviteManagerProps) {
    const [emails, setEmails] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);
    const [createdInvite, setCreatedInvite] = useState<string | null>(null);
    const createInvite = useMutation(api.invites.create);

    const handleCreateInvite = async () => {
        if (!emails.trim()) {
            return;
        }

        try {
            setIsCreating(true);
            const emailList = emails
                .split(",")
                .map((email) => email.trim())
                .filter((email) => email.length > 0);

            const inviteId = await createInvite({
                storageId,
                emails: emailList,
                link: fileLink,
                fileName: "helo",
            });

            // Create a shareable link (you'd replace this with your actual domain)
            const inviteLink = `${window.location.origin}/invite/${inviteId}`;
            setCreatedInvite(inviteLink);
            setEmails("");
        } catch (error) {
            console.error("Failed to create invite:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Share File
                </CardTitle>
                <CardDescription>
                    Invite others to access this file by email
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                    <Label htmlFor="emails">
                        Email addresses (comma-separated)
                    </Label>
                    <Input
                        disabled={isCreating}
                        id="emails"
                        onChange={(e) => setEmails(e.target.value)}
                        placeholder="user@example.com, another@example.com"
                        type="email"
                        value={emails}
                    />
                </div>

                {/* Create Invite Button */}
                <Button
                    className="w-full"
                    disabled={!emails.trim() || isCreating}
                    onClick={handleCreateInvite}
                >
                    {isCreating ? (
                        "Creating invite..."
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Invite Link
                        </>
                    )}
                </Button>

                {/* Created Invite Link */}
                {createdInvite && (
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="font-medium text-sm">
                                Invite Created
                            </span>
                            <Badge variant="secondary">Ready to share</Badge>
                        </div>

                        <div className="space-y-2 rounded-lg bg-muted p-3">
                            <p className="text-muted-foreground text-xs">
                                Share this link:
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    className="text-xs"
                                    readOnly
                                    value={createdInvite}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
