'use client';

import { useSession } from 'next-auth/react';
import { User, Clock, Target, Award } from 'lucide-react';
import { Container } from '@/presentation/components';
import styles from './page.module.scss';

const VolunteerProfile = () => {
  const { data: session } = useSession();

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <User size={40} />
          </div>
          <div>
            <h1 className={styles.name}>{session?.user?.name}</h1>
            <p className={styles.email}>{session?.user?.email}</p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Clock className={styles.icon} size={24} />
            <span className={styles.value}>0</span>
            <span className={styles.label}>ساعات</span>
          </div>
          
          <div className={styles.stat}>
            <Target className={styles.icon} size={24} />
            <span className={styles.value}>0</span>
            <span className={styles.label}>أنشطة</span>
          </div>
          
          <div className={styles.stat}>
            <Award className={styles.icon} size={24} />
            <span className={styles.value}>0</span>
            <span className={styles.label}>شهادات</span>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default VolunteerProfile;