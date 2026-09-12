"use client";

import Link from "next/link";
import Image from "next/image";
import { Award, Bot, CalendarDays, EyeOff, LogOut, MessageCircle, User } from "lucide-react";
import Tooltip from "@/presentation/components/base/Tooltip/Tooltip";
import styles from "./UserMenuDropdown.module.scss";
import { BOT_PRESENCE_OPTIONS, ROUTES } from "@/presentation/constants";
import { useBotPresence } from "@/presentation/hooks";

interface Props {
  userName: string;
  avatarUrl?: string | null;
  onClose: () => void;
  onLogout: () => void;
}

const LINKS = [
  { href: ROUTES.VOLUNTEER.PROFILE, icon: <User size={15} />, label: "الملف الشخصي" },
  { href: ROUTES.VOLUNTEER.ACTIVITIES, icon: <CalendarDays size={15} />, label: "فرصي التطوعية" },
  { href: ROUTES.VOLUNTEER.CERTIFICATES, icon: <Award size={15} />, label: "شهاداتي" }
];

const MODE_ICONS = {
  full: MessageCircle,
  bot: Bot,
  hidden: EyeOff
} as const;

const UserMenuDropdown = ({ userName, avatarUrl, onLogout, onClose }: Props) => {
  const { mode, setMode } = useBotPresence();

  return (
    <div className={styles.dropdown}>
      <Link href={ROUTES.VOLUNTEER.PROFILE} className={styles.userInfoLink} onClick={onClose}>
        <div className={styles.userInfo}>
          <div className={styles.avatarWrap}>
            <Image
              src={avatarUrl!}
              alt={userName}
              width={38}
              height={38}
              className={styles.avatarImg}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>متطوع</span>
          </div>
        </div>
      </Link>

      <div className={styles.divider} />

      <div className={styles.list}>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.item} onClick={onClose}>
            <span className={styles.itemIcon}>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}

        <div className={styles.item} role="group" aria-label="رفيق بصمات">
          <span className={styles.itemIcon}>
            <Bot size={15} />
          </span>
          <span>رفيق بصمات</span>
          <div className={styles.botModes}>
            {BOT_PRESENCE_OPTIONS.map((option) => {
              const Icon = MODE_ICONS[option.id];
              return (
                <Tooltip key={option.id} content={option.hint} side="bottom">
                  <button
                    type="button"
                    className={`${styles.botMode} ${mode === option.id ? styles.botModeOn : ""}`}
                    aria-label={option.label}
                    aria-pressed={mode === option.id}
                    onClick={() => setMode(option.id)}
                  >
                    <Icon size={14} />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <button className={styles.logoutItem} onClick={onLogout}>
        <span className={styles.itemIcon}>
          <LogOut size={15} />
        </span>
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
};

export default UserMenuDropdown;
