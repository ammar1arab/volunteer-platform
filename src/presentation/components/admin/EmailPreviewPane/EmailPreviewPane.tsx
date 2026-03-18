"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./EmailPreviewPane.module.scss";
import { buildBulkEmail, applyVariables } from "@/lib/templates/emails/bulkEmail";

interface Props {
  subject: string;
  body: string;
  fromAlias: string;
}

const SAMPLE = {
  name: "أحمد محمد",
  city: "عمان",
  hours: 24,
  activityLink: "https://youthprints.online/activities/مثال",
};
const EmailPreviewPane = ({ subject, body, fromAlias }: Props) => {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resolvedSubject = applyVariables(subject || "موضوع الإيميل", SAMPLE);
  const resolvedBody = applyVariables(body || "", SAMPLE);
  const html = buildBulkEmail({ subject: resolvedSubject, body: resolvedBody, fromAlias });
  const isEmpty = !subject.trim() && !body.trim();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || isEmpty) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html, isEmpty]);

  return (
    <div className={styles.pane}>

      <div className={styles.chrome}>
        <div className={styles.chromeDots}>
          <span /><span /><span />
        </div>
        <div className={styles.chromeBar}>
          <span className={styles.chromeLabel}>معاينة الإيميل</span>
        </div>
        <div className={styles.deviceSwitch}>
          <button
            className={`${styles.switchBtn} ${device === "desktop" ? styles.switchActive : ""}`}
            onClick={() => setDevice("desktop")}
          >
            سطح المكتب
          </button>
          <button
            className={`${styles.switchBtn} ${device === "mobile" ? styles.switchActive : ""}`}
            onClick={() => setDevice("mobile")}
          >
            موبايل
          </button>
        </div>
      </div>

      {!isEmpty && (
        <div className={styles.emailHeader}>
          <div className={styles.emailField}>
            <span className={styles.emailFieldLabel}>من</span>
            <span className={styles.emailFieldValue} dir="ltr">{fromAlias}</span>
          </div>
          <div className={styles.emailDivider} />
          <div className={styles.emailField}>
            <span className={styles.emailFieldLabel}>الموضوع</span>
            <span className={styles.emailFieldValue}>{resolvedSubject}</span>
          </div>
        </div>
      )}

      <div className={styles.viewport}>
        <div
          className={styles.viewportInner}
          style={{ maxWidth: device === "mobile" ? 390 : "100%" }}
        >
          {isEmpty ? (
            <div className={styles.empty}>
              <div className={styles.emptyLines}>
                <span className={styles.emptyLine} style={{ width: "60%" }} />
                <span className={styles.emptyLine} style={{ width: "80%" }} />
                <span className={styles.emptyLine} style={{ width: "45%" }} />
                <span className={styles.emptyLine} style={{ width: "70%" }} />
                <span className={styles.emptyLine} style={{ width: "55%" }} />
              </div>
              <p className={styles.emptyText}>ابدأ بكتابة رسالتك لترى المعاينة هنا</p>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className={styles.iframe}
              title="email-preview"
              sandbox="allow-same-origin"
            />
          )}
        </div>
      </div>

      <div className={styles.sampleNote}>
        بيانات تجريبية — {SAMPLE.name} · {SAMPLE.city} · {SAMPLE.hours} ساعة
      </div>

    </div>
  );
};

export default EmailPreviewPane;