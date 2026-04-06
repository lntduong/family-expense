'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrashIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
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

function getExpenseDisplay(exp: any) {
	// Priority 1: Use the linked Category object (categoryRef)
	if (exp.categoryRef) {
		return {
			icon: exp.categoryRef.icon || '📁',
			color: 'bg-primary/10 text-primary',
			name: exp.categoryRef.name,
			customColor: exp.categoryRef.color, // hex color for inline style
		};
	}
	// Priority 2: Use old string-based category field
	if (exp.category) {
		return { ...getCategoryDisplay(exp.category), customColor: undefined };
	}
	// Fallback
	return { icon: '📦', color: 'bg-gray-500/10 text-gray-600', name: 'Khác', customColor: undefined };
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
	const cat = getExpenseDisplay(exp);

	const handleDragEnd = (event: any, info: PanInfo) => {
		if (info.offset.x < -100 && userRole !== 'HUSBAND') {
			onDelete(exp.id);
		}
	};

	const canDelete = userRole !== 'HUSBAND';

	return (
		<div className='relative overflow-hidden rounded-xl'>
			{canDelete && (
				<div className='absolute inset-0 flex items-center justify-end pr-6 rounded-xl bg-red-500'>
					<TrashIcon className='h-6 w-6 text-white' />
				</div>
			)}
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
				<div
					className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${cat.customColor ? '' : cat.color}`}
					style={cat.customColor ? { backgroundColor: cat.customColor + '20', color: cat.customColor } : undefined}
				>
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

const DATES_PER_PAGE = 5;

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
	const [page, setPage] = useState(1);

	useEffect(() => setItems(initial), [initial]);

	// Reset về trang 1 khi search
	useEffect(() => { setPage(1); }, [query]);

	const filtered = items.filter(
		(i) =>
			i.note?.toLowerCase().includes(query.toLowerCase()) ||
			i.category?.toLowerCase().includes(query.toLowerCase()),
	);

	// Group by date
	const groupedByDate = useMemo(() => {
		return filtered.reduce((acc, exp) => {
			const d = new Date(exp.date);
			const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
			if (!acc[dateKey]) acc[dateKey] = [];
			acc[dateKey].push(exp);
			return acc;
		}, {} as Record<string, any[]>);
	}, [filtered]);

	const sortedDates = useMemo(
		() => Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a)),
		[groupedByDate]
	);

	// Pagination
	const totalPages = Math.max(1, Math.ceil(sortedDates.length / DATES_PER_PAGE));
	const pagedDates = sortedDates.slice((page - 1) * DATES_PER_PAGE, page * DATES_PER_PAGE);

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
				<>
					<div className='space-y-6'>
						{pagedDates.map((dateKey) => {
							const dayExpenses = groupedByDate[dateKey];
							const dayTotal = dayExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
							const [year, month, day] = dateKey.split('-').map(Number);
							const dateObj = new Date(year, month - 1, day);

							return (
								<div key={dateKey} className='space-y-2'>
									{/* Date Header */}
									<div className='flex items-center justify-between py-2 border-b border-border/50'>
										<div className='flex items-center gap-3'>
											<div className='h-10 w-10 rounded-xl bg-muted flex items-center justify-center'>
												<span className='text-lg font-bold'>{day}</span>
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

					{/* Pagination */}
					{totalPages > 1 && (
						<div className='flex items-center justify-between pt-4 border-t border-border/50'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className='gap-1'
							>
								<ChevronLeftIcon className='h-4 w-4' />
								Trước
							</Button>

							{/* Page numbers */}
							<div className='flex items-center gap-1'>
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
									// Show first, last, current ±1
									const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
									const showEllipsisBefore = p === page - 2 && p > 2;
									const showEllipsisAfter = p === page + 2 && p < totalPages - 1;

									if (showEllipsisBefore || showEllipsisAfter) {
										return <span key={p} className='px-1 text-muted-foreground text-sm'>…</span>;
									}
									if (!show) return null;

									return (
										<button
											key={p}
											onClick={() => setPage(p)}
											className={`h-8 w-8 rounded-lg text-sm font-medium transition-all ${
												p === page
													? 'bg-primary text-primary-foreground shadow-sm'
													: 'hover:bg-muted text-muted-foreground hover:text-foreground'
											}`}
										>
											{p}
										</button>
									);
								})}
							</div>

							<Button
								variant='outline'
								size='sm'
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className='gap-1'
							>
								Sau
								<ChevronRightIcon className='h-4 w-4' />
							</Button>
						</div>
					)}

					{/* Summary */}
					<p className='text-center text-xs text-muted-foreground'>
						Trang {page}/{totalPages} • {sortedDates.length} ngày • {filtered.length} khoản
					</p>
				</>
			)}
		</div>
	);
}
