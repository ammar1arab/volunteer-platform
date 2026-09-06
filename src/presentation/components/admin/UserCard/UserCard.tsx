"use client";
import styles from "./UserCard.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserAnalyticsDto } from "@/core/application/dtos";
import { getFallbackProfileImage } from "@/lib/utils/image";
import { useImagePreview } from "@/presentation/providers/ImagePreviewProvider";
import { Mail, Phone, Award, Clock, ExternalLink, MapPin } from "lucide-react";
import { ROUTES, getCityLabel } from "@/presentation/constants";
import { JordanianCity } from "@/core/domain/enums";

interface UserCardProps {
  user: UserAnalyticsDto;
}

export default function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const isVolunteer = user.role === "VOLUNTEER";
  
  const displayImage = getFallbackProfileImage(
    user.volunteerProfile?.profilePictureUrl, 
    user.volunteerProfile?.gender
  );
  
  const { previewImage } = useImagePreview();

  return (
    <div
      className={`${styles.card} ${isVolunteer ? styles.clickable : styles.admin}`}
      onClick={() => isVolunteer && router.push(ROUTES.ADMIN.USER_DETAILS(user.id))}
    >
      <div 
        className={styles.avatar}
        onClick={(e) => {
          e.stopPropagation();
          previewImage(displayImage);
        }}
        style={{ cursor: 'pointer' }}
      >
        <Image
          src={displayImage}
          alt={user.fullName}
          width={56}
          height={56}
          className={styles.avatarImg}
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>
          {user.fullName}
          {isVolunteer && <ExternalLink size={12} />}
        </h3>
        <div className={styles.contact}>
          <div className={styles.contactItem}>
            <Mail size={12} />
            <span>{user.email}</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={12} />
            <span>{user.phone}</span>
          </div>
          {user.volunteerProfile?.city && (
            <div className={styles.contactItem}>
              <MapPin size={12} />
              <span>{getCityLabel(user.volunteerProfile.city as JordanianCity)}</span>
            </div>
          )}
        </div>
      </div>

      {isVolunteer && user.stats && (
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
