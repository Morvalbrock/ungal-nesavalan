import { productRepo, questionRepo } from "@/server/repositories";
import { QuestionsClient } from "./QuestionsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Q & A" };

export default async function AdminQuestionsPage() {
  const questions = await questionRepo.listAll();
  const productIds = Array.from(new Set(questions.map((q) => q.productId)));
  const products = await Promise.all(productIds.map((id) => productRepo.findById(id)));
  const productMap = new Map<string, { name: string; slug: string }>();
  for (const p of products) if (p) productMap.set(p.id, { name: p.name, slug: p.slug });

  const rows = questions.map((q) => ({
    question: q,
    productName: productMap.get(q.productId)?.name ?? "(deleted product)",
    productSlug: productMap.get(q.productId)?.slug ?? ""
  }));

  return <QuestionsClient rows={rows} />;
}
