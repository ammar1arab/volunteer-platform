'use client';

import styles from './StatisticsSection.module.scss';
import { Container, SectionHeader } from '@/presentation/components';
import { FiSmile, FiUsers, FiCheckCircle } from 'react-icons/fi';

const StatisticsSection = () => {
  const stats = [
    { icon: <FiUsers />, number: "3,200+", label: "متطوع فعال" },
    { icon: <FiSmile />, number: "18,000+", label: "مستفيد" },
    { icon: <FiCheckCircle />, number: "150+", label: "مبادرة ناجحة" },
  ];

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeader title="أرقام نتفاخر بها" subtitle="إنجازات حقيقية بفضل متطوعينا" />

        <div className={styles.grid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{s.icon}</div>
              <h3 className={styles.number}>{s.number}</h3>
              <p className={styles.label}>{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default StatisticsSection;
