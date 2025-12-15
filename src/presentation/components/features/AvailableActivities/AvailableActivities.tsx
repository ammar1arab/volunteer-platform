'use client';

import { useState, useEffect } from 'react';
import styles from './AvailableActivities.module.scss';
import { Container, SectionHeader } from '@/presentation/components';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// ==================== TYPES ====================
type ActivityType = 'environmental' | 'social' | 'educational' | 'health' | 'other';
type ActivityStatus = 'open' | 'upcoming' | 'closed';

interface Activity {
  id: number;
  title: string;
  category: string;
  type: ActivityType;
  location: string;
  date: string;
  time: string;
  duration: string;
  volunteersNeeded: number;
  status: ActivityStatus;
  image: string;
  description: string;
}

// ==================== MOCK DATA ====================
const activitiesMock: Activity[] = [
  {
    id: 1,
    title: "حملة تنظيف الحدائق العامة",
    category: "بيئي",
    type: "environmental",
    location: "عمّان - المدينة الرياضية",
    date: "السبت 15 آذار",
    time: "10 صباحاً - 1 ظهراً",
    duration: "3 ساعات",
    volunteersNeeded: 15,
    status: "open",
    image: "/images/featuredPrints/featuredPrint-1.jpg",
    description: "المشاركة في تنظيف الحدائق العامة ودعم الوعي البيئي.",
  },
  {
    id: 2,
    title: "ورشة دعم تعليمي للأطفال",
    category: "تعليمي",
    type: "educational",
    location: "عمّان - جبل الحسين",
    date: "الجمعة 22 آذار",
    time: "3 مساءً - 6 مساءً",
    duration: "3 ساعات",
    volunteersNeeded: 10,
    status: "open",
    image: "/images/featuredPrints/featuredPrint-2.jpg",
    description: "تنظيم أنشطة تعليمية تفاعلية في بيئة ممتعة وآمنة.",
  },
  {
    id: 3,
    title: "حملة توزيع طرود غذائية",
    category: "اجتماعي",
    type: "social",
    location: "الزرقاء - عدة مناطق",
    date: "الخميس 28 آذار",
    time: "1 ظهراً - 5 مساءً",
    duration: "4 ساعات",
    volunteersNeeded: 20,
    status: "upcoming",
    image: "/images/featuredPrints/featuredPrint-3.jpg",
    description: "المساعدة في تجهيز وتوزيع الطرود الغذائية للأسر المستفيدة.",
  },
  {
    id: 4,
    title: "يوم صحي توعوي",
    category: "صحي",
    type: "health",
    location: "إربد - وسط المدينة",
    date: "السبت 5 نيسان",
    time: "9 صباحاً - 1 ظهراً",
    duration: "4 ساعات",
    volunteersNeeded: 8,
    status: "upcoming",
    image: "/images/featuredPrints/featuredPrint-4.jpg",
    description: "تنظيم فعاليات صحية توعوية وفحوصات بسيطة للمجتمع.",
  },
  {
    id: 5,
    title: "مبادرة زراعة الأشجار",
    category: "بيئي",
    type: "environmental",
    location: "عجلون - المحمية",
    date: "الأحد 13 نيسان",
    time: "8 صباحاً - 2 ظهراً",
    duration: "6 ساعات",
    volunteersNeeded: 25,
    status: "open",
    image: "/images/featuredPrints/featuredPrint-1.jpg",
    description: "المساهمة في زراعة الأشجار والحفاظ على الغطاء النباتي.",
  },
  {
    id: 6,
    title: "برنامج محو الأمية",
    category: "تعليمي",
    type: "educational",
    location: "معان - مركز المجتمع",
    date: "الثلاثاء 16 نيسان",
    time: "5 مساءً - 8 مساءً",
    duration: "3 ساعات",
    volunteersNeeded: 12,
    status: "upcoming",
    image: "/images/featuredPrints/featuredPrint-2.jpg",
    description: "تعليم القراءة والكتابة للكبار في جو تفاعلي وداعم.",
  },
  {
    id: 7,
    title: "حملة تزيين المدارس الحكومية",
    category: "اجتماعي",
    type: "social",
    location: "عمّان - ماركا",
    date: "السبت 20 نيسان",
    time: "9 صباحاً - 1 ظهراً",
    duration: "4 ساعات",
    volunteersNeeded: 18,
    status: "open",
    image: "/images/featuredPrints/featuredPrint-3.jpg",
    description: "المشاركة في دهان الجدران وترتيب الساحات لبيئة دراسية أفضل للطلاب.",
  },
  {
    id: 8,
    title: "ورشة توعية صحية لكبار السن",
    category: "صحي",
    type: "health",
    location: "السلط - مركز الرعاية",
    date: "الخميس 25 نيسان",
    time: "10 صباحاً - 12 ظهراً",
    duration: "ساعتان",
    volunteersNeeded: 6,
    status: "open",
    image: "/images/featuredPrints/featuredPrint-4.jpg",
    description: "تقديم نصائح بسيطة ومتابعة صحية لكبار السن داخل المركز.",
  },
  {
    id: 9,
    title: "فعالية تنظيف شاطئ البحر الميت",
    category: "بيئي",
    type: "environmental",
    location: "البحر الميت - الشاطئ الجنوبي",
    date: "الجمعة 3 أيار",
    time: "7 صباحاً - 11 صباحاً",
    duration: "4 ساعات",
    volunteersNeeded: 30,
    status: "open",
    image: "/images/featuredPrints/featuredPrint-1.jpg",
    description: "جمع النفايات وتحسين نظافة الشاطئ للحفاظ على السياحة والبيئة.",
  },
  {
    id: 10,
    title: "مهرجان الرسم للأطفال",
    category: "تعليمي",
    type: "educational",
    location: "إربد - حديقة الاستقلال",
    date: "السبت 11 أيار",
    time: "4 مساءً - 7 مساءً",
    duration: "3 ساعات",
    volunteersNeeded: 10,
    status: "upcoming",
    image: "/images/featuredPrints/featuredPrint-2.jpg",
    description: "تنظيم ورش رسم ممتعة وتعليم أساسيات الألوان للأطفال.",
  },
  {
    id: 11,
    title: "حملة جمع الملابس للأسر المحتاجة",
    category: "اجتماعي",
    type: "social",
    location: "عمّان - طبربور",
    date: "الأحد 12 أيار",
    time: "10 صباحاً - 3 مساءً",
    duration: "5 ساعات",
    volunteersNeeded: 22,
    status: "open",
    image: "/images/featuredPrints/featuredPrint-3.jpg",
    description: "فرز وتوزيع الملابس المتبرع بها للأسر المحتاجة في المنطقة.",
  },
  {
    id: 12,
    title: "فعالية توعية مرورية للأطفال",
    category: "أخرى",
    type: "other",
    location: "الزرقاء - المدينة العمالية",
    date: "الجمعة 17 أيار",
    time: "9 صباحاً - 12 ظهراً",
    duration: "3 ساعات",
    volunteersNeeded: 14,
    status: "upcoming",
    image: "/images/featuredPrints/featuredPrint-4.jpg",
    description: "تعليم الأطفال قواعد السلامة المرورية بطرق تفاعلية ولطيفة.",
  },
];

