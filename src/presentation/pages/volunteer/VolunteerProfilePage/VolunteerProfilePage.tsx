"use client";
import styles from "./VolunteerProfilePage.module.scss";
import { useProfilePage } from "./VolunteerProfilePage.logic";

import Image from "next/image";
import { useState } from "react";

import { CITY_OPTIONS } from "@/presentation/constants";
import { Dropdown, Pagination, LoadingState, EmptyState } from "@/presentation/components";
import { User, Mail, Phone, MapPin, Calendar, Award, Heart, Edit2, Check, X, Upload, Plus } from "lucide-react";

export default function VolunteerProfilePage() {
  const { user, stats, isLoading, error, successMessage, editingField, isSaving, isUploadingImage, activityFilter, filteredParticipations, currentPage, setCurrentPage, itemsPerPage, paginatedActivities, setActivityFilter, startEditing, cancelEditing, updateFieldValue, saveField, handleProfilePictureUpload, calculateAge, } = useProfilePage();

  if (isLoading) return <LoadingState />;

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorAlert}>{error || "لم يتم العثور على الملف الشخصي"}</div>
      </div>
    );
  }

  const { volunteerProfile } = user;

  const filterItems = [
    { key: "all", label: "الكل", count: stats.total },
    { key: "PENDING", label: "معلق", count: stats.pending },
    { key: "APPROVED", label: "موافق", count: stats.approved },
    { key: "REJECTED", label: "مرفوض", count: stats.rejected },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {error && <div className={styles.errorAlert}>{error}</div>}
        {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

        <section className={styles.hero}>
          <div className={styles.avatarSection}>
            <label className={styles.avatarLabel}>
              {volunteerProfile?.profilePictureUrl ? (
                <Image src={volunteerProfile.profilePictureUrl} alt={user.fullName} width={120} height={120} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User size={48} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProfilePictureUpload(file);
                }}
                disabled={isUploadingImage}
              />
              <div className={styles.uploadBadge}>
                {isUploadingImage ? <div className={styles.spinner} /> : <Upload size={14} />}
              </div>
            </label>
          </div>

          <div className={styles.info}>
            <h1 className={styles.name}>{user.fullName}</h1>
            <div className={styles.memberSince}>
              <Calendar size={14} />
              <span>عضو منذ {new Date(user.createdAt).toLocaleDateString("ar")}</span>
            </div>
            <div className={styles.stats}>
              <Stat label="موافق" value={stats.approved} />
              <Stat label="معلق" value={stats.pending} />
              <Stat label="مرفوض" value={stats.rejected} />
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          <div className={styles.col}>
            <Card title="المعلومات الشخصية">
              <div className={styles.infoList}>
                <EditableField icon={<Mail />} label="البريد" value={user.email} field="email" type="text" editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} />
                <EditableField icon={<Phone />} label="الهاتف" value={user.phone} field="phone" type="text" editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} />
                {volunteerProfile && (
                  <>
                    <EditableField icon={<MapPin />} label="المدينة" value={volunteerProfile.city} displayValue={CITY_OPTIONS.find(c => c.value === volunteerProfile.city)?.label} field="city" type="select" options={CITY_OPTIONS} editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} />
                    <EditableField icon={<Calendar />} label="العمر" value={volunteerProfile.dateOfBirth?.split('T')[0] ?? ""} displayValue={volunteerProfile.dateOfBirth ? `${calculateAge(volunteerProfile.dateOfBirth)} سنة` : "غير محدد"} field="dateOfBirth" type="date" editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} />                    <EditableField icon={<User />} label="الجنس" value={volunteerProfile.gender || ""} displayValue={volunteerProfile.gender === "MALE" ? "ذكر" : volunteerProfile.gender === "FEMALE" ? "أنثى" : "غير محدد"} field="gender" type="select" options={[{ value: "", label: "غير محدد" }, { value: "MALE", label: "ذكر" }, { value: "FEMALE", label: "أنثى" }]} editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} />
                  </>
                )}
              </div>
            </Card>

            {volunteerProfile && (
              <>
                <EditableCard title="نبذة عني" field="bio" value={volunteerProfile.bio} editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} isTextarea />
                <TagsCard icon={<Award />} title="المهارات" field="skills" tags={volunteerProfile.skills} editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} color="green" />
                <TagsCard icon={<Heart />} title="الاهتمامات" field="interests" tags={volunteerProfile.interests} editingField={editingField} isSaving={isSaving} onStartEdit={startEditing} onCancel={cancelEditing} onUpdate={updateFieldValue} onSave={saveField} color="red" />
              </>
            )}
          </div>

          <div className={styles.col}>
            <Card title="سجل الفرص" action={<Dropdown items={filterItems} active={activityFilter} onChange={setActivityFilter} placeholder="الحالة" compact />}>
              {paginatedActivities.length === 0 ? (
                <EmptyState icon={Award} message="لا توجد فرص" />
              ) : (
                <>
                  <div className={styles.list}>
                    {paginatedActivities.map((p: any) => (
                      <ActivityCard key={p.id} participation={p} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredParticipations.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    sticky
                  />                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className={styles.stat}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const Card = ({ title, action, children }: any) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const EditableCard = ({ title, field, value, editingField, isSaving, onStartEdit, onCancel, onUpdate, onSave }: any) => {
  const isEditing = editingField?.field === field;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {!isEditing && (
          <button className={styles.btnEdit} onClick={() => onStartEdit(field, value || "")}>
            <Edit2 size={14} />
          </button>
        )}
      </div>
      {isEditing ? (
        <div className={styles.editSection}>
          <textarea className={styles.textarea} rows={4} value={editingField.value} onChange={(e) => onUpdate(e.target.value)} placeholder="اكتب..." disabled={isSaving} />
          <div className={styles.actions}>
            <button className={styles.btnCancel} onClick={onCancel} disabled={isSaving}><X size={14} /> إلغاء</button>
            <button className={styles.btnSave} onClick={onSave} disabled={isSaving}>{isSaving ? "..." : <><Check size={14} /> حفظ</>}</button>
          </div>
        </div>
      ) : (
        <p className={styles.bio}>{value || "لم يتم الإضافة"}</p>
      )}
    </div>
  );
};

function EditableField({ icon, label, value, displayValue, field, type, options, editingField, isSaving, onStartEdit, onCancel, onUpdate, onSave }: any) {
  const isEditing = editingField?.field === field;

  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>{icon}</div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        {isEditing ? (
          <div className={styles.inlineEdit}>
            {type === "select" ? (
              <select className={styles.input} value={editingField.value} onChange={(e) => onUpdate(e.target.value)} disabled={isSaving}>
                {options.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : type === "date" ? (
              <input type="date" className={styles.input} value={editingField.value} onChange={(e) => onUpdate(e.target.value)} disabled={isSaving} />
            ) : (
              <input type="text" className={styles.input} value={editingField.value} onChange={(e) => onUpdate(e.target.value)} disabled={isSaving} />
            )}
            <button className={styles.btnCheck} onClick={onSave} disabled={isSaving}><Check size={14} /></button>
            <button className={styles.btnX} onClick={onCancel} disabled={isSaving}><X size={14} /></button>
          </div>
        ) : (
          <div className={styles.infoValueRow}>
            <span className={styles.infoValue}>{displayValue || value || "غير محدد"}</span>
            <button className={styles.btnEditIcon} onClick={() => onStartEdit(field, value)}><Edit2 size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function TagsCard({ icon, title, field, tags, editingField, isSaving, onStartEdit, onCancel, onUpdate, onSave, color }: any) {
  const [input, setInput] = useState("");
  const isEditing = editingField?.field === field;
  const currentTags: string[] = isEditing ? editingField.value : tags;

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !currentTags.includes(trimmed)) {
      onUpdate([...currentTags, trimmed]);
      setInput("");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{icon} {title}</h2>
        {!isEditing && <button className={styles.btnEdit} onClick={() => onStartEdit(field, tags)}><Edit2 size={14} /></button>}
      </div>

      {isEditing ? (
        <div className={styles.editSection}>
          <div className={styles.tagInput}>
            <input type="text" className={styles.input} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())} placeholder="أضف..." disabled={isSaving} />
            <button className={styles.btnAdd} onClick={handleAdd} disabled={isSaving || !input.trim()}><Plus size={16} /></button>
          </div>
          {currentTags.length > 0 && (
            <div className={styles.tags}>
              {currentTags.map((tag: string, i: number) => (
                <span key={i} className={`${styles.tag} ${styles[color]}`}>
                  {tag}
                  <button className={styles.btnRemove} onClick={() => onUpdate(currentTags.filter((t: string) => t !== tag))} disabled={isSaving}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
          <div className={styles.actions}>
            <button className={styles.btnCancel} onClick={onCancel} disabled={isSaving}><X size={14} /> إلغاء</button>
            <button className={styles.btnSave} onClick={onSave} disabled={isSaving}>{isSaving ? "..." : <><Check size={14} /> حفظ</>}</button>
          </div>
        </div>
      ) : currentTags.length > 0 ? (
        <div className={styles.tags}>
          {currentTags.map((tag: string, i: number) => (
            <span key={i} className={`${styles.tag} ${styles[color]}`}>{tag}</span>
          ))}
        </div>
      ) : (
        <p className={styles.bio}>لم يتم الإضافة</p>
      )}
    </div>
  );
}

function ActivityCard({ participation }: any) {
  const { activity } = participation;
  const statusConfig: any = {
    PENDING: { label: "معلق", color: "yellow" },
    APPROVED: { label: "موافق", color: "green" },
    REJECTED: { label: "مرفوض", color: "red" },
  };
  const config = statusConfig[participation.status] || statusConfig.PENDING;

  return (
    <div className={styles.activityCard}>
      <div className={styles.activityHeader}>
        <h3 className={styles.activityTitle}>{activity?.title || "نشاط تطوعي"}</h3>
        <span className={`${styles.badge} ${styles[config.color]}`}>{config.label}</span>
      </div>
      {activity?.description && <p className={styles.activityDesc}>{activity.description}</p>}
      <div className={styles.activityDetails}>
        {activity?.date && (
          <div className={styles.detail}>
            <Calendar size={14} />
            <span>{new Date(activity.date).toLocaleDateString("ar")}</span>
          </div>
        )}
        {activity?.placeName && (
          <div className={styles.detail}>
            <MapPin size={14} />
            <span>{activity.placeName}</span>
          </div>
        )}
      </div>
      <div className={styles.activityFooter}>
        طلب: {new Date(participation.requestedAt).toLocaleDateString("ar")}
      </div>
    </div>
  );
}