import React from "react";
import { Users, Activity, Clock, ShieldAlert, Eye, FileText, Download, ActivitySquare } from "lucide-react";
import { Badge, SystemLogBadge, UserList } from "@/presentation/components";
import { formatDate } from "@/lib/utils/date";
import type { Column } from "@/presentation/components/admin/SharedDataModal/SharedDataModal";
import { ActivityStatus, SystemLogStatus } from "@/core/domain/enums";
import { getActivityStatusLabel } from "@/presentation/constants";

export const USERS_COLUMNS: Column<any>[] = [
  { key: "name", header: "الاسم", accessor: (u) => u.fullName, sortable: true, sortValue: (u) => u.fullName },
  { key: "email", header: "البريد الإلكتروني", accessor: (u) => u.email, sortable: true, sortValue: (u) => u.email },
  { key: "date", header: "تاريخ الانضمام", accessor: (u) => formatDate(u.createdAt), sortable: true, sortValue: (u) => new Date(u.createdAt).getTime() },
];

export const ACTIVITIES_COLUMNS: Column<any>[] = [
  { key: "title", header: "عنوان النشاط", accessor: (a) => a.title, sortable: true, sortValue: (a) => a.title },
  { key: "status", header: "الحالة", accessor: (a) => (
      <Badge variant={a.status === ActivityStatus.PUBLISHED ? "success" : a.status === ActivityStatus.DRAFT ? "warning" : "danger"}>
        {getActivityStatusLabel(a.status)}
      </Badge>
    ) 
  },
  { key: "date", header: "تاريخ النشاط", accessor: (a) => formatDate(a.date), sortable: true, sortValue: (a) => new Date(a.date).getTime() },
];

export const PENDING_REQUESTS_COLUMNS: Column<any>[] = [
  { key: "volunteer", header: "اسم المتطوع", accessor: (r) => r.volunteerName, sortable: true, sortValue: (r) => r.volunteerName },
  { key: "activity", header: "النشاط", accessor: (r) => r.activityTitle, sortable: true, sortValue: (r) => r.activityTitle },
  { key: "date", header: "تاريخ الطلب", accessor: (r) => formatDate(r.createdAt), sortable: true, sortValue: (r) => new Date(r.createdAt).getTime() },
];

export const SYSTEM_LOGS_COLUMNS: Column<any>[] = [
  { key: "action", header: "الحدث", accessor: (l) => l.action, sortable: true, sortValue: (l) => l.action },
  { key: "user", header: "المستخدم", accessor: (l) => l.user?.fullName || "نظام", sortable: true, sortValue: (l) => l.user?.fullName || "نظام" },
  { key: "status", header: "الحالة", accessor: (l) => <SystemLogBadge status={l.status} /> },
  { key: "date", header: "التاريخ", accessor: (l) => formatDate(l.createdAt), sortable: true, sortValue: (l) => new Date(l.createdAt).getTime() },
];

export const MODAL_CONFIGS: Record<string, any> = {
  users: {
    title: "إحصائيات المستخدمين",
    icon: Users,
    fetchUrl: "/api/users",
    dataKey: "users",
    columns: USERS_COLUMNS,
    emptyTitle: "لا يوجد مستخدمين",
    emptyMessage: "لم ينضم أي مستخدمين جدد مؤخراً.",
    customListRenderer: (data: any[]) => (
      <UserList
        users={data.map((u) => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          phone: u.phone,
          avatarUrl: u.avatarUrl,
          role: u.role,
          meta: [
            u.city ? { value: u.city, icon: require("lucide-react").MapPin } : null,
            { value: formatDate(u.createdAt), icon: require("lucide-react").Clock }
          ].filter(Boolean) as any
        }))}
        layout="list"
      />
    )
  },
  activities: {
    title: "إحصائيات الأنشطة",
    icon: Activity,
    fetchUrl: "/api/activities",
    dataKey: "activities",
    columns: ACTIVITIES_COLUMNS,
    emptyTitle: "لا توجد أنشطة",
    emptyMessage: "لم يتم إنشاء أي أنشطة بعد.",
  },
  pending: {
    title: "الطلبات المعلقة",
    icon: Clock,
    fetchUrl: "/api/activity-participations/pending",
    dataKey: "requests",
    columns: PENDING_REQUESTS_COLUMNS,
    emptyTitle: "لا توجد طلبات معلقة",
    emptyMessage: "جميع طلبات المشاركة تم التعامل معها بنجاح.",
  },
  errors: {
    title: "أخطاء النظام",
    icon: ShieldAlert,
    fetchUrl: "/api/reports/logs?limit=50&status=ERROR",
    dataKey: "logs",
    columns: SYSTEM_LOGS_COLUMNS,
    emptyTitle: "لا توجد أخطاء",
    emptyMessage: "النظام يعمل بكفاءة ولا توجد أخطاء مسجلة حالياً.",
  },
  activityViews: {
    title: "مشاهدات الأنشطة",
    icon: Eye,
    fetchUrl: "/api/activities",
    dataKey: "activities",
    columns: ACTIVITIES_COLUMNS,
    emptyTitle: "لا يوجد بيانات",
    emptyMessage: "لا توجد مشاهدات مسجلة.",
  },
  postViews: {
    title: "تفاعل المقالات",
    icon: FileText,
    fetchUrl: "/api/featured-posts",
    dataKey: "posts",
    columns: [
      { key: "title", header: "عنوان المقال", accessor: (p: any) => p.title, sortable: true, sortValue: (p: any) => p.title },
      { key: "date", header: "التاريخ", accessor: (p: any) => formatDate(p.createdAt), sortable: true, sortValue: (p: any) => new Date(p.createdAt).getTime() },
    ],
    emptyTitle: "لا يوجد تفاعل",
    emptyMessage: "لا توجد مقالات مسجلة.",
  },
  magazineDownloads: {
    title: "تحميلات المجلة",
    icon: Download,
    fetchUrl: "/api/monthly-magazines",
    dataKey: "magazines",
    columns: [
      { key: "title", header: "الإصدار", accessor: (m: any) => m.title, sortable: true, sortValue: (m: any) => m.title },
      { key: "downloads", header: "مرات التحميل", accessor: (m: any) => m.downloads || 0, sortable: true, sortValue: (m: any) => m.downloads || 0 },
    ],
    emptyTitle: "لا يوجد تحميلات",
    emptyMessage: "لم يتم تحميل أي أعداد بعد.",
  },
  operations: {
    title: "عمليات النظام",
    icon: ActivitySquare,
    fetchUrl: "/api/reports/logs?limit=50",
    dataKey: "logs",
    columns: SYSTEM_LOGS_COLUMNS,
    emptyTitle: "لا يوجد عمليات",
    emptyMessage: "لا توجد عمليات مسجلة في النظام.",
  },
};
