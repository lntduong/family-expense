import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProgress } from '@/components/widgets/BudgetProgress';
import { Charts } from '@/components/widgets/Charts';
import { MonthCalendar } from '@/components/widgets/MonthCalendar';
import { MonthComparison } from '@/components/widgets/MonthComparison';
import { BudgetWarning } from '@/components/widgets/BudgetWarning';
import { SpendingPrediction } from '@/components/widgets/SpendingPrediction';

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

	const [
		monthlyTotal,
		budget,
		categories,
		yearExpenses,
		rawExpenses,
		prevMonthTotal,
		prevCategories,
	] = await Promise.all([
		prisma.expense.aggregate({
			_sum: { amount: true },
			where: { userId, date: { gte: monthStart, lte: monthEnd } },
		}),
		prisma.budget.findFirst({
			where: { userId, month: targetMonth + 1, year: targetYear },
		}),
		prisma.expense.groupBy({
			by: ['category'],
			_sum: { amount: true },
			where: { userId, date: { gte: monthStart, lte: monthEnd } },
		}),
		prisma.expense.findMany({
			where: { userId, date: { gte: yearStart, lte: yearEnd } },
			select: { date: true, amount: true },
		}),
		prisma.expense.findMany({
			where: { userId, date: { gte: monthStart, lte: monthEnd } },
			select: { date: true, amount: true },
		}),
		// Previous month data
		prisma.expense.aggregate({
			_sum: { amount: true },
			where: { userId, date: { gte: prevMonthStart, lte: prevMonthEnd } },
		}),
		prisma.expense.groupBy({
			by: ['category'],
			_sum: { amount: true },
			where: { userId, date: { gte: prevMonthStart, lte: prevMonthEnd } },
		}),
	]);

	const serializedCategories = categories.map((cat) => ({
		category: cat.category || 'Khác',
		_sum: { amount: Number(cat._sum.amount || 0) },
	}));

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
	const highestCategory = serializedCategories.reduce<{ name: string; amount: number }>(
		(max, cat) =>
			cat._sum.amount > max.amount ? { name: cat.category || 'Khác', amount: cat._sum.amount } : max,
		{ name: '', amount: 0 },
	);

	// Comparison data
	const currentMonthData = {
		total,
		byCategory: categories.map(c => ({
			category: c.category || 'Khác',
			amount: Number(c._sum.amount || 0),
		})),
	};
	const previousMonthData = {
		total: prevTotal,
		byCategory: prevCategories.map(c => ({
			category: c.category || 'Khác',
			amount: Number(c._sum.amount || 0),
		})),
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
				<MonthCalendar
					currentMonth={targetMonth + 1}
					currentYear={targetYear}
				/>
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
								<div className='text-2xl font-bold capitalize'>
									{highestCategory.name === 'food'
										? 'Ăn uống'
										: highestCategory.name === 'shopping'
										? 'Mua sắm'
										: highestCategory.name === 'bills'
										? 'Hóa đơn'
										: highestCategory.name === 'kids'
										? 'Con cái'
										: highestCategory.name}
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
