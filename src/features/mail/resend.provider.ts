import { Resend } from "resend";
import type { MailProvider } from "./mail.provider";

export function createResendProvider(): MailProvider {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const from = process.env.MAIL_FROM ?? "Ungal Nesavalan <noreply@ungalnesavalan.example>";
  const client = new Resend(key);

  return {
    mode: "resend",
    async send({ to, subject, html, text, tags }) {
      const res = await client.emails.send({
        from,
        to,
        subject,
        html,
        text,
        tags: tags ? Object.entries(tags).map(([name, value]) => ({ name, value })) : undefined
      });
      if (res.error) throw new Error(res.error.message);
      return { id: res.data?.id ?? "unknown", provider: "resend" };
    }
  };
}
