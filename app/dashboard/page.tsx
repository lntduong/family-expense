import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetProgress } from '@/components/widgets/BudgetProgress';
import { ExpenseList } from '@/components/widgets/ExpenseList';
import { QuickAdd } from '@/components/widgets/QuickAdd';
import { BudgetForm } from '@/components/widgets/BudgetForm';
import { BudgetWarning } from '@/components/widgets/BudgetWarning';

import { MonthCalendar } from '@/components/widgets/MonthCalendar';

export default async function DashboardPage({
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
	const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

	const [monthlyTotal, budget, rawExpenses, categories] =
		await Promise.all([
			prisma.expense.aggregate({
				_sum: { amount: true },
				where: { userId, date: { gte: monthStart, lte: monthEnd } },
			}),
			prisma.budget.findFirst({
				where: { userId, month: targetMonth + 1, year: targetYear },
			}),
			prisma.expense.findMany({
				where: { userId, date: { gte: monthStart, lte: monthEnd } },
				orderBy: { date: 'desc' },
			}),
			prisma.expense.groupBy({
				by: ['category'],
				_sum: { amount: true },
				where: { userId, date: { gte: monthStart, lte: monthEnd } },
			}),
		]);

	const expenses = rawExpenses
		.map((exp) => ({
			...exp,
			amount: Number(exp.amount),
		}))
		.slice(0, 10);

	const total = Number(monthlyTotal._sum.amount || 0);

	// Budget warning calculations
	const currentDay = targetYear === now.getFullYear() && targetMonth === now.getMonth()
		? now.getDate()
		: daysInMonth;
	const daysLeft = Math.max(0, daysInMonth - currentDay);
	const nonZeroDays = rawExpenses.length > 0 
		? new Set(rawExpenses.map(e => e.date.getDate())).size 
		: 1;
	const avgDaily = total / nonZeroDays;

	return (
		<div className='space-y-6 pb-20'>
			{/* Budget Warning - Shows prominently if over budget */}
			{budget && (
				<BudgetWarning
					current={total}
					limit={Number(budget.limit)}
					daysLeft={daysLeft}
					dailyAverage={avgDaily}
				/>
			)}

			{/* Quick Add - First thing user sees */}
			<div className='glass-card macos-shadow-md p-6'>
				<h2 className='text-lg font-semibold mb-4'>Ghi nhanh chi tiêu</h2>
				<QuickAdd userId={userId} />
			</div>

			{/* Month Calendar */}
			<MonthCalendar
				currentMonth={targetMonth + 1}
				currentYear={targetYear}
			/>

			{/* Stats Cards */}
			<div className='grid grid-cols-2 gap-4'>
				<Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-xs font-semibold text-muted-foreground'>Đã chi tháng này</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate'>
							{total >= 1000000000 
								? `${(total / 1000000000).toFixed(1)}tỷ`
								: total >= 1000000 
								? `${(total / 1000000).toFixed(1)}tr`
								: total.toLocaleString('vi-VN')} ₫
						</p>
					</CardContent>
				</Card>
				<Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-xs font-semibold text-muted-foreground'>Ngân sách</CardTitle>
					</CardHeader>
					<CardContent>
						{budget ? (
							<div className='space-y-2'>
								<p className='text-lg sm:text-2xl font-bold truncate'>
									{Number(budget.limit) >= 1000000000 
										? `${(Number(budget.limit) / 1000000000).toFixed(1)}tỷ`
										: Number(budget.limit) >= 1000000 
										? `${(Number(budget.limit) / 1000000).toFixed(1)}tr`
										: Number(budget.limit).toLocaleString('vi-VN')} ₫
								</p>
								<BudgetProgress current={total} limit={Number(budget.limit)} />
							</div>
						) : (
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>Chưa đặt</p>
								<BudgetForm month={targetMonth + 1} year={targetYear} />
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Expense History */}
			<ExpenseList initial={expenses} userRole={(session?.user as any)?.role} />
		</div>
	);
}
