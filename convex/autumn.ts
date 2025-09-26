import { Autumn } from "@useautumn/convex";
import { components } from "./_generated/api";

export const autumn = new Autumn(components.autumn, {
    secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
    identify: async (ctx: any) => {
        // Use Better Auth to get the current user
        const user = await ctx.auth.getUserIdentity();
        if (!user) return null;

        // Adjust these fields based on your Better Auth user object
        return {
            customerId: user.id, // or user.subject, depending on your setup
            customerData: {
                name: user.name,
                email: user.email,
            },
        };
    },
});

export const { track, check, ...rest } = autumn.api();
