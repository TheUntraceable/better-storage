"use client";

import { downloadFile } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Download } from "lucide-react";

export const DownloadButton = ({
    invite,
}: {
    invite: { link: string; fileName: string };
}) => {
    return (
        <Button
            className="flex-1"
            color="primary"
            onPress={async () => {
                await downloadFile({
                    name: invite.fileName,
                    link: invite.link,
                });
            }}
            startContent={<Download className="mr-2 h-4 w-4" />}
            variant="shadow"
        >
            Download File
        </Button>
    );
};
