import { NextResponse } from "next/server";
import { destroyModeratorSession } from "@/lib/security/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await destroyModeratorSession();
  return NextResponse.json({ success: true, message: "Moderator session terminated." });
}
