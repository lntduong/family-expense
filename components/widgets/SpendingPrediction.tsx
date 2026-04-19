'use client';

import { useMemo } from 'react';
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ReferenceLine,
	CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SpendingPredictionProps {
	dailyData: { day: number; total: number }[];
	budget: number | null;
	currentTotal: number;
	daysInMonth: number;
	currentDay: number;
}

export function SpendingPrediction({
	dailyData,
	budget,
	currentTotal,
	daysInMonth,
	currentDay,
}: SpendingPredictionProps) {
	const prediction = useMemo(() => {
		// Calculate daily average from actual spending days
		const daysWithSpending = dailyData.filter(d => d.total > 0 && d.day <= currentDay);
		const activeDays = daysWithSpending.length || 1;
		const avgDaily = currentTotal / activeDays;
		
		// Calculate trend (simple linear regression)
		let trend = 0;
		if (daysWithSpending.length >= 3) {
			const recentDays = daysWithSpending.slice(-7); // Last 7 days with spending
			if (recentDays.length >= 3) {
				const n = recentDays.length;
				const sumX = recentDays.reduce((sum, _, i) => sum + i, 0);
				const sumY = recentDays.reduce((sum, d) => sum + d.total, 0);
				const sumXY = recentDays.reduce((sum, d, i) => sum + i * d.total, 0);
				const sumX2 = recentDays.reduce((sum, _, i) => sum + i * i, 0);
				
				const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
				trend = slope;
			}
		}

		// Predict remaining days
		const remainingDays = daysInMonth - currentDay;
		const predictedAdditional = avgDaily * remainingDays;
		const predictedTotal = currentTotal + predictedAdditional;
		
		// Trend-adjusted prediction
		const trendAdjusted = predictedTotal + (trend * remainingDays * 0.5);
		
		// Generate prediction data for chart
		const chartData = dailyData.map(d => ({
			day: d.day,
			actual: d.day <= currentDay ? d.total : null,
			cumulative: 0,
			predicted: null as number | null,
			predictedCumulative: null as number | null,
		}));

		// Calculate cumulative actual
		let cumulative = 0;
		chartData.forEach((d, i) => {
			if (d.actual !== null) {
				cumulative += d.actual;
				chartData[i].cumulative = cumulative;
			}
		});

		// Add predicted values for future days
		let predictedCumulative = currentTotal;
		for (let i = currentDay; i < daysInMonth; i++) {
			const predictedDaily = avgDaily + (trend * (i - currentDay) * 0.3);
			predictedCumulative += Math.max(0, predictedDaily);
			chartData[i].predicted = Math.max(0, predictedDaily);
			chartData[i].predictedCumulative = predictedCumulative;
		}

		return {
			avgDaily: Math.round(avgDaily),
			predictedTotal: Math.round(Math.max(currentTotal, trendAdjusted > 0 ? trendAdjusted : predictedTotal)),
			remainingDays,
			chartData,
			trend: trend > 100 ? 'increasing' : trend < -100 ? 'decreasing' : 'stable',
		};
	}, [dailyData, currentTotal, currentDay, daysInMonth]);

	const formatCurrency = (value: number) => {
		if (value >= 1000000) return `${(value / 1000000).toFixed(1)}Tr`;
		if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
		return value.toString();
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const actual = payload.find((p: any) => p.dataKey === 'cumulative');
			const predicted = payload.find((p: any) => p.dataKey === 'predictedCumulative');
			
			return (
				<div className='bg-background border rounded-lg shadow-lg p-3 text-sm'>
					<p className='font-semibold mb-2'>Ngày {label}</p>
					{actual?.value && (
						<p className='text-primary'>
							Thực tế: {actual.value.toLocaleString('vi-VN')} ₫
						</p>
					)}
					{predicted?.value && (
						<p className='text-orange-500'>
							Dự đoán: {predicted.value.toLocaleString('vi-VN')} ₫
						</p>
					)}
				</div>
			);
		}
		return null;
	};

	const willExceedBudget = budget && prediction.predictedTotal > budget;
	const budgetDiff = budget ? prediction.predictedTotal - budget : 0;

	return (
		<Card className='glass-card macos-shadow'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<TrendingUp className='h-5 w-5 text-primary' />
					Dự đoán chi tiêu cuối tháng
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Prediction Summary */}
				<div className='grid grid-cols-2 gap-4'>
					<div className='p-4 rounded-xl bg-muted/50'>
						<div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
							<Target className='h-4 w-4' />
							Hiện tại
						</div>
						<p className='text-lg sm:text-xl font-bold truncate' title={currentTotal.toLocaleString('vi-VN') + ' ₫'}>
							{currentTotal.toLocaleString('vi-VN')} ₫
						</p>
						<p className='text-xs text-muted-foreground truncate'>
							TB {prediction.avgDaily.toLocaleString('vi-VN')} ₫/ngày
						</p>
					</div>
					
					<div className={`p-4 rounded-xl ${
						willExceedBudget ? 'bg-red-500/10' : 'bg-green-500/10'
					}`}>
						<div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
							{willExceedBudget ? (
								<AlertCircle className='h-4 w-4 text-red-500' />
							) : (
								<CheckCircle2 className='h-4 w-4 text-green-500' />
							)}
							Dự đoán
						</div>
						<p 
              className={`text-lg sm:text-xl font-bold truncate ${
							  willExceedBudget ? 'text-red-600' : 'text-green-600'
						  }`}
              title={prediction.predictedTotal.toLocaleString('vi-VN') + ' ₫'}
            >
							{prediction.predictedTotal.toLocaleString('vi-VN')} ₫
						</p>
						<p className='text-xs text-muted-foreground truncate'>
							Còn {prediction.remainingDays} ngày
						</p>
					</div>
				</div>

				{/* Budget Warning */}
				{budget && (
					<div className={`p-3 rounded-lg text-sm ${
						willExceedBudget 
							? 'bg-red-500/10 text-red-600 dark:text-red-400' 
							: 'bg-green-500/10 text-green-600 dark:text-green-400'
					}`}>
						{willExceedBudget ? (
							<p>
								⚠️ Dự kiến <strong>vượt ngân sách {Math.abs(budgetDiff).toLocaleString('vi-VN')} ₫</strong>. 
								Cần giảm chi ~{Math.ceil(budgetDiff / prediction.remainingDays).toLocaleString('vi-VN')} ₫/ngày.
							</p>
						) : (
							<p>
								✅ Dự kiến <strong>tiết kiệm {Math.abs(budgetDiff).toLocaleString('vi-VN')} ₫</strong> so với ngân sách!
							</p>
						)}
					</div>
				)}

				{/* Trend Indicator */}
				<div className='flex items-center gap-2 text-sm'>
					<span className='text-muted-foreground'>Xu hướng:</span>
					<span className={`font-medium ${
						prediction.trend === 'increasing' ? 'text-red-500' :
						prediction.trend === 'decreasing' ? 'text-green-500' :
						'text-muted-foreground'
					}`}>
						{prediction.trend === 'increasing' && '📈 Đang tăng'}
						{prediction.trend === 'decreasing' && '📉 Đang giảm'}
						{prediction.trend === 'stable' && '➡️ Ổn định'}
					</span>
				</div>

				{/* Prediction Chart */}
				<div className='h-48'>
					<ResponsiveContainer width='100%' height='100%'>
						<AreaChart data={prediction.chartData}>
							<defs>
								<linearGradient id='colorActual' x1='0' y1='0' x2='0' y2='1'>
									<stop offset='5%' stopColor='#0EA5E9' stopOpacity={0.3}/>
									<stop offset='95%' stopColor='#0EA5E9' stopOpacity={0}/>
								</linearGradient>
								<linearGradient id='colorPredicted' x1='0' y1='0' x2='0' y2='1'>
									<stop offset='5%' stopColor='#F97316' stopOpacity={0.3}/>
									<stop offset='95%' stopColor='#F97316' stopOpacity={0}/>
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray='3 3' vertical={false} opacity={0.2} />
							<XAxis 
								dataKey='day' 
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10 }}
								tickFormatter={(val) => val % 5 === 0 ? val : ''}
							/>
							<YAxis 
								tickFormatter={formatCurrency}
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10 }}
								width={45}
							/>
							<Tooltip content={<CustomTooltip />} />
							
							{/* Budget line */}
							{budget && (
								<ReferenceLine 
									y={budget} 
									stroke='#EF4444' 
									strokeDasharray='5 5'
									label={{ value: 'Ngân sách', fontSize: 10, fill: '#EF4444' }}
								/>
							)}

							{/* Current day line */}
							<ReferenceLine 
								x={currentDay} 
								stroke='#6366F1' 
								strokeDasharray='3 3'
							/>

							{/* Actual cumulative spending */}
							<Area
								type='monotone'
								dataKey='cumulative'
								stroke='#0EA5E9'
								strokeWidth={2}
								fill='url(#colorActual)'
								connectNulls={false}
							/>
							
							{/* Predicted cumulative spending */}
							<Area
								type='monotone'
								dataKey='predictedCumulative'
								stroke='#F97316'
								strokeWidth={2}
								strokeDasharray='5 5'
								fill='url(#colorPredicted)'
								connectNulls={false}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				<div className='flex items-center gap-4 text-xs text-muted-foreground'>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-0.5 bg-[#0EA5E9]' />
						<span>Thực tế</span>
					</div>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-0.5 bg-[#F97316]' style={{ borderStyle: 'dashed' }} />
						<span>Dự đoán</span>
					</div>
					{budget && (
						<div className='flex items-center gap-1'>
							<div className='w-3 h-0.5 bg-red-500' style={{ borderStyle: 'dashed' }} />
							<span>Ngân sách</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
