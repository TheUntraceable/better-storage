"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import LinkEmail from "../emails/link-email";
import { action } from "./_generated/server";
import { pretty, render } from "@react-email/render";

const resend: Resend = new Resend(process.env.RESEND_API_KEY!);

export const sendInviteEmail = action({
    args: {
        to: v.array(v.string()),
        from: v.string(),
        inviteId: v.id("invites"),
        fileName: v.string(),
    },
    handler: async (_ctx, { to, from, inviteId, fileName }) => {
        for (const email of to) {
            if (!email) {
                throw new Error("Email is required");
            }
            await resend.emails.send({
                from: "no-reply@storage.untraceable.dev",
                to: email,
                subject: "You've been invited to view a file",
                html: await pretty(await render(
                    <LinkEmail
                        fileName={fileName}
                        from={from}
                        inviteId={inviteId}
                    />
                )),
            });
        }
    },
});
