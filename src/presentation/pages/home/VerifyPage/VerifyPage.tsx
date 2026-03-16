"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Download, Calendar, Clock } from "lucide-react";
import styles from "./VerifyPage.module.scss";
import { certificateApi } from "@/presentation/services";
import { LoadingState } from "@/presentation/components";
import { Share } from "@/presentation/components";
import type { CertificateDto } from "@/core/application/dtos";

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

interface Props { certificateId: string; }

const VerifyPage = ({ certificateId }: Props) => {
  const [certificate, setCertificate] = useState<CertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!certificateId) return;
    certificateApi.getById(certificateId).then((res) => {
      if (res.success && res.data?.certificate) {
        setCertificate(res.data.certificate);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [certificateId]);

  if (loading) return <LoadingState />;

  if (notFound || !certificate) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <ShieldCheck size={48} strokeWidth={1.2} />
            <p>الشهادة غير موجودة أو تم حذفها</p>
            <Link href="/" className={styles.homeLink}>العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    );
  }

  const shareText = `شهادة مشاركة "${certificate.activityTitle}" — بصمات شبابية\n${typeof window !== "undefined" ? window.location.href : ""}`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Verified Badge */}
        <div className={styles.badge}>
          <ShieldCheck size={18} />
          <span>شهادة موثقة</span>
        </div>

        {/* Certificate Preview */}
        {certificate.pngUrl && (
          <div className={styles.preview}>
            <Image
              src={certificate.pngUrl}
              alt={`شهادة ${certificate.activityTitle}`}
              fill
              sizes="(max-width: 600px) 100vw, 700px"
              className={styles.previewImg}
              priority
            />
          </div>
        )}

        {/* Info */}
        <div className={styles.info}>
          <h1 className={styles.activity}>{certificate.activityTitle}</h1>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <Calendar size={14} />
              <span>{fmt(certificate.issuedAt)}</span>
            </div>
            {certificate.durationHours && (
              <div className={styles.metaItem}>
                <Clock size={14} />
                <span>{certificate.durationHours} ساعة تطوع</span>
              </div>
            )}
          </div>
          <p className={styles.certId}>
            رقم الشهادة: <span>{certificate.id.slice(0, 10).toUpperCase()}</span>
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {certificate.pdfUrl && (
            <a href={certificate.pdfUrl} download="certificate.pdf" className={styles.btnPdf}>
              <Download size={15} />
              تحميل PDF
            </a>
          )}
          {certificate.pngUrl && (
            <a href={certificate.pngUrl} download="certificate.png" className={styles.btnPng}>
              <Download size={15} />
              تحميل PNG
            </a>
          )}
          <Share
            trigger={(openShare) => (
              <button
                className={styles.btnShare}
                onClick={() => openShare({ title: certificate.activityTitle, text: shareText })}
              >
                مشاركة الشهادة
              </button>
            )}
          />
        </div>

        <Link href="/" className={styles.homeLink}>
          youthprints.online
        </Link>

      </div>
    </div>
  );
};

export default VerifyPage;