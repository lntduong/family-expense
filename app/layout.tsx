import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SwRegister } from '@/components/providers/sw-register';
import { AuthProvider } from '@/components/providers/auth-provider';
import { NotificationManager } from '@/components/widgets/NotificationManager';
import { Be_Vietnam_Pro } from 'next/font/google';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DarkModeToggle } from '@/components/widgets/DarkModeToggle';
import { BottomNav } from '@/components/widgets/BottomNav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { WorkspaceSwitcher } from '@/components/widgets/WorkspaceSwitcher';
import { cookies } from 'next/headers';

const beVietnamPro = Be_Vietnam_Pro({
	subsets: ['latin', 'vietnamese'],
	weight: ['400', '600'],
	variable: '--font-sans',
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'Chi tiêu gia đình',
	description: 'Quản lý chi tiêu gia đình tối giản',
	manifest: '/manifest.webmanifest',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'Chi tiêu gia đình',
	},
	icons: {
		icon: '/icon-192.png',
		apple: '/icon-192.png',
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	const activeWorkspaceId = cookies().get('workspaceId')?.value;
	let workspaces: any[] = [];

	if (session?.user?.id) {
		workspaces = await prisma.workspace.findMany({
			where: {
				OR: [
					{ ownerId: session.user.id },
					{ members: { some: { id: session.user.id } } },
				],
			},
			select: { id: true, name: true }
		});
	}

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
						<NotificationManager />
						<div className='max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6'>
							<header className='flex items-center justify-between pb-4 mb-6'>
								<Link href='/' className='text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
									Family
								</Link>
								<div className="flex items-center gap-2">
									{workspaces.length > 0 && (
										<WorkspaceSwitcher workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
									)}
									<DarkModeToggle />
								</div>
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
