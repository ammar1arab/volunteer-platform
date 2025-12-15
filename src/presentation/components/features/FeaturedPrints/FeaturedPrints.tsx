'use client';

import { useState, useEffect } from 'react';
import styles from './FeaturedPrints.module.scss';
import { Container, SectionHeader } from '@/presentation/components';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { FiShare2, FiUser } from 'react-icons/fi';

// ==================== TYPES ====================
interface FeaturedPrint {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  likes: number;
}

// ==================== MOCK DATA ====================
const featuredPrintsMock: FeaturedPrint[] = [
  {
    id: 1,
    name: "محمد العواملة",
    title: "قائد فريق ميداني",
    description: "ساهم في قيادة الفرق الميدانية وتنظيم الأنشطة التطوعية، وشارك في أكثر من 20 مبادرة تركت أثراً واضحاً.",
    image: "/images/featuredPrints/featuredPrint-1.jpg",
    likes: 12,
  },
  {
    id: 2,
    name: "سارة الخطيب",
    title: "مشرفة متطوعين",
    description: "قدمت دعماً وإشرافاً مميزاً للمتطوعين وساهمت في تنسيق الفعاليات الكبرى للمبادرة.",
    image: "/images/featuredPrints/featuredPrint-2.jpg",
    likes: 18,
  },
  {
    id: 3,
    name: "ليث العمري",
    title: "متطوع ميداني",
    description: "شارك في حملات التوعية وتوزيع المساعدات، وساهم في إنجاح العديد من المبادرات المجتمعية.",
    image: "/images/featuredPrints/featuredPrint-3.jpg",
    likes: 9,
  },
  {
    id: 4,
    name: "رهف عبدالله",
    title: "مصممة محتوى",
    description: "ساهمت في تصميم الهوية البصرية للمبادرة ونشر الرسائل التوعوية بطريقة جذّابة واحترافية.",
    image: "/images/featuredPrints/featuredPrint-4.jpg",
    likes: 23,
  },
  {
    id: 5,
    name: "أحمد القيسي",
    title: "منسق فعاليات",
    description: "ساهم في تنظيم الفعاليات وإدارة المتطوعين داخل وخارج عمّان بشكل احترافي.",
    image: "/images/featuredPrints/featuredPrint-5.jpg",
    likes: 16,
  },
  {
    id: 6,
    name: "نور السالم",
    title: "مشرفة فريق إعلامي",
    description: "قادت الفريق الإعلامي وساعدت في نشر قصص النجاح والتوعية عبر منصات التواصل.",
    image: "/images/featuredPrints/featuredPrint-6.jpg",
    likes: 30,
  },
  {
    id: 7,
    name: "يزن العجارمة",
    title: "متطوع لوجستي",
    description: "ساعد في تجهيز المواقع والمعدات قبل الفعاليات لضمان تنفيذ سلس.",
    image: "/images/featuredPrints/featuredPrint-7.jpg",
    likes: 11,
  },
  {
    id: 8,
    name: "مرح عواد",
    title: "منسقة محتوى",
    description: "شاركت في كتابة محتوى المشاريع الإنسانية وإعداد قصص مؤثرة عن المتطوعين.",
    image: "/images/featuredPrints/featuredPrint-8.jpg",
    likes: 21,
  },
];

// ==================== COMPONENT ====================
const FeaturedPrints = () => {
  // State
  const [prints, setPrints] = useState<FeaturedPrint[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  // Load mock data
  useEffect(() => {
    setPrints(featuredPrintsMock);
  }, []);

  // Like logic
  const toggleLike = (id: number) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getLikesCount = (item: FeaturedPrint) => {
    return item.likes + (liked[item.id] ? 1 : 0);
  };

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeader
          title="بصمات مميزة"
          subtitle="متطوعون تركوا أثراً ملموساً في المجتمع"
        />

        <div className={styles.grid}>
          {prints.map(m => (
            <div key={m.id} className={styles.card}>
              <img src={m.image} alt={m.name} className={styles.image} />

              <h3 className={styles.name}>{m.name}</h3>
              <p className={styles.title}>{m.title}</p>
              <p className={styles.desc}>{m.description}</p>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label="إعجاب"
                  onClick={() => toggleLike(m.id)}
                >
                  {liked[m.id] ? <FaHeart /> : <FaRegHeart />}
                  <span className={styles.likesCount}>{getLikesCount(m)}</span>
                </button>

                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label="مشاركة"
                >
                  <FiShare2 />
                </button>

                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label="عرض البروفايل"
                >
                  <FiUser />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturedPrints;