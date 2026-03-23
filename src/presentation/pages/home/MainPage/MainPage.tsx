"use client";
import styles from "./MainPage.module.scss";
import { useMainPage } from "./MainPage.logic";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  HeroSection, Container, SectionHeader, ActivityCarousel,
  FeaturedPostCard, AboutSection, ContactSection, Button,
  LoadingState, VolunteerSpotlightCard, MagazineCard
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";

const MainPage = () => {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    posts, activities, spotlights, magazines,
    hasMorePosts, hasMoreSpotlights, hasMoreMagazines,
    loading, submitting, getActionButton
  } = useMainPage();

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!els?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  if (loading) return <LoadingState />;

  return (
    <div ref={rootRef}>
      <HeroSection />

      {activities.length > 0 && (
        <section id="opportunities" className={styles.section}>
          <Container>
            <div data-reveal className={styles.reveal}>
              <ActivityCarousel
                activities={activities}
                getActionButton={getActionButton}
                submitting={submitting}
                onViewAll={() => router.push(ROUTES.ACTIVITIES)}
              />
            </div>
          </Container>
        </section>
      )}

      {posts.length > 0 && (
        <section className={styles.section}>
          <Container>
            <div data-reveal className={styles.reveal}>
              <SectionHeader title="منشورات ملهمة" subtitle="تجارب وإنجازات تستحق أن تُشارك" />
            </div>
            <div data-reveal className={`${styles.postsGrid} ${styles.revealStagger}`}>
              {posts.map((post) => (
                <FeaturedPostCard key={post.id} id={post.id} imageUrl={post.imageUrl}
                  title={post.title} description={post.description} variant="glass" />
              ))}
            </div>
            {hasMorePosts && (
              <div data-reveal className={`${styles.viewAll} ${styles.reveal}`}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.POSTS)}>
                  عرض جميع المنشورات
                </Button>
              </div>
            )}
          </Container>
        </section>
      )}

      {spotlights.length > 0 && (
        <section className={styles.section}>
          <Container>
            <div data-reveal className={styles.reveal}>
              <SectionHeader title="أبرز المتطوعين" subtitle="نحتفي بنماذج مضيئة كرّست وقتها لخدمة المجتمع" />
            </div>
            <div data-reveal className={`${styles.spotlightsGrid} ${styles.revealStagger}`}>
              {spotlights.map((s) => <VolunteerSpotlightCard key={s.id} spotlight={s} />)}
            </div>
            {hasMoreSpotlights && (
              <div data-reveal className={`${styles.viewAll} ${styles.reveal}`}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.SPOTLIGHT.BASE)}>
                  تعرّف على ملهمينا
                </Button>
              </div>
            )}
          </Container>
        </section>
      )}

      {magazines.length > 0 && (
        <section className={styles.section}>
          <Container>
            <div data-reveal className={styles.reveal}>
              <SectionHeader title="حصاد العطاء" subtitle="توثيق شامل لإنجازاتنا وفعالياتنا في إصدارات رقمية" />
            </div>
            <div data-reveal className={`${styles.magazinesGrid} ${styles.revealStagger}`}>
              {magazines.map((m) => (
                <MagazineCard key={m.id} title={m.title} monthYear={m.monthYear} pdfUrl={m.pdfUrl} />
              ))}
            </div>
            {hasMoreMagazines && (
              <div data-reveal className={`${styles.viewAll} ${styles.reveal}`}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.MAGAZINES)}>
                  أرشيف المجلات
                </Button>
              </div>
            )}
          </Container>
        </section>
      )}

      <section id="about"><AboutSection /></section>
      <div data-reveal className={styles.reveal}>
        <section id="contact"><ContactSection /></section>
      </div>
    </div>
  );
};

export default MainPage;