"use client";

import styles from "./AboutSection.module.scss";
import { Container, Button } from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { Fingerprint, Zap, Award, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const AboutSection = () => {
  const router = useRouter();

  return (
    <section className={styles.wrapper}>
      <Container>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div className={styles.badge}>
              <Star size={14} fill="currentColor" />
              <span>منذ عام 2012 وبصمتنا تكبر</span>
            </div>
            <h2 className={styles.title}>
              نحن لا نتطوع فقط، نحن <span className={styles.greenText}>نصنع أثراً</span> <br />
              يخلد في <span className={styles.redText}>بصمة الأردن</span>
            </h2>
            <p className={styles.leadText}>
              مبادرة بدأت بحلم شبابي بسيط، واليوم نصل لكل محافظات المملكة لنرسم خارطة جديدة من العطاء المستدام والتمكين الحقيقي.
            </p>
          </div>

          <div className={styles.visualSection}>
            <div className={styles.leftBasma}>
              <div className={styles.basmaCircle}>
                <Fingerprint size={160} strokeWidth={1} />
                <div className={styles.rippleEffect}></div>
              </div>
            </div>

            <div className={styles.rightStats}>
              <div className={styles.statCard}>
                <div className={styles.iconCircle}><Zap size={24} /></div>
                <div className={styles.info}>
                  <h3>3700+</h3>
                  <p>متطوع فاعل</p>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.greenVariant}`}>
                <div className={styles.iconCircle}><Award size={24} /></div>
                <div className={styles.info}>
                  <h3>#1</h3>
                  <p>أفضل مبادرة 2022</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actionArea}>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push(ROUTES.ABOUT)}
            >
              تعرف على رحلتنا الكاملة
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AboutSection;