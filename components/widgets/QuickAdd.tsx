'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/widgets/DatePicker';
import { VoiceInput } from '@/components/widgets/VoiceInput';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export function QuickAdd({ userId }: { userId: string }) {
	const router = useRouter();
	const [amountStr, setAmountStr] = useState('');
	const [category, setCategory] = useState('');
	const [note, setNote] = useState('');
	const [date, setDate] = useState<Date>(new Date());
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [categories, setCategories] = useState<Array<{
		id: string;
		name: string;
		icon: string;
		color: string;
	}>>([]);

	// Fetch categories on mount
	useEffect(() => {
		async function fetchCategories() {
			try {
				const res = await fetch('/api/categories');
				if (res.ok) {
					const data = await res.json();
					setCategories(data);
					if (data.length > 0 && !category) {
						setCategory(data[0].id); // Set first category as default
					}
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
		}
		fetchCategories();
	}, []);

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let rawValue = e.target.value.replace(/\D/g, '');

		// Xóa số 0 ở đầu nếu có (trừ trường hợp chỉ nhập 1 số 0)
		if (rawValue.length > 1 && rawValue.startsWith('0')) {
			rawValue = rawValue.replace(/^0+/, '');
		}

		if (!rawValue) {
			setAmountStr('');
			return;
		}
		// Tách bằng dấu chấm thủ công để đảm bảo 100% là (.) ở mọi hệ điều hành
		setAmountStr(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
	};

	const setAmount = (amount: number) => {
		setAmountStr(amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
	};

	const handleVoiceResult = (data: { amount: number; note: string }) => {
		setAmount(data.amount);
		setNote(data.note);
		setShowForm(true);
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
				categoryId: category, // Use categoryId instead of category string
				note,
				date: date,
			}),
			headers: { 'Content-Type': 'application/json' },
		});
		setAmountStr('');
		setNote('');
		setDate(new Date());
		setShowForm(false);
		setLoading(false);
		router.refresh();
	}

	return (
		<div className='space-y-4'>
			{/* Voice Input */}
			<VoiceInput onResult={handleVoiceResult} />
			
			{/* Divider */}
			<div className='relative'>
				<div className='absolute inset-0 flex items-center'>
					<span className='w-full border-t' />
				</div>
				<div className='relative flex justify-center text-xs uppercase'>
					<span className='bg-background px-2 text-muted-foreground'>
						hoặc nhập thủ công
					</span>
				</div>
			</div>

			{/* Manual Form - Collapsed by default, expanded after voice or click */}
			{!showForm ? (
				<Button 
					type='button' 
					variant='outline' 
					className='w-full'
					onClick={() => setShowForm(true)}
				>
					Nhập thủ công
				</Button>
			) : (
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
					<div className='flex gap-2'>
						<Button 
							type='button' 
							variant='outline' 
							className='flex-1'
							onClick={() => {
								setShowForm(false);
								setAmountStr('');
								setNote('');
							}}
						>
							Hủy
						</Button>
						<Button type='submit' className='flex-1' disabled={loading}>
							{loading ? 'Đang lưu...' : 'Lưu'}
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
