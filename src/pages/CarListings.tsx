import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertCircle, Car, RefreshCw, SearchX, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Footer } from "@/components/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { AppliedFilters } from "@/components/listings/AppliedFilters";
import { VehicleCard, VehicleCardSkeleton } from "@/components/home/VehicleCard";
import { SEARCH_LIMIT, searchListings } from "@/services/listings";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { ArgusSearchAssistant } from "@/components/argus/ArgusSearchAssistant";
import { ArgusSearchBox } from "@/components/moatwave/ArgusSearchBox";
import {
  EMPTY_CRITERIA,
  SORT_OPTIONS,
  activeFilterCount,
  criteriaToParams,
  parseCriteria,
  type SearchCriteria,
  type SortOption,
} from "@/lib/vehicleSearch";

const PAGE_SIZE = 24;

// Parameters this page owns, including the legacy ones folded into criteria on load.
// Anything else in the URL (for example campaign tags) is carried along untouched.
const OWNED_PARAMS = new Set([
  ...Object.keys(EMPTY_CRITERIA),
  "brand", "type", "categories", "fuelType",
]);

const CarListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const criteria = useMemo(() => parseCriteria(searchParams), [searchParams]);
  const place = criteria.location === "FCT" ? "Abuja" : criteria.location;
  usePageMeta({
    title: `${criteria.make ? `${criteria.make} cars` : "Cars"} for sale${place ? ` in ${place}` : " in Nigeria"}`,
    description: `Browse ${criteria.make ? `${criteria.make} ` : ""}cars for sale${place ? ` in ${place}` : " across Nigeria"} from dealers, car stands and private sellers on Motorcars.`,
  });
  const argusMode = useFeatureMode("argus");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const writeCriteria = useCallback(
    (next: SearchCriteria) => {
      const params = criteriaToParams(next);
      searchParams.forEach((value, key) => {
        if (!OWNED_PARAMS.has(key)) params.append(key, value);
      });
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Rewrite legacy links (?category=toyota, ?type=foreign-used) into their canonical form once
  useEffect(() => {
    const canonical = criteriaToParams(criteria);
    const owned = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (OWNED_PARAMS.has(key)) owned.append(key, value);
    });
    if (canonical.toString() !== owned.toString()) writeCriteria(criteria);
  }, [criteria, searchParams, writeCriteria]);

  const updateCriteria = useCallback(
    (patch: Partial<SearchCriteria>) => writeCriteria({ ...criteria, ...patch }),
    [criteria, writeCriteria]
  );

  const clearAll = useCallback(() => writeCriteria({ ...EMPTY_CRITERIA }), [writeCriteria]);

  const queryKey = criteriaToParams(criteria).toString();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["search", queryKey],
    queryFn: () => searchListings(criteria),
    placeholderData: keepPreviousData,
    retry: 1,
    staleTime: 60_000,
  });

  useEffect(() => setVisible(PAGE_SIZE), [queryKey]);

  const listings = data?.listings ?? [];
  const filterCount = activeFilterCount(criteria);
  const sortOptions = SORT_OPTIONS.filter((option) => option.id !== "relevance" || criteria.search);

  const resultSummary = isLoading
    ? "Searching…"
    : isError
      ? "Results unavailable"
      : `${listings.length.toLocaleString("en-NG")}${data?.truncated ? "+" : ""} ${listings.length === 1 ? "car" : "cars"}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">Cars for sale</h1>
            <p className="mt-1 text-muted-foreground" aria-live="polite">
              {resultSummary}
              {isFetching && !isLoading && <span className="ml-2 text-xs">Updating…</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filters open in a sheet below the desktop breakpoint */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters{filterCount > 0 ? ` (${filterCount})` : ""}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] overflow-y-auto bg-background sm:max-w-sm">
                <SheetHeader className="mb-4">
                  <SheetTitle>Filter cars</SheetTitle>
                </SheetHeader>
                <FilterPanel criteria={criteria} onChange={updateCriteria} onClearAll={clearAll} />
                <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
                  Show {isLoading ? "" : `${listings.length} `}results
                </Button>
              </SheetContent>
            </Sheet>

            <label htmlFor="sort" className="sr-only">Sort by</label>
            <select
              id="sort"
              value={criteria.sort}
              onChange={(event) => updateCriteria({ sort: event.target.value as SortOption })}
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {argusMode === "preview" && (
          <div className="mt-4">
            <ArgusSearchBox onApply={(next) => writeCriteria(next)} />
          </div>
        )}
        {(argusMode === "motorcars" || argusMode === "moatwave") && (
          <div className="mt-4">
            <ArgusSearchAssistant onApply={(next) => writeCriteria(next)} />
          </div>
        )}

        <div className="mt-4">
          <AppliedFilters criteria={criteria} onChange={updateCriteria} onClearAll={clearAll} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border bg-card p-5 shadow-sm">
              <FilterPanel criteria={criteria} onChange={updateCriteria} onClearAll={clearAll} />
            </div>
          </aside>

          <section aria-label="Results">
            {isLoading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <VehicleCardSkeleton key={index} />
                ))}
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-lg font-semibold">We couldn't load cars right now.</p>
                <p className="text-sm text-muted-foreground">
                  Your filters are kept. Check your connection and try again.
                </p>
                <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                  Try again
                </Button>
              </div>
            )}

            {!isLoading && !isError && listings.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-10 text-center">
                {filterCount > 0 ? (
                  <>
                    <SearchX className="h-10 w-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">No cars match these filters</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Try removing a filter above, widening the price range or searching a nearby state.
                    </p>
                    <Button onClick={clearAll}>Clear all filters</Button>
                  </>
                ) : (
                  <>
                    <Car className="h-10 w-10 text-muted-foreground" />
                    <p className="text-lg font-semibold">No cars are listed yet</p>
                    <Button asChild>
                      <Link to="/sell">List a car</Link>
                    </Button>
                  </>
                )}
              </div>
            )}

            {!isError && listings.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.slice(0, visible).map((listing) => (
                    <VehicleCard key={listing.id} listing={listing} />
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <p>
                    Showing {Math.min(visible, listings.length).toLocaleString("en-NG")} of{" "}
                    {listings.length.toLocaleString("en-NG")}
                  </p>
                  {visible < listings.length && (
                    <Button variant="outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                      Show more cars
                    </Button>
                  )}
                  {data?.truncated && (
                    <p className="max-w-md text-center text-xs">
                      Results come from the newest {SEARCH_LIMIT.toLocaleString("en-NG")} listings that fit your
                      price, year and condition. Narrow your filters to see older ones.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CarListings;
