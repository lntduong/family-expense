import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CategoryManager } from '@/components/widgets/CategoryManager';
import { QRSettings } from '@/components/widgets/QRSettings';
import { LogoutButton } from '@/components/widgets/LogoutButton';

export default async function SettingsPage() {
	const session = await getServerSession(authOptions);
	if (!session) redirect('/login');

	return (
		<main className='min-h-screen pb-20'>
			<div className='max-w-4xl mx-auto p-6 space-y-6'>
				{/* Header */}
				<div className='glass-card macos-shadow-md p-6'>
					<h1 className='text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
						Cài đặt
					</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Quản lý danh mục và thông tin thanh toán
					</p>
				</div>

				{/* QR Settings */}
				<QRSettings />

				{/* Category Manager */}
				<CategoryManager />

				{/* Logout */}
				<LogoutButton />
			</div>
		</main>
	);
}
