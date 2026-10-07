import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const workspaceId = await getCurrentWorkspaceId(session.user.id);
  if (!workspaceId) return NextResponse.json({ totalSpent: 0 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  
  // Default to current month if no dates provided
  let monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  if (searchParams.get("from") && searchParams.get("to")) {
    monthStart = new Date(searchParams.get("from")!);
    monthEnd = new Date(searchParams.get("to")!);
  }

  const [monthlyTotal, workspace] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true }
    })
  ]);

  return NextResponse.json({
    totalSpent: Number(monthlyTotal._sum.amount || 0),
    workspaceName: workspace?.name || 'Cá nhân'
  });
}
