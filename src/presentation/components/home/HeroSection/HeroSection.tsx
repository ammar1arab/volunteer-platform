"use client";
import styles from "./HeroSection.module.scss";
import Link from "next/link";
import { Button } from "@/presentation/components";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/presentation/constants";

const HeroSection = () => {
  const scrollToOpportunities = () => {
    document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className={styles.hero}>
      <div className={styles.orb} data-orb="1" />
      <div className={styles.orb} data-orb="2" />
      <div className={styles.orb} data-orb="3" />
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          منصة تطوعية رائدة
        </div>
        <h1 className={styles.title}>
          <span className={styles.word}>اصنع</span>
          <span className={styles.word}>أثراً</span>
          <span className={styles.word}>لا</span>
          <span className={styles.word}>يُنسى</span>
          <br />
          في <span className={styles.greenText}>حياة</span> <span className={styles.redText}>الآخرين</span>
        </h1>
        <p className={styles.subtitle}>
          انضم لآلاف المتطوعين وكن سبباً حقيقياً في التغيير, خطوة صغيرة منك تصنع فارقاً كبيراً في مجتمعك
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={scrollToOpportunities} icon={<ArrowLeft size={18} />}>
            استكشف الفرص
          </Button>
          <Link href={ROUTES.ABOUT} className={styles.linkBtn}>
            تعرّف علينا أكثر
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;