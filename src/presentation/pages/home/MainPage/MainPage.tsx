"use client";
import styles from "./MainPage.module.scss";
import { useMainPage } from "./MainPage.logic";
import { useRouter } from "next/navigation";
import {
  HeroSection, Container, SectionHeader, ActivityCarousel,
  FeaturedPostCard, AboutSection, ContactSection, Button,
  LoadingState, VolunteerSpotlightCard, MagazineCard
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";

function Reveal({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={className}
      ref={(el) => {
        if (!el) return;
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              el.classList.add(styles.revealed);
              observer.unobserve(el);
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
      }}
    >
      {children}
    </div>
  );
}

const MainPage = () => {
  const router = useRouter();
  const {
    posts, activities, spotlights, magazines,
    hasMorePosts, hasMoreSpotlights, hasMoreMagazines,
    loading, submitting, getActionButton
  } = useMainPage();

  if (loading) return <LoadingState />;

  return (
    <div>
      <HeroSection />

      {activities.length > 0 && (
        <section id="opportunities" className={styles.section}>
          <Container>
            <Reveal className={styles.reveal}>
              <ActivityCarousel
                activities={activities}
                getActionButton={getActionButton}
                submitting={submitting}
                onViewAll={() => router.push(ROUTES.ACTIVITIES)}
              />
            </Reveal>
          </Container>
        </section>
      )}

      {posts.length > 0 && (
        <section className={styles.section}>
          <Container>
            <Reveal className={styles.reveal}>
              <SectionHeader title="منشورات ملهمة" subtitle="تجارب وإنجازات تستحق أن تُشارك" />
            </Reveal>
            <Reveal className={`${styles.postsGrid} ${styles.revealStagger}`}>
              {posts.map((post) => (
                <FeaturedPostCard key={post.id} id={post.id} imageUrl={post.imageUrl}
                  title={post.title} description={post.description} variant="glass" />
              ))}
            </Reveal>
            {hasMorePosts && (
              <Reveal className={`${styles.viewAll} ${styles.reveal}`}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.POSTS)}>
                  عرض جميع المنشورات
                </Button>
              </Reveal>
            )}
          </Container>
        </section>
      )}

      {spotlights.length > 0 && (
        <section className={styles.section}>
          <Container>
            <Reveal className={styles.reveal}>
              <SectionHeader title="أبرز المتطوعين" subtitle="نحتفي بنماذج مضيئة كرّست وقتها لخدمة المجتمع" />
            </Reveal>
            <Reveal className={`${styles.spotlightsGrid} ${styles.revealStagger}`}>
              {spotlights.map((s) => <VolunteerSpotlightCard key={s.id} spotlight={s} />)}
            </Reveal>
            {hasMoreSpotlights && (
              <Reveal className={`${styles.viewAll} ${styles.reveal}`}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.SPOTLIGHT.BASE)}>
                  تعرّف على ملهمينا
                </Button>
              </Reveal>
            )}
          </Container>
        </section>
      )}

      {magazines.length > 0 && (
        <section className={styles.section}>
          <Container>
            <Reveal className={styles.reveal}>
              <SectionHeader title="حصاد العطاء" subtitle="توثيق شامل لإنجازاتنا وفعالياتنا في إصدارات رقمية" />
            </Reveal>
            <Reveal className={`${styles.magazinesGrid} ${styles.revealStagger}`}>
              {magazines.map((m) => (
                <MagazineCard key={m.id} title={m.title} monthYear={m.monthYear} pdfUrl={m.pdfUrl} />
              ))}
            </Reveal>
            {hasMoreMagazines && (
              <Reveal className={`${styles.viewAll} ${styles.reveal}`}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.MAGAZINES)}>
                  أرشيف المجلات
                </Button>
              </Reveal>
            )}
          </Container>
        </section>
      )}

      <section id="about"><AboutSection /></section>
      <Reveal className={styles.reveal}>
        <section id="contact"><ContactSection /></section>
      </Reveal>
    </div>
  );
};

export default MainPage;
