'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/widgets/DatePicker';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type Category = {
	id: string;
	name: string;
	icon: string;
	color: string;
};

export function QuickAdd({ categories }: { categories: Category[] }) {
	const router = useRouter();
	const [amountStr, setAmountStr] = useState('');
	const [category, setCategory] = useState(categories[0]?.id || '');
	const [note, setNote] = useState('');
	const [date, setDate] = useState<Date>(() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; });
	const [loading, setLoading] = useState(false);

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let rawValue = e.target.value.replace(/\D/g, '');

		if (rawValue.length > 1 && rawValue.startsWith('0')) {
			rawValue = rawValue.replace(/^0+/, '');
		}

		if (!rawValue) {
			setAmountStr('');
			return;
		}
		setAmountStr(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
	};

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const amount = Number(amountStr.replace(/\D/g, ''));
		if (!amount || !date || !category) return;

		// Fix timezone: set to noon to prevent UTC offset shifting date to previous day
		// Vietnam is UTC+7, so midnight local = 17:00 UTC previous day
		const safeDate = new Date(date);
		safeDate.setHours(12, 0, 0, 0);

		setLoading(true);
		await fetch('/api/expenses', {
			method: 'POST',
			body: JSON.stringify({
				amount,
				categoryId: category,
				note,
				date: safeDate,
			}),
			headers: { 'Content-Type': 'application/json' },
		});
		setAmountStr('');
		setNote('');
		const resetDate = new Date();
		resetDate.setHours(12, 0, 0, 0);
		setDate(resetDate);
		setLoading(false);
		router.refresh();
	}

	return (
		<form className='space-y-4' onSubmit={submit}>
			<div className='relative'>
				<Input
					type='text'
					inputMode='numeric'
					placeholder='Số tiền'
					value={amountStr}
					onChange={handleAmountChange}
					required
					className='text-lg font-semibold pr-8'
				/>
				<span className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
					VND
				</span>
			</div>
			<Select value={category} onValueChange={setCategory}>
				<SelectTrigger>
					<SelectValue placeholder='Chọn danh mục' />
				</SelectTrigger>
				<SelectContent>
					{categories.length === 0 ? (
						<div className='px-2 py-6 text-center text-sm text-muted-foreground'>
							Chưa có danh mục.
							<br />
							Vào cài đặt để xem thêm.
						</div>
					) : (
						categories.map((cat) => (
							<SelectItem key={cat.id} value={cat.id}>
								<div className='flex items-center gap-2'>
									<span>{cat.icon}</span>
									<span>{cat.name}</span>
								</div>
							</SelectItem>
						))
					)}
				</SelectContent>
			</Select>
			<DatePicker
				date={date}
				onDateChange={(newDate) => {
					const d = newDate || new Date();
					d.setHours(12, 0, 0, 0);
					setDate(d);
				}}
			/>
			<Textarea
				placeholder='Ghi chú'
				value={note}
				onChange={(e) => setNote(e.target.value)}
			/>
			<Button type='submit' className='w-full' disabled={loading}>
				{loading ? 'Đang lưu...' : 'Lưu chi tiêu'}
			</Button>
		</form>
	);
}
