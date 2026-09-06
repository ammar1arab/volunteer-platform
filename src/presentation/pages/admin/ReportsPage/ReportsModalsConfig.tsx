import React from "react";
import { Users, Activity, Clock, ShieldAlert, Eye, FileText, Download, ActivitySquare, BookOpen, Newspaper } from "lucide-react";
import { Badge, SystemLogBadge, UserCard } from "@/presentation/components";
import { formatDate } from "@/lib/utils/date";
import type { Column } from "@/presentation/components/admin/SharedDataModal/SharedDataModal";
import { ActivityStatus, SystemLogStatus } from "@/core/domain/enums";
import { getActivityStatusLabel } from "@/presentation/constants";
import type { UserAnalyticsDto } from "@/core/application/dtos";

export const USERS_COLUMNS: Column<any>[] = [
  { key: "name", header: "الاسم", accessor: (u) => u.fullName, sortable: true, sortValue: (u) => u.fullName },
  { key: "email", header: "البريد الإلكتروني", accessor: (u) => u.email, sortable: true, sortValue: (u) => u.email },
  { key: "phone", header: "الهاتف", accessor: (u) => u.phone || "—", sortable: true, sortValue: (u) => u.phone || "" },
  { key: "hours", header: "الساعات", accessor: (u) => u.stats?.totalHours ?? 0, sortable: true, sortValue: (u) => u.stats?.totalHours ?? 0 },
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
  { key: "volunteer", header: "اسم المتطوع", accessor: (r) => r.volunteer?.fullName || r.volunteerName || "—", sortable: true, sortValue: (r) => r.volunteer?.fullName || r.volunteerName || "" },
  { key: "activity", header: "النشاط", accessor: (r) => r.activity?.title || r.activityTitle || "—", sortable: true, sortValue: (r) => r.activity?.title || r.activityTitle || "" },
  { key: "date", header: "تاريخ الطلب", accessor: (r) => formatDate(r.requestedAt || r.createdAt), sortable: true, sortValue: (r) => new Date(r.requestedAt || r.createdAt).getTime() },
];

export const SYSTEM_LOGS_COLUMNS: Column<any>[] = [
  { key: "action", header: "الحدث", accessor: (l) => l.action, sortable: true, sortValue: (l) => l.action },
  { key: "user", header: "المستخدم", accessor: (l) => l.user?.fullName || "نظام", sortable: true, sortValue: (l) => l.user?.fullName || "نظام" },
  { key: "status", header: "الحالة", accessor: (l) => <SystemLogBadge status={l.status} /> },
  { key: "date", header: "التاريخ", accessor: (l) => formatDate(l.createdAt), sortable: true, sortValue: (l) => new Date(l.createdAt).getTime() },
];

export const MODAL_CONFIGS: Record<string, any> = {
  users: {
    title: "المستخدمون",
    icon: Users,
    fetchUrl: "/api/users",
    dataKey: "users",
    columns: USERS_COLUMNS,
    emptyTitle: "لا يوجد مستخدمين",
    emptyMessage: "لم ينضم أي مستخدمين جدد مؤخراً.",
    itemsPerPage: 8,
    customListRenderer: (data: UserAnalyticsDto[]) => (
      <>
        {data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </>
    )
  },
  activities: {
    title: "الأنشطة التطوعية",
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
    defaultSortKey: "views",
    defaultSortOrder: "desc",
    columns: [
      { key: "title", header: "عنوان النشاط", accessor: (a: any) => a.title, sortable: true, sortValue: (a: any) => a.title },
      { key: "views", header: "المشاهدات", accessor: (a: any) => a.views ?? 0, sortable: true, sortValue: (a: any) => a.views ?? 0 },
      { key: "status", header: "الحالة", accessor: (a: any) => (
          <Badge variant={a.status === ActivityStatus.PUBLISHED ? "success" : a.status === ActivityStatus.DRAFT ? "warning" : "danger"}>
            {getActivityStatusLabel(a.status)}
          </Badge>
        )
      },
      { key: "date", header: "التاريخ", accessor: (a: any) => formatDate(a.date), sortable: true, sortValue: (a: any) => new Date(a.date).getTime() },
    ],
    emptyTitle: "لا يوجد بيانات",
    emptyMessage: "لا توجد مشاهدات مسجلة.",
  },
  postViews: {
    title: "تفاعل المقالات",
    icon: FileText,
    fetchUrl: "/api/featured-posts",
    dataKey: "posts",
    defaultSortKey: "views",
    defaultSortOrder: "desc",
    columns: [
      { key: "title", header: "عنوان المقال", accessor: (p: any) => p.title, sortable: true, sortValue: (p: any) => p.title },
      { key: "views", header: "المشاهدات", accessor: (p: any) => p.views ?? 0, sortable: true, sortValue: (p: any) => p.views ?? 0 },
      { key: "date", header: "التاريخ", accessor: (p: any) => formatDate(p.publishedAt || p.createdAt), sortable: true, sortValue: (p: any) => new Date(p.publishedAt || p.createdAt).getTime() },
    ],
    emptyTitle: "لا يوجد تفاعل",
    emptyMessage: "لا توجد مقالات مسجلة.",
  },
  magazines: {
    title: "المجلات",
    icon: BookOpen,
    fetchUrl: "/api/monthly-magazines",
    dataKey: "magazines",
    columns: [
      { key: "title", header: "الإصدار", accessor: (m: any) => m.title, sortable: true, sortValue: (m: any) => m.title },
      { key: "monthYear", header: "الشهر", accessor: (m: any) => formatDate(m.monthYear), sortable: true, sortValue: (m: any) => new Date(m.monthYear).getTime() },
    ],
    emptyTitle: "لا توجد مجلات",
    emptyMessage: "لم يتم نشر أي إصدارات بعد.",
  },
  featuredPosts: {
    title: "المنشورات المميزة",
    icon: Newspaper,
    fetchUrl: "/api/featured-posts",
    dataKey: "posts",
    columns: [
      { key: "title", header: "عنوان المنشور", accessor: (p: any) => p.title, sortable: true, sortValue: (p: any) => p.title },
      { key: "date", header: "التاريخ", accessor: (p: any) => formatDate(p.publishedAt || p.createdAt), sortable: true, sortValue: (p: any) => new Date(p.publishedAt || p.createdAt).getTime() },
    ],
    emptyTitle: "لا توجد منشورات",
    emptyMessage: "لم يتم نشر أي منشورات مميزة بعد.",
  },
  magazineDownloads: {
    title: "تحميلات المجلة",
    icon: Download,
    fetchUrl: "/api/monthly-magazines",
    dataKey: "magazines",
    defaultSortKey: "downloads",
    defaultSortOrder: "desc",
    columns: [
      { key: "title", header: "الإصدار", accessor: (m: any) => m.title, sortable: true, sortValue: (m: any) => m.title },
      { key: "monthYear", header: "الشهر", accessor: (m: any) => formatDate(m.monthYear), sortable: true, sortValue: (m: any) => new Date(m.monthYear).getTime() },
      { key: "downloads", header: "مرات التحميل", accessor: (m: any) => m.downloads ?? 0, sortable: true, sortValue: (m: any) => m.downloads ?? 0 },
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
