import { AboutSection, AvailableActivities, ContactSection, FeaturedPosts, HeroSection } from "@/presentation/components";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedPosts />
      <AvailableActivities />
      <AboutSection/>
      <ContactSection/>
    </>
  );
}
