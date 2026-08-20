"use client";
import styles from "./BroadcastRecipientsModal.module.scss";
import { useMemo } from "react";
import { Search, MapPin, User2, Clock, Users } from "lucide-react";
import { Modal, EmptyState, LoadingState, Pagination, UserList } from "@/presentation/components";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
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
  const [search, setSearch] = useSessionStorageState(
    "filters.admin.broadcastRecipientsModal.search",
    ""
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.broadcastRecipientsModal.currentPage",
    1
  );

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
            <UserList
              layout="list"
              users={paginated.map(r => ({
                id: r.id,
                name: r.name,
                email: r.email || "",
                phone: r.phone,
                avatarUrl: r.avatarUrl,
                meta: [
                  r.city ? { value: getCityLabel(r.city as JordanianCity), icon: MapPin } : null,
                  r.gender ? { value: getGenderLabel(r.gender as Gender), icon: User2 } : null,
                  r.hours > 0 ? { value: `${r.hours} ساعة`, icon: Clock } : null,
                  r.certifications ? { value: `${r.certifications} شهادة`, icon: require("lucide-react").Award } : null,
                ].filter(Boolean) as any[]
              }))}
            />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          compact
        />

      </div>
    </Modal>
  );
};

export default BroadcastRecipientsModal;