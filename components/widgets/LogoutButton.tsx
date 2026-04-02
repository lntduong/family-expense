'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ExitIcon } from '@radix-ui/react-icons';

export function LogoutButton() {
	return (
		<div className='glass-card macos-shadow-md p-6'>
			<h2 className='text-lg font-semibold mb-2'>Tài khoản</h2>
			<p className='text-sm text-muted-foreground mb-4'>
				Đăng xuất khỏi ứng dụng
			</p>
			<Button
				variant='outline'
				onClick={() => signOut({ callbackUrl: '/login' })}
				className='w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500/30'
			>
				<ExitIcon className='h-4 w-4' />
				Đăng xuất
			</Button>
		</div>
	);
}
