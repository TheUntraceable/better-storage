import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { showErrorToast, showSuccessToast } from "./toast";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const copyToClipboard = async (
    text: string,
    successMessage?: string
) => {
    try {
        await navigator.clipboard.writeText(text);
        if (successMessage) {
            showSuccessToast("Copied!", successMessage);
        }
        return true;
    } catch {
        showErrorToast("Copy Failed", "Unable to copy to clipboard");
        return false;
    }
};
