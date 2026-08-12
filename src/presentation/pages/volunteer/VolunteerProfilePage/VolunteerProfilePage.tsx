"use client";
import styles from "./VolunteerProfilePage.module.scss";
import { useProfilePage } from "./VolunteerProfilePage.logic";
import Image from "next/image";
import Link from "next/link";
import {
  CITY_OPTIONS,
  ROUTES,
  getCityLabel,
  getGenderLabel,
  getEducationLevelLabel,
  getMonthLabel,
  EDUCATION_LEVEL_OPTIONS,
  EXPERIENCE_OPTIONS,
  LANGUAGE_SUGGESTIONS,
  VOLUNTEER_TYPE_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  INTEREST_SUGGESTIONS
} from "@/presentation/constants";
import { LoadingState, ProfileTagsSection } from "@/presentation/components";
import {
  User, Mail, Phone, MapPin, Calendar, Award, Heart, Edit2, Check, X, Upload,
  ChevronLeft, Hash, Briefcase, GraduationCap, Languages, Sparkles
} from "lucide-react";
import { JordanianCity, Gender } from "@/core/domain/enums";

const GENDER_OPTIONS = [
  { value: "", label: "غير محدد" },
  { value: "MALE", label: "ذكر" },
  { value: "FEMALE", label: "أنثى" },
];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${getMonthLabel(dt.getMonth() + 1)} ${dt.getFullYear()}`;
};

export default function VolunteerProfilePage() {
  const {
    user, isLoading, error, successMessage,
    editingField, isSaving, isUploadingImage,
    startEditing, cancelEditing, updateFieldValue, saveField,
    handleProfilePictureUpload, calculateAge, totalHours, certCount
  } = useProfilePage();

  if (isLoading) return <LoadingState />;
  if (!user) return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.errorAlert}>{error || "لم يتم العثور على الملف الشخصي"}</div>
      </div>
    </div>
  );

  const vp = user.volunteerProfile;
  const ef = {
    editingField, isSaving,
    onStartEdit: startEditing, onCancel: cancelEditing,
    onUpdate: updateFieldValue, onSave: saveField,
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {error && <div className={styles.errorAlert}>{error}</div>}
        {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

        <section className={styles.hero}>
          <div className={styles.avatarSection}>
            <label className={styles.avatarLabel}>
              {vp?.profilePictureUrl
                ? <Image src={vp.profilePictureUrl} alt={user.fullName} width={88} height={88} className={styles.avatar} />
                : <div className={styles.avatarPlaceholder}><User size={36} /></div>
              }
              <input type="file" accept="image/*" className={styles.fileInput}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleProfilePictureUpload(f); }}
                disabled={isUploadingImage}
              />
              <div className={styles.uploadBadge}>
                {isUploadingImage ? <div className={styles.spinner} /> : <Upload size={11} />}
              </div>
            </label>
          </div>

          <div className={styles.info}>
            <h1 className={styles.name}>{user.fullName}</h1>
            <div className={styles.memberSince}>
              <Calendar size={12} /><span>عضو منذ {fmt(user.createdAt)}</span>
            </div>
            {vp && (
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{totalHours}</span>
                  <span className={styles.heroStatLabel}>ساعة تطوع</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{certCount}</span>
                  <span className={styles.heroStatLabel}>شهادة</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className={styles.quickLinks}>
          <Link href={ROUTES.VOLUNTEER.ACTIVITIES} className={styles.quickLink}>
            <span>فرصي التطوعية</span>
            <ChevronLeft size={15} />
          </Link>
          <Link href={ROUTES.ACTIVITIES} className={styles.quickLink}>
            <span>استكشف الفرص</span>
            <ChevronLeft size={15} />
          </Link>
        </div>

        <div className={styles.grid}>
          <Card title="المعلومات الشخصية">
            <div className={styles.infoList}>
              <EField icon={<Mail size={15} />} label="البريد" value={user.email} field="email" type="text" {...ef} />
              <EField icon={<Phone size={15} />} label="الهاتف" value={user.phone} field="phone" type="text" {...ef} />
              {vp && <>
                <EField
                  icon={<Hash size={15} />}
                  label="رقم الانتساب"
                  value={vp.membershipNumber || ""}
                  displayValue={vp.membershipNumber || "غير محدد"}
                  field="membershipNumber"
                  type="text"
                  {...ef}
                />
                <EField icon={<MapPin size={15} />} label="المدينة" value={vp.city}
                  displayValue={vp.city ? getCityLabel(vp.city as JordanianCity) : undefined}
                  field="city" type="select" options={CITY_OPTIONS} {...ef} />
                <EField icon={<Calendar size={15} />} label="العمر" value={vp.dateOfBirth?.split("T")[0] ?? ""}
                  displayValue={vp.dateOfBirth ? `${calculateAge(vp.dateOfBirth)} سنة` : "غير محدد"}
                  field="dateOfBirth" type="date" {...ef} />
                <EField icon={<User size={15} />} label="الجنس" value={vp.gender || ""}
                  displayValue={vp.gender ? getGenderLabel(vp.gender as Gender) : "غير محدد"}
                  field="gender" type="select" options={GENDER_OPTIONS} {...ef} />
                <EField
                  icon={<GraduationCap size={15} />}
                  label="المستوى التعليمي"
                  value={vp.educationLevel || ""}
                  displayValue={vp.educationLevel ? getEducationLevelLabel(vp.educationLevel) : "غير محدد"}
                  field="educationLevel"
                  type="select"
                  options={[{ value: "", label: "غير محدد" }, ...EDUCATION_LEVEL_OPTIONS]}
                  {...ef}
                />
                <EField
                  icon={<Briefcase size={15} />}
                  label="التخصص / المهنة"
                  value={vp.occupation || ""}
                  displayValue={vp.occupation || "غير محدد"}
                  field="occupation"
                  type="text"
                  {...ef}
                />
                <EField
                  icon={<Award size={15} />}
                  label="خبرة تطوعية سابقة"
                  value={vp.hasVolunteerExperience ? "true" : "false"}
                  displayValue={vp.hasVolunteerExperience ? "نعم" : "لا"}
                  field="hasVolunteerExperience"
                  type="select"
                  options={EXPERIENCE_OPTIONS}
                  {...ef}
                />
              </>}
            </div>
          </Card>

          {vp && (
            <ECard title="نبذة عني" field="bio" value={vp.bio || ""} {...ef} />
          )}
        </div>

        {vp && (
          <div className={styles.themesBlock}>
            <ProfileTagsSection
              title="اهتماماتي التطوعية"
              items={[
                {
                  field: "skills",
                  title: "المهارات",
                  icon: <Award size={14} />,
                  tags: vp.skills ?? [],
                  suggestions: SKILL_SUGGESTIONS
                },
                {
                  field: "interests",
                  title: "الاهتمامات",
                  icon: <Heart size={14} />,
                  tags: vp.interests ?? [],
                  suggestions: INTEREST_SUGGESTIONS
                },
                {
                  field: "languages",
                  title: "اللغات",
                  icon: <Languages size={14} />,
                  tags: vp.languages ?? [],
                  suggestions: LANGUAGE_SUGGESTIONS
                },
                {
                  field: "preferredVolunteerTypes",
                  title: "أنواع التطوع المفضلة",
                  icon: <Sparkles size={14} />,
                  tags: vp.preferredVolunteerTypes ?? [],
                  suggestions: VOLUNTEER_TYPE_SUGGESTIONS
                }
              ]}
              {...ef}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}><h2 className={styles.cardTitle}>{title}</h2></div>
    {children}
  </div>
);

type ProfileFieldValue = string | number | boolean | string[] | null;

interface EditingFieldState {
  field: string;
  value: ProfileFieldValue;
}

interface EditHandlers {
  editingField: EditingFieldState | null;
  isSaving: boolean;
  onStartEdit: (field: string, value: ProfileFieldValue) => void;
  onCancel: () => void;
  onUpdate: (value: ProfileFieldValue) => void;
  onSave: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

const ECard = ({
  title,
  field,
  value,
  editingField,
  isSaving,
  onStartEdit,
  onCancel,
  onUpdate,
  onSave
}: {
  title: string;
  field: string;
  value: string;
} & EditHandlers) => {
  const isEditing = editingField?.field === field;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {!isEditing && <button className={styles.btnEdit} onClick={() => onStartEdit(field, value || "")}><Edit2 size={13} /></button>}
      </div>
      {isEditing ? (
        <div className={styles.editSection}>
          <textarea className={styles.textarea} rows={4} value={String(editingField.value ?? "")}
            onChange={e => onUpdate(e.target.value)} placeholder="اكتب..." disabled={isSaving} />
          <div className={styles.actions}>
            <button className={styles.btnCancel} onClick={onCancel} disabled={isSaving}><X size={13} /> إلغاء</button>
            <button className={styles.btnSave} onClick={onSave} disabled={isSaving}><Check size={13} /> حفظ</button>
          </div>
        </div>
      ) : <p className={styles.bio}>{value || "لم يتم الإضافة"}</p>}
    </div>
  );
};

const EField = ({
  icon,
  label,
  value,
  displayValue,
  field,
  type,
  options,
  editingField,
  isSaving,
  onStartEdit,
  onCancel,
  onUpdate,
  onSave
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  displayValue?: string;
  field: string;
  type?: string;
  options?: SelectOption[];
} & EditHandlers) => {
  const isEditing = editingField?.field === field;
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>{icon}</div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        {isEditing ? (
          <div className={styles.inlineEdit}>
            {type === "select"
              ? <select className={styles.input} value={String(editingField.value ?? "")} onChange={e => onUpdate(e.target.value)} disabled={isSaving}>
                {(options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              : <input type={type === "date" ? "date" : "text"} className={styles.input}
                value={String(editingField.value ?? "")} onChange={e => onUpdate(e.target.value)} disabled={isSaving} />
            }
            <button className={styles.btnCheck} onClick={onSave} disabled={isSaving}><Check size={13} /></button>
            <button className={styles.btnX} onClick={onCancel} disabled={isSaving}><X size={13} /></button>
          </div>
        ) : (
          <div className={styles.infoValueRow}>
            <span className={styles.infoValue}>{displayValue || value || "غير محدد"}</span>
            <button className={styles.btnEditIcon} onClick={() => onStartEdit(field, value)}><Edit2 size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
};
