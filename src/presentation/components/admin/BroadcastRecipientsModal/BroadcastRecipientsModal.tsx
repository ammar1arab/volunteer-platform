"use client";
import styles from "./BroadcastRecipientsModal.module.scss";
import { useState, useMemo } from "react";
import { Search, MapPin, User2, Clock, Users } from "lucide-react";
import { Modal, EmptyState, LoadingState, Pagination } from "@/presentation/components";
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

const ITEMS_PER_PAGE = 15;

const BroadcastRecipientsModal = ({ isOpen, onClose, broadcastTitle, recipients, loading }: Props) => {
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? recipients.filter(r => r.name.toLowerCase().includes(q)) : recipients;
  }, [recipients, search]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

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
            onChange={e => handleSearch(e.target.value)}
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
              {paginated.map(r => (
                <div key={r.id} className={styles.row}>
                  <div className={styles.avatar}>{r.name.charAt(0)}</div>
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

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />

      </div>
    </Modal>
  );
};

export default BroadcastRecipientsModal;