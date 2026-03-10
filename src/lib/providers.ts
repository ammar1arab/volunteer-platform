import { R2StorageService } from "@/infrastructure/external";

import {
  UserRepository,
  VolunteerProfileRepository,
  ActivityRepository,
  ActivityParticipationRepository,
  FeaturedPostRepository,
  VolunteerSpotlightRepository,
  MonthlyMagazineRepository
} from "@/infrastructure/persistence/repositories";
import {
  AuthUseCase,
  UserUseCase,
  VolunteerProfileUseCase,
  ActivityUseCase,
  ActivityParticipationUseCase,
  FeaturedPostUseCase,
  VolunteerSpotlightUseCase,
  MonthlyMagazineUseCase
} from "@/core/application/useCases";

export const providers = {
  auth: () => new AuthUseCase(new UserRepository(), new VolunteerProfileRepository()),

  user: () => new UserUseCase(new UserRepository()),

  volunteerProfile: () => new VolunteerProfileUseCase(new VolunteerProfileRepository(), new R2StorageService()),

  activity: () => new ActivityUseCase(new ActivityRepository(), new ActivityParticipationRepository()),

  participation: () =>
    new ActivityParticipationUseCase(
      new ActivityParticipationRepository(),
      new ActivityRepository(),
      new UserRepository(),
      new VolunteerProfileRepository()
    ),

  featuredPost: () => new FeaturedPostUseCase(new FeaturedPostRepository()),

  volunteerSpotlight: () => new VolunteerSpotlightUseCase(new VolunteerSpotlightRepository()),

  monthlyMagazine: () => new MonthlyMagazineUseCase(new MonthlyMagazineRepository()),

  storage: () => new R2StorageService()
};
