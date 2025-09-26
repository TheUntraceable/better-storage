"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Download, Eye, FileIcon, Mail, Users } from "lucide-react";

interface InvitePageProps {
    params: {
        inviteId: string;
    };
}

export default function InvitePage({ params }: InvitePageProps) {
    const invite = useQuery(api.invites.get, { 
        inviteId: params.inviteId as Id<"invites"> 
    });

    if (invite === undefined) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="mx-auto max-w-md">
                    <CardContent className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (invite === null) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="mx-auto max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Invite Not Found</CardTitle>
                        <CardDescription>
                            This invite link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <a href="/">Go to Homepage</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Users className="h-6 w-6" />
                            You've been invited to view a file
                        </CardTitle>
                        <CardDescription>
                            Someone has shared a file with you through our secure file sharing system.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* File Access Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileIcon className="h-5 w-5" />
                                Shared File
                            </span>
                            <Badge variant="secondary">
                                <Mail className="h-3 w-3 mr-1" />
                                {invite.emails.length} recipient{invite.emails.length !== 1 ? 's' : ''}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* File Preview/Info */}
                        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                            <div className="text-center space-y-2">
                                <FileIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Click the buttons below to view or download the file
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button asChild className="flex-1" size="lg">
                                <a 
                                    href={invite.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview File
                                </a>
                            </Button>
                            
                            <Button asChild variant="outline" className="flex-1" size="lg">
                                <a href={invite.link} download>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download File
                                </a>
                            </Button>
                        </div>

                        {/* Invite Info */}
                        <div className="pt-4 border-t space-y-2">
                            <div className="text-xs text-muted-foreground">
                                <p><strong>Shared with:</strong> {invite.emails.join(", ")}</p>
                                <p><strong>File ID:</strong> {invite._id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Want to share files like this? 
                            <Button asChild variant="link" className="p-0 ml-1 h-auto">
                                <a href="/">Create your account</a>
                            </Button>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}