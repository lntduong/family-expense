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
	const [date, setDate] = useState<Date>(new Date());
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

		setLoading(true);
		await fetch('/api/expenses', {
			method: 'POST',
			body: JSON.stringify({
				amount,
				categoryId: category,
				note,
				date: date,
			}),
			headers: { 'Content-Type': 'application/json' },
		});
		setAmountStr('');
		setNote('');
		setDate(new Date());
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
					₫
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
							Vào Cài đặt để thêm!
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
			<DatePicker date={date} onDateChange={(newDate) => setDate(newDate || new Date())} />
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
