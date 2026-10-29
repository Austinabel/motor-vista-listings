import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, MapPin, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { fetchPublicDealers, type DealerSummary } from "@/services/dealers";

const STANDS_SHOWN = 4;

const StandCard = ({ dealer }: { dealer: DealerSummary }) => (
  <Link
    to={`/dealer/${dealer.id}`}
    className="group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
  >
    {dealer.imageUrl ? (
      <img src={dealer.imageUrl} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
    ) : (
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-2xl font-bold text-gold">
        {dealer.businessName.charAt(0).toUpperCase()}
      </span>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-base font-bold">{dealer.businessName}</p>
      {dealer.state && (
        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {dealer.state}
        </p>
      )}
    </div>
    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
  </Link>
);

export const StandsSection = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("");
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["home", "dealers"],
    queryFn: fetchPublicDealers,
    retry: 1,
    staleTime: 5 * 60_000,
  });

  const explore = () => navigate(state ? `/dealers?state=${encodeURIComponent(state)}` : "/dealers");

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-3xl bg-brand-dark text-primary-foreground shadow-xl lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-gold-foreground">
            <Store className="h-7 w-7" />
          </span>
          <h2 className="mt-6 text-3xl font-extrabold md:text-4xl">Find car stands near you</h2>
          <p className="mt-3 max-w-lg text-lg text-primary-foreground/80">
            Discover dealerships and car stands, browse their available vehicles, and contact sellers directly.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="stand-state" className="sr-only">State</label>
            <select
              id="stand-state"
              value={state}
              onChange={(event) => setState(event.target.value)}
              className="h-12 w-full rounded-xl border-0 bg-card px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-gold sm:max-w-xs"
            >
              <option value="">All states</option>
              {NIGERIAN_STATES.map((name) => (
                <option key={name} value={name}>{name === "FCT" ? "Abuja (FCT)" : name}</option>
              ))}
            </select>
            <Button onClick={explore} size="lg" className="h-12 rounded-xl bg-gold px-6 text-base text-gold-foreground hover:bg-gold/90">
              Explore car stands
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/60">
            Opening hours and live open status will show once stands record them.
          </p>
        </div>
        {/* Decorative photograph, not a Motorcars dealer */}
        <div className="relative min-h-[240px] lg:min-h-full">
          <img
            src="/images/home/stands-lot.webp"
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 to-transparent lg:from-brand-dark" />
        </div>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: STANDS_SHOWN }, (_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-6 text-center sm:flex-row sm:justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="font-medium">We couldn't load car stands right now.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Try again
            </Button>
          </div>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-6 text-center sm:flex-row sm:justify-center">
            <p className="font-medium">No car stands are listed yet.</p>
            <Button asChild size="sm">
              <Link to="/dealer-registration">Register your stand</Link>
            </Button>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.slice(0, STANDS_SHOWN).map((dealer) => (
              <StandCard key={dealer.id} dealer={dealer} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
