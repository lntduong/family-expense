import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = await getCurrentWorkspaceId(session.user.id);
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const targetMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) - 1 : now.getMonth();
    const targetYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : now.getFullYear();

    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const [workspace, totalAgg, expenses] = await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true }
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.expense.findMany({
        where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
        select: {
          amount: true,
          category: true,
          categoryRef: { select: { name: true, icon: true, color: true } },
        },
      }),
    ]);

    const total = Number(totalAgg._sum.amount || 0);

    const catMap = new Map<string, { category: string; icon: string; color: string; amount: number }>();
    for (const exp of expenses) {
      const name = exp.categoryRef?.name || exp.category || 'Khác';
      const icon = exp.categoryRef?.icon || '📦';
      const color = exp.categoryRef?.color || '#ea580c';
      const existing = catMap.get(name);
      if (existing) {
        existing.amount += Number(exp.amount);
      } else {
        catMap.set(name, { category: name, icon, color, amount: Number(exp.amount) });
      }
    }

    const categories = Array.from(catMap.values()).sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      workspaceName: workspace?.name || 'Gia đình',
      total,
      categories,
      month: targetMonth + 1,
      year: targetYear,
    });
  } catch (error: any) {
    console.error('Error fetching settlement:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
