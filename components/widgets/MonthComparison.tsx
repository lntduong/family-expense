'use client';

import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MonthComparisonProps {
	currentMonth: {
		total: number;
		byCategory: { category: string; amount: number }[];
	};
	previousMonth: {
		total: number;
		byCategory: { category: string; amount: number }[];
	};
	currentMonthName: string;
	previousMonthName: string;
}

export function MonthComparison({
	currentMonth,
	previousMonth,
	currentMonthName,
	previousMonthName,
}: MonthComparisonProps) {
	// Calculate difference
	const diff = currentMonth.total - previousMonth.total;
	const diffPercent = previousMonth.total > 0 
		? ((diff / previousMonth.total) * 100).toFixed(1)
		: currentMonth.total > 0 ? '100' : '0';
	
	const isIncrease = diff > 0;
	const isDecrease = diff < 0;

	// Prepare comparison data by category
	const categories = new Set([
		...currentMonth.byCategory.map(c => c.category),
		...previousMonth.byCategory.map(c => c.category),
	]);

	const comparisonData = Array.from(categories).map(cat => {
		const current = currentMonth.byCategory.find(c => c.category === cat)?.amount || 0;
		const previous = previousMonth.byCategory.find(c => c.category === cat)?.amount || 0;
		return {
			category: cat || 'Khác',
			[currentMonthName]: current,
			[previousMonthName]: previous,
		};
	}).filter(d => d[currentMonthName] > 0 || d[previousMonthName] > 0);

	const formatCurrency = (value: number) => {
		if (value >= 1000000) return `${(value / 1000000).toFixed(1)}Tr`;
		if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
		return value.toString();
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className='bg-background border rounded-lg shadow-lg p-3 text-sm'>
					<p className='font-semibold mb-2'>{label}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} style={{ color: entry.color }}>
							{entry.name}: {entry.value.toLocaleString('vi-VN')} ₫
						</p>
					))}
				</div>
			);
		}
		return null;
	};

	return (
		<Card className='glass-card macos-shadow'>
			<CardHeader>
				<CardTitle className='flex items-center justify-between'>
					<span>So sánh với tháng trước</span>
					<div className={`flex items-center gap-1 text-sm font-medium ${
						isIncrease ? 'text-red-500' : isDecrease ? 'text-green-500' : 'text-muted-foreground'
					}`}>
						{isIncrease ? (
							<TrendingUp className='w-4 h-4' />
						) : isDecrease ? (
							<TrendingDown className='w-4 h-4' />
						) : (
							<Minus className='w-4 h-4' />
						)}
						<span>{isIncrease ? '+' : ''}{diffPercent}%</span>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Summary */}
				<div className='grid grid-cols-2 gap-4'>
					<div className='p-3 rounded-lg bg-muted/50'>
						<p className='text-xs text-muted-foreground mb-1'>{previousMonthName}</p>
						<p className='text-lg font-bold'>
							{previousMonth.total.toLocaleString('vi-VN')} ₫
						</p>
					</div>
					<div className='p-3 rounded-lg bg-primary/10'>
						<p className='text-xs text-muted-foreground mb-1'>{currentMonthName}</p>
						<p className='text-lg font-bold'>
							{currentMonth.total.toLocaleString('vi-VN')} ₫
						</p>
					</div>
				</div>

				{/* Difference indicator */}
				<div className={`p-3 rounded-lg text-center ${
					isIncrease ? 'bg-red-500/10 text-red-600' : 
					isDecrease ? 'bg-green-500/10 text-green-600' : 
					'bg-muted text-muted-foreground'
				}`}>
					<p className='text-sm'>
						{isIncrease ? (
							<>Chi tiêu <strong>tăng {Math.abs(diff).toLocaleString('vi-VN')} ₫</strong></>
						) : isDecrease ? (
							<>Chi tiêu <strong>giảm {Math.abs(diff).toLocaleString('vi-VN')} ₫</strong> 🎉</>
						) : (
							<>Chi tiêu <strong>không đổi</strong></>
						)}
					</p>
				</div>

				{/* Chart */}
				{comparisonData.length > 0 && (
					<div className='h-64'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={comparisonData} layout='vertical'>
								<CartesianGrid strokeDasharray='3 3' horizontal={true} vertical={false} opacity={0.3} />
								<XAxis 
									type='number' 
									tickFormatter={formatCurrency}
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 11 }}
								/>
								<YAxis 
									type='category' 
									dataKey='category' 
									width={80}
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 11 }}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Legend wrapperStyle={{ fontSize: '12px' }} />
								<Bar 
									dataKey={previousMonthName} 
									fill='#94a3b8' 
									radius={[0, 4, 4, 0]}
									maxBarSize={20}
								/>
								<Bar 
									dataKey={currentMonthName} 
									fill='#0EA5E9' 
									radius={[0, 4, 4, 0]}
									maxBarSize={20}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
