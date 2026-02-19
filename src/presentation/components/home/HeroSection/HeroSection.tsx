"use client";
import styles from "./HeroSection.module.scss";

import Link from "next/link";
import { Button } from "@/presentation/components";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/presentation/constants";

const HeroSection = () => {
  const scrollToOpportunities = () => {
    const element = document.getElementById("opportunities");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot}></span>
          منصة تطوعية رائدة
        </div>

        <h1 className={styles.title}>
          <span className={styles.word}>كن</span>
          <span className={styles.word}>جزءاً</span>
          <span className={styles.word}>من</span>
          <br />
          <span className={styles.highlight}>التغيير الإيجابي</span>
        </h1>

        <p className={styles.subtitle}>
          انضم لمجتمع من المتطوعين المتحمسين واصنع أثراً حقيقياً
          <br />
          يلامس حياة الآخرين في مجتمعك
        </p>

        <div className={styles.actions}>
          <Button variant="primary" size="md" onClick={scrollToOpportunities} icon={<ArrowLeft size={18} />}>
            استكشف الفرص
          </Button>

          <Link href={ROUTES.ABOUT} className={styles.linkBtn}>
            تعرّف علينا أكثر
          </Link>
        </div>

        <div className={styles.floatingElements}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;