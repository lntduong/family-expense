import { NextResponse } from 'next/server';
import webpush from 'web-push';
import prisma from '@/lib/prisma';

webpush.setVapidDetails(
  process.env.VAPID_CONTACT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// POST /api/push/send — gửi thông báo tới tất cả subscriptions
// Được gọi bởi Vercel Cron lúc 12:00 và 18:00 ICT
export async function POST(req: Request) {
  // Xác thực cron secret để tránh gọi trái phép
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const hourICT = (new Date().getUTCHours() + 7) % 24; // Convert UTC → ICT (UTC+7)
  const isNoon = hourICT === 12;

  const messages = isNoon
    ? [
        'Đã 12 giờ trưa! Hôm nay bạn đã chi tiêu gì chưa? 🍜',
        'Giờ nghỉ trưa rồi! Ghi lại chi tiêu buổi sáng nhé 📝',
        'Nhắc nhở buổi trưa: cập nhật chi tiêu để quản lý tốt hơn 💰',
      ]
    : [
        'Sắp hết ngày rồi! Đừng quên ghi lại chi tiêu hôm nay 📊',
        '6 giờ chiều! Tổng kết chi tiêu trong ngày nào 💳',
        'Nhắc nhở buổi tối: điền đầy đủ chi tiêu trong ngày nhé 🏠',
      ];

  const title = body.title || 'Chi tiêu gia đình';
  const message = body.body || messages[Math.floor(Math.random() * messages.length)];

  // Lấy tất cả subscriptions
  const subscriptions = await (prisma as any).pushSubscription.findMany();

  if (subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No subscriptions' });
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };

      try {
        await webpush.sendNotification(
          pushSub,
          JSON.stringify({
            title,
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: '/dashboard',
            tag: `reminder-${Date.now()}`,
          }),
        );
        return { ok: true, endpoint: sub.endpoint };
      } catch (err: any) {
        // 410 Gone = subscription expired, xoá khỏi DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          await (prisma as any).pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
        throw err;
      }
    }),
  );

  const sent = results.filter((r): r is PromiseFulfilledResult<unknown> => r.status === 'fulfilled').length;
  const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected').length;

  return NextResponse.json({ sent, failed, total: subscriptions.length });
}

// GET — dành cho test thủ công
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return POST(req);
}
