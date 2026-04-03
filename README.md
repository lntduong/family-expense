# 💰 Family Expense Management

Ứng dụng quản lý chi tiêu gia đình tối giản, được xây dựng với Next.js 14 và tối ưu cho mobile.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.11-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Tính năng

### 📝 Quản lý chi tiêu
- Ghi chi tiêu nhanh với danh mục tùy chỉnh
- Lịch sử chi tiêu theo ngày, tìm kiếm & lọc
- Vuốt trái để xóa (swipe-to-delete)
- Hỗ trợ ghi chú cho mỗi khoản chi

### 📊 Thống kê & Phân tích
- Biểu đồ chi tiêu theo ngày/tháng/danh mục
- So sánh chi tiêu giữa các tháng
- Dự đoán chi tiêu cuối tháng
- Cảnh báo khi gần/vượt ngân sách

### 💵 Ngân sách
- Đặt ngân sách theo tháng
- Thanh tiến độ trực quan
- Cảnh báo thông minh (80%, 100%, vượt mức)

### 👨‍👩‍👧 Vai trò gia đình
- **Wife**: Nhập chi tiêu, quản lý danh mục
- **Husband**: Xem chi tiêu, xác nhận chuyển tiền

### 💳 Thanh toán
- Tạo QR VietQR để nhận tiền
- Tính toán kết toán cuối tháng
- Tải ảnh QR code

### 📱 PWA & Mobile
- Cài đặt như app native (Add to Home Screen)
- Thông báo nhắc nhở lúc 12h và 18h
- Giao diện tối ưu cho mobile
- Dark mode

### 📤 Xuất dữ liệu
- Export CSV cho Excel/Google Sheets

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Database** | PostgreSQL (Neon recommended) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js |
| **Realtime** | Pusher (optional) |
| **Deployment** | Vercel |

---

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- PostgreSQL database (local hoặc cloud như [Neon](https://neon.tech))

### 1. Clone repository

```bash
git clone https://github.com/your-username/family-expense-management.git
cd family-expense-management
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Điền các biến môi trường:

```env
# Database (bắt buộc)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth (bắt buộc)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# VietQR (tùy chọn - cho tính năng QR)
NEXT_PUBLIC_VIETQR_BANK_ID="970422"
NEXT_PUBLIC_VIETQR_ACCOUNT_NO="1234567890"
NEXT_PUBLIC_VIETQR_ACCOUNT_NAME="NGUYEN VAN A"
NEXT_PUBLIC_VIETQR_TEMPLATE="compact"

# Pusher (tùy chọn - cho realtime)
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
```

### 4. Khởi tạo database

```bash
# Tạo tables
npx prisma migrate dev --name init

# (Tùy chọn) Seed dữ liệu mẫu
npx ts-node prisma/seed.ts
```

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra linting |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Chạy database migrations |

---

## 🌐 Deploy lên Vercel

### 1. Push code lên GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import project trên Vercel

1. Vào [vercel.com](https://vercel.com) → New Project
2. Import repository từ GitHub
3. Thêm Environment Variables (giống file `.env`)
4. Deploy!

### 3. Chạy migration (sau khi deploy)

```bash
npx prisma migrate deploy
```

### Lưu ý Vercel
- `DATABASE_URL` phải có `?sslmode=require`
- Vercel tự động chạy `prisma generate` qua `postinstall`
- Build command mặc định: `npm run build`

---

## 📁 Cấu trúc Project

```
family-expense-management/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── budget/         # Budget CRUD
│   │   ├── categories/     # Categories CRUD
│   │   ├── expenses/       # Expenses CRUD
│   │   ├── export/         # CSV export
│   │   ├── qr/             # VietQR generation
│   │   └── register/       # User registration
│   ├── dashboard/          # Main app pages
│   │   ├── analytic/       # Charts & statistics
│   │   ├── settings/       # App settings
│   │   └── settlement/     # Payment settlement
│   ├── qr/                 # QR code page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── providers/          # Context providers
│   ├── ui/                 # shadcn/ui components
│   └── widgets/            # Feature components
├── lib/                    # Utilities
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   ├── pusher.ts          # Pusher config
│   ├── utils.ts           # Helper functions
│   ├── validators.ts      # Zod schemas
│   └── vietqr.ts          # VietQR helpers
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration files
│   └── seed.ts            # Seed data
├── public/
│   ├── icon.svg           # Favicon
│   ├── icon-192.svg       # PWA icon
│   ├── icon-512.svg       # PWA splash
│   ├── manifest.webmanifest
│   └── service-worker.js  # PWA service worker
└── package.json
```

---

## 🗄️ Database Schema

```prisma
model User {
  id         String     @id @default(cuid())
  email      String     @unique
  password   String
  role       Role       @default(WIFE)  // WIFE | HUSBAND
  expenses   Expense[]
  budgets    Budget[]
  categories Category[]
}

model Expense {
  id         String    @id @default(cuid())
  amount     Decimal
  category   String?
  categoryId String?
  note       String?
  date       DateTime  @default(now())
  recurring  Boolean   @default(false)
  user       User      @relation(...)
}

model Budget {
  id     String  @id @default(cuid())
  month  Int
  year   Int
  limit  Decimal
  user   User    @relation(...)
}

model Category {
  id       String    @id @default(cuid())
  name     String
  icon     String    @default("📁")
  color    String    @default("#3b82f6")
  user     User      @relation(...)
  expenses Expense[]
}
```

---

## ⚡ Performance Optimizations

App đã được tối ưu cho mobile:

- ✅ **Font optimization**: Chỉ load 2 font weights + `display: swap`
- ✅ **Reduced animations**: Bỏ global transitions, giảm backdrop-blur
- ✅ **Optimized gestures**: Framer Motion swipe tối ưu
- ✅ **Code splitting**: Dynamic imports cho Charts, heavy components
- ✅ **Server prefetch**: Categories fetch từ server, không client fetch
- ✅ **Skeleton loading**: Progressive loading với Suspense
- ✅ **Image optimization**: AVIF/WebP formats, aggressive caching
- ✅ **Gzip compression**: Enabled trong Next.js config

---

## 🔔 Push Notifications

App gửi thông báo nhắc nhở lúc **12:00** và **18:00**:

> "Hãy vào app để điền thu chi bạn nhé! 💰"

**Yêu cầu:**
- User phải cho phép notification
- App được cài như PWA (Add to Home Screen)
- iOS Safari: chỉ hoạt động khi app đang mở

---

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

---

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👨‍💻 Author

Được phát triển với ❤️ cho gia đình Việt Nam.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Recharts](https://recharts.org/) - Chart library
- [VietQR](https://vietqr.io/) - QR payment standard
