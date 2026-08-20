"use client";
import Image from "next/image";
import { Upload, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { useImagePreview } from "@/presentation/providers/ImagePreviewProvider";
import styles from "./ProfileHeader.module.scss";

type Props = {
  fullName: string;
  role: string;
  profilePictureUrl?: string;
  createdAt: string;
  isEditable?: boolean;
  isUploading?: boolean;
  onImageUpload?: (file: File) => void;
  totalHours?: number;
};

const ProfileHeader = ({
  fullName, role, profilePictureUrl, createdAt,
  isEditable = false, isUploading = false, onImageUpload, totalHours,
}: Props) => {
  const { previewImage } = useImagePreview();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) onImageUpload(file);
  };

  return (
    <div className={styles.header}>
      <div className={styles.avatarWrapper}>
        {isEditable ? (
          <label className={styles.avatarLabel}>
            <div onClick={() => profilePictureUrl && previewImage(profilePictureUrl)} style={{ cursor: profilePictureUrl ? 'pointer' : 'default' }}>
              {profilePictureUrl
                ? <Image src={profilePictureUrl} alt={fullName} width={80} height={80} className={styles.avatar} />
                : <div className={styles.avatarPlaceholder}><User size={32} /></div>}
            </div>
            <div className={styles.uploadBadge}>
              {isUploading ? <div className={styles.spinner} /> : <Upload size={14} />}
            </div>
            <input type="file" accept="image/*" className={styles.fileInput} onChange={handleFileChange} disabled={isUploading} />
          </label>
        ) : (
          <div onClick={() => profilePictureUrl && previewImage(profilePictureUrl)} style={{ cursor: profilePictureUrl ? 'pointer' : 'default' }}>
            {profilePictureUrl
              ? <Image src={profilePictureUrl} alt={fullName} width={80} height={80} className={styles.avatar} />
              : <div className={styles.avatarPlaceholder}>{fullName.charAt(0).toUpperCase()}</div>}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h1 className={styles.name}>{fullName}</h1>
        <span className={styles.role}>{role}</span>
        <div className={styles.memberSince}>
          <Calendar size={14} />
          <span>عضو منذ {formatDate(createdAt)}</span>
        </div>
        {totalHours !== undefined && (
          <div className={styles.hoursChip}>
            <span className={styles.hoursValue}>{totalHours}</span>
            <span className={styles.hoursLabel}>ساعة تطوع</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;