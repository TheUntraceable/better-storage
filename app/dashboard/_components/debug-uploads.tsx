"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DebugUploads() {
    const uploads = useQuery(api.storage.get);

    if (!uploads || uploads.length === 0) {
        return (
            <div className="rounded bg-gray-100 p-4 text-sm">
                No uploads to debug
            </div>
        );
    }

    return (
        <div className="space-y-2 rounded bg-gray-100 p-4 text-xs">
            <h4 className="font-bold">Debug: Upload Objects</h4>
            {uploads.slice(0, 2).map((upload, i) => (
                <div className="rounded border bg-white p-2" key={i}>
                    <p>
                        <strong>ID:</strong> {upload._id}
                    </p>
                    <p>
                        <strong>Storage ID:</strong> {upload.storageId}
                    </p>
                    <p>
                        <strong>Link:</strong> {upload.link}
                    </p>
                    <p>
                        <strong>Uploader:</strong> {upload.uploader}
                    </p>
                    <p>
                        <strong>Created:</strong>{" "}
                        {new Date(upload._creationTime).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
