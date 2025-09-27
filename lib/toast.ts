import { addToast } from "@heroui/toast";

export const showSuccessToast = (title: string, description: string) => {
    addToast({
        title,
        description,
        color: "success",
    });
};

export const showErrorToast = (title: string, description: string) => {
    addToast({
        title,
        description,
        color: "danger",
    });
};

export const showInfoToast = (title: string, description: string) => {
    addToast({
        title,
        description,
        color: "primary",
    });
};
