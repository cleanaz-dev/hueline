import CTASection from "@/components/ui/landing-page/cta-section";
import ExamplesSection from "@/components/ui/landing-page/example-section";
import FooterSection from "@/components/ui/landing-page/footer-section";
import { HeroSection } from "@/components/ui/landing-page/hero-section";
import NavSection from "@/components/ui/landing-page/nav-section";
import SolutionSection from "@/components/ui/landing-page/solutions-section";
import WYGSection from "@/components/ui/landing-page/wyg-section";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
      <div className="sticky top-0 z-50">
        <NavSection />
      </div>
      <div className="space-y-12 md:space-y-16">
        <HeroSection />
        <SolutionSection />
        <ExamplesSection />
        <WYGSection />
        <CTASection />
        <FooterSection />
      </div>
    </div>
  );
}
