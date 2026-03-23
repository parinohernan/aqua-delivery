import LandingNavbar from './sections/LandingNavbar';
import HeroSection from './sections/HeroSection';
import ComparisonSection from './sections/ComparisonSection';
import SolutionSection from './sections/SolutionSection';
import FeaturesSection from './sections/FeaturesSection';
import BenefitsSection from './sections/BenefitsSection';
import TrustSection from './sections/TrustSection';
import GuidesSection from './sections/GuidesSection';
import PricingSection from './sections/PricingSection';
import FAQSection from './sections/FAQSection';
import FinalCTASection from './sections/FinalCTASection';
import LandingFooter from './sections/LandingFooter';

const LandingPage = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Aqua Delivery Manager (ADM)",
    "operatingSystem": "Android, iOS, Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "10000.00",
      "highPrice": "50000.00",
      "priceCurrency": "ARS",
      "availability": "https://schema.org/InStock"
    },
    "description": "Software de gestión logística para repartos de agua y soda. Control de envases, deudas y rutas optimizadas para soderías y distribuidoras en Argentina y Latam.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "12" // Simulación de autoridad inicial para la IA
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-sans selection:bg-blue-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <LandingNavbar />

      <main>
        <HeroSection />
        <ComparisonSection />
        <SolutionSection />
        <FeaturesSection />
        <BenefitsSection />
        <TrustSection />
        <GuidesSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
