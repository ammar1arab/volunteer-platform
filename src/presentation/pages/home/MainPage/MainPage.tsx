"use client";
import styles from "./MainPage.module.scss";
import { useMainPage } from "./MainPage.logic";
import { useRouter } from "next/navigation";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  HeroSection, Container, SectionHeader, ActivityCard,
  FeaturedPostCard, AboutSection, ContactSection, Button,
  LoadingState, VolunteerSpotlightCard, MagazineCard
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ActivityCarousel = ({ activities, getActionButton, submitting, onViewAll }: any) => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.querySelector("li")?.getBoundingClientRect().width ?? 400;
    el.scrollBy({ left: dir === "left" ? cardW + 16 : -(cardW + 16), behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isPaused || isDragging.current) return;

    const interval = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;

      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("left");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, scroll]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollStart.current = trackRef.current?.scrollLeft ?? 0;
    if (trackRef.current) trackRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - trackRef.current.offsetLeft - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollStart.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };

  return (
    <div
      className={styles.carouselRoot}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className={styles.carouselHeader}>
        <SectionHeader
          title="كن جزءاً من التغيير"
          subtitle="مبادرات تطوعية قائمة تنتظر شغفك ومهاراتك لتصنع الفرق"
        />
      </div>

      <div className={styles.carouselWrapper}>
        <button
          className={`${styles.arrowBtn} ${styles.rightArrow}`}
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="السابق"
        >
          <ChevronRight size={20} />
        </button>

        <ul
          className={styles.carouselTrack}
          ref={trackRef}
          onScroll={updateArrows}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {activities.map((activity: any) => {
            const action = getActionButton(activity);
            return (
              <li key={activity.id} className={styles.carouselItem}>
                <ActivityCard
                  activity={activity}
                  actionButton={
                    <Button
                      variant={action.variant}
                      size="sm"
                      disabled={action.disabled}
                      loading={submitting && !action.disabled}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  }
                />
              </li>
            );
          })}
        </ul>

        <button
          className={`${styles.arrowBtn} ${styles.leftArrow}`}
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="التالي"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className={styles.carouselFooter}>
        <Button variant="primary" size="md" onClick={onViewAll}>
          استكشف كافة الفرص
        </Button>
      </div>
    </div>
  );
};

const MainPage = () => {
  const router = useRouter();
  const {
    posts, activities, spotlights, magazines,
    hasMorePosts, hasMoreActivities, hasMoreSpotlights, hasMoreMagazines,
    loading, submitting, getActionButton
  } = useMainPage();

  if (loading) return <LoadingState />;

  return (
    <>
      <HeroSection />

      {activities.length > 0 && (
        <section id="opportunities" className={styles.section}>
          <Container>
            <ActivityCarousel
              activities={activities}
              getActionButton={getActionButton}
              submitting={submitting}
              onViewAll={() => router.push(ROUTES.ACTIVITIES)}
            />
          </Container>
        </section>
      )}

      {posts.length > 0 && (
        <section className={styles.section}>
          <Container>
            <SectionHeader title="منشورات ملهمة" subtitle="تجارب وإنجازات تستحق أن تُشارك" />
            <div className={styles.postsGrid}>
              {posts.map((post) => (
                <FeaturedPostCard key={post.id} id={post.id} imageUrl={post.imageUrl}
                  title={post.title} description={post.description} variant="glass" />
              ))}
            </div>
            {hasMorePosts && (
              <div className={styles.viewAll}>
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
            <SectionHeader title="أبرز المتطوعين" subtitle="نحتفي بنماذج مضيئة كرّست وقتها لخدمة المجتمع" />
            <div className={styles.spotlightsGrid}>
              {spotlights.map((s) => <VolunteerSpotlightCard key={s.id} spotlight={s} />)}
            </div>
            {hasMoreSpotlights && (
              <div className={styles.viewAll}>
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
            <SectionHeader title="المجلة الشهرية" subtitle="توثيق شامل لإنجازاتنا وفعالياتنا في إصدارات رقمية" />
            <div className={styles.magazinesGrid}>
              {magazines.map((m) => (
                <MagazineCard key={m.id} title={m.title} monthYear={m.monthYear} pdfUrl={m.pdfUrl} />
              ))}
            </div>
            {hasMoreMagazines && (
              <div className={styles.viewAll}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.MAGAZINES)}>
                  أرشيف المجلات
                </Button>
              </div>
            )}
          </Container>
        </section>
      )}

      <section id="about"><AboutSection /></section>
      <section id="contact"><ContactSection /></section>
    </>
  );
};

export default MainPage;