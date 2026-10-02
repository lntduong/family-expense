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
		<Card className='glass-card macos-shadow-sm rounded-xl'>
			<CardHeader>
				<CardTitle className='text-xl font-bold'>Chi tiết kết toán</CardTitle>
			</CardHeader>
			<CardContent className='space-y-8'>
				<div className='flex flex-col items-center justify-center py-6 bg-primary/5 rounded-2xl border border-primary/10'>
					<p className='text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider'>
						Tổng chi tiêu gia đình
					</p>
					<p className='text-4xl font-bold text-foreground'>
						{total.toLocaleString('vi-VN')} <span className='text-xl text-muted-foreground font-normal'>₫</span>
					</p>
				</div>

				<div className='space-y-3'>
					<p className='text-sm font-semibold'>Chi tiết theo danh mục</p>
					<div className='space-y-1 text-sm bg-muted/30 p-4 rounded-xl border'>
						{categories.length > 0 ? categories.map((c) => (
							<div
								key={c.category}
								className='flex justify-between items-center py-2 border-b border-border/50 last:border-0 last:pb-0'
							>
								<div className='flex items-center gap-3'>
									<div className='w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm'>
										{c.icon ? (
											<span className='text-sm'>{c.icon}</span>
										) : (
											<span
												className='w-3 h-3 rounded-full'
												style={{ backgroundColor: c.color || '#6b7280' }}
											/>
										)}
									</div>
									<span className='font-medium'>{c.category}</span>
								</div>
								<span className='font-semibold'>
									{c.amount.toLocaleString('vi-VN')} ₫
								</span>
							</div>
						)) : (
							<p className='text-muted-foreground text-center py-2'>Chưa có khoản chi nào.</p>
						)}
					</div>
				</div>

				<div className='space-y-4 pt-2'>
					<p className='text-sm font-semibold'>
						Tỷ lệ đóng góp của người còn lại:
					</p>
					<div className='flex gap-3'>
						<Button
							variant={percent === 50 ? 'default' : 'outline'}
							onClick={() => setPercent(50)}
							className={`flex-1 h-12 shadow-sm ${percent === 50 ? 'font-bold' : ''}`}
						>
							Chia đôi (50%)
						</Button>
						<Button
							variant={percent === 100 ? 'default' : 'outline'}
							onClick={() => setPercent(100)}
							className={`flex-1 h-12 shadow-sm ${percent === 100 ? 'font-bold' : ''}`}
						>
							Trả hết (100%)
						</Button>
					</div>
					<div className='flex gap-3 items-center bg-muted/30 p-3 rounded-xl border'>
						<span className='text-sm font-medium whitespace-nowrap'>
							Nhập tỷ lệ % khác:
						</span>
						<div className='relative flex-1'>
							<Input
								type='number'
								value={percent}
								onChange={(e) => setPercent(Number(e.target.value))}
								className='w-full h-10 pr-8 font-semibold text-right'
								min={0}
								max={100}
							/>
							<span className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
								%
							</span>
						</div>
					</div>
				</div>

				<div className='pt-6 border-t space-y-5'>
					<div className='flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20'>
						<span className='font-semibold text-primary'>Cần thanh toán:</span>
						<span className='text-3xl font-bold text-primary'>
							{amountToPay.toLocaleString('vi-VN')} ₫
						</span>
					</div>

					<Button asChild className='w-full h-14 text-lg font-bold shadow-md' size='lg'>
						<Link href={`/qr?amount=${amountToPay}`}>
							Tạo QR nhận tiền
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
