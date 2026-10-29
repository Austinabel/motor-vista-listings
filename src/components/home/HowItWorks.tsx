import { ClipboardCheck, MessageCircle, Search, UserCheck } from "lucide-react";

const STEPS = [
  { icon: Search, title: "Find the car", text: "Search by make, budget, condition and state." },
  { icon: UserCheck, title: "Check the seller", text: "See who is selling and where their stand is." },
  { icon: MessageCircle, title: "Contact the seller", text: "Message or call to confirm the car is still available." },
  { icon: ClipboardCheck, title: "Inspect before you pay", text: "See the car and its papers in person before any payment." },
];

export const HowItWorks = () => (
  <section className="bg-brand-dark text-primary-foreground">
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">How Motorcars works</p>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">A safer, simpler way to buy a car in Nigeria</h2>
      </div>
      <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="relative rounded-2xl bg-primary-foreground/5 p-6 ring-1 ring-primary-foreground/10">
            <span className="absolute right-5 top-4 text-5xl font-black text-gold/25" aria-hidden>
              {index + 1}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Icon className="h-6 w-6" />
            </span>
            <p className="mt-5 text-sm font-bold text-gold">Step {index + 1}</p>
            <p className="mt-1 text-xl font-bold">{title}</p>
            <p className="mt-2 text-primary-foreground/75">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
