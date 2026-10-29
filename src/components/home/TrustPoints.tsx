import { ClipboardCheck, MapPinned, MessageCircle, Store, type LucideIcon } from "lucide-react";

// Statements the product can stand behind today: dealers are admin-approved before they are
// listed publicly, and contact and inspection happen directly between buyer and seller.
const TRUST_POINTS:{ icon: LucideIcon; title: string; text: string }[] = [
  { icon: Store, title: "Approved businesses", text: "Dealers and stands are reviewed before they appear" },
  { icon: MessageCircle, title: "Contact sellers directly", text: "Message or call the seller about any car" },
  { icon: MapPinned, title: "Across Nigeria", text: "Search by state, city and area" },
  { icon: ClipboardCheck, title: "Inspect before you pay", text: "See the car and its papers in person" },
];

/** Glass panel beside the hero headline on wide screens. */
export const TrustPanel = () => (
  <ul className="space-y-5 rounded-2xl border border-white/15 bg-brand-dark/70 p-6 shadow-2xl backdrop-blur-md">
    {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
      <li key={title} className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/40">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-primary-foreground">{title}</p>
          <p className="text-sm text-primary-foreground/70">{text}</p>
        </div>
      </li>
    ))}
  </ul>
);

/** The same points as a strip under the hero where the panel does not fit. */
export const TrustStrip = () => (
  <section aria-label="Why buy on Motorcars" className="border-b bg-card xl:hidden">
    <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-brand-dark">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);
