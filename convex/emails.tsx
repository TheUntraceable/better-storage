"use node";

import { Resend } from "@convex-dev/resend";
import { pretty, render } from "@react-email/render";
import { v } from "convex/values";
import LinkEmail from "../emails/link-email";
import { components } from "./_generated/api";
import { action } from "./_generated/server";

export const resend: Resend = new Resend(components.resend, {
    testMode: false,
});

export const sendInviteEmail = action({
    args: {
        to: v.array(v.string()),
        from: v.string(),
        inviteId: v.id("invites"),
        fileName: v.string(),
    },
    handler: async (ctx, { to, from, inviteId, fileName }) => {
        const html = await pretty(
            await render(
                <LinkEmail
                    fileName={fileName}
                    from={from}
                    inviteId={inviteId}
                />
            )
        );
        for (const email of to) {
            if (!email) {
                throw new Error("Email is required");
            }
            await resend.sendEmail(ctx, {
                from: "no-reply@storage.untraceable.dev",
                to: email,
                subject: "You've been invited to view a file",
                html,
            });
        }
    },
});
