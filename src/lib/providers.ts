import { R2StorageService } from "@/infrastructure/external";
import {
  UserRepository,
  VolunteerProfileRepository,
  ActivityRepository,
  ActivityParticipationRepository,
  FeaturedPostRepository,
  VolunteerSpotlightRepository,
  MonthlyMagazineRepository,
  CertificateRepository,
  NotificationRepository,
  OtpRepository,
  PendingRegistrationRepository,
} from "@/infrastructure/persistence/repositories";
import {
  AuthUseCase,
  UserUseCase,
  VolunteerProfileUseCase,
  ActivityUseCase,
  ActivityParticipationUseCase,
  FeaturedPostUseCase,
  VolunteerSpotlightUseCase,
  MonthlyMagazineUseCase,
  CertificateUseCase,
  NotificationUseCase,
  EmailUseCase,
  OtpUseCase,
} from "@/core/application/useCases";

const makeEmailUseCase   = () => new EmailUseCase(new UserRepository());
const makePendingRepo    = () => new PendingRegistrationRepository();
const makeOtpRepo        = () => new OtpRepository();
const makeUserRepo       = () => new UserRepository();

const makeOtpUseCase = () =>
  new OtpUseCase(
    makeOtpRepo(),
    makeUserRepo(),
    makeEmailUseCase(),
    makePendingRepo(),
  );

const makeAuthUseCase = () =>
  new AuthUseCase(
    makeUserRepo(),
    makeOtpUseCase(),
    makePendingRepo(),
  );

export const providers = {
  auth:  makeAuthUseCase,
  otp:   makeOtpUseCase,

  user:             () => new UserUseCase(new UserRepository()),
  volunteerProfile: () => new VolunteerProfileUseCase(new VolunteerProfileRepository(), new R2StorageService()),
  activity:         () => new ActivityUseCase(new ActivityRepository(), new ActivityParticipationRepository()),

  participation: () =>
    new ActivityParticipationUseCase(
      new ActivityParticipationRepository(),
      new ActivityRepository(),
      new UserRepository(),
      new VolunteerProfileRepository(),
    ),

  featuredPost:       () => new FeaturedPostUseCase(new FeaturedPostRepository()),
  volunteerSpotlight: () => new VolunteerSpotlightUseCase(new VolunteerSpotlightRepository()),
  monthlyMagazine:    () => new MonthlyMagazineUseCase(new MonthlyMagazineRepository()),

  certificate: () =>
    new CertificateUseCase(
      new CertificateRepository(),
      new ActivityRepository(),
      new ActivityParticipationRepository(),
    ),

  notification: () => new NotificationUseCase(new NotificationRepository()),
  email:        () => makeEmailUseCase(),
  storage:      () => new R2StorageService(),
};