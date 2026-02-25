// ─── Base ─────────────────────────────────────────────────────
export { ok, fail } from "./base.dto";
export type { Result, ErrorPayload } from "./base.dto";

// ─── Shared Fragments ─────────────────────────────────────────
export type {
  UserSummaryDto,
  VolunteerProfileSummaryDto,
  ActivitySummaryDto,
  ApprovedVolunteerRow
} from "./shared.dto";

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
  UpdateUserResponse
} from "./user.dto";

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
  GetActivityVolunteersResponse
} from "./activity.dto";

// ─── Participation ────────────────────────────────────────────
export type {
  ActivityParticipationDto,
  CreateJoinRequestResponse,
  GetJoinRequestsResponse,
  ApproveJoinRequestResponse,
  RejectJoinRequestResponse
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
