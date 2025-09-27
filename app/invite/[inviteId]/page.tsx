import { DownloadButton } from "@/components/download-button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { requireSession } from "@/lib/session";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { Eye, FileIcon, Mail, Users } from "lucide-react";

interface InvitePageProps {
    params: {
        inviteId: string;
    };
}

const NotFound = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mx-auto max-w-md border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">
                        Invite Not Found
                    </CardTitle>
                    <CardDescription>
                        This invite link is invalid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        className={buttonStyles({
                            variant: "faded",
                        })}
                        href="/"
                    >
                        Go Back Home
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};

export default async function InvitePage({ params }: InvitePageProps) {
    const user = await requireSession();
    let invite: null | FunctionReturnType<typeof api.invites.get> = null;
    const { inviteId } = await params;
    try {
        invite = await fetchQuery(
            api.invites.get,
            {
                inviteId: inviteId as Id<"invites">,
            },
            {
                token: user.token,
            }
        );

        if (invite === undefined) {
            return (
                <div className="container mx-auto px-4 py-8">
                    <Card className="mx-auto max-w-md">
                        <CardContent className="flex items-center justify-center p-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                        </CardContent>
                    </Card>
                </div>
            );
        }
    } catch (error) {
        return <NotFound />;
    }

    if (invite === null) {
        return <NotFound />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Users className="h-6 w-6" />
                            You've been invited to view a file
                        </CardTitle>
                        <CardDescription>
                            Someone has shared a file with you through our
                            secure file sharing system.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileIcon className="h-5 w-5" />
                                Shared File
                            </span>
                            <Badge variant="secondary">
                                <Mail className="mr-1 h-3 w-3" />
                                {invite.emails.length} recipient
                                {invite.emails.length !== 1 ? "s" : ""}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center rounded-lg bg-muted p-8">
                            <div className="space-y-2 text-center">
                                <FileIcon className="mx-auto h-12 w-12" />
                                <p className="text-sm">
                                    Click the buttons below to view or download
                                    the file
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                className={buttonStyles({
                                    variant: "faded",
                                })}
                                href={invite.link}
                            >
                                <Eye className="h-3 w-3" />
                                Preview file
                            </Link>
                            <DownloadButton
                                invite={{
                                    link: invite.link,
                                    fileName: invite.fileName,
                                }}
                            />
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <div className="text-xs">
                                <p>
                                    <strong>Shared with:</strong>{" "}
                                    {invite.emails.join(", ")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm">
                            Want to share files like this?
                            <Link className="ml-1 h-auto p-0" href="/dashboard">
                                Go to the dashboard
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
