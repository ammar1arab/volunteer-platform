'use client';

import styles from './HeroSection.module.scss';
import { Container } from '@/presentation/components';
import { FiArrowLeft, FiUsers, FiHeart } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.wrapper}>
          
          <div className={styles.textBox}>
            <h1 className={styles.title}>
              اصنع <span>بصمتك</span> في مجتمعك
            </h1>

            <p className={styles.subtitle}>
              انضم إلى مئات المتطوعين وساهم في المبادرات التي تُحدث فرقاً حقيقياً في حياة الناس.
            </p>

            <div className={styles.actions}>
              <button type="button" className={styles.primaryBtn}>
                ابدأ الآن <FiArrowLeft />
              </button>

              <button type="button" className={styles.secondaryBtn}>
                تعرف علينا
              </button>
            </div>

            <div className={styles.stats}>
              <div>
                <FiUsers /> <span>+3,200 متطوع</span>
              </div>
              <div>
                <FiHeart /> <span>+150 مبادرة ناجحة</span>
              </div>
            </div>
          </div>

          <div className={styles.heroImage}>
            <img src="/images/about.jpg" alt="Volunteer Image" />
          </div>

        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
