
import { Hero } from "@/components/Hero";
import { MobileHero } from "@/components/MobileHero";
import { MobileCarGrid } from "@/components/MobileCarGrid";
import { SearchFilters } from "@/components/SearchFilters";
import { BrandCarousel } from "@/components/BrandCarousel";
import { FeaturedListings } from "@/components/FeaturedListings";

import { HelpIcons } from "@/components/HelpIcons";
import { Testimonials } from "@/components/Testimonials";
import { ToolsSection } from "@/components/ToolsSection";
import { DownloadApp } from "@/components/DownloadApp";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { VerifiedDealers } from "@/components/VerifiedDealers";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Mobile Hero with conditional content */}
      {isMobile ? (
        <>
          <MobileHero />
          <MobileCarGrid />
        </>
      ) : (
        <>
          <Hero />
          <div className="px-2 md:px-0">
            <SearchFilters />
            <BrandCarousel />
            <FeaturedListings />
            <VerifiedDealers />
            <HelpIcons />
            <Testimonials />
            <ToolsSection />
            <DownloadApp />
            <FAQ />
          </div>
        </>
      )}
      <div className={isMobile ? "hidden" : ""}>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
