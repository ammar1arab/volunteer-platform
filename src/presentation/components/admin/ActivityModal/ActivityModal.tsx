"use client";
import styles from "./ActivityModal.module.scss";
import { useActivityModal, MEETING_LINK_SOURCE_OPTIONS } from "./ActivityModal.logic";
import Image from "next/image";
import {
  DAY_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  CITY_OPTIONS,
  CATEGORY_OPTIONS,
  MEETING_PLATFORM_OPTIONS,
  ACTIVITY_PRESENTER_LABEL,
  ACTIVITY_PRESENTER_PLACEHOLDER,
  ACTIVITY_PRESENTER_NONE
} from "@/presentation/constants/labels";
import { Modal, SelectInput, BirthDateInput, TimePickerInput, LocationPicker, MultiSelectInput, MeetingStatusBadge } from "@/presentation/components";
import { Upload, AlertTriangle } from "lucide-react";
import {
  ActivityType,
  DayOfWeek,
  JordanianCity,
  MeetingLinkSource,
  MeetingPlatform,
  DomainFeaturedPostCategory,
  UserRole,
  MeetingSyncStatus
} from "@/core/domain/enums";
import { useUsers, useGoogleIntegrationStatus } from "@/presentation/hooks";
import { useMemo } from "react";
import { ROUTES } from "@/presentation/constants";
import Link from "next/link";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
  isSubmitting: boolean;
};

