import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'VLU Super Admin', description: 'Hệ thống quản trị toàn diện – Văn Lang University' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
