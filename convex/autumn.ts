import { Autumn } from "@useautumn/convex";
import { components } from "./_generated/api";

export const autumn = new Autumn(components.autumn, {
    secretKey: process.env.AUTUMN_SECRET_KEY ?? "",

    identify: async (ctx: any) => {
        const user = (await ctx.auth.getUserIdentity()) || ctx.user;

        if (!user) {
            return null;
        }

        return {
            customerId: user.subject as string,
            customerData: {
                email: user.email as string,
                name: user.name as string,
            },
        };
    },
});

export const {
    track,
    cancel,
    query,
    attach,
    check,
    checkout,
    usage,
    setupPayment,
    createCustomer,
    listProducts,
    billingPortal,
    createReferralCode,
    redeemReferralCode,
    createEntity,
    getEntity,
} = autumn.api();
