"use client";
import styles from "./VolunteersModal.module.scss";
import { useVolunteersModal } from "./VolunteersModal.logic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { JordanianCity } from "@/core/domain/enums";
import { Modal, LoadingState, EmptyState } from "@/presentation/components";
import { ROUTES, getCityLabel } from "@/presentation/constants";
import { MapPin, Calendar, Users as UsersIcon } from "lucide-react";

type Props = {
  activityId: string;
  activityTitle: string;
  isOpen: boolean;
  onClose: () => void;
};

const VolunteersModal = ({ activityId, isOpen, onClose }: Props) => {
  const { volunteers, loading, calculateAge } = useVolunteersModal(activityId, isOpen);
  const router = useRouter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="المتطوعون" size="md">
      {loading ? (
        <div className={styles.loading}><LoadingState /></div>
      ) : volunteers.length === 0 ? (
        <EmptyState icon={UsersIcon} title="لا يوجد متطوعون" message="لم يتم قبول أي متطوع بعد" />
      ) : (
        <>
          <div className={styles.list}>
            {volunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className={styles.card}
                onClick={() => {
                  onClose();
                  router.push(ROUTES.ADMIN.USER_DETAILS(volunteer.id ?? volunteer.id));
                }}
              >
                <div className={styles.avatar}>
                  {volunteer.profilePictureUrl ? (
                    <Image src={volunteer.profilePictureUrl} alt={volunteer.fullName}
                      width={48} height={48} className={styles.avatarImage} />
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
                      <span className={styles.metaItem}>
                        <MapPin size={12} />
                        {getCityLabel(volunteer.city as JordanianCity)}
                      </span>
                    )}
                    {volunteer.dateOfBirth && (
                      <span className={styles.metaItem}>
                        <Calendar size={12} />
                        {calculateAge(volunteer.dateOfBirth)} سنة
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <p className={styles.count}>
              إجمالي المتطوعين: <strong>{volunteers.length}</strong>
            </p>
          </div>
        </>
      )}
    </Modal>
  );
};

export default VolunteersModal;