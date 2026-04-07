'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!;

// Chuyển base64 URL-safe string sang Uint8Array cho Web Push
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
    });

    // Lưu subscription lên server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    });

    return sub;
  } catch (err) {
    console.error('Push subscribe error:', err);
    return null;
  }
}

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!('Notification' in window)) return;

    const perm = Notification.permission;
    setPermission(perm);

    const wasDismissed = localStorage.getItem('notif-banner-dismissed');
    if (wasDismissed) setDismissed(true);

    if (perm === 'granted') {
      // Đã có quyền → đảm bảo subscription tồn tại trên server
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            // Re-save subscription đề phòng server mất data
            fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sub.toJSON()),
            }).catch(() => {});
          }
        });
      });
    } else if (perm === 'default' && !wasDismissed) {
      // Delay 3 giây trước khi hiện banner
      const t = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  async function requestPermission() {
    if (!('Notification' in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    setShowBanner(false);

    if (result === 'granted') {
      await subscribeToPush();
    }
  }

  function dismiss() {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('notif-banner-dismissed', '1');
  }

  if (!mounted || !('Notification' in window)) return null;
  if (!showBanner || permission !== 'default' || dismissed) return null;

  return (
    <div className='fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96 animate-in slide-in-from-bottom-4 duration-300'>
      <div className='glass-card macos-shadow-lg border border-primary/20 p-4 rounded-2xl'>
        <div className='flex items-start gap-3'>
          <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
            <Bell className='w-5 h-5 text-primary' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='font-semibold text-sm'>Bật thông báo nhắc nhở?</p>
            <p className='text-xs text-muted-foreground mt-1'>
              Nhắc nhở lúc <strong>12:00</strong> và <strong>18:00</strong> để ghi chi tiêu — ngay cả khi đóng app.
            </p>
            <div className='flex gap-2 mt-3'>
              <Button size='sm' onClick={requestPermission} className='flex-1 h-8 text-xs'>
                Bật thông báo
              </Button>
              <Button size='sm' variant='outline' onClick={dismiss} className='h-8 text-xs px-3'>
                Để sau
              </Button>
            </div>
          </div>
          <button onClick={dismiss} className='text-muted-foreground hover:text-foreground p-1 shrink-0'>
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook để dùng trong Settings page
export function useNotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    setPermission(Notification.permission);

    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  async function enable() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      const sub = await subscribeToPush();
      setIsSubscribed(!!sub);
    }
  }

  async function disable() {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
        setIsSubscribed(false);
      }
    }
  }

  return { permission, isSubscribed, enable, disable };
}
