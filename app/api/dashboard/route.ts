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

  const [monthlyTotal, workspace, budget, categoryBreakdown, expensesLast7Days] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true }
    }),
    prisma.budget.findFirst({
      where: { workspaceId, month: now.getMonth() + 1, year: now.getFullYear() },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.expense.findMany({
      where: { 
        workspaceId, 
        date: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } 
      },
      select: { date: true, amount: true }
    })
  ]);

  // Process last 7 days
  const last7DaysMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    last7DaysMap.set(dateStr, 0);
  }

  expensesLast7Days.forEach(exp => {
    const dateStr = exp.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (last7DaysMap.has(dateStr)) {
      last7DaysMap.set(dateStr, last7DaysMap.get(dateStr)! + Number(exp.amount));
    }
  });

  const last7Days = Array.from(last7DaysMap.entries()).map(([date, amount]) => ({ date, amount }));

  return NextResponse.json({
    totalSpent: Number(monthlyTotal._sum.amount || 0),
    workspaceName: workspace?.name || 'Cá nhân',
    budgetLimit: budget ? Number(budget.limit) : null,
    categoryBreakdown: categoryBreakdown.map(c => ({
      category: c.category || 'Khác',
      total: Number(c._sum.amount || 0)
    })).sort((a, b) => b.total - a.total),
    last7Days
  });
}
