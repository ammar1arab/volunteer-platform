"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Download, Calendar, Clock, Share2 } from "lucide-react";
import styles from "./VerifyPage.module.scss";
import { certificateApi } from "@/presentation/services";
import { LoadingState } from "@/presentation/components";
import { Share } from "@/presentation/components";
import type { CertificateDto } from "@/core/application/dtos";

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

async function downloadAsPng(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "certificate.png";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function downloadAsPdf(url: string) {
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [img.naturalWidth, img.naturalHeight] });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, img.naturalWidth, img.naturalHeight);
  pdf.save("certificate.pdf");
}

const VerifyPage = ({ certificateId }: { certificateId: string }) => {
  const [cert, setCert] = useState<CertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!certificateId) return;
    certificateApi.getById(certificateId).then((res) => {
      if (res.success && res.data?.certificate) setCert(res.data.certificate);
      else setNotFound(true);
      setLoading(false);
    });
  }, [certificateId]);

  if (loading) return <LoadingState />;

  if (notFound || !cert) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <ShieldCheck size={40} strokeWidth={1} />
          <p>الشهادة غير موجودة</p>
          <Link href="/">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const shareText = `شهادة مشاركة "${cert.activityTitle}" — بصمات شبابية\n${typeof window !== "undefined" ? window.location.href : ""}`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.verified}>
          <ShieldCheck size={15} />
          <span>شهادة موثقة</span>
        </div>

        {cert.pngUrl && (
          <div className={styles.preview}>
            <Image
              src={cert.pngUrl}
              alt={cert.activityTitle}
              fill
              sizes="(max-width: 700px) 100vw, 700px"
              className={styles.img}
              priority
            />
          </div>
        )}

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Calendar size={13} />
            <span>{fmt(cert.issuedAt)}</span>
          </div>
          {cert.durationHours && (
            <div className={styles.metaItem}>
              <Clock size={13} />
              <span>{cert.durationHours} ساعة تطوع</span>
            </div>
          )}
          <span className={styles.certId}>#{cert.id.slice(0, 10).toUpperCase()}</span>
        </div>

        <h1 className={styles.title}>{cert.activityTitle}</h1>

        <div className={styles.actions}>
          {cert.pngUrl && (
            <>
              <button className={styles.btnPrimary} onClick={() => downloadAsPdf(cert.pngUrl!)}>
                <Download size={14} /> تحميل PDF
              </button>
              <button className={styles.btnSecondary} onClick={() => downloadAsPng(cert.pngUrl!)}>
                <Download size={14} /> تحميل PNG
              </button>
            </>
          )}
          <Share
            trigger={(open) => (
              <button
                className={styles.btnSecondary}
                onClick={() => open({ title: cert.activityTitle, text: shareText })}
              >
                <Share2 size={14} /> مشاركة
              </button>
            )}
          />
        </div>

        <Link href="/" className={styles.brand}>youthprints.online</Link>

      </div>
    </div>
  );
};

export default VerifyPage;