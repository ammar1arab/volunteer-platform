import type { Metadata } from 'next';
import { ActivityDetailsPage } from '@/presentation/pages';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `https://www.youthprints.online/api/activities/${params.id}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error();

    const activity = await res.json();

    return {
      title: activity.title,
      description: activity.description?.replace(/[#*\n]/g, ' ').slice(0, 160),
      openGraph: {
        title: activity.title,
        description: activity.description?.replace(/[#*\n]/g, ' ').slice(0, 160),
        type: 'website',
        locale: 'ar_JO',
        url: `https://www.youthprints.online/activities/${activity.id}`,
        siteName: 'مبادرة بصمات شبابية',
        images: activity.imageUrl
          ? [{ url: activity.imageUrl, width: 1200, height: 630, alt: activity.title }]
          : [{ url: '/images/og-preview.jpg', width: 1200, height: 630, alt: 'مبادرة بصمات شبابية' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: activity.title,
        description: activity.description?.replace(/[#*\n]/g, ' ').slice(0, 160),
        images: activity.imageUrl ? [activity.imageUrl] : ['/images/og-preview.jpg'],
      },
      alternates: {
        canonical: `https://www.youthprints.online/activities/${params.id}`,
      },
    };
  } catch {
    return {
      title: 'فرصة تطوعية | مبادرة بصمات شبابية',
      description: 'اكتشف الفرص التطوعية المتاحة مع مبادرة بصمات شبابية في الأردن',
    };
  }
}

export default function ActivityDetailPage() {
  return <ActivityDetailsPage />;
}