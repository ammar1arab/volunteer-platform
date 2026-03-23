import styles from "./AboutPage.module.scss";
import Link from "next/link";
import { Container } from "@/presentation/components";
import { Target, Heart, Users, Briefcase, Sparkles, TreePine, CalendarDays } from "lucide-react";
import { ROUTES } from "@/presentation/constants";

const AboutPage = () => {
  const goals = [
    "إيجاد مبادرة وطنية تخدم الوطن والمواطن",
    "بناء ثقافة تكافل اجتماعي مستدام",
    "شراكات قوية مع مؤسسات المجتمع المدني",
    "تقديم الدعم المباشر للأيتام والمحتاجين",
    "تمكين الشباب وتطوير مهاراتهم القيادية",
    "دعم المرأة وتمكينها معرفياً ومهنياً",
    "التوعية بمخاطر المخدرات والانحرافات",
    "الحفاظ على البيئة وتنظيم حملات النظافة",
    "تقديم إرشاد نفسي وصحي وأسري",
    "تعزيز دمج الأشخاص ذوي الإعاقة",
  ];

  const activities = [
    { icon: Briefcase, title: "ورش تدريبية",  desc: "المهارات الحياتية، الصحة النفسية، فن الإلقاء، ريادة الأعمال" },
    { icon: Users,    title: "حملات توعوية", desc: "ضد العنف المدرسي، المخدرات، التنمر، والزواج المبكر" },
    { icon: Heart,    title: "حملات خيرية",  desc: "توزيع طرود الخير وكسوة الشتاء ودعم الأسر" },
    { icon: TreePine, title: "مشاريع بيئية", desc: "حملات نظافة دورية وحماية المواقع التراثية" },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Container>
          <div className={styles.badge}>
            <CalendarDays size={13} />
            تأسست عام 2012
          </div>
          <h1 className={styles.title}>
            مسيرة <span className={styles.green}>عطاء</span><br />
            وأثر <span className={styles.red}>مستدام</span>
          </h1>
          <p className={styles.desc}>
            أول مبادرة شبابية متكاملة تهدف لإحداث تغيير جذري في المجتمع الأردني،
            تأسست على يد <strong>خالد الدويك</strong> لتكون منارة للعمل التطوعي.
          </p>
        </Container>
      </header>

      <section className={styles.story}>
        <Container>
          <div className={styles.grid}>
            <div>
              <h2>من نحن؟</h2>
              <p>
                <strong>بصمات شبابية</strong> هي أكثر من مجرد مبادرة؛ هي حركة تطوعية وطنية تهدف إلى إحداث تغيير
                إيجابي ملموس في المجتمع المحلي من خلال التوعية، التدريب، والتمكين.
              </p>
              <p>
                نعمل على نطاق وطني واسع، ونفتخر بتكريمنا من منصة "نحن"
                كأفضل مبادرة تطوعية على مستوى المملكة، مما يعكس التزامنا بالجودة والأثر.
              </p>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>3700+</span>
                <span className={styles.statLabel}>متطوع ومتطوعة</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>#1</span>
                <span className={styles.statLabel}>جائزة أفضل مبادرة</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>∞</span>
                <span className={styles.statLabel}>أثر لا يتوقف</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.vision}>
        <Container>
          <div className={styles.cards}>
            <div className={styles.card}>
              <Target size={40} />
              <h3>رؤيتنا</h3>
              <p>
                مجتمع متكافل وبيئة آمنة، حيث يتم تمكين الشباب والأسر في المناطق الأقل حظاً
                ليكونوا عناصر فاعلة في بناء الوطن.
              </p>
            </div>
            <div className={styles.card}>
              <Heart size={40} />
              <h3>رسالتنا</h3>
              <p>
                ترسيخ ثقافة التطوع المستدام، وتقديم الدعم المباشر للفئات المحتاجة،
                مع التركيز على بناء قدرات الشباب القيادية والمهنية.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.goals}>
        <Container>
          <div className={styles.header}>
            <h2>أهدافنا الإستراتيجية</h2>
          </div>
          <div className={styles.goalsGrid}>
            {goals.map((goal, i) => (
              <div key={i} className={styles.goalCard}>
                <Sparkles size={18} />
                <p>{goal}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.activities}>
        <Container>
          <div className={styles.header}>
            <h2>ميادين عملنا</h2>
            <p>مجالات متنوعة نترك فيها بصمة</p>
          </div>
          <div className={styles.activitiesGrid}>
            {activities.map((activity, i) => (
              <div key={i} className={styles.activityCard}>
                <activity.icon size={32} />
                <h3>{activity.title}</h3>
                <p>{activity.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container>
          <h2>#مسيرتنا_مستمرة</h2>
          <p>
            لأننا نؤمن أن التغيير لا يتوقف، وأن لكل بصمة أثراً لا يُنسى.
            كن جزءاً من القصة.
          </p>
          <Link href={ROUTES.SIGNUP}>انضم لعائلتنا</Link>
        </Container>
      </section>
    </main>
  );
};

export default AboutPage;