"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User, X, MapPin, Calendar, Users as UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./VolunteersModal.module.scss";
import type { ActivityVolunteerDto } from "@/core/application/dtos";
import { activityApi } from "@/lib/api";

interface VolunteersModalProps {
  activityId: string;
  activityTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VolunteersModal({
  activityId,
  activityTitle,
  isOpen,
  onClose,
}: VolunteersModalProps) {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<ActivityVolunteerDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activityId) {
      fetchVolunteers();
    }
  }, [isOpen, activityId]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const result = await activityApi.getVolunteers(activityId);
      if (result.success && result.volunteers) {
        setVolunteers(result.volunteers);
      }
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleViewProfile = (volunteerId: string) => {
    router.push(`/volunteer/profile?id=${volunteerId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <UsersIcon size={24} />
            <div>
              <h2 className={styles.title}>المتطوعون</h2>
              <p className={styles.subtitle}>{activityTitle}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>جاري التحميل...</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className={styles.empty}>
              <UsersIcon size={48} />
              <p>لا يوجد متطوعون مقبولون بعد</p>
            </div>
          ) : (
            <div className={styles.list}>
              {volunteers.map((volunteer) => (
                <div key={volunteer.id} className={styles.volunteerCard}>
                  {/* Avatar */}
                  <div className={styles.avatar}>
                    {volunteer.profilePictureUrl ? (
                      <Image
                        src={volunteer.profilePictureUrl}
                        alt={volunteer.fullName}
                        width={60}
                        height={60}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {volunteer.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.info}>
                    <h3 className={styles.name}>{volunteer.fullName}</h3>
                    <p className={styles.email}>{volunteer.email}</p>
                    <div className={styles.meta}>
                      <span className={styles.metaItem}>
                        {volunteer.phone}
                      </span>
                      {volunteer.city && (
                        <>
                          <span className={styles.divider}>•</span>
                          <span className={styles.metaItem}>
                            <MapPin size={14} />
                            {volunteer.city}
                          </span>
                        </>
                      )}
                      {volunteer.dateOfBirth && (
                        <>
                          <span className={styles.divider}>•</span>
                          <span className={styles.metaItem}>
                            <Calendar size={14} />
                            {calculateAge(volunteer.dateOfBirth)} سنة
                          </span>
                        </>
                      )}
                    </div>
                  </div>

          
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.count}>
            إجمالي المتطوعين: <strong>{volunteers.length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}