'use client';

import styles from './PopularActivities.module.scss';
import { Container, SectionHeader } from '@/presentation/components';
import { FiArrowLeft } from 'react-icons/fi';

const PopularActivities = () => {
  const items = [
    { id: 1, title: "حملة تنظيف الشواطئ", category: "بيئي" },
    { id: 2, title: "دعم تعليمي للأطفال", category: "تعليمي" },
    { id: 3, title: "زيارة دور الأيتام", category: "اجتماعي" },
    { id: 4, title: "يوم صحي مجاني", category: "صحي" },
  ];

  return (
    <section className={styles.section}>
      <Container>

        <SectionHeader
          title="أنشطة رائجة"
          subtitle="الأكثر طلباً من المتطوعين"
        />

        <div className={styles.grid}>
          {items.map((i) => (
            <div key={i.id} className={styles.card}>
              <span className={styles.category}>{i.category}</span>
              <h3 className={styles.title}>{i.title}</h3>
              <button className={styles.learnMore} type="button" aria-label={`تفاصيل ${i.title}`}>
                تفاصيل <FiArrowLeft />
              </button>
            </div>
          ))}
        </div>

      </Container>
    </section>
  );
};

export default PopularActivities;
