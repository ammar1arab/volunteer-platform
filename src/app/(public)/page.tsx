import { HeroSection, FeaturedPosts, AvailableActivities, AboutSection, ContactSection } from '@/presentation/components';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <section id="opportunities">
        <AvailableActivities />
      </section>

      <FeaturedPosts />

      <section id="about">
        <AboutSection />
      </section>
      <section id="contact">
        <ContactSection />
      </section>
    </>
  );
};

export default HomePage;