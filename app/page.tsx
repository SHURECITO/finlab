import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CtaSection } from "@/components/sections/CtaSection";
import { FinancingSection } from "@/components/sections/FinancingSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectionsSection } from "@/components/sections/ProjectionsSection";
import { CtaComparadorSection } from "@/components/sections/CtaComparadorSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { StrategicSection } from "@/components/sections/StrategicSection";
import { UsersSection } from "@/components/sections/UsersSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <UsersSection />
      <FinancingSection />
      <ProjectionsSection />
      <StrategicSection />
      <CtaComparadorSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
