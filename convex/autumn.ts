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
            },
        };
    },
});

export const { track, check, ...rest } = autumn.api();
