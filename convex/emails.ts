import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const resend: Resend = new Resend(components.resend, {
    testMode: false,
});

export const sendInviteEmail = internalMutation({
    args: {
        to: v.array(v.string()),
        from: v.string(),
        inviteId: v.id("invites"),
        fileName: v.string(),
    },
    handler: async (ctx, { to, from, inviteId, fileName }) => {
        for (const email of to) {
            if (!email) {
                throw new Error("Email is required");
            }
            await resend.sendEmail(ctx, {
                from: "no-reply@storage.untraceable.dev",
                to: email,
                subject: "You've been invited to view a file",
                html: `<p>You've been invited to view a ${fileName} from ${from}. Click the link below to access it:</p>
                <p><a href="https://better-storage.untraceable.dev/invite/${inviteId}">View File</a></p>
                <p>If you did not expect this email, you can ignore it.</p>
                `,
            });
        }
    },
});
