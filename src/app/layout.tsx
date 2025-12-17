import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/presentation/styles/globals.scss';

export const metadata: Metadata = {
  title: {
    default: "مبادرة بصمات شبابية",
    template: '%s | مبادرة بصمات شبابية',
  },
  description: "مبادرة بصمات شبابية",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
