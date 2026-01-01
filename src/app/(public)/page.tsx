import { HeroSection, FeaturedPosts, AvailableActivities, AboutSection, ContactSection } from '@/presentation/components';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturedPosts />
      <section id="opportunities">
        <AvailableActivities />
      </section>
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