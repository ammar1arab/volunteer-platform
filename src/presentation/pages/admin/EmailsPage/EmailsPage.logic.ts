"use client";

import { useState, useCallback } from "react";
import { UserRole } from "@/core/domain/enums";
import { useAuth, useToast } from "@/presentation/hooks";
import type { EmailAlias, EmailRecipientDto } from "@/core/application/dtos";
import { emailApi } from "@/presentation/services/email.service";
import { CITY_OPTIONS, GENDER_OPTIONS } from "@/presentation/constants";

export type EmailTarget       = "ALL" | "CITY" | "GENDER";
export type ExperienceFilter  = "all" | "yes" | "no";

export const ALIAS_OPTIONS = [
  { value: "contact@youthprints.online",      label: "contact@youthprints.online"      },
  { value: "support@youthprints.online",      label: "support@youthprints.online"      },
  { value: "noreply@youthprints.online",      label: "noreply@youthprints.online"      },
  { value: "certificates@youthprints.online", label: "certificates@youthprints.online" },
];

export const TARGET_OPTIONS = [
  { value: "ALL",    label: "جميع المتطوعين" },
  { value: "CITY",   label: "حسب المدينة"   },
  { value: "GENDER", label: "حسب الجنس"     },
];

export const VARS = [
  { label: "اسم المتطوع",  value: "{اسم_المتطوع}"  },
  { label: "المدينة",      value: "{المدينة}"       },
  { label: "ساعات التطوع", value: "{ساعات_التطوع}"  },
  { label: "التاريخ",      value: "{التاريخ}"       },
  { label: "رابط النشاط",  value: "{رابط_النشاط}"   },
] as const;

export interface EmailTemplate {
  id:          string;
  label:       string;
  description: string;
  subject:     string;
  body:        string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id:          "custom",
    label:       "مخصص",
    description: "ابدأ من الصفر",
    subject:     "",
    body:        "",
  },
  {
    id:          "announcement",
    label:       "إعلان",
    description: "أخبار وتحديثات",
    subject:     "إعلان مهم من مبادرة بصمات شبابية",
    body:        "أهلاً {اسم_المتطوع}،\n\nيسعدنا مشاركتك بأخبار مهمة من مبادرة بصمات شبابية.\n\n[أضف تفاصيل الإعلان هنا]\n\nنحن ممتنون لتطوعك ودعمك المستمر.\n\nمع أطيب التحيات،\nفريق بصمات شبابية",
  },
  {
    id:          "activity_invite",
    label:       "دعوة نشاط",
    description: "رابط تسجيل مباشر",
    subject:     "دعوة للتسجيل في نشاط تطوعي",
    body:        "مرحباً {اسم_المتطوع}،\n\nيسعدنا دعوتك للمشاركة في نشاطنا التطوعي القادم.\n\n[أضف وصف النشاط هنا]\n\nللتسجيل المباشر اضغط الرابط:\n{رابط_النشاط}\n\nلا تفوّت هذه الفرصة!",
  },
  {
    id:          "appreciation",
    label:       "تقدير",
    description: "شكر المتطوعين",
    subject:     "شكراً على {ساعات_التطوع} ساعة من العطاء",
    body:        "عزيزي/عزيزتي {اسم_المتطوع}،\n\nنريد أن نتوقف لنقول: شكراً.\n\nبفضل تطوعك وتكريسك {ساعات_التطوع} ساعة في {المدينة}، تركت أثراً حقيقياً في مجتمعنا.\n\nاستمر في العطاء.",
  },
  {
    id:          "reminder",
    label:       "تذكير",
    description: "موعد نشاط قادم",
    subject:     "تذكير: نشاطك التطوعي القادم",
    body:        "مرحباً {اسم_المتطوع}،\n\nهذا تذكير بنشاطك التطوعي القادم مع بصمات شبابية.\n\n[أضف تفاصيل النشاط والموعد]\n\nللاستفسار: support@youthprints.online",
  },
  {
  id:          "welcome",
  label:       "ترحيب",
  description: "استقبال متطوع جديد",
  subject:     "أهلاً بك في بصمات شبابية يا {اسم_المتطوع}",
  body:        "مرحباً {اسم_المتطوع}،\n\nيسعدنا انضمامك لعائلة بصمات الشبابية!\n\nأنت الآن جزء من مجتمع من المتطوعين المتميزين الذين يصنعون فرقاً حقيقياً.\n\nابدأ رحلتك بتصفح الفرص التطوعية المتاحة وسجّل في النشاط الذي يناسب اهتماماتك.\n\nنتطلع للقائك!",
},
];

export { CITY_OPTIONS, GENDER_OPTIONS };

export interface EmailForm {
  fromAlias:     EmailAlias;
  templateId:    string;
  subject:       string;
  body:          string;
  target:        EmailTarget;
  targetValue:   string;
  genderFilter:  string;
  cityFilter:    string;
  minHours:      string;
  minAge:        string;
  maxAge:        string;
  interests:     string;
  hasExperience: ExperienceFilter;
  activityLink:  string;
}

