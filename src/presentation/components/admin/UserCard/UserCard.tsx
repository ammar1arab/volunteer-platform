"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Phone, CheckCircle } from "lucide-react";
import styles from "./UserCard.module.scss";
import type { UserAnalyticsDto } from "@/core/application/dtos";
import { ROUTES } from "@/lib";

interface UserCardProps {
  user: UserAnalyticsDto;
}

export default function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const isVolunteer = user.role === "VOLUNTEER";

  const handleClick = () => {
    if (isVolunteer) {
      router.push(ROUTES.ADMIN.USER_DETAILS(user.id));
    }
  };

  return (
    <div
      className={`${styles.card} ${isVolunteer ? styles.clickable : styles.admin}`}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className={styles.avatar}>
        {user.volunteerProfile?.profilePictureUrl ? (
          <Image
            src={user.volunteerProfile.profilePictureUrl}
            alt={user.fullName}
            width={56}
            height={56}
            className={styles.avatarImg}
          />
        ) : (
          <span className={styles.avatarText}>
            {user.fullName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{user.fullName}</h3>

        <div className={styles.contact}>
          <div className={styles.contactItem}>
            <Mail size={12} />
            <span>{user.email}</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={12} />
            <span>{user.phone}</span>
          </div>
        </div>
      </div>

      {/* Stats Badge */}
      {isVolunteer && (
        <div className={styles.badge}>
          <CheckCircle size={16} />
          <span>{user.stats.approvedActivities}</span>
        </div>
      )}
    </div>
  );
}