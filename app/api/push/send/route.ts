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
  let messages = ['Đừng quên cập nhật chi tiêu nhé! 💸'];

  if (hourICT >= 6 && hourICT <= 10) {
    // Sáng (9h)
    messages = [
      'Chào buổi sáng! Bạn đã ăn sáng chưa? Ghi lại chi tiêu nhé 🍳',
      'Đầu ngày mới! Chúc bạn ngày làm việc hiệu quả và đừng quên ghi chi tiêu ☀️',
      'Đã 9 giờ sáng! Hôm nay bạn có dự định chi tiêu gì không? ☕',
    ];
  } else if (hourICT >= 11 && hourICT <= 13) {
    // Trưa (12h)
    messages = [
      'Đã 12 giờ trưa! Hôm nay bạn đã chi tiêu gì chưa? 🍜',
      'Giờ nghỉ trưa rồi! Ghi lại chi tiêu buổi sáng nhé 📝',
      'Nhắc nhở buổi trưa: cập nhật chi tiêu để quản lý tốt hơn 💰',
    ];
  } else if (hourICT >= 14 && hourICT <= 16) {
    // Chiều (15h)
    messages = [
      '3 giờ chiều rôì! Có ăn vặt gì không thì ghi vào app nhé 🧋',
      'Buổi chiều thảnh thơi! Uống nước và quản lý chi tiêu nào 🥤',
      'Break time! Nhập chi tiêu một xíu cho đỡ quên nhé 📋',
    ];
  } else if (hourICT >= 17 && hourICT <= 19) {
    // Tối (18h)
    messages = [
      'Sắp hết ngày rồi! Đừng quên ghi lại chi tiêu hôm nay 📊',
      '6 giờ chiều! Tổng kết chi tiêu trong ngày nào 💳',
      'Nhắc nhở xế chiều: Đi chợ hay siêu thị thì nhớ điền app nhé 🛒',
    ];
  } else if (hourICT >= 20 || hourICT <= 5) {
    // Đêm (21h)
    messages = [
      'Đã 9 giờ tối! Kiểm tra lại xem hôm nay bạn nhập đủ chi tiêu chưa? 🌙',
      'Cuối ngày rồi! Tổng kết chi phí để đi ngủ ngon giấc nhé 😴',
      'Nhắc lại lần cuối trước khi ngủ: Ghi sổ xong mình đi ngủ nhen 🏠',
    ];
  }

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

// GET — Vercel Cron gọi endpoint này (Vercel tự inject Authorization header)
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return POST(new Request(req.url, { method: 'POST', headers: req.headers }));
}
