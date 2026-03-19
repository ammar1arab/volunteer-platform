import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.youthprints.online'),

  title: {
    default: 'مبادرة بصمات شبابية',
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
    'volunteer jordan',
    'تطوع شباب',
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },

  openGraph: {
    type: 'website',
    locale: 'ar_JO',
    url: 'https://www.youthprints.online',
    siteName: 'مبادرة بصمات شبابية',
    title: 'مبادرة بصمات شبابية',
    description: 'منصة تطوعية أردنية تجمع الشباب لصنع أثر حقيقي. اكتشف الفرص التطوعية وانضم إلينا.',
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
    title: 'مبادرة بصمات شبابية',
    description: 'منصة تطوعية أردنية تجمع الشباب لصنع أثر حقيقي.',
    images: ['/images/og-preview.jpg'],
  },

  alternates: {
    canonical: 'https://www.youthprints.online',
  },

  verification: {
    google: 'q0OmESGMWPoG4Xl98nNd23zMAQzPmsIIHAHAitRmkl4',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "VolunteerOrganization",
                name: "مبادرة بصمات شبابية",
                alternateName: "Youthprints Initiative",
                url: "https://www.youthprints.online",
                logo: "https://www.youthprints.online/images/logo.png",
                foundingDate: "2012",
                description: "منصة تطوعية أردنية تجمع الشباب لصنع أثر حقيقي في مجتمعهم",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "عمان",
                  addressRegion: "عمان",
                  addressCountry: "JO",
                },
                sameAs: [
                  "https://www.instagram.com/basmatshababia/",
                  "https://web.facebook.com/p/%D9%85%D8%A8%D8%A7%D8%AF%D8%B1%D8%A9-%D8%A8%D8%B5%D9%85%D8%A7%D8%AA-%D8%B4%D8%A8%D8%A7%D8%A8%D9%8A%D8%A9-100063497834494/",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "مبادرة بصمات شبابية",
                url: "https://www.youthprints.online",
                inLanguage: "ar",
              },
            ]),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}