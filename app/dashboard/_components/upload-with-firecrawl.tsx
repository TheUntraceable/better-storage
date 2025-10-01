"use client";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useAction, useMutation } from "convex/react";
import { ExternalLink, Globe, RefreshCw, Save, Upload } from "lucide-react";
import { useState } from "react";

type ScrapedDocument = {
    markdown?: string;
    metadata?: {
        title?: string;
        description?: string;
    };
    summary?: string;
};

type UploadWithFirecrawlDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (document: ScrapedDocument) => void;
    onSaveSuccess?: () => void;
};

const urlRegex =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
// preview length removed (unused)

// Success state component
function ScrapeSuccessState({
    scrapedDocument,
    url,
    onViewDocument,
    onRetry,
    onSave,
    isSaving,
}: {
    scrapedDocument: ScrapedDocument;
    url: string;
    onViewDocument?: () => void;
    onRetry: () => void;
    onSave: () => void;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-4">
            <Card className="flex items-center justify-center gap-3 rounded-lg p-2 text-center">
                <CardHeader className="space-y-1">
                    <CardTitle className="font-semibold text-sm text-success">
                        Web Page Scraped Successfully!
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400">
                        Content from {new URL(url).hostname} has been extracted
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Document Preview Section */}
            <div className="max-h-72 space-y-3 rounded-lg border p-2">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-medium text-sm">
                        <Globe className="h-4 w-4" />
                        Scraped Content
                    </Label>
                    <div className="space-y-2">
                        <div className="text-xs">
                            <strong>URL:</strong> {url}
                        </div>
                        {scrapedDocument.metadata?.title && (
                            <div className="text-xs">
                                <strong>Title:</strong>{" "}
                                {scrapedDocument.metadata.title}
                            </div>
                        )}
                        {scrapedDocument.metadata?.description && (
                            <div className="text-xs">
                                <strong>Description:</strong>{" "}
                                {scrapedDocument.metadata.description}
                            </div>
                        )}
                        <div className="w-full min-w-0 rounded border bg-background p-2">
                            <p className="m-0 text-sm">
                                Content extracted - click "View Full Content" to
                                inspect or copy the full markdown.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        className="flex-1"
                        color="danger"
                        isDisabled={isSaving}
                        onPress={onRetry}
                        size="sm"
                        startContent={<RefreshCw className="h-4 w-4" />}
                        variant="bordered"
                    >
                        Retry
                    </Button>
                    <Button
                        className="flex-1"
                        color="primary"
                        isLoading={isSaving}
                        onPress={onSave}
                        size="sm"
                        startContent={<Save className="h-4 w-4" />}
                        variant="shadow"
                    >
                        {isSaving ? "Saving..." : "Save as File"}
                    </Button>
                </div>
                {onViewDocument && (
                    <Button
                        className="w-full"
                        color="default"
                        isDisabled={isSaving}
                        onPress={onViewDocument}
                        size="sm"
                        startContent={<ExternalLink className="h-4 w-4" />}
                        variant="flat"
                    >
                        View Full Content
                    </Button>
                )}
            </div>
        </div>
    );
}

