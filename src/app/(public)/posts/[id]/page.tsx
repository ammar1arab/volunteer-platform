import type { Metadata } from 'next';
import { PostDetailsPage } from '@/presentation/pages';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `https://www.youthprints.online/api/featured-posts/${params.id}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error();

    const post = await res.json();

    return {
      title: post.title, 
      description: post.description?.replace(/[#*\n]/g, ' ').slice(0, 160),
      openGraph: {
        title: post.title,
        description: post.description?.replace(/[#*\n]/g, ' ').slice(0, 160),
        type: 'article',
        locale: 'ar_JO',
        url: `https://www.youthprints.online/posts/${params.id}`,
        siteName: 'مبادرة بصمات شبابية',
        images: [
          {
            url: post.imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description?.replace(/[#*\n]/g, ' ').slice(0, 160),
        images: [post.imageUrl],
      },
      alternates: {
        canonical: `https://www.youthprints.online/posts/${params.id}`,
      },
    };
  } catch {
    return {
      title: 'منشور | مبادرة بصمات شبابية',
      description: 'اقرأ آخر منشورات مبادرة بصمات شبابية',
    };
  }
}

export default function PostDetailPage() {
  return <PostDetailsPage />;
}