'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface BudgetWarningProps {
	current: number;
	limit: number;
	daysLeft: number;
	dailyAverage: number;
}

export function BudgetWarning({ current, limit, daysLeft, dailyAverage }: BudgetWarningProps) {
	const [dismissed, setDismissed] = useState(false);
	const [hasNotified, setHasNotified] = useState(false);

	const percent = limit > 0 ? (current / limit) * 100 : 0;
	const remaining = limit - current;
	const projectedTotal = current + (dailyAverage * daysLeft);
	const willExceed = projectedTotal > limit;
	
	// Determine warning level
	const getWarningLevel = () => {
		if (percent >= 100) return 'exceeded';
		if (percent >= 90) return 'critical';
		if (percent >= 80) return 'warning';
		return 'safe';
	};

	const level = getWarningLevel();

	// Request notification permission and show notification
	useEffect(() => {
		if (level !== 'safe' && !hasNotified && typeof window !== 'undefined') {
			// Check if we already notified today
			const lastNotified = localStorage.getItem('budget-warning-date');
			const today = new Date().toDateString();
			
			if (lastNotified === today) {
				setHasNotified(true);
				return;
			}

			// Request permission and send notification
			if ('Notification' in window && Notification.permission === 'granted') {
				sendNotification(level, percent);
				localStorage.setItem('budget-warning-date', today);
				setHasNotified(true);
			} else if ('Notification' in window && Notification.permission !== 'denied') {
				Notification.requestPermission().then(permission => {
					if (permission === 'granted') {
						sendNotification(level, percent);
						localStorage.setItem('budget-warning-date', today);
						setHasNotified(true);
					}
				});
			}
		}
	}, [level, percent, hasNotified]);

	const sendNotification = (level: string, percent: number) => {
		const messages = {
			exceeded: `⚠️ Bạn đã vượt ngân sách! Đã chi ${percent.toFixed(0)}%`,
			critical: `🔴 Cảnh báo! Đã chi ${percent.toFixed(0)}% ngân sách`,
			warning: `🟡 Lưu ý: Đã chi ${percent.toFixed(0)}% ngân sách tháng`,
		};

		new Notification('Quản lý chi tiêu', {
			body: messages[level as keyof typeof messages],
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			tag: 'budget-warning',
			renotify: true,
		});
	};

	if (limit === 0 || level === 'safe' || dismissed) {
		return null;
	}

	const styles = {
		exceeded: {
			bg: 'bg-red-500/10 border-red-500/30',
			icon: 'text-red-500',
			progress: 'bg-red-500',
			text: 'text-red-600 dark:text-red-400',
		},
		critical: {
			bg: 'bg-orange-500/10 border-orange-500/30',
			icon: 'text-orange-500',
			progress: 'bg-orange-500',
			text: 'text-orange-600 dark:text-orange-400',
		},
		warning: {
			bg: 'bg-yellow-500/10 border-yellow-500/30',
			icon: 'text-yellow-500',
			progress: 'bg-yellow-500',
			text: 'text-yellow-600 dark:text-yellow-400',
		},
		safe: {
			bg: 'bg-green-500/10 border-green-500/30',
			icon: 'text-green-500',
			progress: 'bg-green-500',
			text: 'text-green-600 dark:text-green-400',
		},
	};

	const style = styles[level];

	return (
		<Card className={`${style.bg} border relative overflow-hidden`}>
			<Button
				variant='ghost'
				size='icon'
				className='absolute top-2 right-2 h-6 w-6 opacity-50 hover:opacity-100'
				onClick={() => setDismissed(true)}
			>
				<X className='h-4 w-4' />
			</Button>
			
			<CardContent className='pt-4 pb-4'>
				<div className='flex items-start gap-3'>
					<div className={`p-2 rounded-full ${style.bg}`}>
						{level === 'exceeded' ? (
							<AlertTriangle className={`h-5 w-5 ${style.icon}`} />
						) : (
							<TrendingUp className={`h-5 w-5 ${style.icon}`} />
						)}
					</div>
					
					<div className='flex-1 space-y-2'>
						<div className='flex items-center justify-between'>
							<h4 className={`font-semibold ${style.text}`}>
								{level === 'exceeded' && 'Vượt ngân sách!'}
								{level === 'critical' && 'Sắp hết ngân sách!'}
								{level === 'warning' && 'Cảnh báo chi tiêu'}
							</h4>
							<span className={`text-sm font-bold ${style.text}`}>
								{percent.toFixed(0)}%
							</span>
						</div>

						<Progress 
							value={Math.min(percent, 100)} 
							className='h-2'
						/>

						<div className='text-sm text-muted-foreground space-y-1'>
							<p>
								Đã chi: <strong>{current.toLocaleString('vi-VN')} ₫</strong> / {limit.toLocaleString('vi-VN')} ₫
							</p>
							
							{remaining > 0 ? (
								<p>
									Còn lại: <strong>{remaining.toLocaleString('vi-VN')} ₫</strong> 
									{daysLeft > 0 && (
										<span className='text-xs'> ({Math.floor(remaining / daysLeft).toLocaleString('vi-VN')} ₫/ngày)</span>
									)}
								</p>
							) : (
								<p className={style.text}>
									Đã vượt: <strong>{Math.abs(remaining).toLocaleString('vi-VN')} ₫</strong>
								</p>
							)}

							{willExceed && remaining > 0 && (
								<p className='text-orange-500 text-xs mt-2'>
									⚠️ Dự kiến vượt ngân sách cuối tháng nếu tiếp tục chi như hiện tại
								</p>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Enable notification permission request
export function NotificationPermissionButton() {
	const [permission, setPermission] = useState<NotificationPermission>('default');

	useEffect(() => {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			setPermission(Notification.permission);
		}
	}, []);

	const requestPermission = async () => {
		if ('Notification' in window) {
			const result = await Notification.requestPermission();
			setPermission(result);
		}
	};

	if (permission === 'granted') {
		return (
			<div className='flex items-center gap-2 text-sm text-green-600'>
				<CheckCircle2 className='h-4 w-4' />
				<span>Đã bật thông báo</span>
			</div>
		);
	}

	if (permission === 'denied') {
		return (
			<p className='text-sm text-muted-foreground'>
				Thông báo đã bị chặn. Vào cài đặt trình duyệt để bật lại.
			</p>
		);
	}

	return (
		<Button variant='outline' size='sm' onClick={requestPermission}>
			Bật thông báo cảnh báo
		</Button>
	);
}
