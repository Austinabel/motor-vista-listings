import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Text tiles: no manufacturer logos are licensed for use, so none are drawn
const MAKES = ["Toyota", "Lexus", "Honda", "Mercedes-Benz", "Hyundai", "Kia", "Ford", "Nissan", "BMW", "Suzuki"];

export const PopularMakes = () => (
  <aside className="rounded-2xl border bg-card p-6 shadow-sm" aria-labelledby="popular-makes">
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 id="popular-makes" className="text-xl font-extrabold">Popular makes</h2>
        <p className="text-sm text-muted-foreground">Browse by brand</p>
      </div>
      <Link to="/cars" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
        All cars
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-1">
      {MAKES.map((make) => (
        <Link
          key={make}
          to={`/cars?make=${encodeURIComponent(make)}`}
          className="group flex items-center gap-3 rounded-xl border bg-background px-3 py-3 transition hover:border-primary hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-dark text-sm font-black text-gold">
            {make.charAt(0)}
          </span>
          <span className="truncate text-sm font-semibold group-hover:text-primary">{make}</span>
        </Link>
      ))}
    </div>
  </aside>
);
