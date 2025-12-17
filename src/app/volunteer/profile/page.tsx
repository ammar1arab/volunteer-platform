'use client';

import { Target, FileText, Clock, Award } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';
import { Container } from '@/presentation/components';
import type { DashboardCard } from '@/lib/types';
import styles from './page.module.scss';

const PROFILE_CARDS: DashboardCard[] = [
  {
    id: 'activities',
    title: 'الأنشطة المتاحة',
    description: 'تصفح الفرص التطوعية المتاحة',
    icon: 'target',
  },
  {
    id: 'applications',
    title: 'طلباتي',
    description: 'عرض حالة طلباتك التطوعية',
    icon: 'file',
  },
  {
    id: 'hours',
    title: 'ساعات التطوع',
    description: 'عدد الساعات التطوعية: 0',
    icon: 'clock',
  },
  {
    id: 'certificates',
    title: 'الشهادات',
    description: 'تحميل شهاداتك التطوعية',
    icon: 'award',
  },
];

const ICON_MAP = {
  target: Target,
  file: FileText,
  clock: Clock,
  award: Award,
};

const VolunteerProfile = () => {
  const { session, isLoading } = useAuth({
    requireAuth: true,
    requireRole: 'VOLUNTEER',
  });

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper} role="status" aria-live="polite">
        <p className={styles.loadingText}>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Container>
        <main className={styles.contentWrapper} role="main">
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>الملف الشخصي</h1>
            <p className={styles.welcomeText}>
              مرحباً، <strong>{session?.user?.name}</strong>
            </p>
          </header>

          <section className={styles.cardsGrid} aria-label="إحصائيات الملف الشخصي">
            {PROFILE_CARDS.map((card, index) => {
              const IconComponent = ICON_MAP[card.icon as keyof typeof ICON_MAP];
              
              return (
                <article
                  key={card.id}
                  className={styles.profileCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.cardIconWrapper}>
                    <IconComponent className={styles.cardIcon} size={32} aria-hidden="true" />
                  </div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                </article>
              );
            })}
          </section>
        </main>
      </Container>
    </div>
  );
};

export default VolunteerProfile;