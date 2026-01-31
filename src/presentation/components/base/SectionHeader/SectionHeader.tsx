'use client';

import styles from './SectionHeader.module.scss';

interface Props {
  title: string;
  subtitle?: string;
}

const SectionHeader = ({ title, subtitle }: Props) => {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.underline} />
    </div>
  );
};

export default SectionHeader;
