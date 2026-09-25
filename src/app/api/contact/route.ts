import { NextResponse } from "next/server";
import { z } from "zod";
import { getMailProvider } from "@/features/mail";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(4000)
});

const CARE_INBOX = process.env.CONTACT_INBOX ?? "care@ungal-nesavalan.in";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  const html = `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
<hr />
<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>`;

  const mail = getMailProvider();
  await mail.send({
    to: CARE_INBOX,
    subject: `[Contact] ${subject}`,
    html,
    tags: { kind: "contact" }
  });

  return NextResponse.json({ ok: true });
}
