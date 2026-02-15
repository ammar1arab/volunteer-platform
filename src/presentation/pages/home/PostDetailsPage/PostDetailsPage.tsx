"use client";
import styles from "./PostDetailsPage.module.scss";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { LoadingState, Button } from "@/presentation/components";
import { usePostDetails } from "@/presentation/hooks";
import { ROUTES } from "@/lib";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

const PostDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { post, loading, error } = usePostDetails(id);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingState />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.empty}>
        <p>{error || "المنشور غير موجود"}</p>
        <Button onClick={() => router.push(ROUTES.POSTS)}>رجوع للمنشورات</Button>
      </div>
    );
  }

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
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className={styles.heroImage}
            priority
          />
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.meta}>
              <span className={styles.date}>
                <Calendar size={16} />
                {new Date(post.createdAt).toLocaleDateString("ar-JO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {post.categories?.length > 0 && (
              <div className={styles.categories}>
                {post.categories.map((cat) => (
                  <span key={cat} className={styles.category}>
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* استخدام المكتبة هنا هو الحل الجذري */}
          <div className={styles.markdownBody}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                // تخصيص كيفية عرض الصور داخل النص إذا وجدت
                img: ({node, ...props}) => (
                  <span className={styles.inlineImageWrapper}>
                    <img {...props} className={styles.inlineImage} alt={props.alt || ''} />
                  </span>
                )
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