const ActivityModal = ({ isOpen, onClose, mode, initialData, onSubmit, onImageUpload, isSubmitting }: Props) => {
  const { form, preview, uploading, setForm, handleImage, handleSubmit } =
    useActivityModal({ initialData, onSubmit, onImageUpload, onClose });

  const { users } = useUsers({ enabled: isOpen });
  const { status: googleIntegration } = useGoogleIntegrationStatus({ enabled: isOpen });
  const volunteerOptions = useMemo(
    () => [
      { value: "", label: ACTIVITY_PRESENTER_NONE },
      ...users
        .filter((u) => u.role === UserRole.VOLUNTEER && u.isActive)
        .map((u) => ({
          value: u.id,
          label: `${u.fullName}${u.email ? ` · ${u.email}` : ""}`
        }))
    ],
    [users]
  );

  const isOnline = form.activityType === ActivityType.ONLINE;
  const isAutoMeet = form.meetingLinkSource === MeetingLinkSource.GOOGLE_MEET_AUTO;
  const isManualMeet = form.meetingLinkSource === MeetingLinkSource.MANUAL;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "create" ? "إنشاء فرصة تطوعية" : "تعديل الفرصة"} size="lg">
      <form className={styles.form} onSubmit={handleSubmit}>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>عنوان الفرصة</label>
            <input className={styles.input} value={form.title} required
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <SelectInput label="نوع النشاط" value={form.activityType} options={ACTIVITY_TYPE_OPTIONS} required
              onChange={(val) => setForm(p => ({
                ...p,
                activityType: val as ActivityType,
                ...(val === ActivityType.ONLINE
                  ? {
                      placeName: "",
                      city: "" as "",
                      latitude: 31.9454,
                      longitude: 35.9284,
                      meetingLinkSource: MeetingLinkSource.MANUAL,
                      meetingPlatform: "" as "",
                      meetingLink: ""
                    }
                  : {
                      meetingLink: "",
                      meetingPlatform: "" as "",
                      meetingLinkSource: "" as "",
                      primaryPresenterId: ""
                    }
                )
              }))} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>التصنيفات</label>
          <MultiSelectInput
            values={form.categories || []}
            options={CATEGORY_OPTIONS}
            onChange={(values) => setForm((p) => ({ ...p, categories: values as DomainFeaturedPostCategory[] }))}
            maxSelections={3}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>وصف الفعالية</label>
          <textarea className={styles.textarea} rows={3} value={form.description} required
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <SelectInput label="اليوم" value={form.dayOfWeek} options={DAY_OPTIONS} required
              onChange={(value) => setForm((p) => ({ ...p, dayOfWeek: value as DayOfWeek }))} />
          </div>
          <div className={styles.field}>
            <BirthDateInput label="التاريخ" value={form.date} required allowFuture
              onChange={(value) => setForm((p) => ({ ...p, date: value }))} />
          </div>
        </div>

        <div className={styles.timeRow}>
          <TimePickerInput label="وقت البدء" value={form.startTime} required
            onChange={(value) => setForm((p) => ({ ...p, startTime: value }))} />
          <TimePickerInput label="وقت الانتهاء" value={form.endTime} required
            onChange={(value) => setForm((p) => ({ ...p, endTime: value }))} />
          <div className={styles.field}>
            <label className={styles.label}>ساعات التطوع</label>
            <input className={styles.input} type="number" min={1} value={form.durationHours} required
              onChange={(e) => setForm((p) => ({ ...p, durationHours: parseInt(e.target.value) || 1 }))} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>العدد الأقصى للمتطوعين</label>
          <input className={styles.input} type="number" min={1} value={form.maxVolunteers} required
            onChange={(e) => setForm((p) => ({ ...p, maxVolunteers: parseInt(e.target.value) || 1 }))} />
        </div>

        {!isOnline && (
          <>
            <div className={styles.row}>
              <div className={styles.field}>
                <SelectInput label="المدينة" value={form.city} options={CITY_OPTIONS}
                  onChange={(v) => setForm(p => ({ ...p, city: v as JordanianCity }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>اسم المكان</label>
                <input className={styles.input} value={form.placeName}
                  onChange={(e) => setForm((p) => ({ ...p, placeName: e.target.value }))} />
              </div>
            </div>

            <div className={styles.field}>
              <LocationPicker
                latitude={form.latitude ?? 31.9454}
                longitude={form.longitude ?? 35.9284}
                onChange={(lat, lng) => setForm((p) => ({ ...p, latitude: lat, longitude: lng }))}
              />
            </div>
          </>
        )}

        {isOnline && (
          <>
            <div className={styles.field}>
              <SelectInput
                label="مصدر رابط الاجتماع"
                value={form.meetingLinkSource}
                options={MEETING_LINK_SOURCE_OPTIONS}
                required
                onChange={(v) => {
                  const source = v as MeetingLinkSource;
                  setForm((p) => ({
                    ...p,
                    meetingLinkSource: source,
                    ...(source === MeetingLinkSource.GOOGLE_MEET_AUTO
                      ? {
                          meetingPlatform: MeetingPlatform.GOOGLE_MEET,
                          meetingLink: ""
                        }
                      : {
                          meetingPlatform: p.meetingPlatform === MeetingPlatform.GOOGLE_MEET
                            ? p.meetingPlatform
                            : ("" as "")
                        })
                  }));
                }}
              />
            </div>

            {isManualMeet && (
              <div className={styles.row}>
                <div className={styles.field}>
                  <SelectInput label="منصة الاجتماع" value={form.meetingPlatform} options={MEETING_PLATFORM_OPTIONS}
                    onChange={(v) => setForm(p => ({ ...p, meetingPlatform: v as MeetingPlatform }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>رابط الاجتماع</label>
                  <input className={styles.input} value={form.meetingLink}
                    onChange={(e) => setForm(p => ({ ...p, meetingLink: e.target.value }))} />
                </div>
              </div>
            )}

            {isAutoMeet && (
              <>
                <p className={styles.hint}>
                  سيتم إنشاء رابط Google Meet تلقائياً عند نشر الفرصة وربطه بحساب المنظمة.
                </p>
                {googleIntegration && !googleIntegration.connected && (
                  <p className={styles.meetWarn}>
                    <AlertTriangle size={14} />
                    Google غير متصل حالياً.{" "}
                    <Link href={ROUTES.ADMIN.GOOGLE_MEET}>اربط الحساب من إدارة الاجتماعات</Link>
                    {" "}قبل النشر التلقائي.
                  </p>
                )}
                {mode === "edit" && initialData?.meetingSyncStatus && (
                  <div className={styles.meetStatusRow}>
                    <MeetingStatusBadge status={initialData.meetingSyncStatus} />
                    {initialData.meetingLink && (
                      <a
                        href={initialData.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.meetLinkPreview}
                      >
                        فتح رابط الاجتماع
                      </a>
                    )}
                    {initialData.meetingSyncStatus === MeetingSyncStatus.FAILED &&
                      initialData.meetingSyncError && (
                        <span className={styles.meetError}>{initialData.meetingSyncError}</span>
                      )}
                  </div>
                )}
              </>
            )}

            <div className={styles.field}>
              <SelectInput
                label={ACTIVITY_PRESENTER_LABEL}
                value={form.primaryPresenterId}
                options={volunteerOptions}
                placeholder={ACTIVITY_PRESENTER_PLACEHOLDER}
                onChange={(v) => setForm((p) => ({ ...p, primaryPresenterId: v }))}
              />
            </div>
          </>
        )}

        <div className={styles.field}>
          <label className={styles.label}>صورة الفعالية</label>
          <div className={styles.uploadSection}>
            {(preview || form.imageUrl) && (
              <div className={styles.preview}>
                <Image src={preview || form.imageUrl} alt="Preview" width={800} height={400} loading="eager" />
              </div>
            )}
            <label className={styles.btnUpload}>
              <Upload size={16} />
              {uploading ? "جاري الرفع..." : form.imageUrl ? "تغيير الصورة" : "رفع صورة الغلاف"}
              <input type="file" accept="image/*" className={styles.fileInput} disabled={uploading}
                onChange={(e) => handleImage(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={isSubmitting || uploading || !form.title}>
            {isSubmitting ? "جاري الحفظ..." : mode === "create" ? "إنشاء الفرصة" : "حفظ التعديلات"}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default ActivityModal;
