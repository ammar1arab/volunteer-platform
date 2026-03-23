"use client";
import styles from "./BroadcastRecipientsModal.module.scss";
import { useState, useMemo } from "react";
import { Search, MapPin, User2, Clock, Users } from "lucide-react";
import { Modal, EmptyState, LoadingState } from "@/presentation/components";
import type { BroadcastRecipientDto } from "@/core/application/dtos";
import { getCityLabel, getGenderLabel } from "@/presentation/constants";
import { JordanianCity, Gender } from "@/core/domain/enums";

interface Props {
  isOpen:         boolean;
  onClose:        () => void;
  broadcastTitle: string;
  recipients:     BroadcastRecipientDto[];
  loading:        boolean;
}

const BroadcastRecipientsModal = ({ isOpen, onClose, broadcastTitle, recipients, loading }: Props) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? recipients.filter(r => r.name.toLowerCase().includes(q)) : recipients;
  }, [recipients, search]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="مستقبلو الإشعار" size="md">
      <div className={styles.wrapper}>

        <div className={styles.subtitle}>
          <span className={styles.broadcastName}>{broadcastTitle}</span>
          <span className={styles.countBadge}>
            <Users size={11} /> {recipients.length} متطوع
          </span>
        </div>

        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم..."
          />
        </div>

        <div className={styles.listWrap}>
          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} message={search ? "لا توجد نتائج" : "لا يوجد مستقبلون"} />
          ) : (
            <div className={styles.list}>
              {filtered.map(r => (
                <div key={r.id} className={styles.row}>
                  <div className={styles.avatar}>
                    {r.name.charAt(0)}
                  </div>
                  <div className={styles.info}>
                    <span className={styles.name}>{r.name}</span>
                    <div className={styles.meta}>
                      {r.city && (
                        <span className={styles.chip}>
                          <MapPin size={9} /> {getCityLabel(r.city as JordanianCity)}
                        </span>
                      )}
                      {r.gender && (
                        <span className={styles.chip}>
                          <User2 size={9} /> {getGenderLabel(r.gender as Gender)}
                        </span>
                      )}
                      {r.hours > 0 && (
                        <span className={`${styles.chip} ${styles.hours}`}>
                          <Clock size={9} /> {r.hours} ساعة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default BroadcastRecipientsModal;