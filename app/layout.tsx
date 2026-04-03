import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SwRegister } from '@/components/providers/sw-register';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Be_Vietnam_Pro } from 'next/font/google';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DarkModeToggle } from '@/components/widgets/DarkModeToggle';
import { BottomNav } from '@/components/widgets/BottomNav';

const beVietnamPro = Be_Vietnam_Pro({
	subsets: ['latin', 'vietnamese'],
	weight: ['400', '600'],
	variable: '--font-sans',
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'Family Expense Management',
	description: 'Quản lý chi tiêu gia đình tối giản',
	manifest: '/manifest.webmanifest',
	icons: {
		icon: '/icon.svg',
		apple: '/icon-192.svg',
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='vi' suppressHydrationWarning className={cn("font-sans", beVietnamPro.variable)}>
			<body
				className={cn(
					'min-h-screen bg-background text-foreground font-sans antialiased',
					beVietnamPro.variable,
				)}
			>
				<ThemeProvider>
					<AuthProvider>
						<SwRegister />
						<div className='max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6'>
							<header className='flex items-center justify-between pb-4 mb-6'>
								<Link href='/' className='text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
									Family Expense
								</Link>
								<DarkModeToggle />
							</header>
							<main>{children}</main>
						</div>
						<BottomNav />
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
