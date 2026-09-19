import { Users, Activity, Clock, Eye, FileText, Download, MapPin, Clock as ClockIcon } from "lucide-react";
import { Badge, UserList, compactUserListMeta } from "@/presentation/components";
import { formatDate } from "@/lib/utils/date";
import type { Column, SharedDataModalConfig } from "@/presentation/components/admin/SharedDataModal/SharedDataModal";
import { ActivityStatus } from "@/core/domain/enums";
import { getActivityStatusLabel, getCityLabel } from "@/presentation/constants";
import type {
  ActivityDto,
  ActivityParticipationDto,
  FeaturedPostDto,
  MonthlyMagazineDto,
  UserAnalyticsDto
} from "@/core/application/dtos";

export const USERS_COLUMNS: Column<UserAnalyticsDto>[] = [
  { key: "name", header: "الاسم", accessor: (u) => u.fullName, sortable: true, sortValue: (u) => u.fullName },
  { key: "email", header: "البريد الإلكتروني", accessor: (u) => u.email, sortable: true, sortValue: (u) => u.email },
  { key: "date", header: "تاريخ الانضمام", accessor: (u) => formatDate(u.createdAt), sortable: true, sortValue: (u) => new Date(u.createdAt).getTime() },
];

export const ACTIVITIES_COLUMNS: Column<ActivityDto>[] = [
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

export const PENDING_REQUESTS_COLUMNS: Column<ActivityParticipationDto>[] = [
  { key: "volunteer", header: "اسم المتطوع", accessor: (r) => r.volunteer?.fullName ?? "-", sortable: true, sortValue: (r) => r.volunteer?.fullName ?? "" },
  { key: "activity", header: "النشاط", accessor: (r) => r.activity?.title ?? "-", sortable: true, sortValue: (r) => r.activity?.title ?? "" },
  { key: "date", header: "تاريخ الطلب", accessor: (r) => formatDate(r.requestedAt), sortable: true, sortValue: (r) => new Date(r.requestedAt).getTime() },
];

export const POSTS_COLUMNS: Column<FeaturedPostDto>[] = [
  { key: "title", header: "عنوان المقال", accessor: (p) => p.title, sortable: true, sortValue: (p) => p.title },
  { key: "date", header: "التاريخ", accessor: (p) => formatDate(p.createdAt), sortable: true, sortValue: (p) => new Date(p.createdAt).getTime() },
];

export const MAGAZINE_COLUMNS: Column<MonthlyMagazineDto>[] = [
  { key: "title", header: "الإصدار", accessor: (m) => m.title, sortable: true, sortValue: (m) => m.title },
  { key: "downloads", header: "مرات التحميل", accessor: (m) => m.downloads || 0, sortable: true, sortValue: (m) => m.downloads || 0 },
];

export const ANALYTICS_MODAL_CONFIGS = {
  users: {
    title: "إحصائيات المستخدمين",
    icon: Users,
    fetchUrl: "/api/users",
    dataKey: "users",
    columns: USERS_COLUMNS,
    emptyTitle: "لا يوجد مستخدمين",
    emptyMessage: "لم ينضم أي مستخدمين جدد مؤخراً.",
    customListRenderer: (data: UserAnalyticsDto[]) => (
      <UserList
        users={data.map((u) => {
          const city = u.city ?? u.volunteerProfile?.city;
          return {
            id: u.id,
            name: u.fullName,
            email: u.email,
            phone: u.phone,
            avatarUrl: u.volunteerProfile?.profilePictureUrl,
            gender: u.volunteerProfile?.gender,
            role: u.role,
            meta: compactUserListMeta([
              city ? { value: getCityLabel(city), icon: MapPin } : null,
              { value: formatDate(u.createdAt), icon: ClockIcon },
            ]),
          };
        })}
        layout="list"
      />
    ),
  } satisfies SharedDataModalConfig<UserAnalyticsDto>,
  activities: {
    title: "إحصائيات الأنشطة",
    icon: Activity,
    fetchUrl: "/api/activities",
    dataKey: "activities",
    columns: ACTIVITIES_COLUMNS,
    emptyTitle: "لا توجد أنشطة",
    emptyMessage: "لم يتم إنشاء أي أنشطة بعد.",
  } satisfies SharedDataModalConfig<ActivityDto>,
  pending: {
    title: "الطلبات المعلقة",
    icon: Clock,
    fetchUrl: "/api/activity-participations/pending",
    dataKey: "requests",
    columns: PENDING_REQUESTS_COLUMNS,
    emptyTitle: "لا توجد طلبات معلقة",
    emptyMessage: "جميع طلبات المشاركة تم التعامل معها بنجاح.",
  } satisfies SharedDataModalConfig<ActivityParticipationDto>,
  activityViews: {
    title: "مشاهدات الأنشطة",
    icon: Eye,
    fetchUrl: "/api/activities",
    dataKey: "activities",
    columns: ACTIVITIES_COLUMNS,
    emptyTitle: "لا يوجد بيانات",
    emptyMessage: "لا توجد مشاهدات مسجلة.",
  } satisfies SharedDataModalConfig<ActivityDto>,
  postViews: {
    title: "تفاعل المقالات",
    icon: FileText,
    fetchUrl: "/api/featured-posts",
    dataKey: "posts",
    columns: POSTS_COLUMNS,
    emptyTitle: "لا يوجد تفاعل",
    emptyMessage: "لا توجد مقالات مسجلة.",
  } satisfies SharedDataModalConfig<FeaturedPostDto>,
  magazineDownloads: {
    title: "تحميلات المجلة",
    icon: Download,
    fetchUrl: "/api/monthly-magazines",
    dataKey: "magazines",
    columns: MAGAZINE_COLUMNS,
    emptyTitle: "لا يوجد تحميلات",
    emptyMessage: "لم يتم تحميل أي أعداد بعد.",
  } satisfies SharedDataModalConfig<MonthlyMagazineDto>,
};

export type AnalyticsModalId = keyof typeof ANALYTICS_MODAL_CONFIGS;
