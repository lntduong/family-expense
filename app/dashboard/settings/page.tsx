import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CategoryManager } from '@/components/widgets/CategoryManager';
import { QRSettings } from '@/components/widgets/QRSettings';
import { LogoutButton } from '@/components/widgets/LogoutButton';
import { NotificationSettings } from '@/components/widgets/NotificationSettings';
import { WorkspaceSettings } from '@/components/widgets/WorkspaceSettings';
import { getCurrentWorkspaceId } from '@/lib/workspace';
import prisma from '@/lib/prisma';

export default async function SettingsPage() {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) redirect('/login');

	const workspaceId = await getCurrentWorkspaceId((session.user as any).id);
	let activeWorkspace = null;
	if (workspaceId) {
		activeWorkspace = await prisma.workspace.findUnique({
			where: { id: workspaceId },
			select: { id: true, name: true, inviteCode: true, ownerId: true },
		});
	}

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

				{/* Workspace Settings */}
				{activeWorkspace && <WorkspaceSettings activeWorkspace={activeWorkspace as any} />}

				{/* QR Settings */}
				<QRSettings />

				{/* Notification Settings */}
				<NotificationSettings />

				{/* Category Manager */}
				<CategoryManager />

				{/* Logout */}
				<LogoutButton />
			</div>
		</main>
	);
}
