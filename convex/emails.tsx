"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { RawLinkEmailHTML } from "../emails/link-email";
import { action } from "./_generated/server";

export const resend: Resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = action({
    args: {
        to: v.array(v.string()),
        from: v.string(),
        inviteId: v.id("invites"),
        fileName: v.string(),
    },
    handler: async (_ctx, { to, from, inviteId, fileName }) => {
        const html = RawLinkEmailHTML(fileName, inviteId, from);
        for (const email of to) {
            if (!email) {
                throw new Error("Email is required");
            }
            await resend.emails.send({
                from: "no-reply@storage.untraceable.dev",
                to: email,
                subject: "You've been invited to view a file",
                html,
            });
        }
    },
});