const EMPTY_FORM: EmailForm = {
  fromAlias:     "contact@youthprints.online",
  templateId:    "custom",
  subject:       "",
  body:          "",
  target:        "ALL",
  targetValue:   "",
  genderFilter:  "",
  cityFilter:    "",
  minHours:      "",
  minAge:        "",
  maxAge:        "",
  interests:     "",
  hasExperience: "all",
  activityLink:  "",
};

export function useEmailsPageLogic() {
  const { status }                         = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();

  const [form,           setFormState]    = useState<EmailForm>(EMPTY_FORM);
  const [previewUsers,   setPreviewUsers] = useState<EmailRecipientDto[]>([]);
  const [selectedIds,    setSelectedIds]  = useState<Set<string>>(new Set());
  const [showPreview,    setShowPreview]  = useState(false);
  const [showConfirm,    setShowConfirm]  = useState(false);
  const [loadingPreview, setLoading]      = useState(false);
  const [isSending,      setIsSending]    = useState(false);

  const setField = useCallback(<K extends keyof EmailForm>(key: K, value: EmailForm[K]) => {
    setFormState((p) => ({
      ...p,
      [key]: value,
      ...(key === "target" ? { targetValue: "", genderFilter: "", cityFilter: "" } : {}),
    }));
  }, []);

  const applyTemplate = useCallback((templateId: string) => {
    const t = EMAIL_TEMPLATES.find((tmpl) => tmpl.id === templateId);
    if (!t) return;
    setFormState((p) => ({ ...p, templateId, subject: t.subject, body: t.body }));
  }, []);

  const buildFilters = useCallback(() => {
    const interestsArr = form.interests.trim()
      ? form.interests.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;
    const hasExp = form.hasExperience === "yes" ? true
                 : form.hasExperience === "no"  ? false
                 : undefined;
    return {
      target:         form.target,
      targetValue:    form.targetValue   || undefined,
      genderFilter:   form.genderFilter  || undefined,
      cityFilter:     form.cityFilter    || undefined,
      minHours:       form.minHours      ? Number(form.minHours) : undefined,
      minAge:         form.minAge        ? Number(form.minAge)   : undefined,
      maxAge:         form.maxAge        ? Number(form.maxAge)   : undefined,
      interests:      interestsArr,
      hasExperience:  hasExp,
    };
  }, [form]);

  const handlePreview = useCallback(async () => {
    if (!form.subject.trim() || !form.body.trim()) {
      showToast("يرجى إدخال العنوان والمحتوى", "error");
      return;
    }
    setLoading(true);
    try {
      const res   = await emailApi.previewRecipients(buildFilters());
      const users = (res as { data?: { recipients?: EmailRecipientDto[] } })?.data?.recipients ?? [];
      if (!users.length) {
        showToast("لا يوجد متطوعون يطابقون هذا الاستهداف", "error");
        return;
      }
      setPreviewUsers(users);
      setSelectedIds(new Set(users.map((u) => u.id)));
      setShowPreview(true);
    } catch {
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  }, [form, buildFilters, showToast]);

  const toggleUser = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === previewUsers.length
        ? new Set()
        : new Set(previewUsers.map((u) => u.id))
    );
  }, [previewUsers]);

  const handleSend = useCallback(async () => {
    setShowConfirm(false);
    setIsSending(true);
    try {
      const res  = await emailApi.sendBulk({
        fromAlias:    form.fromAlias,
        subject:      form.subject.trim(),
        body:         form.body.trim(),
        filters:      buildFilters(),
        recipientIds: [...selectedIds],
        activityLink: form.activityLink.trim() || undefined,
      });
      const sent = (res as { data?: { sent?: number } })?.data?.sent ?? 0;
      showToast(`تم الإرسال بنجاح لـ ${sent} متطوع`, "success");
      setFormState(EMPTY_FORM);
      setShowPreview(false);
      setPreviewUsers([]);
      setSelectedIds(new Set());
    } catch {
      showToast("حدث خطأ أثناء الإرسال", "error");
    } finally {
      setIsSending(false);
    }
  }, [form, buildFilters, selectedIds, showToast]);

  const closePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewUsers([]);
    setSelectedIds(new Set());
  }, []);

  const hasActivityLinkVar = form.body.includes("{رابط_النشاط}") || form.subject.includes("{رابط_النشاط}");

  return {
    status,
    form,
    isFormValid: form.subject.trim().length > 0 && form.body.trim().length > 0,
    hasActivityLinkVar,
    previewUsers, selectedIds,
    showPreview, showConfirm,
    loadingPreview, isSending,
    toasts, removeToast,
    setField, applyTemplate,
    handlePreview, toggleUser, toggleAll,
    setShowConfirm, handleSend, closePreview,
  };
}