'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function BudgetForm({ month, year }: { month: number; year: number }) {
	const router = useRouter();
	const [limitStr, setLimitStr] = useState('');
	const [message, setMessage] = useState('');

	const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let rawValue = e.target.value.replace(/\D/g, '');

		if (rawValue.length > 1 && rawValue.startsWith('0')) {
			rawValue = rawValue.replace(/^0+/, '');
		}

		if (!rawValue) {
			setLimitStr('');
			return;
		}
		setLimitStr(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
	};

	async function save(e: React.FormEvent) {
		e.preventDefault();
		const limit = Number(limitStr.replace(/\D/g, ''));
		if (!limit) return;

		const res = await fetch('/api/budget', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ month, year, limit }),
		});
		if (res.ok) {
			setMessage('Đã lưu ngân sách');
			router.refresh();
		} else {
			setMessage('Lỗi lưu ngân sách');
		}
	}

	return (
		<form className='space-y-3' onSubmit={save}>
			<Input
				type='text'
				inputMode='numeric'
				placeholder='Ngân sách (VD: 5.000.000)'
				value={limitStr}
				onChange={handleLimitChange}
				required
			/>
			<Button type='submit' size='sm' className='w-full'>
				Lưu ngân sách
			</Button>
			{message && (
				<p className='text-xs text-muted-foreground text-center'>{message}</p>
			)}
		</form>
	);
}
