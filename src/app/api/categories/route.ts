import { NextResponse } from "next/server";
import { categoryRepo } from "@/server/repositories";

export async function GET() {
  const categories = await categoryRepo.list();
  return NextResponse.json(categories);
}
