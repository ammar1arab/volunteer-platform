"use client";

import Image from "next/image";
import { useProfilePage } from "./page.logic";
import {
  User, Mail, Phone, MapPin, Calendar, Award, Heart,
  CheckCircle, Clock, XCircle, Edit2, Check, X,
  Upload, LogOut, Plus
} from "lucide-react";
import { useState } from "react";
import styles from "./page.module.scss";
import { JORDANIAN_CITIES } from "@/lib";

export default function VolunteerProfilePage() {
  const {
    user,
    stats,
    isLoading,
    error,
    successMessage,
    editingField,
    isSaving,
    isUploadingImage,
    startEditing,
    cancelEditing,
    updateFieldValue,
    saveField,
    handleProfilePictureUpload,
    handleSignOut,
    calculateAge,
    participations,
  } = useProfilePage();

  const [activityFilter, setActivityFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error && !user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorAlert}>{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorAlert}>لم يتم العثور على الملف الشخصي</div>
      </div>
    );
  }

  const { volunteerProfile } = user; // بس volunteerProfile، مش participations
  // Filter participations
  const filteredParticipations = activityFilter === "ALL"
    ? participations
    : participations.filter((p) => p.status === activityFilter);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Messages */}
        {error && <div className={styles.errorAlert}>{error}</div>}
        {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

        {/* Hero Section - Instagram Style */}
        <section className={styles.hero}>
          <div className={styles.profileHeader}>
            {/* Profile Picture */}
            <div className={styles.avatarSection}>
              <label className={styles.avatarLabel}>
                {volunteerProfile?.profilePictureUrl ? (
                  <Image
                    src={volunteerProfile.profilePictureUrl}
                    alt={user.fullName}
                    width={150}
                    height={150}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <User size={64} />
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
                  {isUploadingImage ? (
                    <div className={styles.uploadingSpinner} />
                  ) : (
                    <Upload size={18} />
                  )}
                </div>
              </label>
            </div>

            {/* Profile Info */}
            <div className={styles.profileInfo}>
              <div className={styles.profileTop}>
                <div>
                  <h1 className={styles.profileName}>{user.fullName}</h1>
                </div>
                <button className={styles.btnSignOut} onClick={handleSignOut}>
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>

              {/* Stats Row */}
              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stats.total}</span>
                  <span className={styles.statLabel}>أنشطة</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stats.approved}</span>
                  <span className={styles.statLabel}>موافق عليها</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stats.pending}</span>
                  <span className={styles.statLabel}>معلقة</span>
                </div>
              </div>

              {/* Member Since */}
              <div className={styles.memberSince}>
                <Calendar size={16} />
                <span>عضو منذ {new Date(user.createdAt).toLocaleDateString("ar-JO")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} data-color="green">
            <div className={styles.statCardIcon}>
              <Award />
            </div>
            <div className={styles.statCardContent}>
              <p className={styles.statCardValue}>{stats.total}</p>
              <p className={styles.statCardLabel}>إجمالي الأنشطة</p>
            </div>
          </div>

          <div className={styles.statCard} data-color="yellow">
            <div className={styles.statCardIcon}>
              <Clock />
            </div>
            <div className={styles.statCardContent}>
              <p className={styles.statCardValue}>{stats.pending}</p>
              <p className={styles.statCardLabel}>طلبات معلقة</p>
            </div>
          </div>

          <div className={styles.statCard} data-color="green">
            <div className={styles.statCardIcon}>
              <CheckCircle />
            </div>
            <div className={styles.statCardContent}>
              <p className={styles.statCardValue}>{stats.approved}</p>
              <p className={styles.statCardLabel}>موافق عليها</p>
            </div>
          </div>

          <div className={styles.statCard} data-color="red">
            <div className={styles.statCardIcon}>
              <XCircle />
            </div>
            <div className={styles.statCardContent}>
              <p className={styles.statCardValue}>{stats.rejected}</p>
              <p className={styles.statCardLabel}>مرفوضة</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Left Column - Personal Info */}
          <div className={styles.leftColumn}>
            {/* Personal Info Card */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>المعلومات الشخصية</h2>

              <div className={styles.infoList}>
                <EditableField
                  icon={<Mail />}
                  label="البريد الإلكتروني"
                  value={user.email}
                  displayValue={user.email}
                  field="email"
                  type="text"
                  editingField={editingField}
                  isSaving={isSaving}
                  onStartEdit={startEditing}
                  onCancel={cancelEditing}
                  onUpdate={updateFieldValue}
                  onSave={saveField}
                />

                <EditableField
                  icon={<Phone />}
                  label="رقم الهاتف"
                  value={user.phone}
                  displayValue={user.phone}
                  field="phone"
                  type="text"
                  editingField={editingField}
                  isSaving={isSaving}
                  onStartEdit={startEditing}
                  onCancel={cancelEditing}
                  onUpdate={updateFieldValue}
                  onSave={saveField}
                />

                {volunteerProfile && (
                  <>
                    <EditableField
                      icon={<MapPin />}
                      label="المدينة"
                      value={volunteerProfile.city}
                      displayValue={JORDANIAN_CITIES.find(c => c.value === volunteerProfile.city)?.label || volunteerProfile.city}
                      field="city"
                      type="select"
                      options={JORDANIAN_CITIES}
                      editingField={editingField}
                      isSaving={isSaving}
                      onStartEdit={startEditing}
                      onCancel={cancelEditing}
                      onUpdate={updateFieldValue}
                      onSave={saveField}
                    />

                    <EditableField
                      icon={<Calendar />}
                      label="العمر"
                      value={volunteerProfile.dateOfBirth.split('T')[0]}
                      displayValue={`${calculateAge(volunteerProfile.dateOfBirth)}`}
                      field="dateOfBirth"
                      type="date"
                      editingField={editingField}
                      isSaving={isSaving}
                      onStartEdit={startEditing}
                      onCancel={cancelEditing}
                      onUpdate={updateFieldValue}
                      onSave={saveField}
                    />

                    <EditableField
                      icon={<User />}
                      label="الجنس"
                      value={volunteerProfile.gender || ""}
                      displayValue={volunteerProfile.gender === "MALE" ? "ذكر" : volunteerProfile.gender === "FEMALE" ? "أنثى" : "غير محدد"}
                      field="gender"
                      type="select"
                      options={[
                        { value: "", label: "غير محدد" },
                        { value: "MALE", label: "ذكر" },
                        { value: "FEMALE", label: "أنثى" },
                      ]}
                      editingField={editingField}
                      isSaving={isSaving}
                      onStartEdit={startEditing}
                      onCancel={cancelEditing}
                      onUpdate={updateFieldValue}
                      onSave={saveField}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Bio Card */}
            {volunteerProfile && (
              <div className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>نبذة عني</h2>
                  {editingField?.field !== "bio" && (
                    <button
                      className={styles.btnEdit}
                      onClick={() => startEditing("bio", volunteerProfile.bio || "")}
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>

                {editingField?.field === "bio" ? (
                  <div className={styles.editingSection}>
                    <textarea
                      className={styles.textarea}
                      rows={5}
                      value={editingField.value}
                      onChange={(e) => updateFieldValue(e.target.value)}
                      placeholder="اكتب نبذة عن نفسك..."
                      disabled={isSaving}
                    />
                    <div className={styles.editActions}>
                      <button
                        className={styles.btnSave}
                        onClick={saveField}
                        disabled={isSaving}
                      >
                        {isSaving ? "جاري الحفظ..." : <><Check size={16} /> حفظ</>}
                      </button>
                      <button
                        className={styles.btnCancel}
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X size={16} /> إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={styles.bioText}>
                    {volunteerProfile.bio || "لم يتم إضافة نبذة بعد. اضغط على زر التعديل لإضافة نبذة عنك."}
                  </p>
                )}
              </div>
            )}

            {/* Skills Card */}
            {volunteerProfile && (
              <div className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <Award size={20} />
                    المهارات
                  </h2>
                  {editingField?.field !== "skills" && (
                    <button
                      className={styles.btnEdit}
                      onClick={() => startEditing("skills", volunteerProfile.skills)}
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>

                {editingField?.field === "skills" ? (
                  <TagsEditor
                    tags={editingField.value || []}
                    onUpdate={updateFieldValue}
                    onSave={saveField}
                    onCancel={cancelEditing}
                    isSaving={isSaving}
                    placeholder="أضف مهارة"
                    color="green"
                  />
                ) : volunteerProfile.skills.length > 0 ? (
                  <div className={styles.tagsGrid}>
                    {volunteerProfile.skills.map((skill, index) => (
                      <span key={index} className={`${styles.tag} ${styles.tagGreen}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>
                    لم يتم إضافة مهارات بعد
                  </p>
                )}
              </div>
            )}

            {/* Interests Card */}
            {volunteerProfile && (
              <div className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <Heart size={20} />
                    الاهتمامات
                  </h2>
                  {editingField?.field !== "interests" && (
                    <button
                      className={styles.btnEdit}
                      onClick={() => startEditing("interests", volunteerProfile.interests)}
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>

                {editingField?.field === "interests" ? (
                  <TagsEditor
                    tags={editingField.value || []}
                    onUpdate={updateFieldValue}
                    onSave={saveField}
                    onCancel={cancelEditing}
                    isSaving={isSaving}
                    placeholder="أضف اهتمام"
                    color="red"
                  />
                ) : volunteerProfile.interests.length > 0 ? (
                  <div className={styles.tagsGrid}>
                    {volunteerProfile.interests.map((interest, index) => (
                      <span key={index} className={`${styles.tag} ${styles.tagRed}`}>
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>
                    لم يتم إضافة اهتمامات بعد
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Activities */}
          <div className={styles.rightColumn}>
            <div className={styles.activitiesSection}>
              <div className={styles.activitiesHeader}>
                <h2 className={styles.sectionTitle}>سجل الأنشطة</h2>

                {/* Filter Buttons */}
                <div className={styles.filterButtons}>
                  <button
                    className={`${styles.filterBtn} ${activityFilter === "ALL" ? styles.active : ""}`}
                    onClick={() => setActivityFilter("ALL")}
                  >
                    الكل ({participations.length})
                  </button>
                  <button
                    className={`${styles.filterBtn} ${styles.filterPending} ${activityFilter === "PENDING" ? styles.active : ""}`}
                    onClick={() => setActivityFilter("PENDING")}
                  >
                    معلق ({stats.pending})
                  </button>
                  <button
                    className={`${styles.filterBtn} ${styles.filterApproved} ${activityFilter === "APPROVED" ? styles.active : ""}`}
                    onClick={() => setActivityFilter("APPROVED")}
                  >
                    موافق ({stats.approved})
                  </button>
                  <button
                    className={`${styles.filterBtn} ${styles.filterRejected} ${activityFilter === "REJECTED" ? styles.active : ""}`}
                    onClick={() => setActivityFilter("REJECTED")}
                  >
                    مرفوض ({stats.rejected})
                  </button>
                </div>
              </div>

              {/* Activities List */}
              {filteredParticipations.length === 0 ? (
                <div className={styles.emptyActivities}>
                  <Award size={64} />
                  <p>
                    {activityFilter === "ALL"
                      ? "لم تشارك في أي نشاط بعد"
                      : `لا توجد أنشطة ${activityFilter === "PENDING" ? "معلقة" : activityFilter === "APPROVED" ? "موافق عليها" : "مرفوضة"}`
                    }
                  </p>
                </div>
              ) : (
                <div className={styles.activitiesList}>
                  {filteredParticipations.map((participation, index) => (
                    <ActivityCard key={participation.id} participation={participation} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function InfoField({ icon, label, value }: any) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>{icon}</div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    </div>
  );
}

function EditableField({
  icon, label, value, displayValue, field, type, options,
  editingField, isSaving, onStartEdit, onCancel, onUpdate, onSave
}: any) {
  const isEditing = editingField?.field === field;

  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>{icon}</div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        {isEditing ? (
          <div className={styles.inlineEdit}>
            {type === "select" ? (
              <select
                className={styles.selectInput}
                value={editingField.value}
                onChange={(e) => onUpdate(e.target.value)}
                disabled={isSaving}
              >
                {options.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : type === "date" ? (
              <input
                type="date"
                className={styles.textInput}
                value={editingField.value}
                onChange={(e) => onUpdate(e.target.value)}
                disabled={isSaving}
              />
            ) : (
              <input
                type="text"
                className={styles.textInput}
                value={editingField.value}
                onChange={(e) => onUpdate(e.target.value)}
                disabled={isSaving}
              />
            )}
            <button className={styles.btnSaveInline} onClick={onSave} disabled={isSaving}>
              {isSaving ? "..." : <Check size={14} />}
            </button>
            <button className={styles.btnCancelInline} onClick={onCancel} disabled={isSaving}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className={styles.infoValueRow}>
            <span className={styles.infoValue}>{displayValue || value || "غير محدد"}</span>
            <button className={styles.btnEditInline} onClick={() => onStartEdit(field, value)}>
              <Edit2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TagsEditor({ tags, onUpdate, onSave, onCancel, isSaving, placeholder, color }: any) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onUpdate([...tags, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onUpdate(tags.filter((t: string) => t !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={styles.tagsEditor}>
      <div className={styles.tagInputRow}>
        <input
          type="text"
          className={styles.tagInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isSaving}
        />
        <button
          className={styles.btnAddTag}
          onClick={handleAdd}
          disabled={isSaving || !inputValue.trim()}
        >
          <Plus size={18} />
        </button>
      </div>

      {tags.length > 0 && (
        <div className={styles.tagsGrid}>
          {tags.map((tag: string, index: number) => (
            <span key={index} className={`${styles.tagEditable} ${styles[`tag${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
              {tag}
              <button
                className={styles.btnRemoveTag}
                onClick={() => handleRemove(tag)}
                disabled={isSaving}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={styles.editActions}>
        <button className={styles.btnSave} onClick={onSave} disabled={isSaving}>
          {isSaving ? "جاري الحفظ..." : <><Check size={16} /> حفظ</>}
        </button>
        <button className={styles.btnCancel} onClick={onCancel} disabled={isSaving}>
          <X size={16} /> إلغاء
        </button>
      </div>
    </div>
  );
}

function ActivityCard({ participation, index }: any) {
  const { activity } = participation;

  const statusConfig = {
    PENDING: { label: "معلق", color: "yellow" },
    APPROVED: { label: "موافق عليه", color: "green" },
    REJECTED: { label: "مرفوض", color: "red" },
  };

  const config = statusConfig[participation.status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <div className={styles.activityCard} data-index={index}>
      <div className={styles.activityHeader}>
        <h3 className={styles.activityTitle}>
          {activity?.title || "نشاط تطوعي"}
        </h3>
        <span className={`${styles.statusBadge} ${styles[`status${config.color.charAt(0).toUpperCase() + config.color.slice(1)}`]}`}>
          {config.label}
        </span>
      </div>

      {activity?.description && (
        <p className={styles.activityDescription}>{activity.description}</p>
      )}

      <div className={styles.activityDetails}>
        {activity?.date && (
          <div className={styles.activityDetail}>
            <Calendar size={16} />
            <span>{new Date(activity.date).toLocaleDateString("ar-JO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}</span>
          </div>
        )}

        {activity?.placeName && (
          <div className={styles.activityDetail}>
            <MapPin size={16} />
            <span>{activity.placeName}</span>
          </div>
        )}

        {activity?.startTime && activity?.endTime && (
          <div className={styles.activityDetail}>
            <Clock size={16} />
            <span>{activity.startTime} - {activity.endTime}</span>
          </div>
        )}
      </div>

      <div className={styles.activityFooter}>
        <span className={styles.requestedDate}>
          طلب الانضمام: {new Date(participation.requestedAt).toLocaleDateString("ar-JO")}
        </span>
        {participation.respondedAt && (
          <span className={styles.respondedDate}>
            الرد: {new Date(participation.respondedAt).toLocaleDateString("ar-JO")}
          </span>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.skeletonHero}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonLine} style={{ width: "200px", height: "32px" }} />
            <div className={styles.skeletonLine} style={{ width: "150px", height: "20px", marginTop: "8px" }} />
            <div className={styles.skeletonStats}>
              <div className={styles.skeletonLine} style={{ width: "60px", height: "40px" }} />
              <div className={styles.skeletonLine} style={{ width: "60px", height: "40px" }} />
              <div className={styles.skeletonLine} style={{ width: "60px", height: "40px" }} />
            </div>
          </div>
        </div>

        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>

        <div className={styles.skeletonContent}>
          <div className={styles.skeletonColumn}>
            <div className={styles.skeletonCard} style={{ height: "300px" }} />
            <div className={styles.skeletonCard} style={{ height: "200px" }} />
          </div>
          <div className={styles.skeletonColumn}>
            <div className={styles.skeletonCard} style={{ height: "600px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}