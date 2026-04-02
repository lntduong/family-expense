'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
	HomeIcon,
	IdCardIcon,
	CountdownTimerIcon,
	BarChartIcon,
	GearIcon,
} from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

export function BottomNav() {
	const pathname = usePathname();
	const { status } = useSession();

	if (
		status !== 'authenticated' ||
		pathname === '/' ||
		pathname === '/login' ||
		pathname === '/register'
	) {
		return null;
	}

	const tabs = [
		{ name: 'Tổng quan', href: '/dashboard', Icon: HomeIcon },
		{ name: 'Thống kê', href: '/dashboard/analytic', Icon: BarChartIcon },
		{ name: 'QR Nhận', href: '/qr', Icon: IdCardIcon },
		{
			name: 'Kết toán',
			href: '/dashboard/settlement',
			Icon: CountdownTimerIcon,
		},
		{ name: 'Cài đặt', href: '/dashboard/settings', Icon: GearIcon },
	];

	return (
		<div className='fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 macos-shadow-lg pb-safe'>
			<nav className='flex justify-around items-center h-16 max-w-4xl mx-auto px-2'>
				{tabs.map((tab) => {
					const Icon = tab.Icon;
					const isActive = pathname === tab.href;

					return (
						<Link
							key={tab.name}
							href={tab.href}
							className={cn(
								'flex flex-col items-center justify-center w-full h-full gap-1.5 rounded-xl transition-all duration-200',
								'text-muted-foreground hover:text-foreground',
								isActive && 'text-primary bg-primary/10',
							)}
						>
							<Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
							<span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{tab.name}</span>
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
