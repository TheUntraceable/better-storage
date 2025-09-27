"use client";

import { RainbowButton } from "@/components/ui/rainbow-button";
import { CheckoutDialog, useCustomer } from "autumn-js/react";

export const UpgradeSubscription = () => {
    const { checkout, refetch, customer } = useCustomer();
    const isPro = customer?.products[0].id === "pro";
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
            {isPro ? "Upgrade to Pro" : "You are a Pro User"}
        </RainbowButton>
    );
};
