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

export const downloadFile = async (upload: {
    name: string;
    link: string;
}) => {
    const blob = await fetch(upload.link).then((res) => res.blob());

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = upload.name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
};