import { NextResponse } from "next/server";
import { categoryRepo } from "@/server/repositories";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const showAll = url.searchParams.get("all") === "true";
  const categories = showAll
    ? await categoryRepo.list()
    : await categoryRepo.listWithStock();
  return NextResponse.json(categories);
}
