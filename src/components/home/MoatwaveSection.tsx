import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewBadge } from "@/components/moatwave/PreviewPanel";
import { MOATWAVE_FEATURES } from "@/config/moatwave";

/** Introduces the Moatwave features. They are in development, and the section says so before anything else. */
export const MoatwaveSection = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="moatwave-heading">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Powered by Moatwave <PreviewBadge />
        </p>
        <h2 id="moatwave-heading" className="mt-3 text-3xl font-extrabold md:text-4xl">What's coming to Motorcars</h2>
        <p className="mt-2 text-muted-foreground">
          Five Moatwave features are in development. Look for the Preview label around the site to see where each will
          appear. None is active yet.
        </p>
      </div>
      <Button asChild variant="outline" className="shrink-0">
        <Link to="/moatwave">See how it will work <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>

    <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {MOATWAVE_FEATURES.map(({ id, name, role, icon: Icon, tagline }) => (
        <li key={id}>
          <Link
            to={`/moatwave#${id}`}
            className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-dark text-gold"><Icon className="h-5 w-5" /></span>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">{role}</p>
            <p className="text-lg font-bold">{name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
          </Link>
        </li>
      ))}
    </ul>
  </section>
);
