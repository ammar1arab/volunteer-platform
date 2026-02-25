"use client";
import styles from "./MainPage.module.scss";
import { useMainPage } from "./MainPage.logic";
import { useRouter } from "next/navigation";
import {
  HeroSection, Container, SectionHeader, ActivityCard,
  FeaturedPostCard, AboutSection, ContactSection, Button,
  LoadingState, VolunteerSpotlightCard, MagazineCard
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";

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
            <SectionHeader
              title="كن جزءاً من التغيير"
              subtitle="مبادرات تطوعية قائمة تنتظر شغفك ومهاراتك لتصنع الفرق"
            />            <div className={styles.activitiesGrid}>
              {activities.map((activity) => {
                const action = getActionButton(activity);
                return (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    actionButton={
                      <Button variant={action.variant} size="sm" disabled={action.disabled}
                        loading={submitting && !action.disabled} onClick={action.onClick}>
                        {action.label}
                      </Button>
                    }
                  />
                );
              })}
            </div>
            {hasMoreActivities && (
              <div className={styles.viewAll}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.ACTIVITIES)}>
                  استكشف كافة الفرص
                </Button>
              </div>
            )}
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
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.POSTS)}>عرض جميع المنشورات</Button>
              </div>
            )}
          </Container>
        </section>
      )}

      {spotlights.length > 0 && (
        <section className={styles.section}>
          <Container>
            <SectionHeader
              title="سفراء الأثر"
              subtitle="نحتفي بنماذج مضيئة كرّست وقتها لخدمة المجتمع"
            />         <div className={styles.spotlightsGrid}>
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
            <SectionHeader
              title="حصاد الشهر"
              subtitle="توثيق شامل لإنجازاتنا وفعالياتنا في إصدارات رقمية"
            />
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