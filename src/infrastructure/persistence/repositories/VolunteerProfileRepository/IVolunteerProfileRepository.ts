import { VolunteerProfile } from "@/core/domain/entities";

interface IVolunteerProfileRepository {
  findByUserId(userId: string): Promise<VolunteerProfile | null>;
  create(profile: VolunteerProfile): Promise<VolunteerProfile>;
  update(profile: VolunteerProfile): Promise<VolunteerProfile>;
  delete(id: string): Promise<boolean>;
}

export default IVolunteerProfileRepository;
