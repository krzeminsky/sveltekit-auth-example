import nodemailer from "nodemailer";
import { env } from "$env/dynamic/private";

const senderEmail = env.SENDER_EMAIL;

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: senderEmail,
        pass: env.GMAIL_PASS
    }
});

export function sendMail(to: string, subject: string, html?: string) {
    return transporter.sendMail({
        from: senderEmail,
        to,
        subject,
        html
    });
}