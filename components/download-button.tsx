"use client";

import { Button } from "@heroui/button";
import { Download } from "lucide-react";
import { downloadFile } from "@/lib/utils";

export const DownloadButton = ({
    invite,
    isIconOnly,
}: {
    invite: { link: string; fileName: string };
    isIconOnly?: boolean;
}) => {
    return (
        <Button
            className="flex-1"
            isIconOnly={isIconOnly}
            onPress={async () => {
                await downloadFile({
                    name: invite.fileName,
                    link: invite.link,
                });
            }}
            size={isIconOnly ? "sm" : "md"}
            startContent={!isIconOnly && <Download className="mr-2 h-4 w-4" />}
            variant="faded"
        >
            {isIconOnly ? <Download className="h-4 w-4" /> : "Download File"}
        </Button>
    );
};
