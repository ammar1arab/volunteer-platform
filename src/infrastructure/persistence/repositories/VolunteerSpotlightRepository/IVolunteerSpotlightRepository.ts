import { VolunteerSpotlight } from "@/core/domain/entities";

interface IVolunteerSpotlightRepository {
  findById(id: string): Promise<VolunteerSpotlight | null>;
  findAll(): Promise<VolunteerSpotlight[]>;
  create(volunteerSpotlight: VolunteerSpotlight): Promise<VolunteerSpotlight>;
  update(volunteerSpotlight: VolunteerSpotlight): Promise<VolunteerSpotlight>;
  delete(id: string): Promise<boolean>;
}

export default IVolunteerSpotlightRepository;
