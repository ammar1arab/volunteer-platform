
export { ok, fail } from "./base.dto";
export type { Result, ErrorPayload, ErrorDetails } from "./base.dto";


export type { UserSummaryDto, VolunteerProfileSummaryDto, ActivitySummaryDto } from "./shared.dto";


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
  CreateAdminResponse,
  ToggleUserActiveResponse
} from "./user.dto";


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


export type {
  VolunteerProfileDto,
  GetVolunteerProfileResponse,
  UpdateVolunteerProfileRequest,
  UpdateVolunteerProfileResponse,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse
} from "./volunteerProfile.dto";


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


export type {
  CertificateDto,
  CertificateWithTotalHoursDto,
  GetCertificateByIdResponse,
  GetUserCertificatesResponse
} from "./certificate.dto";


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
  PreviewUsersDto,
  BroadcastRecipientDto,
  DeleteBroadcastResponse,
  GetBroadcastRecipientsResponse
} from "./notification.dto";


export type {
  MeetingIntegrationStatusDto,
  GetMeetingIntegrationStatusResponse,
  GetGoogleConnectUrlResponse,
  DisconnectGoogleMeetResponse,
  HandleGoogleOAuthCallbackResponse,
  OnlineMeetingFilter,
  OnlineMeetingListItemDto,
  ListOnlineMeetingsResponse,
  RetryMeetingSyncResponse,
  GetMeetingLaunchUrlResponse,
  MeetingLaunchDto,
  EnqueueMeetingSyncResponse,
  MeetingGateRoleDto,
  MeetingGateStageDto,
  MeetingGateIdentityDto,
  MeetingWaitingGuestDto,
  MeetingGateSnapshotDto,
  MeetingJitsiEmbedDto,
  MeetingSessionDto,
  GetMeetingSessionResponse,
  LeaveMeetingSessionResponse,
  MeetingReportSummaryDto,
  MeetingReportAttendeeDto,
  MeetingReportDto,
  GetMeetingReportResponse,
  ImportMeetingReportResponse,
  RequestMeetingReportImportResponse,
  MatchMeetingAttendeeResponse
} from "./meeting.dto";
