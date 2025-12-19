import { FeaturedPost } from "@/core/domain/entities";

interface IFeaturedPostRepository {
  findById(id: string): Promise<FeaturedPost | null>;
  findAll(): Promise<FeaturedPost[]>;
  create(featurePost: FeaturedPost): Promise<FeaturedPost>;
  update(featurePost: FeaturedPost): Promise<FeaturedPost>;
  delete(id: string): Promise<boolean>;
}

export default IFeaturedPostRepository;
