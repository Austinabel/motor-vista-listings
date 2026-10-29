import { Link } from "react-router-dom";
import { ArrowRight, Clock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** What the buyer can do on Motorcars today instead */
  meanwhile: string;
}

/** Placeholder for a planned service that is not available yet; it never collects data. */
export const ComingSoon = ({ icon: Icon, title, description, meanwhile }: ComingSoonProps) => (
  <div className="min-h-screen bg-background">
    <section className="bg-brand-dark text-primary-foreground">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-24">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-gold-foreground">
          <Icon className="h-8 w-8" />
        </span>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-bold text-gold">
          <Clock className="h-4 w-4" />
          Coming soon
        </p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">{description}</p>
      </div>
    </section>
    <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
      <p className="text-lg text-muted-foreground">{meanwhile}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-xl">
          <Link to="/cars">
            Browse cars
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link to="/dealers">Find car stands</Link>
        </Button>
      </div>
    </section>
    <Footer />
  </div>
);
