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
import { Mic, Loader2 } from 'lucide-react';

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
	const [isListening, setIsListening] = useState(false);
	const [aiParsing, setAiParsing] = useState(false);

	const startListening = () => {
		if (!('webkitSpeechRecognition' in window)) {
			alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
			return;
		}

		// @ts-ignore
		const recognition = new window.webkitSpeechRecognition();
		recognition.lang = 'vi-VN';
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			setIsListening(true);
		};

		recognition.onresult = async (event: any) => {
			const transcript = event.results[0][0].transcript;
			setIsListening(false);
			setAiParsing(true);

			try {
				const response = await fetch('/api/ai/parse-expense', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: transcript,
						categories: categories,
					}),
				});

				const result = await response.json();
				if (result.success && result.data) {
					const { amount, note: aiNote, categoryId } = result.data;

					if (amount) {
						setAmountStr(
							amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
						);
					}
					if (aiNote) {
						setNote(aiNote);
					}
					if (categoryId && categories.find((c: any) => c.id === categoryId)) {
						setCategory(categoryId);
					}
				} else {
					console.error('AI Error:', result.error);
					alert(
						'Không thể phân tích dữ liệu: ' +
							(result.error || 'Lỗi không xác định'),
					);
				}
			} catch (err) {
				console.error('Lỗi AI Fetch:', err);
				alert('Lỗi kết nối tới AI.');
			} finally {
				setAiParsing(false);
			}
		};

		recognition.onerror = (event: any) => {
			console.error('Speech recognition error:', event.error);
			setIsListening(false);

			if (event.error === 'not-allowed') {
				alert(
					'Web bị chặn quyền dùng Micro. Hoặc bạn đang truy cập qua IP mạng LAN chứ không phải localhost/HTTPS.',
				);
			} else if (event.error === 'network') {
				alert(
					'Lỗi kết nối mạng: Tính năng nhận diện giọng nói cần Internet (Google Speech Server).',
				);
			} else if (event.error === 'no-speech') {
				// Không nghe thấy gì, không cần alert phiền user, chỉ log
				console.warn('Không nghe thấy âm thanh nào.');
			} else {
				alert('Lỗi nhận diện giọng nói: ' + event.error);
			}
		};

		recognition.onend = () => {
			setIsListening(false);
		};

		recognition.start();
	};

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
			<div className='flex gap-2 mb-4'>
				<Button
					type='button'
					variant='outline'
					className={`flex-1 gap-2 ${isListening ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
					onClick={startListening}
					disabled={isListening || aiParsing}
				>
					{isListening ? (
						<>
							<Mic className='w-4 h-4 animate-pulse text-red-500' />
							Đang nghe...
						</>
					) : aiParsing ? (
						<>
							<Loader2 className='w-4 h-4 animate-spin' />
							AI đang xử lý...
						</>
					) : (
						<>
							<Mic className='w-4 h-4' />
							Đọc để ghi nhanh (AI)
						</>
					)}
				</Button>
			</div>

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
			<DatePicker
				date={date}
				onDateChange={(newDate) => setDate(newDate || new Date())}
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
