import { CTASection } from "@/components/home/CTASection";
import { HeroSection } from "@/components/home/HeroSection";
import { ProfessionalsPreview } from "@/components/home/ProfessionalsPreview";
import { ServicesSection } from "@/components/home/ServicesSection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProfessionalsPreview />
        <CTASection />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;
