'use client';

import Image from 'next/image';
import { Download, Share2, ShieldCheck, Calendar, Clock } from 'lucide-react';
import styles from './CertificateCard.module.scss';
import { Share } from '@/presentation/components';
import { useCertificateCard } from './CertificateCard.logic';
import { getActivityTypeLabel } from '@/presentation/constants';
import { ActivityType } from '@/core/domain/enums';
import type { CertificateDto } from '@/core/application/dtos';

interface Props { certificate: CertificateDto; }

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

const CertificateCard = ({ certificate }: Props) => {
  const { name, shareText, goToVerify, handleDownloadPng, handleDownloadPdf } =
    useCertificateCard(certificate);

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();
  const isOnline = certificate.activityType === ActivityType.ONLINE;

  return (
    <article className={styles.card} onClick={goToVerify}>
      <div className={styles.shimmer} />

      <div className={styles.preview}>
        {certificate.pngUrl ? (
          <Image
            src={certificate.pngUrl}
            alt={name}
            fill
            sizes="(max-width: 600px) 50vw, 25vw"
            className={styles.previewImg}
            loading="eager"
            priority
          />
        ) : (
          <div className={styles.previewPlaceholder}>
            <ShieldCheck size={48} strokeWidth={0.5} />
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
            <ShieldCheck size={12} />
            موثقة
          </span>
          <span className={styles.certId}>#{certificate.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <h3 className={styles.title}>{name}</h3>

        <div className={styles.metaRow}>
          <span className={styles.meta}>
            <Calendar size={11} />
            {fmt(certificate.issuedAt)}
          </span>
          {certificate.durationHours && (
            <span className={styles.meta}>
              <Clock size={11} />
              {certificate.durationHours} ساعة
            </span>
          )}
        </div>

        <div className={styles.actions} onClick={stopProp}>
          {certificate.pngUrl && (
            <>
              <button className={styles.btnAction} onClick={handleDownloadPng} title="تحميل PNG">
                <Download size={12} /> PNG
              </button>
              <button className={styles.btnAction} onClick={handleDownloadPdf} title="تحميل PDF">
                <Download size={12} /> PDF
              </button>
            </>
          )}
          <Share
            trigger={(openShare) => (
              <button
                className={styles.btnIcon}
                onClick={() => openShare({ title: name, text: shareText })}
                title="مشاركة"
              >
                <Share2 size={13} />
              </button>
            )}
          />
        </div>
      </div>
    </article>
  );
};

export default CertificateCard;