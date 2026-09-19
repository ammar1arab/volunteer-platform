"use client";

import { Search, CheckSquare, Clock } from "lucide-react";
import LoadingState from "@/presentation/components/state/LoadingState/LoadingState";
import SelectInput from "@/presentation/components/base/SelectInput/SelectInput";
import Pagination from "@/presentation/components/base/Pagination/Pagination";
import { UserList } from "@/presentation/components/admin/UserList/UserList";
import type { UserListMeta } from "@/presentation/components/admin/UserList/UserList";
import {
  AUDIENCE_EXPERIENCE_OPTIONS,
  AUDIENCE_TARGET_OPTIONS,
  CITY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  SKILL_OPTIONS,
  VOLUNTEER_TYPE_OPTIONS,
  getCityLabel,
  getGenderLabel
} from "@/presentation/constants";
import { Gender, JordanianCity, type AudienceTarget } from "@/core/domain/enums";
import type { AudienceTargetFieldsState } from "@/presentation/hooks/useAudienceTargetFields";
import type { PreviewUserDto } from "@/core/application/dtos";
import styles from "./AudienceTargetFields.module.scss";

function toListUser(v: PreviewUserDto) {
  const meta: UserListMeta[] = [];
  if (v.city) meta.push({ value: getCityLabel(v.city as JordanianCity) });
  if (v.gender) meta.push({ value: getGenderLabel(v.gender as Gender) });
  if (v.hours !== undefined) meta.push({ value: `${v.hours} ساعة`, icon: Clock });

  return {
    id: v.id,
    name: v.name,
    email: v.email || "",
    gender: v.gender ?? undefined,
    avatarUrl: v.avatarUrl,
    meta
  };
}

interface AudienceTargetFieldsProps {
  target: AudienceTarget;
  targetValue: string;
  disabled?: boolean;
  label?: string;
  onTargetChange: (value: AudienceTarget) => void;
  onTargetValueChange: (value: string) => void;
  fields: AudienceTargetFieldsState;
}

const AudienceTargetFields = ({
  target,
  targetValue,
  disabled,
  label = "الاستهداف",
  onTargetChange,
  onTargetValueChange,
  fields
}: AudienceTargetFieldsProps) => {
  return (
    <>
      <div className={styles.field}>
        <SelectInput
          label={label}
          value={target}
          options={[...AUDIENCE_TARGET_OPTIONS]}
          onChange={(val) => onTargetChange(val as AudienceTarget)}
          disabled={disabled}
        />
      </div>

      {target === "CITY" && (
        <div className={styles.field}>
          <SelectInput
            label="المدينة"
            value={targetValue}
            options={[{ value: "", label: "اختر مدينة" }, ...CITY_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {target === "GENDER" && (
        <div className={styles.field}>
          <SelectInput
            label="الجنس"
            value={targetValue}
            options={[{ value: "", label: "اختر" }, ...GENDER_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {target === "AGE" && (
        <div className={styles.field}>
          <label className={styles.label}>الحد الأدنى للعمر</label>
          <input
            type="number"
            min={0}
            max={100}
            className={styles.input}
            value={targetValue}
            onChange={(e) => onTargetValueChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {target === "HOURS" && (
        <div className={styles.field}>
          <label className={styles.label}>الحد الأدنى من الساعات</label>
          <input
            type="number"
            min={0}
            step={0.5}
            className={styles.input}
            value={targetValue}
            onChange={(e) => onTargetValueChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {target === "EDUCATION" && (
        <div className={styles.field}>
          <SelectInput
            label="المستوى التعليمي"
            value={targetValue}
            options={[{ value: "", label: "اختر" }, ...EDUCATION_LEVEL_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {target === "EXPERIENCE" && (
        <div className={styles.field}>
          <SelectInput
            label="الخبرة التطوعية"
            value={targetValue}
            options={[{ value: "", label: "اختر" }, ...AUDIENCE_EXPERIENCE_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {target === "INTEREST" && (
        <div className={styles.field}>
          <SelectInput
            label="الاهتمام"
            value={targetValue}
            options={[{ value: "", label: "اختر اهتماماً" }, ...INTEREST_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {target === "SKILL" && (
        <div className={styles.field}>
          <SelectInput
            label="المهارة"
            value={targetValue}
            options={[{ value: "", label: "اختر مهارة" }, ...SKILL_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {target === "LANGUAGE" && (
        <div className={styles.field}>
          <SelectInput
            label="اللغة"
            value={targetValue}
            options={[{ value: "", label: "اختر لغة" }, ...LANGUAGE_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {target === "VOLUNTEER_TYPE" && (
        <div className={styles.field}>
          <SelectInput
            label="نوع التطوع المفضل"
            value={targetValue}
            options={[{ value: "", label: "اختر نوعاً" }, ...VOLUNTEER_TYPE_OPTIONS]}
            onChange={onTargetValueChange}
            disabled={disabled}
          />
        </div>
      )}

      {(target === "ACTIVITY_PENDING" || target === "ACTIVITY_APPROVED") && (
        <div className={styles.field}>
          <SelectInput
            label="النشاط"
            value={targetValue}
            options={[{ value: "", label: "اختر نشاطاً" }, ...fields.activityOptions]}
            onChange={onTargetValueChange}
            disabled={disabled || fields.loadingActivities}
          />
        </div>
      )}

      {target === "USERS" && (
        <div className={styles.field}>
          <div className={styles.usersHeader}>
            <label className={styles.label}>اختر المتطوعين</label>
            {fields.directSelectedIds.size > 0 && (
              <span className={styles.selectedBadge}>{fields.directSelectedIds.size} محدد</span>
            )}
          </div>

          <div className={styles.userSearchWrap}>
            <Search size={13} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.userSearchInput}
              value={fields.volunteerSearch}
              onChange={(e) => fields.setVolunteerSearch(e.target.value)}
              placeholder="ابحث بالاسم..."
              disabled={fields.loadingVolunteers}
            />
          </div>

          {fields.loadingVolunteers ? (
            <div className={styles.volunteersLoading}>
              <LoadingState compact />
            </div>
          ) : (
            <>
              <div className={styles.userList}>
                {fields.filteredVolunteers.length > 0 && (
                  <div className={styles.userItem} onClick={fields.toggleAllDirect}>
                    <span
                      className={`${styles.checkbox} ${fields.allDirectVisible ? styles.checkboxActive : ""}`}
                    >
                      {fields.allDirectVisible && <CheckSquare size={11} />}
                    </span>
                    <span className={styles.userName}>
                      تحديد الكل ({fields.filteredVolunteers.length})
                    </span>
                  </div>
                )}

                {fields.filteredVolunteers.length === 0 ? (
                  <p className={styles.noResults}>لا توجد نتائج</p>
                ) : (
                  <UserList
                    users={fields.paginatedVolunteers.map(toListUser)}
                    layout="list"
                    selectable
                    selectedIds={fields.directSelectedIds}
                    onToggleUser={fields.toggleDirectUser}
                  />
                )}
              </div>

              <Pagination
                currentPage={fields.volunteersPage}
                totalItems={fields.filteredVolunteers.length}
                itemsPerPage={fields.volunteersPerPage}
                onPageChange={fields.setVolunteersPage}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AudienceTargetFields;
