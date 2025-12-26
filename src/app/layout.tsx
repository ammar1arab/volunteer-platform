import type { Metadata } from 'next';
import '@/presentation/styles/globals.scss';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: "مبادرة بصمات شبابية",
    template: '%s | مبادرة بصمات شبابية',
  },
  description: "مبادرة بصمات شبابية",
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png'
  }
};

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}