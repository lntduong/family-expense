'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

export function NotificationSettings() {
  const [status, setStatus] = useState<Status>('loading');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? 'subscribed' : 'unsubscribed');
    } catch {
      setStatus('unsubscribed');
    }
  }

  async function subscribe() {
    setWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      if (res.ok) {
        setStatus('subscribed');
        // Xoá flag "đã dismiss" để banner không ẩn nữa
        localStorage.removeItem('notif-banner-dismissed');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setWorking(false);
    }
  }

  async function unsubscribe() {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus('unsubscribed');
    } catch (err) {
      console.error('Unsubscribe error:', err);
    } finally {
      setWorking(false);
    }
  }

  const statusConfig = {
    loading: {
      icon: <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />,
      label: 'Đang kiểm tra...',
      desc: '',
      color: 'text-muted-foreground',
    },
    unsupported: {
      icon: <BellOff className='w-5 h-5 text-muted-foreground' />,
      label: 'Không hỗ trợ',
      desc: 'Trình duyệt này không hỗ trợ thông báo đẩy.',
      color: 'text-muted-foreground',
    },
    denied: {
      icon: <BellOff className='w-5 h-5 text-destructive' />,
      label: 'Đã bị chặn',
      desc: 'Bạn đã tắt thông báo. Vào Cài đặt trình duyệt → Thông báo → Bật cho trang này.',
      color: 'text-destructive',
    },
    subscribed: {
      icon: <CheckCircle className='w-5 h-5 text-green-500' />,
      label: 'Đã bật',
      desc: 'Bạn sẽ nhận thông báo vào 9:00, 12:00, 15:00, 18:00 và 21:00 hàng ngày.',
      color: 'text-green-500',
    },
    unsubscribed: {
      icon: <Bell className='w-5 h-5 text-muted-foreground' />,
      label: 'Chưa bật',
      desc: 'Bật để nhận nhắc nhở ghi chi tiêu vào 9:00, 12:00, 15:00, 18:00 và 21:00.',
      color: 'text-muted-foreground',
    },
  };

  const cfg = statusConfig[status];

  return (
    <Card className='glass-card macos-shadow'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Bell className='w-4 h-4' />
          Thông báo nhắc nhở
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Status row */}
        <div className='flex items-start gap-3 p-3 rounded-xl bg-muted/30'>
          {cfg.icon}
          <div>
            <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
            {cfg.desc && (
              <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>{cfg.desc}</p>
            )}
          </div>
        </div>

        {/* Action button */}
        {status === 'subscribed' && (
          <Button
            variant='outline'
            size='sm'
            onClick={unsubscribe}
            disabled={working}
            className='w-full'
          >
            {working ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : <BellOff className='w-4 h-4 mr-2' />}
            Tắt thông báo
          </Button>
        )}

        {status === 'unsubscribed' && (
          <Button
            size='sm'
            onClick={subscribe}
            disabled={working}
            className='w-full'
          >
            {working ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : <Bell className='w-4 h-4 mr-2' />}
            Bật thông báo
          </Button>
        )}

        {status === 'denied' && (
          <p className='text-xs text-muted-foreground text-center'>
            Trên Chrome Android: Cài đặt → Quyền riêng tư → Thông báo trang web
          </p>
        )}
      </CardContent>
    </Card>
  );
}
