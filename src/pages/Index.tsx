
import { Hero } from "@/components/Hero";
import { SearchFilters } from "@/components/SearchFilters";
import { BrandCarousel } from "@/components/BrandCarousel";
import { FeaturedListings } from "@/components/FeaturedListings";
import { TrustedPartners } from "@/components/TrustedPartners";
import { HelpIcons } from "@/components/HelpIcons";
import { Testimonials } from "@/components/Testimonials";
import { ToolsSection } from "@/components/ToolsSection";
import { BlogSection } from "@/components/BlogSection";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <SearchFilters />
      <BrandCarousel />
      <FeaturedListings />
      <TrustedPartners />
      <HelpIcons />
      <Testimonials />
      <ToolsSection />
      <BlogSection />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
