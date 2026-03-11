import type { Metadata } from 'next';
import { Providers } from './providers';
import { AnimatedBackground } from '@/presentation/components';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.youthprints.online'),

  title: {
    default: 'مبادرة بصمات شبابية | التطوع في الأردن',
    template: '%s | مبادرة بصمات شبابية',
  },

  description:
    'مبادرة بصمات شبابية — منصة تطوعية أردنية تجمع الشباب لصنع أثر حقيقي في مجتمعهم. انضم إلينا واكتشف الفرص التطوعية المتاحة.',

  keywords: [
    'تطوع الأردن',
    'فرص تطوعية',
    'مبادرة شبابية',
    'بصمات شبابية',
    'تطوع عمان',
    'منظمة تطوعية أردنية',
    'youth volunteering jordan',
    'youthprints',
  ],

  authors: [{ name: 'مبادرة بصمات شبابية', url: 'https://www.youthprints.online' }],
  creator: 'مبادرة بصمات شبابية',
  publisher: 'مبادرة بصمات شبابية',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },

  openGraph: {
    type: 'website',
    locale: 'ar_JO',
    url: 'https://www.youthprints.online',
    siteName: 'مبادرة بصمات شبابية',
    title: 'مبادرة بصمات شبابية | التطوع في الأردن',
    description:
      'منصة تطوعية أردنية تجمع الشباب لصنع أثر حقيقي. اكتشف الفرص التطوعية وانضم إلينا.',
    images: [
      {
        url: '/images/og-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'مبادرة بصمات شبابية',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'مبادرة بصمات شبابية | التطوع في الأردن',
    description: 'منصة تطوعية أردنية تجمع الشباب لصنع أثر حقيقي.',
    images: ['/images/og-preview.jpg'],
  },

  alternates: {
    canonical: 'https://www.youthprints.online',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AnimatedBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}