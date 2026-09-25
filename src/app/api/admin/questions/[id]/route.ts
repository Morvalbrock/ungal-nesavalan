import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, ForbiddenError } from "@/features/admin/guard";
import { questionRepo, userRepo } from "@/server/repositories";

const answerSchema = z.object({
  action: z.literal("answer"),
  body: z.string().trim().min(2).max(2000)
});

const publishSchema = z.object({
  action: z.literal("publish"),
  published: z.boolean()
});

const deleteSchema = z.object({ action: z.literal("delete") });

const bodySchema = z.discriminatedUnion("action", [answerSchema, publishSchema, deleteSchema]);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireAdmin();
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    throw e;
  }

  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  if (parsed.data.action === "delete") {
    const removed = await questionRepo.remove(id);
    return NextResponse.json({ ok: removed });
  }
  if (parsed.data.action === "publish") {
    const updated = await questionRepo.setPublished(id, parsed.data.published);
    if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ question: updated });
  }
  const admin = await userRepo.findById(session.userId);
  const updated = await questionRepo.answer(id, {
    body: parsed.data.body,
    authorName: admin?.name ?? "Ungal Nesavalan"
  });
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ question: updated });
}
