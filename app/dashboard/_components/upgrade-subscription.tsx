"use client";

import { RainbowButton } from "@/components/ui/rainbow-button";
import { CheckoutDialog, useCustomer } from "autumn-js/react";

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
                    successUrl: "https://dev.untraceable.dev/dashboard",
                });
                await refetch();
            }}
        >
            {getButtonText()}
        </RainbowButton>
    );
};
