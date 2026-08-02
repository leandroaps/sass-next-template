import nodemailer from "nodemailer";

import { env } from "@/lib/env";

const transporter = nodemailer.createTransport(env.SMTP_URL);

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: "no-reply@sass-next-template.dev",
    ...options,
  });
}
