import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const workspaceId = await getCurrentWorkspaceId(session.user.id);
  if (!workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  
  const targetMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) - 1 : now.getMonth();
  const targetYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : now.getFullYear();

  const monthStart = new Date(targetYear, targetMonth, 1);
  const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
  const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;
  const prevMonthStart = new Date(prevYear, prevMonth, 1);
  const prevMonthEnd = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);

  const yearStart = new Date(targetYear, 0, 1);
  const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);

  const [
    monthlyTotal,
    prevMonthTotal,
    userCategories,
    budget,
    monthExpenses,
    prevMonthExpenses,
    yearExpenses,
  ] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { workspaceId, date: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),
    prisma.category.findMany({ where: { workspaceId } }),
    prisma.budget.findFirst({
      where: { workspaceId, month: targetMonth + 1, year: targetYear },
    }),
    prisma.expense.findMany({
      where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
      include: { categoryRef: true },
    }),
    prisma.expense.findMany({
      where: { workspaceId, date: { gte: prevMonthStart, lte: prevMonthEnd } },
      include: { categoryRef: true },
    }),
    prisma.expense.findMany({
      where: { workspaceId, date: { gte: yearStart, lte: yearEnd } },
      select: { date: true, amount: true }
    }),
  ]);

  const getCatName = (exp: any) => exp.categoryRef?.name || exp.category;

  const catMap = new Map<string, { amount: number, icon: string }>();
  const ruleSpent = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };
  
  for (const exp of monthExpenses) {
    const name = getCatName(exp);
    const userCat = exp.categoryRef
      ? userCategories.find((c) => c.name === exp.categoryRef!.name)
      : userCategories.find((c) => c.name === exp.category);
      
    const icon = exp.categoryRef?.icon || userCat?.icon || '📦';
    const amount = Number(exp.amount);
    
    if (catMap.has(name)) {
      catMap.get(name)!.amount += amount;
    } else {
      catMap.set(name, { amount, icon });
    }

    const ruleType = exp.categoryRef?.ruleType || userCat?.ruleType || 'NEEDS';
    ruleSpent[ruleType as keyof typeof ruleSpent] += amount;
  }

  const serializedCategories = Array.from(catMap.entries()).map(([category, data]) => ({
    category,
    icon: data.icon,
    _sum: { amount: data.amount }
  })).sort((a, b) => b._sum.amount - a._sum.amount);

  const prevCatMap = new Map<string, number>();
  for (const exp of prevMonthExpenses) {
    const name = getCatName(exp);
    prevCatMap.set(name, (prevCatMap.get(name) || 0) + Number(exp.amount));
  }
  const prevCategoriesSummary = Array.from(prevCatMap.entries()).map(([category, amount]) => ({ category, amount }));

  const total = Number(monthlyTotal._sum.amount || 0);
  const prevTotal = Number(prevMonthTotal._sum.amount || 0);

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    total: 0,
  }));

  const dayOfWeekTotals = new Array(7).fill(0);

  for (const exp of monthExpenses) {
    const day = exp.date.getDate();
    const amount = Number(exp.amount);
    dailyData[day - 1].total += amount;
    dayOfWeekTotals[exp.date.getDay()] += amount;
  }

  const monthlyChartData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: 0,
  }));

  const heatmapDailyMap: Record<string, number> = {};
  for (const exp of yearExpenses) {
    const m = exp.date.getMonth();
    monthlyChartData[m].total += Number(exp.amount);
    // Format YYYY-MM-DD in local time
    const y = exp.date.getFullYear();
    const mm = String(exp.date.getMonth() + 1).padStart(2, '0');
    const dd = String(exp.date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${mm}-${dd}`;
    heatmapDailyMap[dateStr] = (heatmapDailyMap[dateStr] || 0) + Number(exp.amount);
  }

  const top5Transactions = monthExpenses
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map(exp => {
      const name = getCatName(exp);
      const userCat = exp.categoryRef
        ? userCategories.find((c) => c.name === exp.categoryRef!.name)
        : userCategories.find((c) => c.name === exp.category);
      return {
        id: exp.id,
        amount: Number(exp.amount),
        date: exp.date.toLocaleDateString('vi-VN'),
        note: exp.note,
        categoryName: name,
        categoryIcon: exp.categoryRef?.icon || userCat?.icon || '📦',
      };
    });

  return NextResponse.json({
    total,
    prevTotal,
    budget: budget ? Number(budget.limit) : null,
    serializedCategories,
    prevCategoriesSummary,
    ruleSpent,
    dailyData,
    dayOfWeekTotals,
    monthlyChartData,
    heatmapDailyMap,
    top5Transactions,
    daysInMonth,
    currentDay: targetYear === now.getFullYear() && targetMonth === now.getMonth() ? now.getDate() : daysInMonth,
    targetMonth: targetMonth + 1,
    targetYear
  });
}
