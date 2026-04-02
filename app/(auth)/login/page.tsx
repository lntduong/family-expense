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
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const res = await signIn('credentials', {
			redirect: false,
			email,
			password,
		});
		if (res?.error) {
			setError('Sai thông tin đăng nhập');
		} else {
			router.push('/dashboard');
		}
	}

	return (
		<div className='flex items-center justify-center min-h-[70vh] py-10'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle>Đăng nhập</CardTitle>
					<CardDescription>Quản lý chi tiêu gia đình</CardDescription>
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
								placeholder='ban@example.com'
							/>
						</div>
						<div className='space-y-2'>
							<Label>Mật khẩu</Label>
							<Input
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type='password'
								required
							/>
						</div>
						{error && <p className='text-sm text-red-500'>{error}</p>}
						<Button type='submit' className='w-full'>
							Đăng nhập
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
