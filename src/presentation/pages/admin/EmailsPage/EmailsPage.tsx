"use client";

import { useRef } from "react";
import styles from "./EmailsPage.module.scss";
import { Send, Users, MapPin, Check, Clock, AtSign } from "lucide-react";
import {
  LoadingState, EmptyState, ToastContainer,
  SelectInput, Button, Modal, ConfirmDialog,
  EmailPreviewPane, Badge, UserList,
} from "@/presentation/components";
import {
  useEmailsPageLogic,
  ALIAS_OPTIONS, TARGET_OPTIONS, CITY_OPTIONS,
  GENDER_OPTIONS, VARS, EMAIL_TEMPLATES,
  type EmailForm, type ExperienceFilter,
} from "./EmailsPage.logic";
import { getCityLabel } from "@/presentation/constants";
import type { EmailRecipientDto } from "@/core/application/dtos";
import { JordanianCity } from "@/core/domain/enums";

const EXP_OPTIONS: { value: ExperienceFilter; label: string }[] = [
  { value: "all", label: "الكل"         },
  { value: "yes", label: "يملك خبرة"    },
  { value: "no",  label: "لا يملك خبرة" },
];

const EmailsPage = () => {
  const {
    status, form, isFormValid, hasActivityLinkVar,
    previewUsers, selectedIds,
    showPreview, showConfirm,
    loadingPreview, isSending,
    toasts, removeToast,
    setField, applyTemplate,
    handlePreview, toggleUser, toggleAll,
    setShowConfirm, handleSend, closePreview,
  } = useEmailsPageLogic();

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertVar = (variable: string) => {
    const el = bodyRef.current;
    if (!el) { setField("body", form.body + variable); return; }
    const s       = el.selectionStart;
    const e       = el.selectionEnd;
    const newBody = form.body.slice(0, s) + variable + form.body.slice(e);
    setField("body", newBody);
    requestAnimationFrame(() => {
      el.selectionStart = s + variable.length;
      el.selectionEnd   = s + variable.length;
      el.focus();
    });
  };

  const allSelected  = selectedIds.size === previewUsers.length && previewUsers.length > 0;
  const noneSelected = selectedIds.size === 0;
  const charCount    = form.body.length;

  if (status === "loading") return <LoadingState />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.root}>
        <div className={styles.composer}>


          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>١</span>
              <div>
                <p className={styles.stepTitle}>المرسِل والقالب</p>
                <p className={styles.stepSub}>اختر عنوان الإرسال ونوع الرسالة</p>
              </div>
            </div>
            <div className={styles.stepBody}>
              <SelectInput
                label="إرسال من"
                value={form.fromAlias}
                options={ALIAS_OPTIONS}
                onChange={(val) => setField("fromAlias", val as EmailForm["fromAlias"])}
                disabled={isSending}
              />
              <div className={styles.field}>
                <label className={styles.fieldLabel}>نوع الرسالة</label>
                <div className={styles.templates}>
                  {EMAIL_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.templateCard} ${form.templateId === t.id ? styles.templateOn : ""}`}
                      onClick={() => applyTemplate(t.id)}
                      disabled={isSending}
                    >
                      <span className={styles.templateName}>{t.label}</span>
                      <span className={styles.templateDesc}>{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sep} />


          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>٢</span>
              <div>
                <p className={styles.stepTitle}>محتوى الرسالة</p>
                <p className={styles.stepSub}>العنوان والنص الذي سيصل للمتطوع</p>
              </div>
            </div>
            <div className={styles.stepBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>عنوان الإيميل</label>
                <input
                  className={styles.input}
                  value={form.subject}
                  onChange={(e) => setField("subject", e.target.value)}
                  disabled={isSending}
                />
              </div>
              <div className={styles.field}>
                <div className={styles.fieldRow}>
                  <label className={styles.fieldLabel}>نص الرسالة</label>
                  <div className={styles.vars}>
                    {VARS.map((v) => (
                      <button
                        key={v.value}
                        className={styles.varPill}
                        onClick={() => insertVar(v.value)}
                        disabled={isSending}
                        type="button"
                        title={`إدراج ${v.label}`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  ref={bodyRef}
                  className={styles.textarea}
                  value={form.body}
                  onChange={(e) => setField("body", e.target.value)}
                  rows={8}
                  disabled={isSending}
                />
                {charCount > 0 && <span className={styles.charCount}>{charCount} حرف</span>}
              </div>

              {hasActivityLinkVar && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    رابط النشاط
                    <span className={styles.varBadge}>{"{رابط_النشاط}"}</span>
                  </label>
                  <input
                    className={styles.input}
                    type="url"
                    value={form.activityLink}
                    onChange={(e) => setField("activityLink", e.target.value)}
                    disabled={isSending}
                    dir="ltr"
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.sep} />


          <div className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>٣</span>
              <div>
                <p className={styles.stepTitle}>الاستهداف</p>
                <p className={styles.stepSub}>حدد من سيستقبل هذا الإيميل بدقة</p>
              </div>
            </div>
            <div className={styles.stepBody}>


              <SelectInput
                label="الاستهداف الأساسي"
                value={form.target}
                options={TARGET_OPTIONS}
                onChange={(val) => setField("target", val as EmailForm["target"])}
                disabled={isSending}
              />
              {form.target === "CITY" && (
                <SelectInput
                  label="المدينة"
                  value={form.targetValue}
                  options={[{ value: "", label: "اختر مدينة" }, ...CITY_OPTIONS]}
                  onChange={(val) => setField("targetValue", val)}
                  disabled={isSending}
                />
              )}
              {form.target === "GENDER" && (
                <SelectInput
                  label="الجنس"
                  value={form.targetValue}
                  options={[{ value: "", label: "اختر" }, ...GENDER_OPTIONS]}
                  onChange={(val) => setField("targetValue", val)}
                  disabled={isSending}
                />
              )}


              <div className={styles.extraFilters}>
                <span className={styles.extraFiltersLabel}>فيلترات إضافية</span>

                <div className={styles.filters}>
                  {form.target !== "GENDER" && (
                    <SelectInput
                      label="الجنس أيضاً"
                      value={form.genderFilter}
                      options={[{ value: "", label: "أي جنس" }, ...GENDER_OPTIONS]}
                      onChange={(val) => setField("genderFilter", val)}
                      disabled={isSending}
                    />
                  )}
                  {form.target !== "CITY" && (
                    <SelectInput
                      label="المدينة أيضاً"
                      value={form.cityFilter}
                      options={[{ value: "", label: "أي مدينة" }, ...CITY_OPTIONS]}
                      onChange={(val) => setField("cityFilter", val)}
                      disabled={isSending}
                    />
                  )}
                </div>

                <div className={styles.filters}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      العمر من <span className={styles.optional}>اختياري</span>
                    </label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      max={100}
                      value={form.minAge}
                      onChange={(e) => setField("minAge", e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      إلى <span className={styles.optional}>اختياري</span>
                    </label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      max={100}
                      value={form.maxAge}
                      onChange={(e) => setField("maxAge", e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                </div>

                <div className={styles.filters}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      حد أدنى للساعات <span className={styles.optional}>اختياري</span>
                    </label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={form.minHours}
                      onChange={(e) => setField("minHours", e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>
                      الخبرة التطوعية <span className={styles.optional}>اختياري</span>
                    </label>
                    <div className={styles.expToggle}>
                      {EXP_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={`${styles.expBtn} ${form.hasExperience === opt.value ? styles.expBtnOn : ""}`}
                          onClick={() => setField("hasExperience", opt.value as ExperienceFilter)}
                          disabled={isSending}
                          type="button"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    الاهتمامات / المهارات <span className={styles.optional}>اختياري — OR</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.interests}
                    onChange={(e) => setField("interests", e.target.value)}
                    disabled={isSending}
                  />
                  <span className={styles.inputHint}>
                    اكتب اهتمامات مفصولة بفاصلة · مثال: صحة,تعليم,بيئة
                  </span>
                </div>

              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<Send size={14} />}
              iconPosition="left"
              disabled={!isFormValid || loadingPreview || isSending}
              onClick={handlePreview}
            >
              {loadingPreview ? "جاري التحميل..." : "معاينة المستلمين والإرسال"}
            </Button>
          </div>
        </div>

        <div className={styles.preview}>
          <EmailPreviewPane subject={form.subject} body={form.body} fromAlias={form.fromAlias} />
        </div>
      </div>

      <Modal isOpen={showPreview} onClose={closePreview} title="المستلمون المستهدفون" size="md">
        <div className={styles.modal}>
          <div className={styles.modalBar}>
            <div className={styles.modalMeta}>
              <span className={styles.modalCount}>
                <strong>{selectedIds.size}</strong>
                <span> / {previewUsers.length} محدد</span>
              </span>
              {form.minHours && <Badge variant="info"><Clock size={10} /> ≥ {form.minHours} ساعة</Badge>}
              {form.minAge && <Badge variant="info">من {form.minAge} سنة</Badge>}
              {form.maxAge && <Badge variant="info">إلى {form.maxAge} سنة</Badge>}
              {form.interests && <Badge variant="info">{form.interests}</Badge>}
              {form.hasExperience !== "all" && (
                <Badge variant="info">{form.hasExperience === "yes" ? "يملك خبرة" : "لا يملك خبرة"}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {allSelected ? "إلغاء الكل" : "تحديد الكل"}
            </Button>
          </div>

          <div className={styles.modalList}>
            <UserList
              users={previewUsers.map((u: EmailRecipientDto) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                meta: [
                  u.city ? { value: getCityLabel(u.city as JordanianCity), icon: MapPin } : null,
                  { value: `${Math.round(u.hours)} ساعة`, icon: Clock }
                ].filter(Boolean) as any
              }))}
              layout="list"
              selectable
              selectedIds={selectedIds}
              onToggleUser={toggleUser}
              emptyMessage="لا يوجد مستلمون"
            />
          </div>

          <div className={styles.modalFooter}>
            <Button variant="ghost" onClick={closePreview} disabled={isSending}>إلغاء</Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<Send size={13} />}
              iconPosition="left"
              disabled={isSending || noneSelected}
              onClick={() => setShowConfirm(true)}
            >
              {isSending ? "جاري الإرسال..." : `إرسال لـ ${selectedIds.size} متطوع`}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSend}
        title="تأكيد إرسال الإيميل"
        message={`سيتم إرسال "${form.subject}" إلى ${selectedIds.size} متطوع. هل أنت متأكد؟`}
        confirmText="إرسال"
        cancelText="رجوع"
        variant="primary"
      />
    </>
  );
};

export default EmailsPage;