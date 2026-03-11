"use client";

import styles from "./PostDetailsPage.module.scss";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ArrowRight } from "lucide-react";
import { getCategoryLabel, ROUTES } from "@/presentation/constants";
import { LoadingState, Button } from "@/presentation/components";
import { usePostDetails } from "@/presentation/hooks";
import { DomainFeaturedPostCategory } from "@/core/domain/enums";

const PostDetailsPage = () => {
  const router = useRouter();
  const { post, loading, error } = usePostDetails(useParams()?.id as string);

  if (loading) return <div className={styles.loadingContainer}><LoadingState /></div>;

  if (error || !post) return (
    <div className={styles.empty}>
      <p>{error || "المنشور غير موجود"}</p>
      <Button onClick={() => router.push(ROUTES.POSTS)}>رجوع للمنشورات</Button>
    </div>
  );



  return (
    <div className={styles.container}>
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowRight size={18} />}
        onClick={() => router.push(ROUTES.POSTS)}
        className={styles.backBtn}
      >
        رجوع للمنشورات
      </Button>

      <article className={styles.article}>
        <div className={styles.hero}>
          <Image src={post.imageUrl} alt={post.title} fill className={styles.heroImage} priority />
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>

            {post.categories?.length > 0 && (
              <div className={styles.categories}>
                {post.categories.map((cat) => (
                  <span key={cat} className={styles.category}>
                    {getCategoryLabel(cat as DomainFeaturedPostCategory)}
                  </span>
              ))}
              </div>
            )}
          </header>

          <div className={styles.markdownBody}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                img: ({ node, ...props }) => (
                  <span className={styles.inlineImageWrapper}>
                    <img {...props} className={styles.inlineImage} alt={props.alt || ""} />
                  </span>
                ),
              }}
            >
              {post.description}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetailsPage;