'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const res = await fetch('/api/register', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
			headers: { 'Content-Type': 'application/json' },
		});
		if (!res.ok) {
			const data = await res.json();
			setError(data.error || 'Không thể tạo tài khoản');
			return;
		}
		router.push('/login');
	}

	return (
		<div className='flex items-center justify-center min-h-[70vh] py-10'>
			<Card className='w-full max-w-md glass-card macos-shadow-lg'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>Tạo tài khoản</CardTitle>
					<CardDescription>
						Đăng ký để bắt đầu quản lý chi tiêu
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label>Email</Label>
							<Input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type='email'
								required
								placeholder='email@example.com'
							/>
						</div>
						<div className='space-y-2'>
							<Label>Mật khẩu</Label>
							<Input
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type='password'
								required
								placeholder='••••••••'
							/>
						</div>
						{error && <p className='text-sm text-red-500'>{error}</p>}
						<Button type='submit' className='w-full h-12 text-base font-semibold'>
							Đăng ký
						</Button>
					</form>
					<p className='text-center text-sm text-muted-foreground mt-4'>
						Đã có tài khoản?{' '}
						<Link href='/login' className='text-primary hover:underline font-medium'>
							Đăng nhập
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
