'use client';

import styles from './SectionHeader.module.scss';

interface Props {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}

const SectionHeader = ({ title, subtitle, align = "center" }: Props) => {
  return (
    <div className={`${styles.header} ${styles[align]}`}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.underline} />
    </div>
  );
};

export default SectionHeader;
