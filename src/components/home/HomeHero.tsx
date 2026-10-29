import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { TrustPanel } from "@/components/home/TrustPoints";

const POPULAR_MAKES = [
  "Toyota", "Lexus", "Honda", "Mercedes-Benz", "Hyundai", "Kia", "Ford", "Nissan", "BMW", "Innoson",
];

const MAX_PRICES = [
  { label: "Under ₦3 million", value: "3000000" },
  { label: "Under ₦5 million", value: "5000000" },
  { label: "Under ₦10 million", value: "10000000" },
  { label: "Under ₦20 million", value: "20000000" },
  { label: "Under ₦50 million", value: "50000000" },
];

// Values match the condition filter on /cars
const CONDITIONS = [
  { label: "Brand new", value: "brand_new" },
  { label: "Foreign used (Tokunbo)", value: "foreign_used" },
  { label: "Nigerian used", value: "local_used" },
];

const selectClass =
  "h-12 w-full rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export const HomeHero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (make) params.set("make", make);
    if (location) params.set("location", location);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (condition) params.set("condition", condition);
    navigate(`/cars${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-brand-dark text-primary-foreground">
      {/* Decorative brand photograph, not a Motorcars listing */}
      <img
        src="/images/home/hero-suv.webp"
        alt=""
        aria-hidden
        loading="eager"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/30 lg:via-brand-dark/75 lg:to-brand-dark/10"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-brand-dark/80 to-transparent" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-14 pt-12 sm:px-6 md:pb-20 md:pt-16 lg:px-8 xl:grid-cols-[1fr_340px] xl:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Nigeria's automotive marketplace</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
            Real Dealers. Real Cars.
            <span className="block text-gold">Live Stands.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/85 md:text-xl">
            Search, compare and buy cars from dealers and private sellers across Nigeria. Meet sellers, inspect
            vehicles and make informed decisions.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-4xl rounded-2xl bg-card p-4 text-foreground shadow-2xl ring-1 ring-black/5 sm:p-5"
            role="search"
            aria-label="Search for a car"
          >
            <label htmlFor="hero-search" className="sr-only">Which motor you dey find?</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="hero-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Which motor you dey find? e.g. Toyota Corolla, Lexus RX"
                className="h-14 rounded-xl pl-12 text-base"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <select aria-label="Make" value={make} onChange={(e) => setMake(e.target.value)} className={selectClass}>
                <option value="">Any make</option>
                {POPULAR_MAKES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <select aria-label="State" value={location} onChange={(e) => setLocation(e.target.value)} className={selectClass}>
                <option value="">Any state</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state === "FCT" ? "Abuja (FCT)" : state}</option>
                ))}
              </select>
              <select aria-label="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={selectClass}>
                <option value="">Any price</option>
                {MAX_PRICES.map((price) => (
                  <option key={price.value} value={price.value}>{price.label}</option>
                ))}
              </select>
              <select aria-label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} className={selectClass}>
                <option value="">Any condition</option>
                {CONDITIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base sm:col-span-2 lg:col-span-1">
                <Search className="mr-2 h-5 w-5" />
                Search cars
              </Button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-primary-foreground/75">Popular:</span>
            {POPULAR_MAKES.slice(0, 8).map((name) => (
              <Link
                key={name}
                to={`/cars?make=${encodeURIComponent(name)}`}
                className="rounded-full border border-primary-foreground/30 px-3.5 py-1 text-sm font-medium text-primary-foreground/90 transition hover:border-gold hover:text-gold"
              >
                {name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-xl bg-gold px-6 text-base text-gold-foreground hover:bg-gold/90">
              <Link to="/sell">
                <Tag className="mr-2 h-5 w-5" />
                Sell your car
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-primary-foreground/40 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/dealers">
                <Store className="mr-2 h-5 w-5" />
                Find car stands
              </Link>
            </Button>
          </div>
        </div>

        <div className="hidden xl:block">
          <TrustPanel />
        </div>
      </div>
    </section>
  );
};
