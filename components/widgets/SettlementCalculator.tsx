'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function SettlementCalculator({
	total,
	categories,
}: {
	total: number;
	categories: { category: string; icon?: string; color?: string; amount: number }[];
}) {
	const [percent, setPercent] = useState<number>(50);

	const amountToPay = Math.round((total * percent) / 100);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Chi tiết kết toán</CardTitle>
			</CardHeader>
			<CardContent className='space-y-6'>
				<div className='space-y-1'>
					<p className='text-sm text-muted-foreground'>
						Tổng chi tiêu gia đình
					</p>
					<p className='text-3xl font-bold'>
						{total.toLocaleString('vi-VN')} VND
					</p>
				</div>

				<div className='space-y-2 text-sm text-muted-foreground bg-accent/20 p-4 rounded-xl'>
					{categories.map((c) => (
						<div
							key={c.category}
							className='flex justify-between items-center border-b border-border/40 last:border-0 pb-2 last:pb-0'
						>
							<div className='flex items-center gap-2'>
								{c.icon ? (
									<span className='text-base'>{c.icon}</span>
								) : (
									<span
										className='w-3 h-3 rounded-full shrink-0'
										style={{ backgroundColor: c.color || '#6b7280' }}
									/>
								)}
								<span>{c.category}</span>
							</div>
							<span className='font-medium'>
								{c.amount.toLocaleString('vi-VN')} VND
							</span>
						</div>
					))}
				</div>

				<div className='space-y-3 pt-2'>
					<p className='text-sm font-medium'>
						Đóng góp của người còn lại:
					</p>
					<div className='flex gap-2'>
						<Button
							variant={percent === 50 ? 'default' : 'outline'}
							onClick={() => setPercent(50)}
							className='flex-1'
						>
							Chia đôi (50%)
						</Button>
						<Button
							variant={percent === 100 ? 'default' : 'outline'}
							onClick={() => setPercent(100)}
							className='flex-1'
						>
							Trả hết (100%)
						</Button>
					</div>
					<div className='flex gap-2 items-center'>
						<span className='text-sm text-muted-foreground whitespace-nowrap min-w-[120px]'>
							Hoặc nhập tỷ lệ %:
						</span>
						<Input
							type='number'
							value={percent}
							onChange={(e) => setPercent(Number(e.target.value))}
							className='w-full'
							min={0}
							max={100}
						/>
					</div>
				</div>

				<div className='pt-6 border-t space-y-4'>
					<div className='flex justify-between items-center'>
						<span className='font-semibold'>Cần thanh toán lại:</span>
						<span className='text-2xl font-bold text-primary'>
							{amountToPay.toLocaleString('vi-VN')} đ
						</span>
					</div>

					<Button asChild className='w-full' size='lg'>
						<Link href={`/qr?amount=${amountToPay}`}>
							Tạo QR cho {amountToPay.toLocaleString('vi-VN')} đ
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
