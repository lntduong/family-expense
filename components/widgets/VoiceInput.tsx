'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
	onResult: (data: { amount: number; note: string }) => void;
}

// Parse Vietnamese voice input to extract amount and note
function parseVoiceInput(text: string): { amount: number; note: string } | null {
	const normalizedText = text.toLowerCase().trim();
	
	// Patterns for Vietnamese currency
	// "50 nghìn ăn sáng" -> 50000, "ăn sáng"
	// "1 triệu tiền nhà" -> 1000000, "tiền nhà"
	// "100k đổ xăng" -> 100000, "đổ xăng"
	// "hai trăm nghìn mua sắm" -> 200000, "mua sắm"
	
	let amount = 0;
	let note = normalizedText;
	
	// Number words mapping
	const numberWords: Record<string, number> = {
		'một': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'năm': 5,
		'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10,
		'mười một': 11, 'mười hai': 12, 'mười ba': 13, 'mười bốn': 14, 'mười lăm': 15,
		'mười sáu': 16, 'mười bảy': 17, 'mười tám': 18, 'mười chín': 19,
		'hai mươi': 20, 'ba mươi': 30, 'bốn mươi': 40, 'năm mươi': 50,
		'sáu mươi': 60, 'bảy mươi': 70, 'tám mươi': 80, 'chín mươi': 90,
		'trăm': 100, 'nghìn': 1000, 'ngàn': 1000, 'triệu': 1000000,
	};

	// Pattern 1: "X triệu Y nghìn" or "X triệu" or "X nghìn"
	const complexPattern = /(\d+)\s*(triệu)?\s*(\d+)?\s*(nghìn|ngàn|k)?/i;
	const match = normalizedText.match(complexPattern);
	
	if (match) {
		const firstNum = parseInt(match[1]) || 0;
		const hasMillion = match[2];
		const secondNum = parseInt(match[3]) || 0;
		const hasThousand = match[4];
		
		if (hasMillion) {
			amount = firstNum * 1000000;
			if (secondNum && hasThousand) {
				amount += secondNum * 1000;
			} else if (secondNum) {
				amount += secondNum * 1000; // assume nghìn if after triệu
			}
		} else if (hasThousand) {
			amount = firstNum * 1000;
		} else {
			// Check if it's a large number already (like 50000)
			if (firstNum >= 1000) {
				amount = firstNum;
			} else {
				// Assume nghìn for small numbers
				amount = firstNum * 1000;
			}
		}
		
		// Remove the amount part from note
		note = normalizedText.replace(complexPattern, '').trim();
	}
	
	// Pattern 2: Word numbers like "năm mươi nghìn"
	if (amount === 0) {
		for (const [word, value] of Object.entries(numberWords)) {
			if (normalizedText.includes(word)) {
				if (word === 'triệu') {
					const beforeTrieu = normalizedText.split('triệu')[0].trim();
					const numBefore = parseInt(beforeTrieu) || numberWords[beforeTrieu] || 1;
					amount = numBefore * 1000000;
				} else if (word === 'nghìn' || word === 'ngàn') {
					const beforeNghin = normalizedText.split(/nghìn|ngàn/)[0].trim();
					const numBefore = parseInt(beforeNghin) || numberWords[beforeNghin] || 1;
					amount = numBefore * 1000;
				}
			}
		}
	}
	
	// Pattern 3: "100k" style
	const kPattern = /(\d+)\s*k\b/i;
	const kMatch = normalizedText.match(kPattern);
	if (kMatch && amount === 0) {
		amount = parseInt(kMatch[1]) * 1000;
		note = normalizedText.replace(kPattern, '').trim();
	}
	
	// Clean up note - remove common words
	note = note
		.replace(/^(cho|để|mua|trả|đi|về)\s+/i, '')
		.replace(/\s+/g, ' ')
		.trim();
	
	if (amount > 0) {
		return { amount, note: note || 'Chi tiêu' };
	}
	
	return null;
}

export function VoiceInput({ onResult }: VoiceInputProps) {
	const [isListening, setIsListening] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [transcript, setTranscript] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		// Check if Speech Recognition is supported
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		setIsSupported(!!SpeechRecognition);
	}, []);

	const startListening = useCallback(() => {
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		
		if (!SpeechRecognition) {
			setError('Trình duyệt không hỗ trợ nhận diện giọng nói');
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.lang = 'vi-VN';
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			setIsListening(true);
			setError('');
			setTranscript('');
		};

		recognition.onresult = (event: any) => {
			const text = event.results[0][0].transcript;
			setTranscript(text);
			
			const parsed = parseVoiceInput(text);
			if (parsed) {
				onResult(parsed);
			} else {
				setError('Không nhận diện được số tiền. Thử nói "50 nghìn ăn sáng"');
			}
		};

		recognition.onerror = (event: any) => {
			setIsListening(false);
			if (event.error === 'no-speech') {
				setError('Không nghe thấy giọng nói');
			} else if (event.error === 'not-allowed') {
				setError('Vui lòng cho phép truy cập microphone');
			} else {
				setError('Lỗi nhận diện giọng nói');
			}
		};

		recognition.onend = () => {
			setIsListening(false);
		};

		recognition.start();
	}, [onResult]);

	if (!isSupported) {
		return null; // Don't show button if not supported
	}

	return (
		<div className='space-y-2'>
			<Button
				type='button'
				variant={isListening ? 'default' : 'outline'}
				size='lg'
				onClick={startListening}
				disabled={isListening}
				className={`w-full h-14 gap-3 text-base ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
			>
				{isListening ? (
					<>
						<span className='relative flex h-4 w-4'>
							<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
							<span className='relative inline-flex rounded-full h-4 w-4 bg-white'></span>
						</span>
						Đang nghe...
					</>
				) : (
					<>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
							<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
							<line x1="12" x2="12" y1="19" y2="22"/>
						</svg>
						Nói để ghi chi tiêu
					</>
				)}
			</Button>
			
			{transcript && (
				<p className='text-sm text-center text-muted-foreground'>
					"{transcript}"
				</p>
			)}
			
			{error && (
				<p className='text-sm text-center text-red-500'>
					{error}
				</p>
			)}
		</div>
	);
}
