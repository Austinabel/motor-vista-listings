import { Link } from "react-router-dom";
import { ArrowRight, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

// Photographs are decorative and do not show Motorcars sellers or dealers
export const SellSection = () => (
  <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="relative isolate flex min-h-[320px] overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg">
        <img
          src="/images/home/sell-keys.webp"
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-y-0 right-0 -z-20 h-full w-[45%] object-cover max-sm:hidden"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-primary from-55% via-primary/80 via-65% to-primary/10" />
        <div className="flex max-w-[60%] flex-col justify-center p-8 md:p-10 max-sm:max-w-none">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-gold-foreground">
            <Tag className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-3xl font-extrabold">Selling a car?</h2>
          <p className="mt-3 text-lg text-primary-foreground/85">
            List it with photos and your price. Buyers contact you directly about your car.
          </p>
          <Button asChild size="lg" className="mt-7 h-12 self-start rounded-xl bg-gold px-6 text-base text-gold-foreground hover:bg-gold/90">
            <Link to="/sell">
              Sell your car
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative isolate flex min-h-[320px] overflow-hidden rounded-3xl border-2 border-gold/50 bg-card shadow-lg">
        <img
          src="/images/home/dealer-lot.webp"
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-y-0 right-0 -z-20 h-full w-[45%] object-cover max-sm:hidden"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-card from-55% via-card/80 via-65% to-card/10" />
        <div className="flex max-w-[60%] flex-col justify-center p-8 md:p-10 max-sm:max-w-none">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark text-gold">
            <Store className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-3xl font-extrabold">Run a dealership or car stand?</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Get a business profile, list your stock and let buyers find your stand. Businesses are reviewed before they go live.
          </p>
          <Button asChild size="lg" className="mt-7 h-12 self-start rounded-xl px-6 text-base">
            <Link to="/dealer-registration">
              Register your business
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);
