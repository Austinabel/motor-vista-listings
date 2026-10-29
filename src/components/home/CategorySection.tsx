import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/home/SectionHeading";

// Category ids are vehicle types /cars understands via ?category=.
// Photos are illustrative category images, not listings.
const VEHICLE_TYPES = [
  { id: "suv", label: "SUVs & 4x4s", hint: "Family and rough roads", image: "type-suv" },
  { id: "sedan", label: "Sedans", hint: "Everyday comfort", image: "type-sedan" },
  { id: "pickups", label: "Pickups", hint: "Work and haulage", image: "type-pickup" },
  { id: "buses-shuttles", label: "Buses & vans", hint: "People and business", image: "type-bus" },
  { id: "trucks", label: "Trucks", hint: "Heavy duty", image: "type-truck" },
  { id: "motorbikes", label: "Motorcycles", hint: "Two wheels", image: "type-motorcycle" },
  { id: "tricycles", label: "Tricycles (Keke)", hint: "Affordable transport", image: "type-tricycle" },
  { id: "electric-cars", label: "Electric & hybrid", hint: "Lower fuel costs", image: "type-electric" },
];

export const CategorySection = () => (
  <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
    <SectionHeading title="Shop by vehicle type" subtitle="Jump straight to the kind of vehicle you need." />

    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-5">
      {VEHICLE_TYPES.map((type) => (
        <Link
          key={type.id}
          to={`/cars?category=${type.id}`}
          className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={`/images/home/${type.image}.webp`}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <p className="text-base font-bold text-foreground md:text-lg">{type.label}</p>
            <p className="text-sm text-muted-foreground">{type.hint}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);
