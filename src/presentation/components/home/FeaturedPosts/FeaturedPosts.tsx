"use client";

import styles from "./FeaturedPosts.module.scss";
import { Container, SectionHeader, FeaturedPostCard, LoadingState } from "@/presentation/components";
import { useFeaturedPosts } from "@/presentation/hooks";

const FeaturedPosts = () => {
  const { list, isLoading } = useFeaturedPosts({ activeOnly: true });

  if (!isLoading && list.length === 0) return null;

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeader title="منشورات" subtitle="تجارب وإنجازات ملهمة" />
        <div className={styles.grid}>
          {isLoading ? (
            <LoadingState variant="skeleton" count={8} />
          ) : (
            list.map((post) => <FeaturedPostCard key={post.id} imageUrl={post.imageUrl} title={post.title} description={post.description} variant="glass" />)
          )}
        </div>
      </Container>
    </section>
  );
};

export default FeaturedPosts;