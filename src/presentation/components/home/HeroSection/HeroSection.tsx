'use client';

import { ROUTES } from '@/lib';
import styles from './HeroSection.module.scss';
import { Container } from '@/presentation/components';
import Image from 'next/image';
import { FiArrowLeft, FiUsers, FiHeart } from 'react-icons/fi';
import Link from 'next/link';

const HeroSection = () => {
  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

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
              <Link href={ROUTES.LOGIN} className={styles.primaryBtn}>
                ابدأ الآن <FiArrowLeft />
              </Link>

              <Link 
                href='/#about' 
                onClick={handleAboutClick} 
                className={styles.secondaryBtn}
              >
                تعرف علينا
              </Link>
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
            <Image width={360}  height={360} priority src="/images/about.jpg" alt="Volunteer Image" />
          </div>

        </div>
      </Container>
    </section>
  );
};

export default HeroSection;