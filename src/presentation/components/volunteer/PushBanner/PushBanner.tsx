"use client";
import styles from "./PushBanner.module.scss";
import { Bell, X, Smartphone } from "lucide-react";
import { useState } from "react";
import { usePushNotifications } from "@/presentation/hooks";

const PushBanner = () => {
  const { state, subscribe, isIOS, isStandalone, isSupported } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed)                                         return null;
  if (state === "granted" || state === "denied")         return null;
  if (!isSupported)                                      return null;

  if (isIOS && !isStandalone) {
    return (
      <div className={`${styles.banner} ${styles.ios}`}>
        <Smartphone size={16} className={styles.icon} />
        <span>لتلقي الإشعارات على iPhone، أضف الموقع لشاشة الرئيسية من Safari</span>
        <button className={styles.close} onClick={() => setDismissed(true)}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <Bell size={15} className={styles.icon} />
      <span>فعّل الإشعارات لتصلك تنبيهات فورية عند قبول طلبك أو صدور شهادتك</span>
      <div className={styles.actions}>
        <button
          className={styles.btnEnable}
          onClick={subscribe}
          disabled={state === "loading"}
        >
          {state === "loading" ? "جارٍ التفعيل..." : "تفعيل"}
        </button>
        <button className={styles.close} onClick={() => setDismissed(true)}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default PushBanner;