"use client";
import styles from "./PushBanner.module.scss";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { BellRing, ShieldCheck, Zap, X, Smartphone, Share, Plus, Check } from "lucide-react";
import { usePushNotifications } from "@/presentation/hooks";

const PushBanner = () => {
  const { data: session } = useSession();
  const { state, subscribe, isIOS, isStandalone, isSupported } = usePushNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!session?.user) return null;
  if (dismissed)      return null;

  // iOS must be checked BEFORE isSupported — PushManager doesn't exist on iOS Chrome
  if (isIOS && !isStandalone) {
    return (
      <div className={`${styles.banner} ${styles.ios} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.iosPill} onClick={() => setCollapsed(p => !p)}>
          <Smartphone size={14} />
          <span>فعّل الإشعارات على iPhone</span>
          <X size={12} className={styles.chevron} onClick={(e) => { e.stopPropagation(); setDismissed(true); }} />
        </div>
        {!collapsed && (
          <div className={styles.iosSteps}>
            <div className={styles.step}><Share size={13} /><span>اضغط زر المشاركة في Safari</span></div>
            <div className={styles.step}><Plus  size={13} /><span>أضف إلى الشاشة الرئيسية</span></div>
            <div className={styles.step}><Check size={13} /><span>افتح من الأيقونة وفعّل الإشعارات</span></div>
          </div>
        )}
      </div>
    );
  }

  if (!isSupported)                              return null;
  if (state === "granted" || state === "denied") return null;

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <div className={styles.iconWrap}>
          <BellRing size={18} className={styles.bellIcon} />
          <span className={styles.dot} />
        </div>
        <div className={styles.text}>
          <strong className={styles.title}>ابقَ على اطلاع دائم</strong>
          <span className={styles.sub}>سيصلك إشعار فور قبول طلبك أو صدور شهادتك</span>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.features}>
          <span className={styles.feat}><Zap         size={11} /> فوري</span>
          <span className={styles.feat}><ShieldCheck  size={11} /> يُلغى متى تريد</span>
        </div>
        <button
          className={styles.btnEnable}
          onClick={subscribe}
          disabled={state === "loading"}
        >
          {state === "loading" ? "جارٍ التفعيل..." : "تفعيل الإشعارات"}
        </button>
      </div>
    </div>
  );
};

export default PushBanner;