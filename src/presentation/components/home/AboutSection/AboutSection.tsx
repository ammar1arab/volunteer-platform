"use client";
import styles from "./AboutSection.module.scss";
import { Container, Button, Badge } from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { Fingerprint, Zap, Award, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const AboutSection = () => {
  const router = useRouter();

  return (
    <section
      className={styles.wrapper}
      ref={(el) => {
        if (!el) return;
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              el.classList.add(styles.visible);
              observer.disconnect();
            }
          },
          { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
      }}
    >
      <Container>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Badge variant="info">
                <Star size={13} fill="currentColor" style={{ marginLeft: '4px' }} />
                منذ عام 2012 وبصمتنا تكبر
              </Badge>
            </div>
            <h2 className={styles.title}>
              نحن لا نتطوع فقط، نحن <span className={styles.greenText}>نصنع أثراً</span>
              <br />
              يخلد في <span className={styles.redText}>بصمة الأردن</span>
            </h2>
          </div>

          <div className={styles.visual}>
            <div className={styles.statLeft}>
              <div className={`${styles.card} ${styles.cardGreen}`}>
                <div className={styles.iconWrap}><Award size={22} /></div>
                <div>
                  <h3>#1</h3>
                  <p>أفضل مبادرة 2022</p>
                </div>
              </div>
            </div>

            <div className={styles.center}>
              <div className={styles.fingerprint}>
                <Fingerprint size={148} strokeWidth={1} />
              </div>
            </div>

            <div className={styles.statRight}>
              <div className={styles.card}>
                <div className={styles.iconWrap}><Zap size={22} /></div>
                <div>
                  <h3>3700+</h3>
                  <p>متطوع فاعل</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cta}>
            <Button variant="primary" size="md" onClick={() => router.push(ROUTES.ABOUT)}>
              تعرف على رحلتنا الكاملة
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AboutSection;
