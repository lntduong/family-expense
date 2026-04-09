import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
import { SettlementCalculator } from '@/components/widgets/SettlementCalculator';
import { MonthCalendar } from '@/components/widgets/MonthCalendar';

export default async function SettlementPage({
	searchParams,
}: {
	searchParams: { month?: string; year?: string };
}) {
	const session = await getServerSession(authOptions);
	const userId = session?.user?.id as string;

	const now = new Date();
	const targetMonth = searchParams.month
		? parseInt(searchParams.month) - 1
		: now.getMonth();
	const targetYear = searchParams.year
		? parseInt(searchParams.year)
		: now.getFullYear();

	const monthStart = new Date(targetYear, targetMonth, 1);
	const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

	const workspaceId = await getCurrentWorkspaceId(userId);

	if (!workspaceId) {
		return (
			<div className="flex h-[50vh] items-center justify-center text-muted-foreground">
				Chưa có nhóm Không gian làm việc.
			</div>
		);
	}

	const [totalAgg, expenses] = await Promise.all([
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

	const full = Number(totalAgg._sum.amount || 0);

	// Group manually using categoryRef (new system) with fallback to old string
	const catMap = new Map<string, { category: string; icon: string; color: string; amount: number }>();
	for (const exp of expenses) {
		const name = exp.categoryRef?.name || exp.category || 'Khác';
		const icon = exp.categoryRef?.icon || '📦';
		const color = exp.categoryRef?.color || '#6b7280';
		const existing = catMap.get(name);
		if (existing) {
			existing.amount += Number(exp.amount);
		} else {
			catMap.set(name, { category: name, icon, color, amount: Number(exp.amount) });
		}
	}

	const serializedCategories = Array.from(catMap.values())
		.sort((a, b) => b.amount - a.amount);

	return (
		<div className='space-y-4'>
			<div className='flex flex-col gap-4'>
				<h1 className='text-2xl font-bold tracking-tight'>Kết toán</h1>
				<MonthCalendar currentMonth={targetMonth + 1} currentYear={targetYear} />
			</div>

			<SettlementCalculator total={full} categories={serializedCategories} />
		</div>
	);
}

