import { NextResponse } from "next/server";
import { z } from "zod";
import { newsletterRepo } from "@/server/repositories";
import { getMailProvider } from "@/features/mail";
import { newsletterWelcomeEmail } from "@/features/mail/templates";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit-request";

const bodySchema = z.object({
  email: z.string().trim().email(),
  source: z.string().trim().min(1).max(64).optional()
});

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: "newsletter",
    max: 5,
    windowMs: 60 * 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { email } = parsed.data;
  const source = parsed.data.source ?? "footer";

  const { subscriber, created } = await newsletterRepo.subscribe({ email, source });

  if (created) {
    const { subject, html } = newsletterWelcomeEmail();
    try {
      await getMailProvider().send({ to: subscriber.email, subject, html, tags: { kind: "newsletter-welcome" } });
    } catch {
      // welcome email failures don't fail the subscription
    }
  }

  return NextResponse.json({ ok: true, alreadySubscribed: !created });
}
