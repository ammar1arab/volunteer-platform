'use client';
import styles from "./UserCard.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserAnalyticsDto } from "@/core/application/dtos";
import { Mail, Phone, Award, Clock } from "lucide-react";
import { ROUTES } from "@/presentation/constants";

interface UserCardProps {
  user: UserAnalyticsDto;
}

export default function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const isVolunteer = user.role === "VOLUNTEER";

  return (
    <div
      className={`${styles.card} ${isVolunteer ? styles.clickable : styles.admin}`}
      onClick={() => isVolunteer && router.push(ROUTES.ADMIN.USER_DETAILS(user.id))}
    >
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

      {isVolunteer && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <Award size={11} />
            <span>{user.stats.certificatesCount}</span>
          </div>
          <div className={styles.statItem}>
            <Clock size={11} />
            <span>{user.stats.totalHours}h</span>
          </div>
        </div>
      )}
    </div>
  );
}