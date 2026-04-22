import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'VLU Rèn Luyện', description: 'Hệ thống Rèn Luyện Điểm – Văn Lang University' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
