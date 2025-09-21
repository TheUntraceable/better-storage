import { useCallback, useEffect, useRef, useState } from "react";

export function useDebouncedSave<T>(
    onSave: (value: T, signal: AbortSignal) => Promise<void>,
    delay = 1000
) {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const triggerSave = useCallback(
        (value: T): Promise<void> => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Abort any ongoing request from a previous triggerSave call
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const newAbortController = new AbortController();
            abortControllerRef.current = newAbortController;

            return new Promise((resolve, reject) => {
                timeoutRef.current = setTimeout(async () => {
                    setIsSaving(true);
                    setIsSaved(false);
                    try {
                        await onSave(value, newAbortController.signal);
                        setIsSaving(false);
                        setIsSaved(true);
                        // Clear the "Saved" checkmark after a couple of seconds
                        setTimeout(() => setIsSaved(false), 2000);
                        resolve();
                    } catch (error) {
                        // Only reject if the error is not an abort error
                        if (
                            error instanceof DOMException &&
                            error.name === "AbortError"
                        ) {
                            // Request was aborted, do nothing
                        } else {
                            setIsSaving(false);
                            setIsSaved(false);
                            reject(error);
                        }
                    } finally {
                        abortControllerRef.current = null; // Clear the controller after the request is done or aborted
                    }
                }, delay);
            });
        },
        [onSave, delay]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return { triggerSave, isSaving, isSaved };
}
