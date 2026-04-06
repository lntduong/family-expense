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

type BrowserSpeechRecognition = {
	lang: string;
	interimResults: boolean;
	continuous: boolean;
	maxAlternatives: number;
	onstart: null | (() => void);
	onresult: null | ((event: any) => void | Promise<void>);
	onerror: null | ((event: any) => void);
	onend: null | (() => void);
	start: () => void;
};

declare global {
	interface Window {
		webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
		SpeechRecognition?: new () => BrowserSpeechRecognition;
	}
}

export function QuickAdd({ categories }: { categories: Category[] }) {
	const router = useRouter();
	const [amountStr, setAmountStr] = useState('');
	const [category, setCategory] = useState(categories[0]?.id || '');
	const [note, setNote] = useState('');
	const [date, setDate] = useState<Date>(() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; });
	const [loading, setLoading] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [aiParsing, setAiParsing] = useState(false);

	const ensureMicrophoneAccess = async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			throw new Error('Browser does not support microphone access');
		}

		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
			},
		});

		stream.getTracks().forEach((track) => track.stop());
	};

	const startListening = async () => {
		const SpeechRecognitionCtor =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognitionCtor) {
			alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Hãy thử Chrome hoặc Safari mới nhất.');
			return;
		}

		try {
			await ensureMicrophoneAccess();
		} catch (error) {
			console.error('Microphone access error:', error);
			alert('Không mở được microphone. Hãy kiểm tra quyền micro trong trình duyệt và Windows, sau đó thử lại.');
			return;
		}

		const recognition = new SpeechRecognitionCtor();
		recognition.lang = 'vi-VN';
		recognition.interimResults = true;
		recognition.continuous = false;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			setIsListening(true);
			console.log('Microphone da bat. San sang nghe tieng...');
		};

		recognition.onresult = async (event: any) => {
			const transcript = Array.from(event.results || [])
				.map((result: any) => result?.[0]?.transcript || '')
				.join(' ')
				.trim();

			if (!transcript) {
				setIsListening(false);
				alert('Minh chua nghe ro noi dung. Hay thu noi cham hon va gan micro hon.');
				return;
			}

			console.log('Ket qua cuoi (bat dau goi AI):', transcript);
			setIsListening(false);
			setAiParsing(true);

			try {
				const response = await fetch('/api/ai/parse-expense', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					cache: 'no-store',
					body: JSON.stringify({
						text: transcript,
						categories,
					}),
				});

				const result = await response.json().catch(() => null);

				if (!response.ok) {
					throw new Error(result?.error || `AI route failed with status ${response.status}`);
				}

				if (result?.success && result.data) {
					const { amount, note: aiNote, categoryId } = result.data;

					if (amount) {
						setAmountStr(
							amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
						);
					}
					if (aiNote) {
						setNote(aiNote);
					}
					if (categoryId && categories.find((c) => c.id === categoryId)) {
						setCategory(categoryId);
					}
				} else {
					throw new Error(result?.error || 'AI route returned an unknown error');
				}
			} catch (err) {
				const rawMessage = err instanceof Error ? err.message : '';
				console.error('Loi AI fetch:', err);
				// Hiển thị thông báo thân thiện hơn tùy theo loại lỗi
				let userMessage = 'Không thể kết nối tới AI. Vui lòng thử lại sau.';
				if (rawMessage.includes('exhausted') || rawMessage.includes('account') || rawMessage.includes('403')) {
					userMessage = 'AI tạm thời không khả dụng (tài khoản hết quota). Vui lòng nhập thủ công.';
				} else if (rawMessage.includes('timeout') || rawMessage.includes('Timeout')) {
					userMessage = 'AI phản hồi quá lâu. Vui lòng thử lại.';
				} else if (rawMessage.includes('network') || rawMessage.includes('fetch')) {
					userMessage = 'Lỗi mạng. Kiểm tra kết nối và thử lại.';
				}
				alert(userMessage);
			} finally {
				setAiParsing(false);
			}
		};

		recognition.onerror = (event: any) => {
			console.error('Speech recognition error:', event.error);
			setIsListening(false);

			if (event.error === 'not-allowed') {
				alert(
					'Web đang bị chặn quyền micro. Nếu mở bằng điện thoại qua IP LAN, hãy thử HTTPS hoặc cấp lại quyền micro cho trình duyệt.',
				);
			} else if (event.error === 'network') {
				alert(
					'Lỗi mạng khi nhận diện giọng nói. Tính năng speech-to-text của trình duyệt cần Internet để hoạt động.',
				);
			} else if (event.error === 'no-speech') {
				alert(
					'Không nghe thấy giọng nói. Hãy kiểm tra micro đang dùng đúng thiết bị input, nói gần micro hơn và giữ im lặng xung quanh khi thử lại.',
				);
			} else {
				alert('Lỗi nhận diện giọng nói: ' + event.error);
			}
		};

		recognition.onend = () => {
			setIsListening(false);
		};

		setTimeout(() => {
			try {
				recognition.start();
			} catch (error) {
				console.error('Speech recognition start error:', error);
				setIsListening(false);
				alert('Không thể khởi động nhận diện giọng nói. Hãy tải lại trang và thử lại.');
			}
		}, 150);
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
