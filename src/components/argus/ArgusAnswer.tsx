import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { ArgusCar } from "@/lib/argus";
import { formatNaira } from "@/lib/format";

/** Claude's reply and the real listings it pointed to. Car details here come from the database, not from Claude. */
export const ArgusAnswer = ({ answer, cars }: { answer: string; cars: ArgusCar[] }) => (
  <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm" aria-live="polite">
    <p className="flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4 text-primary" />Argus</p>
    <p className="mt-1 whitespace-pre-line">{answer}</p>
    {cars.length > 0 && (
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {cars.map((car) => (
          <li key={car.id}>
            <Link to={`/cars/${car.id}`} className="block rounded-lg border bg-card px-3 py-2 hover:border-primary">
              <span className="block truncate font-semibold">{car.title}</span>
              <span className="block text-xs text-muted-foreground">{formatNaira(car.price)} · {car.location}</span>
            </Link>
          </li>
        ))}
      </ul>
    )}
    <p className="mt-2 text-xs text-muted-foreground">Argus is AI and can make mistakes. Check the details with the seller before you pay.</p>
  </div>
);
