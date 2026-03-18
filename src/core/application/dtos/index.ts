// ─── Base ─────────────────────────────────────────────────────
export { ok, fail } from "./base.dto";
export type { Result, ErrorPayload } from "./base.dto";

// ─── Shared Fragments ─────────────────────────────────────────
export type { UserSummaryDto, VolunteerProfileSummaryDto, ActivitySummaryDto } from "./shared.dto";

// ─── Auth ─────────────────────────────────────────────────────
export type {
  SignInRequest,
  SignInUserDto,
  SignInResponse,
  SignUpRequest,
  SignUpUserDto,
  SignUpResponse,
  SignInTokenDto,
  SignInTokenResponse
} from "./auth.dto";

// ─── User ─────────────────────────────────────────────────────
export type {
  UserProfileDto,
  GetUserProfileResponse,
  UserDto,
  UserAnalyticsDto,
  UserActivityDto,
  GetAllUsersResponse,
  GetUserDetailsResponse,
  GetUserActivitiesResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdatePermissionsResponse,
  CreateAdminRequest,
  CreateAdminResponse
} from "./user.dto";

// ─── Otp ────────────────────────────────────────
export type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse
} from "./otp.dto";

// ─── Volunteer Profile ────────────────────────────────────────
export type {
  VolunteerProfileDto,
  GetVolunteerProfileResponse,
  UpdateVolunteerProfileRequest,
  UpdateVolunteerProfileResponse,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse
} from "./volunteerProfile.dto";

// ─── Activity ─────────────────────────────────────────────────
export type {
  ActivityDto,
  CreateActivityRequest,
  CreateActivityResponse,
  UpdateActivityRequest,
  UpdateActivityResponse,
  GetActivityResponse,
  GetAllActivitiesResponse,
  DeleteActivityResponse,
  PublishActivityResponse,
  CancelActivityResponse,
  RestoreActivityResponse,
  ActivityVolunteerDto,
  GetActivityVolunteersResponse,
  CompleteActivityResponse
} from "./activity.dto";

// ─── Certification ────────────────────────────────────────────
export type {
  CertificateDto,
  CertificateWithTotalHoursDto,
  GetCertificateByIdResponse,
  GetUserCertificatesResponse
} from "./certificate.dto";

// ─── Participation ────────────────────────────────────────────
export type {
  ActivityParticipationDto,
  CreateJoinRequestResponse,
  GetJoinRequestsResponse,
  ApproveJoinRequestResponse,
  RejectJoinRequestResponse,
  CancelJoinRequestResponse,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  ApprovedVolunteerRow,
  BulkMarkAttendanceRequest,
  BulkMarkAttendanceResponse
} from "./participation.dto";

// ─── Featured Post ────────────────────────────────────────────
export type {
  FeaturedPostDto,
  CreateFeaturedPostRequest,
  CreateFeaturedPostResponse,
  UpdateFeaturedPostRequest,
  UpdateFeaturedPostResponse,
  GetFeaturedPostResponse,
  GetAllFeaturedPostsResponse,
  DeleteFeaturedPostResponse
} from "./featuredPost.dto";

// ─── Volunteer Spotlight ────────────────────────────────────────────
export type {
  VolunteerSpotlightDto,
  CreateVolunteerSpotlightRequest,
  CreateVolunteerSpotlightResponse,
  UpdateVolunteerSpotlightRequest,
  UpdateVolunteerSpotlightResponse,
  GetVolunteerSpotlightResponse,
  GetAllVolunteerSpotlightsResponse,
  DeleteVolunteerSpotlightResponse
} from "./volunteerSpotlight.dto";

export type {
  CreateMonthlyMagazineRequest,
  CreateMonthlyMagazineResponse,
  DeleteMonthlyMagazineResponse,
  GetAllMonthlyMagazinesResponse,
  GetMonthlyMagazineResponse,
  MonthlyMagazineDto,
  UpdateMonthlyMagazineRequest,
  UpdateMonthlyMagazineResponse
} from "./monthlyMagazine.dto";

// ─── Email ────────────────────────────────────────────
export type {
  EmailAlias,
  EmailRecipientDto,
  EmailRecipientFilters,
  EmailRecipientsDto,
  EmailTarget,
  GetEmailRecipientsResponse,
  SendBulkEmailApiResponse,
  SendBulkEmailInput
} from "./email.dto";

// ─── Notification ────────────────────────────────────────────
export type {
  GetUnreadNotificationsResponse,
  MarkAsReadResponse,
  NotificationDto,
  UnreadNotificationsDto,
  BroadcastDto,
  BroadcastsDto,
  ClearNotificationsResponse,
  GetBroadcastsResponse,
  GetNotificationsResponse,
  NotificationsDto,
  SendCustomNotificationInput,
  SendCustomNotificationResponse,
  GetNotificationPreviewResponse,
  PreviewUserDto,
  PreviewUsersDto
} from "./notification.dto";
