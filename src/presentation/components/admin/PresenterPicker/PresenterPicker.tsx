"use client";

import styles from "./PresenterPicker.module.scss";
import Search from "@/presentation/components/base/Search/Search";
import Pagination from "@/presentation/components/base/Pagination/Pagination";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import {
  ACTIVITY_PRESENTER_HINT,
  ACTIVITY_PRESENTER_LABEL,
  ACTIVITY_PRESENTER_NONE,
  ACTIVITY_PRESENTER_PLACEHOLDER,
  getCityLabel,
  isJordanianCity
} from "@/presentation/constants";
import type { UserAnalyticsDto } from "@/core/application/dtos";
import { PRESENTER_PAGE_SIZE, usePresenterPicker } from "./PresenterPicker.logic";

type Props = {
  volunteers: UserAnalyticsDto[];
  value: string;
  onChange: (volunteerId: string) => void;
  loading?: boolean;
};

const PresenterPicker = ({ volunteers, value, onChange, loading = false }: Props) => {
  const {
    query,
    setQuery,
    setAppliedSearch,
    appliedSearch,
    page,
    setPage,
    filtered,
    paginated
  } = usePresenterPicker(volunteers);

  const selected = volunteers.find((v) => v.id === value);

  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <span className={styles.label}>{ACTIVITY_PRESENTER_LABEL}</span>
        {selected ? (
          <span className={styles.selectedBadge}>{selected.fullName}</span>
        ) : (
          <span className={styles.selectedBadge}>{ACTIVITY_PRESENTER_NONE}</span>
        )}
      </div>

      <p className={styles.hint}>{ACTIVITY_PRESENTER_HINT}</p>

      <Search
        value={query}
        onChange={setQuery}
        onSearch={setAppliedSearch}
        placeholder={ACTIVITY_PRESENTER_PLACEHOLDER}
        disabled={loading}
      />

      {loading ? (
        <div className={styles.loading}>
          <LoadingState compact />
        </div>
      ) : (
        <>
          <div className={styles.list}>
            <button
              type="button"
              className={`${styles.item} ${!value ? styles.itemSelected : ""}`}
              onClick={() => onChange("")}
            >
              <span className={`${styles.radio} ${!value ? styles.radioActive : ""}`} />
              <span className={`${styles.name} ${styles.noneItem}`}>{ACTIVITY_PRESENTER_NONE}</span>
            </button>
            {paginated.map((volunteer) => {
              const active = volunteer.id === value;
              const city = volunteer.city ?? volunteer.volunteerProfile?.city;
              return (
                <button
                  key={volunteer.id}
                  type="button"
                  className={`${styles.item} ${active ? styles.itemSelected : ""}`}
                  onClick={() => onChange(volunteer.id)}
                >
                  <span className={`${styles.radio} ${active ? styles.radioActive : ""}`} />
                  <div className={styles.info}>
                    <span className={styles.name}>{volunteer.fullName}</span>
                    <div className={styles.meta}>
                      <span>{volunteer.email}</span>
                      {city && isJordanianCity(city) && <span>{getCityLabel(city)}</span>}
                    </div>
                  </div>
                  {typeof volunteer.stats?.totalHours === "number" && (
                    <span className={styles.hours}>{volunteer.stats.totalHours} ساعة</span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className={styles.noResults}>
                {appliedSearch ? "لا توجد نتائج للبحث" : "لا يوجد متطوعون"}
              </p>
            )}
          </div>

          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            itemsPerPage={PRESENTER_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default PresenterPicker;
