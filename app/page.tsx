import BusinessChallenges from "@/components/ui/landing-page/business-challenges";
import CalculateROI from "@/components/ui/landing-page/calculate-roi";
import CTASection from "@/components/ui/landing-page/cta-section";
import FeatureSection from "@/components/ui/landing-page/features-section";
import FooterSection from "@/components/ui/landing-page/footer-section";
import { HeroSection } from "@/components/ui/landing-page/hero-section";
import LogoStroke from "@/components/ui/landing-page/logo-stroke";
import NavSection from "@/components/ui/landing-page/nav-section";
import SelfSurvey from "@/components/ui/landing-page/self-survey";

export default function Home() {
  return (
    <div className="bg-[#FAFAFA]">
      <div className="sticky top-0 z-50">
        <NavSection />
      </div>
      <div className="space-y-12 md:space-y-16">
        <HeroSection />
        <LogoStroke />
        <BusinessChallenges />
        <LogoStroke />
        <SelfSurvey />
        <LogoStroke />
        <FeatureSection />
        <LogoStroke />
        <CalculateROI />
         <LogoStroke />
        <CTASection />
        <FooterSection />
      </div>
    </div>
  );
}
