import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import PasswordGate from '@/components/PasswordGate';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Case Management Online — Выписка',
  description: 'История согласования операций',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable} h-full`}>
      <body className="h-full bg-black text-[#FAFAFA]">
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
