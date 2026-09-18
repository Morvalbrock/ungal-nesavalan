import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { userRepo } from "@/server/repositories";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await userRepo.findById(session.userId);
  if (!user) return NextResponse.json({ user: null });
  const { passwordHash: _pw, ...pub } = user;
  void _pw;
  return NextResponse.json({ user: pub });
}
