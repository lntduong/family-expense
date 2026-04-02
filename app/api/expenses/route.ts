import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { expenseSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const exp = await prisma.expense.create({ data: { ...parsed.data, userId: session.user.id as string } });
  return NextResponse.json(exp);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = 20;
  const where: any = { userId: session.user.id };
  if (searchParams.get("category")) where.category = searchParams.get("category");
  if (searchParams.get("q")) where.note = { contains: searchParams.get("q"), mode: "insensitive" };
  if (searchParams.get("from") && searchParams.get("to")) {
    where.date = { gte: new Date(searchParams.get("from")!), lte: new Date(searchParams.get("to")!) };
  }
  const [items, total] = await Promise.all([
    prisma.expense.findMany({ where, orderBy: { date: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.expense.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.expense.deleteMany({ where: { id, userId: session.user.id as string } });
  return NextResponse.json({ ok: true });
}
