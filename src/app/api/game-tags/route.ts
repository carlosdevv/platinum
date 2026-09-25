import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

const DEFAULT_TAG_COLOR = "#3B82F6";
const isHexColor = (value: unknown): value is string => typeof value === "string" && /^#[\da-fA-F]{6}$/.test(value);

function normalizeName(name: string) {
  return name.trim().normalize("NFKC").toLocaleLowerCase("pt-BR");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Sua sessão expirou." }, { status: 401 });
  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true, _count: { select: { games: true } } },
  });
  return NextResponse.json({ tags });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Sua sessão expirou." }, { status: 401 });
  const body = await request.json().catch(() => null) as { name?: unknown; color?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const color = body?.color === undefined ? DEFAULT_TAG_COLOR : body.color;
  const normalizedName = normalizeName(name);
  if (!name || name.length > 32) return NextResponse.json({ message: "A tag deve ter entre 1 e 32 caracteres." }, { status: 400 });
  if (!isHexColor(color)) return NextResponse.json({ message: "Informe uma cor hexadecimal válida, como #3B82F6." }, { status: 400 });
  try {
    const tag = await prisma.tag.create({ data: { name, normalizedName, color, userId: session.user.id } });
    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "Você já criou uma tag com esse nome." }, { status: 409 });
    }
    console.error("[GAME_TAG_CREATE]", error);
    return NextResponse.json({ message: "Não foi possível criar a tag." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Sua sessão expirou." }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: unknown; name?: unknown; color?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const color = body?.color;
  if (!id || (name !== undefined && (!name || name.length > 32))) return NextResponse.json({ message: "Informe a tag e um nome válido." }, { status: 400 });
  if (name === undefined && color === undefined) return NextResponse.json({ message: "Informe o nome ou a cor da tag." }, { status: 400 });
  if (color !== undefined && !isHexColor(color)) return NextResponse.json({ message: "Informe uma cor hexadecimal válida, como #3B82F6." }, { status: 400 });
  try {
    const result = await prisma.tag.updateMany({
      where: { id, userId: session.user.id },
      data: {
        ...(name !== undefined ? { name, normalizedName: normalizeName(name) } : {}),
        ...(color !== undefined ? { color } : {}),
      },
    });
    if (!result.count) return NextResponse.json({ message: "Tag não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "Você já tem outra tag com esse nome." }, { status: 409 });
    }
    console.error("[GAME_TAG_UPDATE]", error);
    return NextResponse.json({ message: "Não foi possível renomear a tag." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Sua sessão expirou." }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ message: "Tag inválida." }, { status: 400 });
  const deleted = await prisma.tag.deleteMany({ where: { id, userId: session.user.id } });
  if (!deleted.count) return NextResponse.json({ message: "Tag não encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
