"use client";
import styles from "./MainPage.module.scss";
import { useMainPage } from "./MainPage.logic";

import { useRouter } from "next/navigation";
import { HeroSection, Container, SectionHeader, ActivityCard, FeaturedPostCard, AboutSection, ContactSection, Button, LoadingState, } from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";

const MainPage = () => {
  const router = useRouter();
  const { posts, activities, hasMorePosts, hasMoreActivities, loading, submitting, getActionButton } = useMainPage();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <HeroSection />

      {/* Activities Section */}
      {activities.length > 0 && (
        <section id="opportunities" className={styles.section}>
          <Container>
            <SectionHeader title="الفرص المتاحة" subtitle="فرص تطوعية يمكنك استكشافها والتقديم عليها" />

            <div className={styles.activitiesGrid}>
              {activities.map((activity) => {
                const action = getActionButton(activity);
                return (
                  <ActivityCard
                    key={activity.id}
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
                );
              })}
            </div>

            {hasMoreActivities && (
              <div className={styles.viewAll}>
                <Button variant="primary" size="md" onClick={() => router.push(ROUTES.ACTIVITIES)}>
                  عرض جميع الفرص
                </Button>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Posts Section */}
        <section className={styles.section}>
          <Container>
            <SectionHeader title="منشورات" subtitle="تجارب وإنجازات ملهمة" />

            <div className={styles.postsGrid}>
              {posts.map((post) => (
                <FeaturedPostCard
                  key={post.id}
                  id={post.id}
                  imageUrl={post.imageUrl}
                  title={post.title}
                  description={post.description}
                  variant="glass"
                />
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

      <section id="about">
        <AboutSection />
      </section>

      <section id="contact">
        <ContactSection />
      </section>
    </>
  );
};

export default MainPage;