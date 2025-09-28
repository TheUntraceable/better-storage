"use client";

import { CheckoutDialog, useCustomer } from "autumn-js/react";
import { RainbowButton } from "@/components/ui/rainbow-button";

export const UpgradeSubscription = () => {
    const { checkout, refetch, customer, isLoading } = useCustomer();
    const isPro = customer?.products[0].id === "pro";

    const getButtonText = () => {
        if (isLoading) {
            return "Loading";
        }
        if (isPro) {
            return "You are a Pro User";
        }
        return "Upgrade to Pro";
    };

    return (
        <RainbowButton
            disabled={isPro}
            onClick={async () => {
                await checkout({
                    productId: "pro",
                    dialog: CheckoutDialog,
                    successUrl:
                        "https://better-storage.untraceable.dev/dashboard",
                });
                await refetch();
            }}
        >
            {getButtonText()}
        </RainbowButton>
    );
};
