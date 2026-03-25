"use client";
import styles from "./PushBanner.module.scss";
import { useState, useEffect } from "react";
import { X, Phone, Shield, Upload, Plus, Check, Smartphone } from "lucide-react";
import { usePushNotifications } from "@/presentation/hooks";

const DISMISS_KEY  = "push_banner_dismissed_at";
const REDISPLAY_MS = 7 * 24 * 60 * 60 * 1000;

const BellIcon = () => (
  <svg className={styles.bellSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <circle cx="18" cy="6" r="3" fill="#4ade80" stroke="none"/>
  </svg>
);

const PushBanner = () => {
  const { state, subscribe, isIOS, isStandalone, isSupported } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    if (state === "granted" || state === "denied") return;
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < REDISPLAY_MS) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [state, isSupported]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  if (isIOS && !isStandalone) {
    return (
      <div className={`${styles.banner} ${styles.ios}`}>
        <div className={styles.iosTop} />
        <div className={styles.iosBody}>
          <div className={styles.iosIconWrap}>
            <Smartphone size={18} />
          </div>
          <div className={styles.iosTxt}>
            <strong className={styles.iosT1}>تلقَّ الإشعارات على iPhone</strong>
            <span className={styles.iosT2}>أضف الموقع لشاشتك الرئيسية وستعمل الإشعارات تلقائياً</span>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <div className={styles.stepIc}><Upload size={10} /></div>
                <span className={styles.stepT}>اضغط زر المشاركة في شريط Safari</span>
              </li>
              <li className={styles.step}>
                <div className={styles.stepIc}><Plus size={10} /></div>
                <span className={styles.stepT}>اختر "إضافة إلى الشاشة الرئيسية"</span>
              </li>
              <li className={styles.step}>
                <div className={styles.stepIc}><Check size={10} /></div>
                <span className={styles.stepT}>افتح الموقع من الأيقونة وفعّل الإشعارات</span>
              </li>
            </ol>
          </div>
          <button className={styles.closeBtn} onClick={dismiss}><X size={12} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <div className={styles.bellShell}>
        <span className={styles.r1} /><span className={styles.r2} />
        <div className={styles.bellBg}><BellIcon /></div>
      </div>
      <div className={styles.txt}>
        <strong className={styles.t1}>ابقَ على اطلاع دائم</strong>
        <span className={styles.t2}>سيصلك إشعار فور قبول طلبك أو صدور شهادتك حتى لو كانت الشاشة مقفلة</span>
        <div className={styles.pills}>
          <span className={styles.pill}><Phone size={10} /> فوري</span>
          <span className={styles.pill}><Shield size={10} /> آمن</span>
          <span className={styles.pill}><X size={10} /> يُلغى متى تريد</span>
        </div>
      </div>
      <div className={styles.acts}>
        <button className={styles.btnEn} onClick={subscribe} disabled={state === "loading"}>
          <Phone size={13} />
          {state === "loading" ? "جارٍ التفعيل" : "تفعيل الإشعارات"}
        </button>
        <button className={styles.closeBtn} onClick={dismiss}><X size={13} /></button>
      </div>
    </div>
  );
};

export default PushBanner;