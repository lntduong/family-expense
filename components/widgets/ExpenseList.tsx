'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrashIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, useMotionValue, PanInfo } from 'framer-motion';

// Category display mapping
const CATEGORY_DISPLAY: Record<string, { icon: string; color: string; name: string }> = {
	food: { icon: '🍜', color: 'bg-orange-500/10 text-orange-600', name: 'Ăn uống' },
	shopping: { icon: '🛒', color: 'bg-blue-500/10 text-blue-600', name: 'Mua sắm' },
	bills: { icon: '💡', color: 'bg-yellow-500/10 text-yellow-600', name: 'Hóa đơn' },
	transport: { icon: '🚗', color: 'bg-green-500/10 text-green-600', name: 'Di chuyển' },
	entertainment: { icon: '🎮', color: 'bg-purple-500/10 text-purple-600', name: 'Giải trí' },
	health: { icon: '💊', color: 'bg-red-500/10 text-red-600', name: 'Sức khỏe' },
	kids: { icon: '👶', color: 'bg-pink-500/10 text-pink-600', name: 'Con cái' },
	other: { icon: '📦', color: 'bg-gray-500/10 text-gray-600', name: 'Khác' },
};

function getCategoryDisplay(category: string) {
	return CATEGORY_DISPLAY[category?.toLowerCase()] || {
		icon: '📁',
		color: 'bg-primary/10 text-primary',
		name: category || 'Khác',
	};
}

// Swipeable expense item component
function SwipeableExpenseItem({
	exp,
	userRole,
	onDelete,
}: {
	exp: any;
	userRole?: string;
	onDelete: (id: string) => void;
}) {
	const x = useMotionValue(0);
	const cat = getCategoryDisplay(exp.category);

	const handleDragEnd = (event: any, info: PanInfo) => {
		if (info.offset.x < -100 && userRole !== 'HUSBAND') {
			onDelete(exp.id);
		}
	};

	const canDelete = userRole !== 'HUSBAND';

	return (
		<div className='relative overflow-hidden rounded-xl'>
			{/* Delete background - simplified, no motion transforms */}
			{canDelete && (
				<div className='absolute inset-0 flex items-center justify-end pr-6 rounded-xl bg-red-500'>
					<TrashIcon className='h-6 w-6 text-white' />
				</div>
			)}

			{/* Swipeable content - optimized */}
			<motion.div
				layout={false}
				drag={canDelete ? 'x' : false}
				dragConstraints={{ left: -120, right: 0 }}
				dragElastic={0}
				dragMomentum={false}
				onDragEnd={handleDragEnd}
				style={{ x, willChange: 'transform' }}
				className='flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50 hover:border-border relative cursor-grab active:cursor-grabbing'
			>
				{/* Category Icon */}
				<div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${cat.color}`}>
					{cat.icon}
				</div>

				{/* Info */}
				<div className='flex-1 min-w-0'>
					<p className='font-medium truncate'>
						{exp.note || cat.name}
					</p>
					<p className='text-xs text-muted-foreground'>
						{cat.name} • {format(new Date(exp.date), 'HH:mm')}
					</p>
				</div>

				{/* Amount */}
				<div className='shrink-0'>
					<p className='font-semibold'>
						-{Number(exp.amount).toLocaleString('vi-VN')} ₫
					</p>
				</div>
			</motion.div>
		</div>
	);
}

export function ExpenseList({
	initial,
	userRole,
}: {
	initial: any[];
	userRole?: string;
}) {
	const router = useRouter();
	const [items, setItems] = useState(initial);
	const [query, setQuery] = useState('');

	useEffect(() => setItems(initial), [initial]);

	const filtered = items.filter(
		(i) =>
			i.note?.toLowerCase().includes(query.toLowerCase()) ||
			i.category?.toLowerCase().includes(query.toLowerCase()),
	);

	// Group by date
	const groupedByDate = filtered.reduce((acc, exp) => {
		const dateKey = format(new Date(exp.date), 'yyyy-MM-dd');
		if (!acc[dateKey]) {
			acc[dateKey] = [];
		}
		acc[dateKey].push(exp);
		return acc;
	}, {} as Record<string, any[]>);

	const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

	async function remove(id: string) {
		const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
		if (res.ok) {
			setItems((prev) => prev.filter((i) => i.id !== id));
			router.refresh();
		}
	}

	return (
		<div className='glass-card macos-shadow-md p-6 space-y-4'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
				<div>
					<h2 className='text-lg font-semibold'>Lịch sử chi tiêu</h2>
					{userRole !== 'HUSBAND' && (
						<p className='text-xs text-muted-foreground'>← Vuốt trái để xóa</p>
					)}
				</div>
				<div className='relative'>
					<MagnifyingGlassIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Tìm kiếm...'
						className='pl-9 w-full sm:w-64'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Expense List */}
			{filtered.length === 0 ? (
				<div className='text-center py-12 text-muted-foreground'>
					<p className='text-4xl mb-2'>📭</p>
					<p>Chưa có khoản chi nào</p>
				</div>
			) : (
				<div className='space-y-6'>
					{sortedDates.map((dateKey) => {
						const dayExpenses = groupedByDate[dateKey];
						const dayTotal = dayExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
						const dateObj = new Date(dateKey);
						
						return (
							<div key={dateKey} className='space-y-2'>
								{/* Date Header */}
								<div className='flex items-center justify-between py-2 border-b border-border/50'>
									<div className='flex items-center gap-3'>
										<div className='h-10 w-10 rounded-xl bg-muted flex items-center justify-center'>
											<span className='text-lg font-bold'>{format(dateObj, 'd')}</span>
										</div>
										<div>
											<p className='font-medium'>{format(dateObj, 'EEEE', { locale: vi })}</p>
											<p className='text-xs text-muted-foreground'>
												{format(dateObj, 'MMMM yyyy', { locale: vi })}
											</p>
										</div>
									</div>
									<p className='font-semibold text-primary'>
										-{dayTotal.toLocaleString('vi-VN')} ₫
									</p>
								</div>

								{/* Expenses for this date */}
								<div className='space-y-2 pl-2'>
									{dayExpenses.map((exp: any) => (
										<SwipeableExpenseItem
											key={exp.id}
											exp={exp}
											userRole={userRole}
											onDelete={remove}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
