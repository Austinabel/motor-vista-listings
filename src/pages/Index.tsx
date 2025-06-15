
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { SearchFilters } from "@/components/SearchFilters";
import { BrandCarousel } from "@/components/BrandCarousel";
import { FeaturedListings } from "@/components/FeaturedListings";
import { TrustedPartners } from "@/components/TrustedPartners";
import { HelpIcons } from "@/components/HelpIcons";
import { Testimonials } from "@/components/Testimonials";
import { ToolsSection } from "@/components/ToolsSection";
import { DownloadApp } from "@/components/DownloadApp";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { VerifiedDealers } from "@/components/VerifiedDealers";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <Hero />
      <div className="px-2 md:px-0">
        <SearchFilters />
        <BrandCarousel />
        <FeaturedListings />
        <VerifiedDealers />
        <TrustedPartners />
        <HelpIcons />
        <Testimonials />
        <ToolsSection />
        <DownloadApp />
        <FAQ />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
