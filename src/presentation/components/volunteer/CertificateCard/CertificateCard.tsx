'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Download, Share2, ShieldCheck, Calendar, Clock } from 'lucide-react';
import styles from './CertificateCard.module.scss';
import { Share } from '@/presentation/components';
import { ROUTES } from '@/presentation/constants';
import type { CertificateDto } from '@/core/application/dtos';
import { getActivityTypeLabel } from '@/presentation/constants';
import { ActivityType } from '@/core/domain/enums';

interface Props {
  certificate: CertificateDto;
}

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

const CertificateCard = ({ certificate }: Props) => {
  const shareText = `شهادة مشاركتي في نشاط "${certificate.activityTitle}" — بصمات شبابية\n${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.VERIFY(certificate.id)}`;
  const isOnline = certificate.activityType === ActivityType.ONLINE;

  return (
    <article className={styles.card}>
      <div className={styles.shimmer} />

      <div className={styles.preview}>
        {certificate.pngUrl ? (
          <Image
            src={certificate.pngUrl}
            alt={certificate.activityTitle}
            fill
            sizes="(max-width: 600px) 100vw, 400px"
            className={styles.previewImg}
          />
        ) : (
          <div className={styles.previewPlaceholder}>
            <ShieldCheck size={64} strokeWidth={0.5} />
          </div>
        )}

        {certificate.activityType && (
          <span className={isOnline ? styles.typeBadgeOnline : styles.typeBadgeInPerson}>
            {getActivityTypeLabel(certificate.activityType as ActivityType)}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.verifiedRow}>
          <span className={styles.verifiedBadge}>
            <ShieldCheck size={14} />
            موثقة
          </span>
          <span className={styles.certId}>#{certificate.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <h3 className={styles.title}>{certificate.activityTitle}</h3>

        <div className={styles.metaRow}>
          <span className={styles.meta}>
            <Calendar size={12} />
            {fmt(certificate.issuedAt)}
          </span>
          {certificate.durationHours && (
            <span className={styles.meta}>
              <Clock size={12} />
              {certificate.durationHours} ساعة
            </span>
          )}
        </div>

        <div className={styles.actions}>
          {certificate.pdfUrl && (
            <a href={certificate.pdfUrl} download className={styles.btnPdf}>
              <Download size={14} />
              PDF
            </a>
          )}
          
          <Share
            trigger={(openShare) => (
              <button 
                className={styles.btnIcon}
                onClick={() => openShare({ title: certificate.activityTitle, text: shareText })}
              >
                <Share2 size={16} />
              </button>
            )}
          />
          
          <Link href={ROUTES.VERIFY(certificate.id)} className={styles.btnVerify}>
            <ShieldCheck size={14} />
            تحقق
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CertificateCard;