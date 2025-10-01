"use client";

import { downloadFile } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Download } from "lucide-react";

export const DownloadButton = ({
    invite,
    isIconOnly,
}: {
    invite: { link: string; fileName: string };
    isIconOnly?: boolean;
}) => {
    return (
        <Tooltip content="Download file" isDisabled={!isIconOnly}>
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
                startContent={
                    !isIconOnly && <Download className="mr-2 h-4 w-4" />
                }
                variant="faded"
            >
                {isIconOnly ? (
                    <Download className="h-4 w-4" />
                ) : (
                    "Download File"
                )}
            </Button>
        </Tooltip>
    );
};
