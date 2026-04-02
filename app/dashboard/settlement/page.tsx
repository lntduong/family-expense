import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
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

	const [total, byCategory] = await Promise.all([
		prisma.expense.aggregate({
			_sum: { amount: true },
			where: { userId, date: { gte: monthStart, lte: monthEnd } },
		}),
		prisma.expense.groupBy({
			by: ['category'],
			_sum: { amount: true },
			where: { userId, date: { gte: monthStart, lte: monthEnd } },
		}),
	]);

	const full = Number(total._sum.amount || 0);
	const serializedCategories = byCategory.map((c) => ({
		category: c.category,
		amount: Number(c._sum.amount || 0),
	}));

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
