"use client";

import Image from "next/image";
import {  X, MapPin, Calendar, Users as UsersIcon } from "lucide-react";
import { useVolunteersModal } from "./VolunteersModal.logic";
import styles from "./VolunteersModal.module.scss";

type Props = {
  activityId: string;
  activityTitle: string;
  isOpen: boolean;
  onClose: () => void;
};

const VolunteersModal = ({ activityId, activityTitle, isOpen, onClose }: Props) => {
  const { volunteers, loading, calculateAge } = useVolunteersModal(activityId, isOpen);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                <div key={volunteer.id} className={styles.card}>
                  <div className={styles.avatar}>
                    {volunteer.profilePictureUrl ? (
                      <Image
                        src={volunteer.profilePictureUrl}
                        alt={volunteer.fullName}
                        width={48}
                        height={48}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {volunteer.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className={styles.info}>
                    <h3 className={styles.name}>{volunteer.fullName}</h3>
                    <p className={styles.email}>{volunteer.email}</p>
                    <div className={styles.meta}>
                      <span className={styles.metaItem}>{volunteer.phone}</span>
                      {volunteer.city && (
                        <>
                          <span className={styles.divider}>•</span>
                          <span className={styles.metaItem}>
                            <MapPin size={12} />
                            {volunteer.city}
                          </span>
                        </>
                      )}
                      {volunteer.dateOfBirth && (
                        <>
                          <span className={styles.divider}>•</span>
                          <span className={styles.metaItem}>
                            <Calendar size={12} />
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

        <div className={styles.footer}>
          <p className={styles.count}>
            إجمالي المتطوعين: <strong>{volunteers.length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteersModal;