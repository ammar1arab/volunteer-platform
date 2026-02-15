import {
  ActivityRepository,
  ActivityParticipationRepository,
  FeaturedPostRepository,
  UserRepository,
  VolunteerProfileRepository,
} from "@/infrastructure/persistence/repositories";
import { R2StorageService } from "@/infrastructure/external";
import {
  ActivityService,
  ActivityParticipationService,
  AuthService,
  FeaturedPostService,
  UserService,
  VolunteerProfileService,
} from "@/core/application/services";

export const providers = {
  activity: () =>
    new ActivityService(
      new ActivityRepository(),
      new ActivityParticipationRepository(),
    ),

  participation: () =>
    new ActivityParticipationService(
      new ActivityParticipationRepository(),
      new ActivityRepository(),
      new UserRepository(),
    ),

  auth: () =>
    new AuthService(new UserRepository(), new VolunteerProfileRepository()),

  featuredPost: () => new FeaturedPostService(new FeaturedPostRepository()),

  user: () => new UserService(new UserRepository()),

  volunteerProfile: () =>
    new VolunteerProfileService(
      new VolunteerProfileRepository(),
      new R2StorageService(),
    ),

  storage: () => new R2StorageService(),
};
