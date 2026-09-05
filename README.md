# Thiệp cưới Quang Huy & Hạnh Thảo

Website thiệp cưới responsive, dùng Vinext/Vite và xuất hoàn toàn tĩnh.

## Chạy trên máy

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Thư mục thành phẩm là `dist/client`.

## Deploy lên Vercel

Import thư mục dự án vào Vercel. File `vercel.json` đã khai báo sẵn lệnh build và thư mục output. Có thể đặt biến môi trường `NEXT_PUBLIC_SITE_URL` bằng domain chính thức để metadata chia sẻ dùng đúng domain.