export function UploadWithFirecrawlDialog({
    isOpen,
    onClose,
    onSuccess,
    onSaveSuccess,
}: UploadWithFirecrawlDialogProps) {
    const [url, setUrl] = useState<string>("");
    const [isScraping, setIsScraping] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [scrapedDocument, setScrapedDocument] =
        useState<ScrapedDocument | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scrape = useAction(api.actions.scrape);
    const generateUploadLink = useMutation(api.storage.generateLink);
    const storeFile = useMutation(api.storage.store);

    const validateUrl = (inputUrl: string): string | null => {
        const trimmedUrl = inputUrl.trim();

        if (!trimmedUrl) {
            return "Please enter a URL";
        }

        if (!urlRegex.test(trimmedUrl)) {
            return "Please enter a valid URL starting with http:// or https://";
        }

        return null;
    };

    const parseError = (scrapeError: unknown): string => {
        if (
            scrapeError &&
            typeof scrapeError === "object" &&
            "data" in scrapeError
        ) {
            const errorWithData = scrapeError as { data?: { code?: string } };
            if (errorWithData.data?.code === "PAYMENT_REQUIRED") {
                return "Insufficient scrapes available. Please upgrade your plan.";
            }
            if (errorWithData.data?.code === "NOT_FOUND") {
                return "Could not access or scrape the provided URL";
            }
        }

        if (
            scrapeError &&
            typeof scrapeError === "object" &&
            "message" in scrapeError
        ) {
            const errorWithMessage = scrapeError as { message: string };
            return errorWithMessage.message;
        }

        return "Failed to scrape the webpage";
    };

    const createMarkdownFile = (
        scrapedDoc: ScrapedDocument,
        sourceUrl: string
    ): File => {
        const hostname = new URL(sourceUrl).hostname;
        const title = scrapedDoc.metadata?.title || `Scraped from ${hostname}`;
        const timestamp = new Date().toISOString().split("T")[0];
        const fileName = `${title.replace(/[^a-zA-Z0-9\\s]/g, "").replace(/\\s+/g, "-")}-${timestamp}.md`;

        let content = `# ${title}\\n\\n`;
        content += `**Source:** ${sourceUrl}\\n`;
        content += `**Scraped:** ${new Date().toLocaleString()}\\n\\n`;

        if (scrapedDoc.metadata?.description) {
            content += `**Description:** ${scrapedDoc.metadata.description}\\n\\n`;
        }

        content += "---\\n\\n";
        content += scrapedDoc.summary || "";

        return new File([content], fileName, { type: "text/markdown" });
    };

    const handleScrapeUrl = async () => {
        const validationError = validateUrl(url);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsScraping(true);
            setError(null);

            const document = await scrape({ url: url.trim() });

            setScrapedDocument(document);
            if (onSuccess) {
                onSuccess(document);
            }
        } catch (scrapeError: unknown) {
            const errorMessage = parseError(scrapeError);
            setError(errorMessage);
            showErrorToast("Scraping failed", errorMessage);
        } finally {
            setIsScraping(false);
        }
    };

    const handleSaveAsFile = async () => {
        if (!scrapedDocument) {
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            const markdownFile = createMarkdownFile(scrapedDocument, url);

            // Generate upload link
            const uploadUrl = await generateUploadLink();

            // Upload the file
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": markdownFile.type },
                body: markdownFile,
            });

            if (!response.ok) {
                const errorText = await response
                    .text()
                    .catch(() => response.statusText);
                throw new Error(
                    `Upload failed (${response.status}): ${errorText}`
                );
            }

            const { storageId } = await response.json();

            // Store metadata
            await storeFile({
                storageId,
                name: markdownFile.name,
            });

            if (onSaveSuccess) {
                onSaveSuccess();
            }

            handleClose();
        } catch (saveError: unknown) {
            const errorMessage =
                saveError instanceof Error
                    ? saveError.message
                    : "Failed to save file";
            setError(errorMessage);
            showErrorToast("Save failed", errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRetry = () => {
        setScrapedDocument(null);
        setError(null);
        // setUrl("");
    };

    const handleClose = () => {
        // Reset state when closing
        setUrl("");
        setScrapedDocument(null);
        setError(null);
        setIsScraping(false);
        setIsSaving(false);
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleScrapeUrl();
        }
    };

    const isScrapingDisabled = () => {
        const trimmedUrl = url.trim();
        if (!trimmedUrl || isScraping || isSaving) {
            return true;
        }
        return !urlRegex.test(trimmedUrl);
    };

    const handleViewDocument = () => {
        // You can implement this to show the full document content
        // For now, we'll just copy it to clipboard or open in a new window
        if (scrapedDocument?.markdown) {
            navigator.clipboard.writeText(scrapedDocument.markdown);
            showSuccessToast(
                "Content copied!",
                "Full markdown content copied to clipboard"
            );
        }
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="max-w-md lg:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Scrape Web Page
                    </DialogTitle>
                    <DialogDescription>
                        {scrapedDocument
                            ? "Successfully scraped content from the webpage."
                            : "Enter a URL to scrape its content using Firecrawl. The page will be converted to markdown format."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Error Display */}
                    {error && (
                        <Alert
                            color="danger"
                            description={error}
                            title="Error"
                            variant="flat"
                        />
                    )}

                    {scrapedDocument ? (
                        <ScrapeSuccessState
                            isSaving={isSaving}
                            onRetry={handleRetry}
                            onSave={handleSaveAsFile}
                            onViewDocument={handleViewDocument}
                            scrapedDocument={scrapedDocument}
                            url={url}
                        />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    className="flex-1"
                                    isDisabled={isScraping}
                                    label="Website URL"
                                    onKeyDown={handleKeyPress}
                                    onValueChange={setUrl}
                                    placeholder="https://example.com/page"
                                    startContent={<Globe className="h-4 w-4" />}
                                    type="url"
                                    value={url}
                                    variant="faded"
                                />
                            </div>

                            {/* URL validation hint */}
                            {url && !urlRegex.test(url.trim()) && (
                                <p className="text-warning text-xs">
                                    Please enter a valid URL starting with
                                    http:// or https://
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {scrapedDocument ? (
                        <Button
                            className="w-full"
                            isDisabled={isSaving}
                            onPress={handleClose}
                        >
                            Close
                        </Button>
                    ) : (
                        <>
                            <Button
                                isDisabled={isScraping || isSaving}
                                onPress={handleClose}
                                variant="bordered"
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                isDisabled={isScrapingDisabled()}
                                isLoading={isScraping}
                                onPress={handleScrapeUrl}
                                startContent={<Upload className="h-4 w-4" />}
                                variant="shadow"
                            >
                                {isScraping
                                    ? "Scraping Page..."
                                    : "Scrape Page"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
