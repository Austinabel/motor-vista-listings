import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Car, Clock, Plane, Sparkles, Wallet, Mountain, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustStrip } from "@/components/home/TrustPoints";
import { CategorySection } from "@/components/home/CategorySection";
import { ListingSection, ListingSectionSkeleton, ListingsUnavailable } from "@/components/home/ListingSection";
import { StandsSection } from "@/components/home/StandsSection";
import { PopularMakes } from "@/components/home/PopularMakes";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SellSection } from "@/components/home/SellSection";
import { MoatwaveSection } from "@/components/home/MoatwaveSection";
import { MOATWAVE_PREVIEWS } from "@/config/features";
import { HOMEPAGE_BUDGET, fetchHomepageListings } from "@/services/listings";
import { formatNaira } from "@/lib/format";

import { usePageMeta } from "@/hooks/usePageMeta";
const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const Index = () => {
  usePageMeta({});
  const { hash } = useLocation();

  // Links such as /#services land on a homepage section
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  // Every vehicle on this page comes from this one query; nothing is filled with sample data
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["home", "listings"],
    queryFn: fetchHomepageListings,
    retry: 1,
    staleTime: 60_000,
  });

  const hasCollections =
    data && (data.foreignUsed.length || data.nigerianUsed.length || data.underBudget.length || data.suvs.length);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <HomeHero />
      <TrustStrip />
      <CategorySection />

      {/* Featured: omitted entirely when nothing is currently featured */}
      {(isLoading || isError || (data && data.featured.length > 0)) && (
        <section className={`${container} pb-6`}>
          {isLoading && <ListingSectionSkeleton title="featured cars" />}
          {isError && <ListingsUnavailable onRetry={() => refetch()} retrying={isFetching} />}
          {data && (
            <ListingSection
              title="Featured cars"
              subtitle="Explore selected cars from dealers and private sellers across Nigeria."
              icon={Sparkles}
              listings={data.featured}
              viewAllHref="/cars"
            />
          )}
        </section>
      )}

      <StandsSection />

      <section className={`${container} py-10`}>
        <div className={`grid grid-cols-1 gap-8 ${isError ? "" : "xl:grid-cols-[1fr_300px]"}`}>
          {isLoading ? (
            <ListingSectionSkeleton title="just listed" columns={3} />
          ) : (
            data && (
              <ListingSection
                title="Just listed"
                subtitle="Explore the latest vehicles added to Motorcars."
                icon={Clock}
                listings={data.justListed}
                viewAllHref="/cars"
                columns={3}
                emptyState={
                  data.featured.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center">
                      <Car className="h-10 w-10 text-muted-foreground" />
                      <p className="text-lg font-semibold">No cars are listed yet.</p>
                      <Button asChild>
                        <Link to="/sell">List the first car</Link>
                      </Button>
                    </div>
                  ) : undefined
                }
              />
            )
          )}
          {/* Makes need no listing data, so they stay available when listings fail to load */}
          <div className={isError ? "" : "xl:pt-[88px]"}>
            <PopularMakes />
          </div>
        </div>
      </section>

      {hasCollections ? (
        <section className={`${container} space-y-14 py-10`}>
          <ListingSection
            title="Foreign used (Tokunbo)"
            subtitle="Imported cars, sold as foreign used."
            icon={Plane}
            listings={data.foreignUsed}
            viewAllHref="/cars?condition=foreign_used"
            viewAllLabel="All foreign used"
          />
          <ListingSection
            title="Nigerian used"
            subtitle="Cars previously registered and driven in Nigeria."
            icon={MapPin}
            listings={data.nigerianUsed}
            viewAllHref="/cars?condition=local_used"
            viewAllLabel="All Nigerian used"
          />
          <ListingSection
            title={`Under ${formatNaira(HOMEPAGE_BUDGET).replace(",000,000", " million")}`}
            subtitle={`Cars with an asking price of ${formatNaira(HOMEPAGE_BUDGET)} or less.`}
            icon={Wallet}
            listings={data.underBudget}
            viewAllHref={`/cars?maxPrice=${HOMEPAGE_BUDGET}&sort=price_asc`}
            viewAllLabel="See more in budget"
          />
          <ListingSection
            title="SUVs and 4x4s"
            subtitle="Sport utility vehicles recognised by model name."
            icon={Mountain}
            listings={data.suvs}
            viewAllHref="/cars?category=suv"
            viewAllLabel="All SUVs"
          />
        </section>
      ) : null}

      <SellSection />
      <ServicesSection />
      {MOATWAVE_PREVIEWS && <MoatwaveSection />}
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
