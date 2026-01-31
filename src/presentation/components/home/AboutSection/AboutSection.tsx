'use client';

import styles from './AboutSection.module.scss';
import { Container, SectionHeader } from '@/presentation/components';
import { FiTarget, FiUsers, FiHeart, FiCheckCircle } from 'react-icons/fi';

const AboutSection = () => {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeader
          title="من نحن"
          subtitle="مبادرة شبابية تطوعية تصنع أثراً حقيقياً"
        />

        <div className={styles.wrapper}>

          <div className={styles.textBox}>
            <h3 className={styles.heading}>نبذة مختصرة</h3>

            <p className={styles.text}>
              مبادرة <strong>بصمات شبابية</strong> هي مبادرة تطوعية شبابية تهدف إلى تمكين
              جيل الشباب وإشراكهم في خدمة المجتمع من خلال العمل التطوعي المنظّم.
              نؤمن بأن كل شاب قادر على ترك بصمة حقيقية وصناعة تأثير إيجابي مهما كان حجمه،
              ولذلك نعمل على توفير بيئة تطوعية آمنة، احترافية، وملهمة تُساعدهم على
              تطوير مهاراتهم وصقل شخصياتهم.
            </p>

            <p className={styles.text}>
              منذ انطلاق المبادرة، ركّزنا على نشر ثقافة التطوع وتعزيز روح التعاون والعطاء
              من خلال تنظيم فعاليات، حملات مجتمعية، ورش عمل تدريبية، وتجارب ميدانية
              تساهم في الارتقاء بالمجتمع المحلي. كما نحرص على تنفيذ مشاريع تنموية
              مستدامة تُعزّز قيم الانتماء، المسؤولية، والروح الإنسانية لدى الشباب
              في مختلف المحافظات.
            </p>

            <p className={styles.text}>
              نسعى دائماً إلى بناء شبكة من المتطوعين القادرين على قيادة التغيير،
              وتمثيل صورة مشرّفة للشباب الأردني الطموح. وتعمل المبادرة باستمرار
              على تطوير منصتها الإلكترونية لتسهيل الوصول إلى الفرص التطوعية،
              والتواصل مع المؤسسات، وإبراز قصص النجاح الملهمة للشباب.
            </p>

            <button
              className={styles.readMore}
              type="button"
              aria-label="اقرأ المزيد عن المبادرة"
            >
              اقرأ المزيد
            </button>
          </div>


          <div className={styles.features}>
            <div className={styles.feature}>
              <FiHeart className={styles.icon} />
              <h4>رسالتنا</h4>
              <p>تمكين الشباب وإتاحة الفرص لهم لصنع أثر إيجابي مستدام داخل المجتمع.</p>
            </div>

            <div className={styles.feature}>
              <FiTarget className={styles.icon} />
              <h4>رؤيتنا</h4>
              <p>مجتمع شبابي واعٍ قادر على المشاركة الفاعلة في التنمية والتغيير.</p>
            </div>

            <div className={styles.feature}>
              <FiUsers className={styles.icon} />
              <h4>قيمنا</h4>
              <p>العمل الجماعي – الاحترام – العطاء – الإبداع – المسؤولية.</p>
            </div>

            <div className={styles.feature}>
              <FiCheckCircle className={styles.icon} />
              <h4>أهدافنا</h4>
              <p>إحداث أثر ملموس عبر أنشطة هادفة تُعزّز روح الانتماء والعمل التطوعي.</p>
            </div>
          </div>

        </div>

      </Container>
    </section>
  );
};

export default AboutSection;