// ==================== COMPONENT ====================
const AvailableActivities = () => {
  // State
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Load mock data
  useEffect(() => {
    setActivities(activitiesMock);
  }, []);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pagination logic
  const itemsPerPage = isMobile ? 2 : 4;
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const pagedActivities = activities.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const next = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const prev = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const goTo = (index: number) => setCurrentPage(index);

  return (
    <section className={styles.section}>
      <Container>
        <SectionHeader
          title="الأنشطة المتاحة"
          subtitle="فرص تطوعية يمكنك استكشافها والتقديم عليها"
        />

        <div className={styles.gridWrapper}>
          <div className={styles.grid}>
            {pagedActivities.map(activity => (
              <article key={activity.id} className={styles.card}>
                <div className={styles.imageCol}>
                  <img src={activity.image} alt={activity.title} className={styles.image} />
                  <span className={`${styles.badge} ${styles[`badge-${activity.type}`]}`}>
                    {activity.category}
                  </span>
                </div>

                <div className={styles.content}>
                  <h3 className={styles.title}>{activity.title}</h3>
                  <p className={styles.desc}>{activity.description}</p>

                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <FiMapPin aria-hidden="true" className={styles.icon} />
                      <span>{activity.location}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <FiCalendar aria-hidden="true" className={styles.icon} />
                      <span>{activity.date}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <FiClock aria-hidden="true" className={styles.icon} />
                      <span>{activity.time}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <FiUsers aria-hidden="true" className={styles.icon} />
                      <span>{activity.volunteersNeeded} متطوع</span>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button 
                      type="button" 
                      className={styles.moreBtn} 
                      aria-label="معرفة المزيد"
                    >
                      معرفة المزيد
                    </button>

                    <button 
                      type="button" 
                      className={styles.applyBtn} 
                      aria-label="قدم طلبك الآن"
                    >
                      قدم طلبك الآن
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.navigation}>
              <button 
                type="button" 
                className={styles.navBtn} 
                onClick={prev} 
                disabled={currentPage === 0}
                aria-label="الصفحة السابقة"
              >
                <FiChevronRight aria-hidden="true" />
              </button>

              <div className={styles.dots}>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.dot} ${index === currentPage ? styles.activeDot : ''}`}
                    onClick={() => goTo(index)}
                    aria-label={`الانتقال إلى الصفحة ${index + 1}`}
                  />
                ))}
              </div>

              <button 
                type="button" 
                className={styles.navBtn} 
                onClick={next} 
                disabled={currentPage === totalPages - 1}
                aria-label="الصفحة التالية"
              >
                <FiChevronLeft aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default AvailableActivities;