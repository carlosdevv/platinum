import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Não autorizado", { status: 401 });
  const connection = await prisma.gameConnection.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: "steam" } },
    select: { externalUserId: true, lastSyncedAt: true, syncError: true },
  });
  return NextResponse.json({ connection });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Não autorizado", { status: 401 });
  await prisma.gameConnection.deleteMany({ where: { userId: session.user.id, provider: "steam" } });
  return NextResponse.json({ ok: true });
}
