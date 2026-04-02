import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
	const session = await getServerSession(authOptions);

	if (session) {
		redirect('/dashboard');
	}

	return (
		<main className='min-h-screen flex flex-col'>
			{/* Hero Section */}
			<section className='flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 py-12'>
				{/* Content */}
				<div className='space-y-6 max-w-xl text-center lg:text-left'>
					<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium'>
						<span className='relative flex h-2 w-2'>
							<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
							<span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
						</span>
						Miễn phí sử dụng
					</div>
					
					<h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight'>
						<span className='bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent'>
							Quản lý chi tiêu
						</span>
						<br />
						<span className='text-foreground'>cho gia đình bạn</span>
					</h1>
					
					<p className='text-lg text-muted-foreground leading-relaxed'>
						Theo dõi chi tiêu hàng ngày, phân chia ngân sách hợp lý, 
						tạo QR thanh toán nhanh chóng và xem báo cáo trực quan. 
						Giúp vợ chồng đồng lòng trong tài chính gia đình.
					</p>

					{/* Features */}
					<div className='grid grid-cols-3 gap-4 pt-2'>
						<div className='flex flex-col items-center gap-2 text-sm'>
							<div className='h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl'>
								📊
							</div>
							<span className='font-medium text-center'>Thống kê chi tiết</span>
						</div>
						<div className='flex flex-col items-center gap-2 text-sm'>
							<div className='h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl'>
								💳
							</div>
							<span className='font-medium text-center'>QR thanh toán</span>
						</div>
						<div className='flex flex-col items-center gap-2 text-sm'>
							<div className='h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl'>
								🎯
							</div>
							<span className='font-medium text-center'>Ngân sách tháng</span>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className='flex flex-col sm:flex-row gap-4 pt-4'>
						<Button asChild size='lg' className='h-14 px-8 text-base font-semibold shadow-lg shadow-primary/25'>
							<Link href='/register'>
								Bắt đầu miễn phí
							</Link>
						</Button>
						<Button
							variant='outline'
							size='lg'
							asChild
							className='h-14 px-8 text-base font-semibold'
						>
							<Link href='/login'>Đăng nhập</Link>
						</Button>
					</div>
				</div>

				{/* 3D Illustration */}
				<div className='relative w-full max-w-md lg:max-w-lg'>
					<div className='absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl opacity-50'></div>
					<div className='relative glass-card macos-shadow-lg p-8 rounded-3xl'>
						{/* Mock App UI */}
						<div className='space-y-4'>
							{/* Header */}
							<div className='flex items-center justify-between'>
								<div className='space-y-1'>
									<p className='text-xs text-muted-foreground'>Tháng 4, 2026</p>
									<p className='text-2xl font-bold'>12.500.000 ₫</p>
								</div>
								<div className='h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl shadow-lg'>
									💰
								</div>
							</div>
							
							{/* Progress */}
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span className='text-muted-foreground'>Ngân sách</span>
									<span className='font-medium'>62%</span>
								</div>
								<div className='h-3 rounded-full bg-muted overflow-hidden'>
									<div className='h-full w-[62%] rounded-full bg-gradient-to-r from-primary to-primary/70'></div>
								</div>
							</div>

							{/* Mini chart bars */}
							<div className='flex items-end justify-between gap-2 h-24 pt-4'>
								{[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
									<div
										key={i}
										className='flex-1 rounded-t-lg bg-gradient-to-t from-primary/80 to-primary/40'
										style={{ height: `${height}%` }}
									></div>
								))}
							</div>
							<div className='flex justify-between text-xs text-muted-foreground'>
								<span>T2</span>
								<span>T3</span>
								<span>T4</span>
								<span>T5</span>
								<span>T6</span>
								<span>T7</span>
								<span>CN</span>
							</div>

							{/* Recent expenses */}
							<div className='space-y-2 pt-2'>
								<p className='text-sm font-medium'>Chi tiêu gần đây</p>
								{[
									{ icon: '🍜', name: 'Ăn sáng', amount: '45.000' },
									{ icon: '⛽', name: 'Đổ xăng', amount: '150.000' },
									{ icon: '🛒', name: 'Siêu thị', amount: '320.000' },
								].map((item, i) => (
									<div key={i} className='flex items-center gap-3 p-2 rounded-xl bg-muted/50'>
										<span className='text-lg'>{item.icon}</span>
										<span className='flex-1 text-sm'>{item.name}</span>
										<span className='text-sm font-medium'>-{item.amount} ₫</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Floating elements */}
					<div className='absolute -top-4 -right-4 h-16 w-16 rounded-2xl bg-green-500 shadow-lg shadow-green-500/30 flex items-center justify-center text-2xl animate-bounce'>
						✓
					</div>
					<div className='absolute -bottom-4 -left-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex items-center justify-center text-xl'>
						📈
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='py-6 text-center text-sm text-muted-foreground'>
				<p>© 2026 Family Expense. Made with ❤️ for families.</p>
			</footer>
		</main>
	);
}
