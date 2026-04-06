'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NOTIFICATION_HOURS = [12, 18]; // 12:00 và 18:00

function scheduleNotifications(registration: ServiceWorkerRegistration) {
  // Kiểm tra mỗi phút xem có đúng giờ không
  function checkTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    // Chỉ thông báo đúng vào phút 0 của các giờ định sẵn
    if (NOTIFICATION_HOURS.includes(h) && m === 0) {
      const lastKey = `notified-${h}`;
      const lastDate = localStorage.getItem(lastKey);
      const today = now.toDateString();

      // Chỉ thông báo 1 lần mỗi ngày mỗi giờ
      if (lastDate !== today) {
        localStorage.setItem(lastKey, today);
        const messages = [
          'Đã đến giờ ghi chi tiêu! 📝',
          'Bạn đã chi tiêu gì hôm nay chưa? 💰',
          'Nhắc nhở: ghi lại chi tiêu để quản lý tốt hơn! 🏠',
        ];
        const body = messages[Math.floor(Math.random() * messages.length)];

        registration.showNotification('Chi tiêu gia đình', {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: `expense-reminder-${h}`,
          renotify: true,
          data: { url: '/dashboard' },
        } as NotificationOptions);
      }
    }
  }

  // Chạy ngay 1 lần và sau đó mỗi phút
  checkTime();
  const id = setInterval(checkTime, 60 * 1000);
  return id;
}

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [swReady, setSwReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu đã dismiss banner trước đó
    const wasDismissed = localStorage.getItem('notification-banner-dismissed');
    if (wasDismissed) setDismissed(true);

    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const perm = Notification.permission;
    setPermission(perm);

    // Đăng ký service worker
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((reg) => {
        setSwReady(true);

        if (perm === 'granted') {
          // Đã có quyền → lên lịch thông báo ngay
          scheduleNotifications(reg);
        } else if (perm === 'default' && !wasDismissed) {
          // Chưa có quyền → hiện banner
          setShowBanner(true);
        }
      })
      .catch((err) => console.warn('SW register failed:', err));
  }, []);

  async function requestPermission() {
    if (!('Notification' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ thông báo.');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    setShowBanner(false);

    if (result === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      scheduleNotifications(reg);
    }
  }

  function dismiss() {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', '1');
  }

  // Không hiển thị gì nếu trình duyệt không hỗ trợ
  if (typeof window !== 'undefined' && !('Notification' in window)) return null;

  // Banner nhắc bật thông báo
  if (showBanner && permission === 'default' && !dismissed) {
    return (
      <div className='fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96'>
        <div className='glass-card macos-shadow-lg border border-primary/20 p-4 rounded-2xl'>
          <div className='flex items-start gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
              <Bell className='w-5 h-5 text-primary' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='font-semibold text-sm'>Bật thông báo nhắc nhở?</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Nhắc nhở lúc <strong>12:00</strong> và <strong>18:00</strong> để ghi chi tiêu.
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
            <button onClick={dismiss} className='text-muted-foreground hover:text-foreground p-1'>
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Hook để dùng trong Settings
export function useNotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  async function toggle() {
    if (permission === 'granted') {
      // Không thể revoke qua JS, hướng dẫn user tắt thủ công
      alert('Để tắt thông báo, vào Cài đặt trình duyệt → Thông báo → Tắt cho trang này.');
    } else {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        scheduleNotifications(reg);
      }
    }
  }

  return { permission, toggle };
}
