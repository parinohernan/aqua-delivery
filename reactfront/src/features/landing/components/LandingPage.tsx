import LandingNavbar from './sections/LandingNavbar';
import HeroSection from './sections/HeroSection';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import FeaturesSection from './sections/FeaturesSection';
import BenefitsSection from './sections/BenefitsSection';
import TrustSection from './sections/TrustSection';
import PricingSection from './sections/PricingSection';
import FAQSection from './sections/FAQSection';
import FinalCTASection from './sections/FinalCTASection';
import LandingFooter from './sections/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-sans selection:bg-blue-500/30">
      <LandingNavbar />

      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <BenefitsSection />
        <TrustSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
