import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  /** Light text for dark sections */
  inverted?: boolean;
}

export const SectionHeading = ({ title, subtitle, icon: Icon, actionLabel, actionHref, inverted }: SectionHeadingProps) => (
  <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex items-start gap-4">
      {Icon && (
        <span className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40 sm:flex">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <div>
        <h2 className={`text-2xl font-extrabold md:text-[2rem] md:leading-tight ${inverted ? "text-primary-foreground" : "text-foreground"}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-1.5 text-base ${inverted ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{subtitle}</p>
        )}
      </div>
    </div>
    {actionLabel && actionHref && (
      <Link
        to={actionHref}
        className={`inline-flex shrink-0 items-center gap-1 text-sm font-bold hover:underline ${inverted ? "text-gold" : "text-primary"}`}
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  </div>
);
