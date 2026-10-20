import { NextRequest, NextResponse } from "next/server";
import { destroyModeratorSession, validateRequestOrigin } from "@/lib/security/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!validateRequestOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  await destroyModeratorSession();
  return NextResponse.json({ success: true, message: "Moderator session terminated." });
}
