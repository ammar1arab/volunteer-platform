import { R2StorageService } from "@/infrastructure/external";

import {
  ActivityRepository,
  ActivityParticipationRepository,
  FeaturedPostRepository,
  UserRepository,
  VolunteerProfileRepository,
  VolunteerSpotlightRepository
} from "@/infrastructure/persistence/repositories";
import {
  ActivityService,
  ActivityParticipationService,
  AuthService,
  FeaturedPostService,
  UserService,
  VolunteerProfileService,
  VolunteerSpotlightService
} from "@/core/application/useCases";

export const providers = {
  auth: () => new AuthService(new UserRepository(), new VolunteerProfileRepository()),

  user: () => new UserService(new UserRepository()),

  volunteerProfile: () => new VolunteerProfileService(new VolunteerProfileRepository(), new R2StorageService()),

  activity: () => new ActivityService(new ActivityRepository(), new ActivityParticipationRepository()),

  participation: () =>
    new ActivityParticipationService(
      new ActivityParticipationRepository(),
      new ActivityRepository(),
      new UserRepository()
    ),

  featuredPost: () => new FeaturedPostService(new FeaturedPostRepository()),

  volunteerSpotlight: () => new VolunteerSpotlightService(new VolunteerSpotlightRepository()),

  storage: () => new R2StorageService()
};
