"use client";
import styles from "./PushBanner.module.scss";
import { useState, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { BellRing, ShieldCheck, Zap, X, Smartphone, Share, Plus, Check } from "lucide-react";
import { usePushNotifications } from "@/presentation/hooks";

const SNOOZE_KEY = "push_banner_snoozed_until";
const VISITS_KEY = "push_banner_visits";
const SNOOZE_DAYS = 7;

let visitBootstrapped = false;

function subscribeBanner(onStoreChange: () => void) {
  if (typeof window !== "undefined" && !visitBootstrapped) {
    visitBootstrapped = true;
    const visits = parseInt(localStorage.getItem(VISITS_KEY) ?? "0", 10) + 1;
    localStorage.setItem(VISITS_KEY, String(visits));
    onStoreChange();
  }
  return () => {};
}

function getBannerVisible() {
  if (typeof window === "undefined") return false;
  const snoozedUntil = parseInt(localStorage.getItem(SNOOZE_KEY) ?? "0", 10);
  if (Date.now() < snoozedUntil) return false;
  const visits = parseInt(localStorage.getItem(VISITS_KEY) ?? "0", 10);
  return visits >= 2;
}

const PushBanner = () => {
  const { data: session } = useSession();
  const { state, subscribe, isIOS, isStandalone, isSupported } = usePushNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const eligible = useSyncExternalStore(subscribeBanner, getBannerVisible, () => false);

  const snooze = () => {
    const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(SNOOZE_KEY, String(until));
    setHidden(true);
  };

  if (!session?.user) return null;
  if (!eligible || hidden) return null;
  if (!isSupported) return null;
  if (state === "granted" || state === "denied") return null;

  if (isIOS && !isStandalone) {
    return (
      <div className={`${styles.banner} ${styles.ios} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.iosPill} onClick={() => setCollapsed(p => !p)}>
          <Smartphone size={14} />
          <span>فعّل الإشعارات على iPhone</span>
          <X size={12} className={styles.chevron} onClick={(e) => { e.stopPropagation(); snooze(); }} />
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
          <span className={styles.feat}><Zap        size={11} /> فوري</span>
          <span className={styles.feat}><ShieldCheck size={11} /> يُلغى متى تريد</span>
        </div>
        <button
          className={styles.btnEnable}
          onClick={subscribe}
          disabled={state === "loading"}
        >
          {state === "loading" ? "جارٍ التفعيل..." : "تفعيل الإشعارات"}
        </button>
      </div>
      <X size={14} style={{ cursor: "pointer", color: "var(--text-muted, #888)", flexShrink: 0 }} onClick={snooze} />
    </div>
  );
};

export default PushBanner;
