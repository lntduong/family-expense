import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getCurrentWorkspaceId } from '@/lib/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProgress } from '@/components/widgets/BudgetProgress';
import { MonthCalendar } from '@/components/widgets/MonthCalendar';
import { BudgetWarning } from '@/components/widgets/BudgetWarning';
import { 
	ChartsSkeleton, 
	MonthComparisonSkeleton, 
	SpendingPredictionSkeleton,
	MonthCalendarSkeleton 
} from '@/components/widgets/Skeletons';

// Dynamic imports for heavy components
const Charts = dynamic(() => import('@/components/widgets/Charts').then(mod => ({ default: mod.Charts })), {
	loading: () => <ChartsSkeleton />,
	ssr: false,
});

const MonthComparison = dynamic(() => import('@/components/widgets/MonthComparison').then(mod => ({ default: mod.MonthComparison })), {
	loading: () => <MonthComparisonSkeleton />,
});

const SpendingPrediction = dynamic(() => import('@/components/widgets/SpendingPrediction').then(mod => ({ default: mod.SpendingPrediction })), {
	loading: () => <SpendingPredictionSkeleton />,
});

export default async function AnalyticsPage({
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

	// Previous month for comparison
	const prevMonthDate = new Date(targetYear, targetMonth - 1, 1);
	const prevMonth = prevMonthDate.getMonth();
	const prevYear = prevMonthDate.getFullYear();
	const prevMonthStart = new Date(prevYear, prevMonth, 1);
	const prevMonthEnd = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);

	// for yearly chart
	const yearStart = new Date(targetYear, 0, 1);
	const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);

	const workspaceId = await getCurrentWorkspaceId(userId);
	if (!workspaceId) {
		return (
			<div className="flex h-[50vh] items-center justify-center text-muted-foreground">
				Chưa có nhóm Không gian làm việc.
			</div>
		);
	}

	const [
		monthlyTotal,
		budget,
		monthExpenses,
		yearExpenses,
		rawExpenses,
		prevMonthTotal,
		prevMonthExpenses,
		userCategories,
	] = await Promise.all([
		prisma.expense.aggregate({
			_sum: { amount: true },
			where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
		}),
		prisma.budget.findFirst({
			where: { workspaceId, month: targetMonth + 1, year: targetYear },
		}),
		// Full expenses this month with categoryRef for grouping
		prisma.expense.findMany({
			where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
			select: { amount: true, category: true, categoryId: true, categoryRef: { select: { name: true, icon: true, color: true } } },
		}),
		prisma.expense.findMany({
			where: { workspaceId, date: { gte: yearStart, lte: yearEnd } },
			select: { date: true, amount: true },
		}),
		prisma.expense.findMany({
			where: { workspaceId, date: { gte: monthStart, lte: monthEnd } },
			select: { date: true, amount: true },
		}),
		// Previous month data
		prisma.expense.aggregate({
			_sum: { amount: true },
			where: { workspaceId, date: { gte: prevMonthStart, lte: prevMonthEnd } },
		}),
		prisma.expense.findMany({
			where: { workspaceId, date: { gte: prevMonthStart, lte: prevMonthEnd } },
			select: { amount: true, category: true, categoryId: true, categoryRef: { select: { name: true } } },
		}),
		// User custom categories for reference
		prisma.category.findMany({
			where: { workspaceId },
			select: { id: true, name: true, icon: true, color: true },
		}),
	]);

	// Helper: get display name for an expense row
	function getCatName(exp: { category: string | null; categoryRef: { name: string } | null }): string {
		if (exp.categoryRef?.name) return exp.categoryRef.name;
		if (exp.category) return exp.category;
		return 'Khác';
	}

	// Build category summary by grouping manually (supports both old & new category system)
	const catMap = new Map<string, { name: string; icon: string; color: string; amount: number }>();
	for (const exp of monthExpenses) {
		const name = getCatName(exp);
		const existing = catMap.get(name);
		// Find icon/color: from categoryRef first, then userCategories lookup
		const userCat = exp.categoryRef
			? userCategories.find((c) => c.name === exp.categoryRef!.name)
			: userCategories.find((c) => c.name === exp.category);
		const icon = exp.categoryRef?.icon || userCat?.icon || '📦';
		const color = exp.categoryRef?.color || userCat?.color || '#6b7280';
		if (existing) {
			existing.amount += Number(exp.amount);
		} else {
			catMap.set(name, { name, icon, color, amount: Number(exp.amount) });
		}
	}
	const serializedCategories = Array.from(catMap.values())
		.map((c) => ({ category: c.name, icon: c.icon, color: c.color, _sum: { amount: c.amount } }))
		.sort((a, b) => b._sum.amount - a._sum.amount);

	// Previous month category summary
	const prevCatMap = new Map<string, number>();
	for (const exp of prevMonthExpenses) {
		const name = getCatName(exp);
		prevCatMap.set(name, (prevCatMap.get(name) || 0) + Number(exp.amount));
	}
	const prevCategoriesSummary = Array.from(prevCatMap.entries()).map(([category, amount]) => ({ category, amount }));

	const total = Number(monthlyTotal._sum.amount || 0);
	const prevTotal = Number(prevMonthTotal._sum.amount || 0);

	// Daily Chart Data
	const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
	const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
		day: i + 1,
		total: 0,
	}));
	rawExpenses.forEach((exp) => {
		const day = exp.date.getDate();
		dailyData[day - 1].total += Number(exp.amount);
	});

	// Monthly Chart Data
	const monthlyChartData = Array.from({ length: 12 }, (_, i) => ({
		month: i + 1,
		total: 0,
	}));
	yearExpenses.forEach((exp) => {
		const m = exp.date.getMonth();
		monthlyChartData[m].total += Number(exp.amount);
	});

	// Calculate average daily spending
	const nonZeroDays = dailyData.filter((d) => d.total > 0).length;
	const averageDaily = nonZeroDays > 0 ? total / nonZeroDays : 0;

	// Find highest spending category
	const highestCategory = serializedCategories[0]
		? { name: serializedCategories[0].category, icon: serializedCategories[0].icon, amount: serializedCategories[0]._sum.amount }
		: { name: '', icon: '', amount: 0 };

	// Comparison data
	const currentMonthData = {
		total,
		byCategory: serializedCategories.map((c) => ({
			category: c.category,
			amount: c._sum.amount,
		})),
	};
	const previousMonthData = {
		total: prevTotal,
		byCategory: prevCategoriesSummary,
	};

	// Month names
	const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
		'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
	const currentMonthName = monthNames[targetMonth];
	const previousMonthName = monthNames[prevMonth];

	// Budget warning calculations
	const budgetLimit = budget ? Number(budget.limit) : 0;
	const currentDay = targetYear === now.getFullYear() && targetMonth === now.getMonth()
		? now.getDate()
		: daysInMonth;
	const daysLeft = Math.max(0, daysInMonth - currentDay);


	return (
		<div className='space-y-6'>
			<div className='flex flex-col gap-4'>
				<h1 className='text-3xl font-bold tracking-tight'>
					Thống kê & Phân tích
				</h1>
				<Suspense fallback={<MonthCalendarSkeleton />}>
					<MonthCalendar
						currentMonth={targetMonth + 1}
						currentYear={targetYear}
					/>
				</Suspense>
			</div>

			{/* Budget Warning - Shows at top if near/over budget */}
			{budget && (
				<BudgetWarning
					current={total}
					limit={budgetLimit}
					daysLeft={daysLeft}
					dailyAverage={averageDaily}
				/>
			)}

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
					<CardHeader>
						<CardTitle className='text-sm font-semibold text-muted-foreground'>Tổng chi tiêu</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
							{total.toLocaleString('vi-VN')} ₫
						</div>
						<p className='text-xs text-muted-foreground mt-2 font-medium'>
							TB {averageDaily.toLocaleString('vi-VN')} ₫/ngày
						</p>
					</CardContent>
				</Card>

				<Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
					<CardHeader>
						<CardTitle className='text-sm font-semibold text-muted-foreground'>
							Ngân sách tháng
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						{budget ? (
							<>
								<div className='text-2xl font-bold'>
									{Number(budget.limit).toLocaleString('vi-VN')} ₫
								</div>
								<BudgetProgress current={total} limit={Number(budget.limit)} />
							</>
						) : (
							<p className='text-sm text-muted-foreground'>
								Chưa đặt ngân sách
							</p>
						)}
					</CardContent>
				</Card>

				<Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
					<CardHeader>
						<CardTitle className='text-sm font-semibold text-muted-foreground'>
							Danh mục chi nhiều nhất
						</CardTitle>
					</CardHeader>
					<CardContent>
						{highestCategory.name ? (
							<>
								<div className='flex items-center gap-2'>
									{highestCategory.icon && (
										<span className='text-2xl'>{highestCategory.icon}</span>
									)}
									<div className='text-2xl font-bold'>{highestCategory.name}</div>
								</div>
								<p className='text-xs text-muted-foreground mt-2 font-medium'>
									{highestCategory.amount.toLocaleString('vi-VN')} ₫
								</p>
							</>
						) : (
							<p className='text-sm text-muted-foreground'>Chưa có dữ liệu</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Spending Prediction */}
			<SpendingPrediction
				dailyData={dailyData}
				budget={budgetLimit || null}
				currentTotal={total}
				daysInMonth={daysInMonth}
				currentDay={currentDay}
			/>

			{/* Month Comparison */}
			<MonthComparison
				currentMonth={currentMonthData}
				previousMonth={previousMonthData}
				currentMonthName={currentMonthName}
				previousMonthName={previousMonthName}
			/>

			{/* Charts */}
			<Charts
				pieData={serializedCategories}
				dailyData={dailyData}
				monthlyData={monthlyChartData}
			/>
		</div>
	);
}
