import { Users, Activity, Clock, Eye, FileText, Download, MapPin, Clock as ClockIcon } from "lucide-react";
import { Badge, UserList } from "@/presentation/components";
import { formatDate } from "@/lib/utils/date";
import type { Column } from "@/presentation/components/admin/SharedDataModal/SharedDataModal";
import { ActivityStatus } from "@/core/domain/enums";
import { getActivityStatusLabel } from "@/presentation/constants";

export const USERS_COLUMNS: Column<any>[] = [
  { key: "name", header: "الاسم", accessor: (u) => u.fullName, sortable: true, sortValue: (u) => u.fullName },
  { key: "email", header: "البريد الإلكتروني", accessor: (u) => u.email, sortable: true, sortValue: (u) => u.email },
  { key: "date", header: "تاريخ الانضمام", accessor: (u) => formatDate(u.createdAt), sortable: true, sortValue: (u) => new Date(u.createdAt).getTime() },
];

export const ACTIVITIES_COLUMNS: Column<any>[] = [
  { key: "title", header: "عنوان النشاط", accessor: (a) => a.title, sortable: true, sortValue: (a) => a.title },
  {
    key: "status",
    header: "الحالة",
    accessor: (a) => (
      <Badge variant={a.status === ActivityStatus.PUBLISHED ? "success" : a.status === ActivityStatus.DRAFT ? "warning" : "danger"}>
        {getActivityStatusLabel(a.status)}
      </Badge>
    ),
  },
  { key: "date", header: "تاريخ النشاط", accessor: (a) => formatDate(a.date), sortable: true, sortValue: (a) => new Date(a.date).getTime() },
];

export const PENDING_REQUESTS_COLUMNS: Column<any>[] = [
  { key: "volunteer", header: "اسم المتطوع", accessor: (r) => r.volunteerName, sortable: true, sortValue: (r) => r.volunteerName },
  { key: "activity", header: "النشاط", accessor: (r) => r.activityTitle, sortable: true, sortValue: (r) => r.activityTitle },
  { key: "date", header: "تاريخ الطلب", accessor: (r) => formatDate(r.createdAt), sortable: true, sortValue: (r) => new Date(r.createdAt).getTime() },
];

export const ANALYTICS_MODAL_CONFIGS: Record<string, any> = {
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
          gender: u.gender ?? u.volunteerProfile?.gender,
          role: u.role,
          meta: [
            u.city ? { value: u.city, icon: MapPin } : null,
            { value: formatDate(u.createdAt), icon: ClockIcon },
          ].filter(Boolean) as any,
        }))}
        layout="list"
      />
    ),
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
};

export type AnalyticsModalId = "users" | "activities" | "pending" | "activityViews" | "postViews" | "magazineDownloads";
