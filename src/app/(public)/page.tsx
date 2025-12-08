import { AboutSection, AvailableActivities, ContactSection, FeaturedPrints, HeroSection, PopularActivities, StatisticsSection } from "@/presentation/components";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatisticsSection />
      <FeaturedPrints />
      <AvailableActivities />
      {/* <PopularActivities/> */}
      <AboutSection/>k
      <ContactSection/>
    </>
  );
}
