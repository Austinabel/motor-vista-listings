import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import {
  CAR_MAKES,
  CONDITIONS,
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
  type SearchCriteria,
} from "@/lib/vehicleSearch";

interface FilterPanelProps {
  criteria: SearchCriteria;
  onChange: (patch: Partial<SearchCriteria>) => void;
  onClearAll: () => void;
}

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear + 1 - 1980 + 1 }, (_, index) => String(currentYear + 1 - index));

/** Text input that reports its value after the buyer stops typing, so the URL is not rewritten per keystroke. */
const DebouncedInput = ({
  value,
  onCommit,
  ...props
}: { value: string; onCommit: (value: string) => void } & Omit<ComponentProps<typeof Input>, "value" | "onChange">) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onCommit(draft.trim()), 500);
    return () => window.clearTimeout(timer);
  }, [draft, value, onCommit]);

  return (
    <Input
      {...props}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onCommit(draft.trim());
      }}
    />
  );
};

const Field = ({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-sm font-semibold">{label}</Label>
    {children}
  </div>
);

export const FilterPanel = ({ criteria, onChange, onClearAll }: FilterPanelProps) => (
  <div className="space-y-5">
    <Field label="Search" htmlFor="filter-search">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <DebouncedInput
          id="filter-search"
          value={criteria.search}
          onCommit={(search) => onChange({ search, sort: search ? "relevance" : "newest" })}
          placeholder="e.g. Corolla 2012"
          className="pl-9"
        />
      </div>
    </Field>

    <Field label="Make" htmlFor="filter-make">
      <select id="filter-make" className={selectClass} value={criteria.make} onChange={(e) => onChange({ make: e.target.value })}>
        <option value="">Any make</option>
        {/* Keep a make from the URL selectable even when it is not in the list */}
        {criteria.make && !CAR_MAKES.includes(criteria.make) && <option value={criteria.make}>{criteria.make}</option>}
        {CAR_MAKES.map((make) => (
          <option key={make} value={make}>{make}</option>
        ))}
      </select>
    </Field>

    <Field label="Model" htmlFor="filter-model">
      <DebouncedInput id="filter-model" value={criteria.model} onCommit={(model) => onChange({ model })} placeholder="e.g. Camry" />
    </Field>

    <Field label="Vehicle type" htmlFor="filter-type">
      <select id="filter-type" className={selectClass} value={criteria.category} onChange={(e) => onChange({ category: e.target.value })}>
        <option value="">All vehicles</option>
        {VEHICLE_TYPES.map((type) => (
          <option key={type.id} value={type.id}>{type.label}</option>
        ))}
      </select>
    </Field>

    <fieldset className="space-y-1.5">
      <legend className="text-sm font-semibold">Condition</legend>
      <div className="flex flex-wrap gap-2 pt-1">
        {[{ id: "", label: "Any" }, ...CONDITIONS].map((condition) => (
          <button
            key={condition.id || "any"}
            type="button"
            aria-pressed={criteria.condition === condition.id}
            onClick={() => onChange({ condition: condition.id })}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              criteria.condition === condition.id
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:border-primary hover:text-primary"
            }`}
          >
            {condition.label}
          </button>
        ))}
      </div>
    </fieldset>

    <Field label="State" htmlFor="filter-location">
      <select id="filter-location" className={selectClass} value={criteria.location} onChange={(e) => onChange({ location: e.target.value })}>
        <option value="">Anywhere in Nigeria</option>
        {criteria.location && !NIGERIAN_STATES.includes(criteria.location) && (
          <option value={criteria.location}>{criteria.location}</option>
        )}
        {NIGERIAN_STATES.map((state) => (
          <option key={state} value={state}>{state === "FCT" ? "Abuja (FCT)" : state}</option>
        ))}
      </select>
    </Field>

    <fieldset className="space-y-1.5">
      <legend className="text-sm font-semibold">Price (₦)</legend>
      <div className="grid grid-cols-2 gap-2">
        <DebouncedInput
          aria-label="Minimum price in naira"
          inputMode="numeric"
          value={criteria.minPrice}
          onCommit={(minPrice) => onChange({ minPrice: minPrice.replace(/\D/g, "") })}
          placeholder="Min"
        />
        <DebouncedInput
          aria-label="Maximum price in naira"
          inputMode="numeric"
          value={criteria.maxPrice}
          onCommit={(maxPrice) => onChange({ maxPrice: maxPrice.replace(/\D/g, "") })}
          placeholder="Max"
        />
      </div>
    </fieldset>

    <fieldset className="space-y-1.5">
      <legend className="text-sm font-semibold">Year</legend>
      <div className="grid grid-cols-2 gap-2">
        <select aria-label="Year from" className={selectClass} value={criteria.yearFrom} onChange={(e) => onChange({ yearFrom: e.target.value })}>
          <option value="">From</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select aria-label="Year to" className={selectClass} value={criteria.yearTo} onChange={(e) => onChange({ yearTo: e.target.value })}>
          <option value="">To</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </fieldset>

    <div className="grid grid-cols-2 gap-2">
      <Field label="Fuel" htmlFor="filter-fuel">
        <select id="filter-fuel" className={selectClass} value={criteria.fuel} onChange={(e) => onChange({ fuel: e.target.value })}>
          <option value="">Any</option>
          {FUEL_TYPES.map((fuel) => (
            <option key={fuel.id} value={fuel.id}>{fuel.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Gearbox" htmlFor="filter-transmission">
        <select id="filter-transmission" className={selectClass} value={criteria.transmission} onChange={(e) => onChange({ transmission: e.target.value })}>
          <option value="">Any</option>
          {TRANSMISSIONS.map((transmission) => (
            <option key={transmission.id} value={transmission.id}>{transmission.label}</option>
          ))}
        </select>
      </Field>
    </div>

    <Button variant="outline" className="w-full" onClick={onClearAll}>
      Clear all filters
    </Button>
  </div>
);
