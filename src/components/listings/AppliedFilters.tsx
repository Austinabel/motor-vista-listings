import { X } from "lucide-react";
import { formatNaira } from "@/lib/format";
import {
  CONDITIONS,
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
  type SearchCriteria,
} from "@/lib/vehicleSearch";

const labelFrom = (list: { id: string; label: string }[], id: string) => list.find((item) => item.id === id)?.label ?? id;

const naira = (value: string) => (Number(value) ? formatNaira(Number(value)) : value);

/** One removable chip per active filter, in the order buyers usually read them. */
const chipsFor = (criteria: SearchCriteria): { label: string; clear: Partial<SearchCriteria> }[] => {
  const chips: { label: string; clear: Partial<SearchCriteria> }[] = [];
  if (criteria.search) chips.push({ label: `"${criteria.search}"`, clear: { search: "", sort: "newest" } });
  if (criteria.make) chips.push({ label: criteria.make, clear: { make: "" } });
  if (criteria.model) chips.push({ label: `Model: ${criteria.model}`, clear: { model: "" } });
  if (criteria.category) chips.push({ label: labelFrom(VEHICLE_TYPES, criteria.category), clear: { category: "" } });
  if (criteria.condition) chips.push({ label: labelFrom(CONDITIONS, criteria.condition), clear: { condition: "" } });
  if (criteria.location) chips.push({ label: criteria.location === "FCT" ? "Abuja (FCT)" : criteria.location, clear: { location: "" } });
  if (criteria.minPrice && criteria.maxPrice) {
    chips.push({ label: `${naira(criteria.minPrice)} – ${naira(criteria.maxPrice)}`, clear: { minPrice: "", maxPrice: "" } });
  } else if (criteria.minPrice) {
    chips.push({ label: `From ${naira(criteria.minPrice)}`, clear: { minPrice: "" } });
  } else if (criteria.maxPrice) {
    chips.push({ label: `Up to ${naira(criteria.maxPrice)}`, clear: { maxPrice: "" } });
  }
  if (criteria.yearFrom || criteria.yearTo) {
    const label = criteria.yearFrom && criteria.yearTo
      ? `${criteria.yearFrom} – ${criteria.yearTo}`
      : criteria.yearFrom ? `${criteria.yearFrom} or newer` : `${criteria.yearTo} or older`;
    chips.push({ label, clear: { yearFrom: "", yearTo: "" } });
  }
  if (criteria.fuel) chips.push({ label: labelFrom(FUEL_TYPES, criteria.fuel), clear: { fuel: "" } });
  if (criteria.transmission) chips.push({ label: labelFrom(TRANSMISSIONS, criteria.transmission), clear: { transmission: "" } });
  return chips;
};

interface AppliedFiltersProps {
  criteria: SearchCriteria;
  onChange: (patch: Partial<SearchCriteria>) => void;
  onClearAll: () => void;
}

export const AppliedFilters = ({ criteria, onChange, onClearAll }: AppliedFiltersProps) => {
  const chips = chipsFor(criteria);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onChange(chip.clear)}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground transition hover:bg-accent/70"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
      <button type="button" onClick={onClearAll} className="text-sm font-semibold text-primary hover:underline">
        Clear all
      </button>
    </div>
  );
};
