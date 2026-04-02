# Family Expense Management (Next.js)

## Chạy cục bộ
1. Sao chép `.env.example` thành `.env` và điền biến (Neon, NextAuth secret, VietQR, Pusher nếu dùng realtime).
2. Cài đặt: `npm install`
3. Tạo DB & migrate: `npx prisma migrate dev --name init`
4. Seed mẫu: `npx ts-node prisma/seed.ts`
5. Chạy dev: `npm run dev`

## Triển khai Vercel
- Thêm biến môi trường như `.env` (DATABASE_URL phải sslmode=require).
- Thiết lập build command: `npm run build` (Vercel tự chạy install + prisma generate).
- Sau khi deploy, chạy `npx prisma migrate deploy` (Vercel Post-build) nếu cần.

## Tính năng chính
- Ghi chi phí nhanh, lịch sử, lọc/search, thống kê biểu đồ, ngân sách tháng + cảnh báo.
- Vai trò Wife/Husband (Wife nhập, Husband xem/xác nhận chuyển tiền).
- QR VietQR tạo sẵn, hỗ trợ tải ảnh.
- Export CSV, PWA offline cơ bản, Dark mode.

## Ghi chú
- Chưa cấu hình upload ảnh hóa đơn; có thể dùng Vercel Blob/Supabase Storage tại `/api/expenses` khi mở rộng.
- Realtime cần thiết lập Pusher key.
- VietQR: đặt `NEXT_PUBLIC_VIETQR_*` và server `VIETQR_*` để tạo mặc định.
