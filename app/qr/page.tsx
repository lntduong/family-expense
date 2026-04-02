'use client';

import { useState, useEffect, Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getQRSettings, type QRSettingsData } from '@/components/widgets/QRSettings';
import { DownloadIcon, GearIcon } from '@radix-ui/react-icons';

function QrContent() {
	const params = useSearchParams();
	const initialAmount = Number(params.get('amount') || 0);
	const [amountStr, setAmountStr] = useState('');
	const [desc, setDesc] = useState('');
	const [qr, setQr] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [qrSettings, setQrSettings] = useState<QRSettingsData | null>(null);

	useEffect(() => {
		if (initialAmount > 0) {
			setAmountStr(
				initialAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
			);
		}
		// Load QR settings from localStorage
		setQrSettings(getQRSettings());
	}, [initialAmount]);

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

	async function generate() {
		const amount = Number(amountStr.replace(/\D/g, ''));
		if (!amount) return;

		// Use settings from localStorage, fallback to env vars
		const bankBin = qrSettings?.bankBin || process.env.NEXT_PUBLIC_VIETQR_BANK_BIN;
		const accountNumber = qrSettings?.accountNumber || process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NUMBER;
		const accountName = qrSettings?.accountName || process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME;

		if (!bankBin || !accountNumber || !accountName) {
			alert('Vui lòng cài đặt thông tin ngân hàng trong phần Cài đặt trước');
			return;
		}

		setLoading(true);
		const res = await fetch('/api/qr', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				amount,
				description: desc,
				bankBin,
				accountNumber,
				accountName,
			}),
		});
		const data = await res.json();
		setQr(data.qrDataUrl);
		setLoading(false);
	}

	const hasSettings = qrSettings || (
		process.env.NEXT_PUBLIC_VIETQR_BANK_BIN && 
		process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NUMBER && 
		process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME
	);

	return (
		<div className='max-w-md mx-auto space-y-6 pb-20'>
			{/* Header */}
			<div className='glass-card macos-shadow-md p-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
							Tạo QR thanh toán
						</h1>
						<p className='text-sm text-muted-foreground mt-1'>
							Chuẩn VietQR
						</p>
					</div>
					<Link 
						href='/dashboard/settings'
						className='p-2 rounded-lg hover:bg-muted transition-colors'
						title='Cài đặt'
					>
						<GearIcon className='h-5 w-5 text-muted-foreground' />
					</Link>
				</div>
			</div>

			{/* Warning if no settings */}
			{!hasSettings && (
				<div className='glass-card macos-shadow p-4 border-amber-500/30 bg-amber-500/5'>
					<p className='text-sm font-medium text-amber-600 dark:text-amber-400'>
						Chưa cài đặt thông tin ngân hàng
					</p>
					<Link 
						href='/dashboard/settings' 
						className='text-sm text-amber-600 dark:text-amber-400 underline hover:no-underline'
					>
						Đi đến Cài đặt →
					</Link>
				</div>
			)}

			{/* Account Info Card */}
			{qrSettings && (
				<div className='glass-card macos-shadow p-4'>
					<p className='text-xs text-muted-foreground mb-1'>Người nhận</p>
					<p className='font-semibold'>{qrSettings.accountName}</p>
					<p className='text-sm text-muted-foreground font-mono'>{qrSettings.accountNumber}</p>
				</div>
			)}

			{/* Form */}
			<div className='glass-card macos-shadow-md p-6 space-y-4'>
				<div>
					<label className='text-sm font-medium mb-2 block'>Số tiền</label>
					<div className='relative'>
						<Input
							type='text'
							inputMode='numeric'
							placeholder='0'
							value={amountStr}
							onChange={handleAmountChange}
							className='text-lg font-semibold pr-12'
						/>
						<span className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
							₫
						</span>
					</div>
				</div>
				
				<div>
					<label className='text-sm font-medium mb-2 block'>Nội dung chuyển khoản</label>
					<Textarea
						placeholder='VD: Thanh toán tiền nhà T4'
						value={desc}
						onChange={(e) => setDesc(e.target.value)}
						rows={2}
						maxLength={25}
					/>
					<p className='text-xs text-muted-foreground mt-1 text-right'>
						{desc.length}/25
					</p>
				</div>

				<Button 
					onClick={generate} 
					disabled={loading || !hasSettings || !amountStr} 
					className='w-full h-12 text-base font-semibold'
				>
					{loading ? 'Đang tạo...' : 'Tạo mã QR'}
				</Button>
			</div>

			{/* QR Result */}
			{qr && (
				<div className='glass-card macos-shadow-lg p-6 space-y-4'>
					<div className='flex flex-col items-center'>
						<div className='bg-white p-4 rounded-2xl shadow-inner'>
							<img
								src={qr}
								alt='VietQR Code'
								className='w-64 h-64'
							/>
						</div>
						
						<div className='mt-4 text-center'>
							<p className='text-2xl font-bold text-primary'>
								{amountStr} ₫
							</p>
							{desc && (
								<p className='text-sm text-muted-foreground mt-1'>
									{desc}
								</p>
							)}
						</div>
					</div>

					<a
						href={qr}
						download={`vietqr-${amountStr.replace(/\D/g, '')}.png`}
						className='flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors'
					>
						<DownloadIcon className='h-5 w-5' />
						Tải ảnh QR
					</a>
				</div>
			)}
		</div>
	);
}

export default function QrPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center text-muted-foreground">Đang tải...</div>}>
			<QrContent />
		</Suspense>
	);
}
