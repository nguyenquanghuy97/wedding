import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quang Huy & Hạnh Thảo | 20.09.2026',
  description: 'Trân trọng mời bạn đến chung vui trong ngày cưới của Quang Huy và Hạnh Thảo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preload" as="image" href="/assets/hero-background.webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
