'use client';

import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Tooltip,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	BarChart,
	Bar,
	Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = [
	'#0EA5E9',
	'#6366F1',
	'#22C55E',
	'#F97316',
	'#E11D48',
	'#14B8A6',
];

export function Charts({
	pieData,
	dailyData,
	monthlyData,
}: {
	pieData: { category: string; _sum: { amount: number } }[];
	dailyData: { day: number; total: number }[];
	monthlyData: { month: number; total: number }[];
}) {
	const pData = pieData.map((d) => ({
		name: d.category,
		value: d._sum.amount,
	}));

	const formatCurrency = (value: number) => {
		if (value >= 1000000) return `${(value / 1000000).toFixed(1)}Tr`;
		if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
		return value.toString();
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className='bg-background border rounded-lg shadow-sm p-3 text-sm'>
					<p className='font-semibold mb-1'>{`Ngày ${label}`}</p>
					<p className='text-primary'>
						{`Chi tiêu: ${payload[0].value.toLocaleString('vi-VN')} đ`}
					</p>
				</div>
			);
		}
		return null;
	};

	const MonthlyTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className='bg-background border rounded-lg shadow-sm p-3 text-sm'>
					<p className='font-semibold mb-1'>{`Tháng ${label}`}</p>
					<p className='text-primary'>
						{`Tổng chi: ${payload[0].value.toLocaleString('vi-VN')} đ`}
					</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
			{/* 1. Biểu đồ chi tiêu hàng ngày trong tháng */}
			<Card className='md:col-span-2 glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
				<CardHeader>
					<CardTitle>Chi tiết mức chi hàng ngày</CardTitle>
				</CardHeader>
				<CardContent className='h-64'>
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart data={dailyData}>
							<CartesianGrid
								strokeDasharray='3 3'
								vertical={false}
								opacity={0.3}
							/>
							<XAxis
								dataKey='day'
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12 }}
							/>
							<YAxis
								tickFormatter={formatCurrency}
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12 }}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar
								dataKey='total'
								fill='#0EA5E9'
								radius={[4, 4, 0, 0]}
								maxBarSize={30}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* 2. Biểu đồ Trend chi tiêu các tháng trong năm */}
			<Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
				<CardHeader>
					<CardTitle className='text-lg font-semibold'>Biến động chi tiêu nguyên năm</CardTitle>
				</CardHeader>
				<CardContent className='h-64'>
					<ResponsiveContainer width='100%' height='100%'>
						<LineChart data={monthlyData}>
							<CartesianGrid
								strokeDasharray='3 3'
								vertical={false}
								opacity={0.1}
							/>
							<XAxis
								dataKey='month'
								tickFormatter={(val) => `T${val}`}
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12 }}
							/>
							<YAxis
								tickFormatter={formatCurrency}
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12 }}
								width={45}
							/>
							<Tooltip content={<MonthlyTooltip />} />
							<Line
								type='monotone'
								dataKey='total'
								stroke='hsl(var(--primary))'
								strokeWidth={3}
								dot={{ r: 4, fill: 'hsl(var(--primary))' }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* 3. Biểu đồ tròn Danh mục */}
			<Card className='glass-card macos-shadow hover:macos-shadow-lg transition-shadow duration-300'>
				<CardHeader>
					<CardTitle className='text-lg font-semibold'>Chi theo danh mục</CardTitle>
				</CardHeader>
				<CardContent className='h-64'>
					<ResponsiveContainer width='100%' height='100%'>
						<PieChart>
							<Pie
								data={pData}
								dataKey='value'
								nameKey='name'
								cx='50%'
								cy='50%'
								innerRadius={50}
								outerRadius={80}
							>
								{pData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								formatter={(value: number) =>
									`${value.toLocaleString('vi-VN')} đ`
								}
							/>
							<Legend wrapperStyle={{ fontSize: '12px' }} />
						</PieChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}
