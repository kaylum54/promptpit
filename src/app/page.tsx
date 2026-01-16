import { Navigation } from '@/components/marketing/Navigation';
import { HeroSection } from '@/components/marketing/HeroSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { ProcessSection } from '@/components/marketing/ProcessSection';
import { ProFeaturesSection } from '@/components/marketing/ProFeaturesSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { FinalCTASection } from '@/components/marketing/FinalCTASection';
import { Footer } from '@/components/marketing/Footer';

export default function HomePage() {
  return (
    <main className="bg-white min-h-screen">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProcessSection />
      <ProFeaturesSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
