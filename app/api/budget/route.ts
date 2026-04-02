import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { budgetSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await req.json();
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;
  const budget = await prisma.budget.upsert({
    where: { month_year_userId: { month: data.month, year: data.year, userId: session.user.id as string } },
    update: { limit: data.limit },
    create: { ...data, userId: session.user.id as string },
  });
  return NextResponse.json(budget);
}
