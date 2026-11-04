import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { moatwaveFeature, type MoatwaveFeatureId } from "@/config/moatwave";

/** Marks anything that shows a Moatwave feature which isn't active yet. */
export const PreviewBadge = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex shrink-0 items-center rounded-full border border-gold/70 bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-foreground ${className}`}
  >
    Preview
  </span>
);

/** Tells the reader that what follows is example content, not a real record. */
export const SampleLabel = ({ children = "Example only" }: { children?: ReactNode }) => (
  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{children}</p>
);

interface PreviewPanelProps {
  feature: MoatwaveFeatureId;
  /** Defaults to the feature's name. */
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/**
 * A Moatwave feature shown before Moatwave is connected. The dashed gold frame, the Preview badge
 * and the footnote all say it isn't active, so nothing inside can be mistaken for a live service.
 */
export const PreviewPanel = ({ feature, title, subtitle, children, className = "" }: PreviewPanelProps) => {
  const { name, icon: Icon, role } = moatwaveFeature(feature);
  return (
    <section className={`rounded-2xl border-2 border-dashed border-gold/60 bg-card p-5 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-gold">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold leading-tight">{title ?? name}</h2>
            <PreviewBadge />
          </div>
          <p className="text-sm text-muted-foreground">{subtitle ?? `${role} · Powered by Moatwave`}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
      <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
        {name} isn't active yet. This preview shows how it will work once Motorcars is connected to Moatwave.{" "}
        <Link to={`/moatwave#${feature}`} className="font-semibold text-primary hover:underline">
          How it will work
        </Link>
      </p>
    </section>
  );
};
