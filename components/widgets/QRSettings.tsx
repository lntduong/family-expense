'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CheckIcon } from '@radix-ui/react-icons';

const BANKS = [
	{ bin: '970436', name: 'Vietcombank', shortName: 'VCB' },
	{ bin: '970418', name: 'BIDV', shortName: 'BIDV' },
	{ bin: '970415', name: 'VietinBank', shortName: 'CTG' },
	{ bin: '970405', name: 'Agribank', shortName: 'AGR' },
	{ bin: '970407', name: 'Techcombank', shortName: 'TCB' },
	{ bin: '970416', name: 'ACB', shortName: 'ACB' },
	{ bin: '970432', name: 'VPBank', shortName: 'VPB' },
	{ bin: '970423', name: 'TPBank', shortName: 'TPB' },
	{ bin: '970422', name: 'MBBank', shortName: 'MB' },
	{ bin: '970403', name: 'Sacombank', shortName: 'STB' },
	{ bin: '970448', name: 'OCB', shortName: 'OCB' },
	{ bin: '970431', name: 'Eximbank', shortName: 'EIB' },
	{ bin: '970426', name: 'MSB', shortName: 'MSB' },
	{ bin: '970441', name: 'VIB', shortName: 'VIB' },
	{ bin: '970443', name: 'SHB', shortName: 'SHB' },
	{ bin: '970454', name: 'Việt Capital Bank', shortName: 'VCCB' },
	{ bin: '970429', name: 'SCB', shortName: 'SCB' },
	{ bin: '970400', name: 'Saigonbank', shortName: 'SGB' },
	{ bin: '970406', name: 'DongA Bank', shortName: 'DAB' },
	{ bin: '970438', name: 'BaoViet Bank', shortName: 'BVB' },
	{ bin: '970446', name: 'CIMB', shortName: 'CIMB' },
	{ bin: '970452', name: 'KienLong Bank', shortName: 'KLB' },
	{ bin: '970449', name: 'LienVietPostBank', shortName: 'LPB' },
	{ bin: '970425', name: 'ABBank', shortName: 'ABB' },
	{ bin: '970427', name: 'VietABank', shortName: 'VAB' },
	{ bin: '970434', name: 'IndovinaBank', shortName: 'IVB' },
	{ bin: '970439', name: 'PublicBank', shortName: 'PBVN' },
	{ bin: '970428', name: 'NamABank', shortName: 'NAB' },
	{ bin: '970419', name: 'NCB', shortName: 'NCB' },
	{ bin: '970414', name: 'OceanBank', shortName: 'OCEANBANK' },
	{ bin: '970424', name: 'ShinhanBank', shortName: 'SHBVN' },
	{ bin: '970433', name: 'VBSP', shortName: 'VBSP' },
	{ bin: '970409', name: 'BacABank', shortName: 'BAB' },
	{ bin: '970412', name: 'PVcomBank', shortName: 'PVCB' },
	{ bin: '970430', name: 'PGBank', shortName: 'PGB' },
	{ bin: '970437', name: 'HDBank', shortName: 'HDB' },
	{ bin: '970442', name: 'HongLeong', shortName: 'HLBVN' },
	{ bin: '970440', name: 'SeABank', shortName: 'SEAB' },
	{ bin: '970410', name: 'Standard Chartered', shortName: 'SCVN' },
	{ bin: '970458', name: 'UOB', shortName: 'UOB' },
	{ bin: '970421', name: 'VRB', shortName: 'VRB' },
	{ bin: '970457', name: 'Woori', shortName: 'WVN' },
	{ bin: '970462', name: 'KookminBank', shortName: 'KBVN' },
	{ bin: '970463', name: 'Nonghyup Bank', shortName: 'NHB' },
	{ bin: '970445', name: 'COOPBANK', shortName: 'COOPBANK' },
	{ bin: '970455', name: 'IBK - Industrial', shortName: 'IBK' },
	{ bin: '970456', name: 'HSBC', shortName: 'HSBC' },
];

export interface QRSettingsData {
	bankBin: string;
	accountNumber: string;
	accountName: string;
}

const STORAGE_KEY = 'fem-qr-settings';

export function getQRSettings(): QRSettingsData | null {
	if (typeof window === 'undefined') return null;
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) return null;
		return JSON.parse(data);
	} catch {
		return null;
	}
}

export function QRSettings() {
	const [bankBin, setBankBin] = useState('');
	const [accountNumber, setAccountNumber] = useState('');
	const [accountName, setAccountName] = useState('');
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		const settings = getQRSettings();
		if (settings) {
			setBankBin(settings.bankBin);
			setAccountNumber(settings.accountNumber);
			setAccountName(settings.accountName);
		}
	}, []);

	function handleSave() {
		const data: QRSettingsData = {
			bankBin,
			accountNumber,
			accountName,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	const selectedBank = BANKS.find((b) => b.bin === bankBin);

	return (
		<div className='glass-card macos-shadow-md p-6 space-y-6'>
			<div>
				<h2 className='text-lg font-semibold'>Cài đặt QR thanh toán</h2>
				<p className='text-sm text-muted-foreground mt-1'>
					Thông tin tài khoản ngân hàng để nhận tiền qua VietQR
				</p>
			</div>

			<div className='space-y-4'>
				<div>
					<label className='text-sm font-medium mb-2 block'>Ngân hàng</label>
					<Select value={bankBin} onValueChange={setBankBin}>
						<SelectTrigger>
							<SelectValue placeholder='Chọn ngân hàng' />
						</SelectTrigger>
						<SelectContent className='max-h-[300px]'>
							{BANKS.map((bank) => (
								<SelectItem key={bank.bin} value={bank.bin}>
									{bank.shortName} - {bank.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{selectedBank && (
						<p className='text-xs text-muted-foreground mt-1'>
							Mã BIN: {selectedBank.bin}
						</p>
					)}
				</div>

				<div>
					<label className='text-sm font-medium mb-2 block'>Số tài khoản</label>
					<Input
						value={accountNumber}
						onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
						placeholder='VD: 0123456789'
						inputMode='numeric'
					/>
				</div>

				<div>
					<label className='text-sm font-medium mb-2 block'>Tên chủ tài khoản</label>
					<Input
						value={accountName}
						onChange={(e) => setAccountName(e.target.value.toUpperCase())}
						placeholder='VD: NGUYEN VAN A'
						className='uppercase'
					/>
					<p className='text-xs text-muted-foreground mt-1'>
						Viết hoa, không dấu
					</p>
				</div>

				<Button 
					onClick={handleSave} 
					className='w-full gap-2'
					disabled={!bankBin || !accountNumber || !accountName}
				>
					{saved ? (
						<>
							<CheckIcon className='h-4 w-4' />
							Đã lưu
						</>
					) : (
						'Lưu cài đặt'
					)}
				</Button>
			</div>
		</div>
	);
}
