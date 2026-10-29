import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Calendar, MapPin, RefreshCw, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";
import { VerifiedBusinessBadge } from "@/components/VerifiedBusinessBadge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { locationMatches } from "@/lib/locations";
import { fetchPublicDealers, type DealerSummary } from "@/services/dealers";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-56";

const DealerCard = ({ dealer }: { dealer: DealerSummary }) => (
  <Link
    to={`/dealer/${dealer.id}`}
    className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
  >
    <div className="flex items-center gap-4">
      {dealer.imageUrl ? (
        <img src={dealer.imageUrl} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-xl font-bold text-gold">
          {dealer.businessName.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-lg font-bold">{dealer.businessName}</p>
        <VerifiedBusinessBadge className="mt-1" />
        {dealer.state && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{dealer.state}</p>
        )}
      </div>
    </div>
    {dealer.description && <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{dealer.description}</p>}
    <div className="mt-auto flex items-center justify-between pt-4 text-sm">
      {dealer.yearEstablished ? (
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />Established {dealer.yearEstablished}</span>
      ) : <span />}
      <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:underline">
        View stand <ArrowRight className="h-4 w-4" />
      </span>
    </div>
  </Link>
);

// Only businesses an admin has approved are listed (get_public_dealers returns approved dealers).
const Dealers = () => {
  usePageMeta({ title: "Car stands and dealers", description: "Find approved car dealers and car stands across Nigeria and browse the cars they have for sale." });
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const state = params.get("state") ?? "";

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dealers", "public"],
    queryFn: fetchPublicDealers,
    retry: 1,
    staleTime: 5 * 60_000,
  });

  const dealers = useMemo(() => {
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    return (data ?? []).filter((dealer) => {
      const text = `${dealer.businessName} ${dealer.description ?? ""}`.toLowerCase();
      return words.every((word) => text.includes(word)) && (!state || locationMatches(dealer.state, state));
    });
  }, [data, search, state]);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-brand-dark text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Car stands</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Car stands and dealers</h1>
          <p className="mt-3 max-w-2xl text-lg text-primary-foreground/80">
            Businesses on Motorcars are reviewed by our team before they appear here. Visit a stand's page to see its cars and
            contact them.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search car stands"
              placeholder="Search by name"
              defaultValue={search}
              onChange={(event) => update("q", event.target.value.trim())}
              className="h-11 pl-9"
            />
          </div>
          <select aria-label="State" className={selectClass} value={state} onChange={(event) => update("state", event.target.value)}>
            <option value="">All states</option>
            {NIGERIAN_STATES.map((name) => <option key={name} value={name}>{name === "FCT" ? "Abuja (FCT)" : name}</option>)}
          </select>
        </div>

        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {data ? `${dealers.length} ${dealers.length === 1 ? "stand" : "stands"}` : ""}
        </p>

        <div className="mt-3">
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="font-medium">We couldn't load car stands.</p>
              <Button variant="outline" onClick={() => refetch()}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
            </div>
          )}
          {data && dealers.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center">
              <Store className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">{data.length === 0 ? "No car stands are listed yet." : "No stands match your search."}</p>
              {data.length > 0 ? (
                <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear search</Button>
              ) : (
                <Button asChild><Link to="/dealer-registration">Register your stand</Link></Button>
              )}
            </div>
          )}
          {dealers.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dealers.map((dealer) => <DealerCard key={dealer.id} dealer={dealer} />)}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center md:p-8">
          <div>
            <p className="text-xl font-extrabold">Run a car stand or dealership?</p>
            <p className="text-primary-foreground/80">Register your business and list your stock on Motorcars.</p>
          </div>
          <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/dealer-registration">Register your business</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dealers;
