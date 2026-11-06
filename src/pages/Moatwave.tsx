import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Camera, Car, CheckCircle2, CircleHelp, Fingerprint, HandCoins, Sparkles, Users, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { PreviewBadge, SampleLabel } from "@/components/moatwave/PreviewPanel";
import { MOATWAVE_FEATURES, type MoatwaveFeatureId } from "@/config/moatwave";
import { usePageMeta } from "@/hooks/usePageMeta";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/** A sample screen. Everything inside is invented for illustration, and the frame says so. */
const SampleScreen = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border-2 border-dashed border-gold/60 bg-background p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-2">
      <SampleLabel>Sample screen · example data</SampleLabel>
      <PreviewBadge />
    </div>
    {children}
  </div>
);

const MidSample = () => (
  <SampleScreen>
    <div className="rounded-xl bg-brand-dark p-5 text-primary-foreground">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-xl font-black text-gold-foreground">E</span>
        <div>
          <p className="font-bold">Example Motors Ltd</p>
          <p className="text-sm text-primary-foreground/70">Car stand · Lagos</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-primary-foreground/10 p-3">
          <p className="flex items-center gap-1 text-xs text-primary-foreground/70"><Fingerprint className="h-3.5 w-3.5" />MID</p>
          <p className="font-mono font-semibold">MID-XXXX-XXXXXXXX</p>
        </div>
        <div className="rounded-lg bg-primary-foreground/10 p-3">
          <p className="flex items-center gap-1 text-xs text-primary-foreground/70"><BadgeCheck className="h-3.5 w-3.5" />Business check</p>
          <p className="font-semibold">CAC and owner ID reviewed</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-primary-foreground/80"><Users className="h-4 w-4" />3 staff linked to this stand</p>
    </div>
  </SampleScreen>
);

const WaveChatSample = () => (
  <SampleScreen>
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b p-3">
        <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Car className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-semibold">Example car · 2018 saloon</p>
          <p className="text-sm font-bold text-primary">Asking price</p>
        </div>
      </div>
      <div className="space-y-2 p-3 text-sm">
        <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">Hello, is this car still available?</p>
        <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">Yes, it's on the stand. When would you like to see it?</p>
        <p className="mx-auto w-fit rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">Inspection requested · Saturday, 10am</p>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t p-3 text-xs font-semibold">
        {[[CircleHelp, "Ask if available"], [Camera, "Request more photos"], [Wrench, "Arrange inspection"], [HandCoins, "Make an offer"]].map(([Icon, label]) => {
          const I = Icon as typeof Car;
          return <span key={label as string} className="flex items-center gap-1.5 rounded-lg border px-2 py-1.5"><I className="h-3.5 w-3.5" />{label as string}</span>;
        })}
      </div>
    </div>
  </SampleScreen>
);

const OioSample = () => (
  <SampleScreen>
    <div className="overflow-hidden rounded-xl border bg-card text-sm">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="font-semibold">Stand inventory</p>
        <p className="text-xs text-primary">Synced with Open Inventory</p>
      </div>
      {[["Example SUV", "Available", "bg-primary text-primary-foreground"], ["Example saloon", "Reserved", "bg-gold text-gold-foreground"], ["Example pickup", "Sold", "bg-muted text-muted-foreground"]].map(([car, status, tone]) => (
        <div key={car} className="flex items-center justify-between border-b px-3 py-2.5 last:border-0">
          <span>{car}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{status}</span>
        </div>
      ))}
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Marked sold on the stand → removed from Motorcars search straight away.</p>
  </SampleScreen>
);

const ConscienceSample = () => (
  <SampleScreen>
    <ul className="space-y-2 rounded-xl border bg-card p-4 text-sm">
      {["Business reviewed: CAC number and owner ID", "Availability confirmed 2 days ago", "Cycle 5 under way: day 9 of 14", "4 of 4 sealed cycles clean"].map((text) => (
        <li key={text} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />{text}</li>
      ))}
    </ul>
    <p className="mt-2 text-xs text-muted-foreground">12 days observed, 48 hours to put things right, then sealed for good. Sample figures.</p>
  </SampleScreen>
);

const ArgusSample = () => (
  <SampleScreen>
    <div className="space-y-3 rounded-xl border bg-card p-4 text-sm">
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
        Family SUV under 15 million in Lagos. What should I check?
      </p>
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
        <p className="flex items-center gap-1.5 font-semibold"><Sparkles className="h-4 w-4 text-primary" />Argus</p>
        <p className="mt-1">I found matching listings on Motorcars. Two don't state mileage, so ask the sellers. At inspection, check the customs papers and look for flood damage under the carpets.</p>
      </div>
    </div>
  </SampleScreen>
);

const SAMPLES: Record<MoatwaveFeatureId, () => ReactNode> = {
  mid: MidSample,
  wavechat: WaveChatSample,
  oio: OioSample,
  conscience: ConscienceSample,
  argus: ArgusSample,
};

const Moatwave = () => {
  usePageMeta({
    title: "Powered by Moatwave",
    description: "How Motorcars will work with Moatwave: MID, WaveChat, Open Inventory, Conscience Protocol and Argus.",
  });
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <section className="bg-brand-dark text-primary-foreground">
        <div className={`${container} py-14 md:py-20`}>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Powered by Moatwave</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold md:text-5xl">How Motorcars will work with Moatwave</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Five Moatwave features will run underneath Motorcars. Moatwave is still being built, so none of them is active
            yet. Around the site you'll find previews marked <span className="font-semibold text-gold">Preview</span> that
            show where each one will appear.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Features">
            {MOATWAVE_FEATURES.map(({ id, name, icon: Icon }) => (
              <a key={id} href={`#${id}`} className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-4 py-2 text-sm font-semibold hover:bg-primary-foreground/10">
                <Icon className="h-4 w-4 text-gold" />
                {name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className={`${container} space-y-16 py-14 md:space-y-24 md:py-20`}>
        {MOATWAVE_FEATURES.map((feature, index) => {
          const Sample = SAMPLES[feature.id];
          const Icon = feature.icon;
          return (
            <section key={feature.id} id={feature.id} className="scroll-mt-24">
              <div className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14 ${index % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-dark text-gold"><Icon className="h-5 w-5" /></span>
                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">{feature.role}</p>
                  </div>
                  <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{feature.name}</h2>
                  <p className="mt-2 text-lg font-semibold text-foreground/80">{feature.tagline}</p>
                  <p className="mt-3 text-muted-foreground">{feature.summary}</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {[["For buyers", feature.forBuyers], ["For dealers and stands", feature.forDealers]].map(([heading, items]) => (
                      <div key={heading as string}>
                        <p className="text-sm font-bold">{heading as string}</p>
                        <ul className="mt-1.5 space-y-1.5 text-sm text-muted-foreground">
                          {(items as string[]).map((item) => (
                            <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl bg-muted/70 p-4 text-sm">
                    <p><span className="font-semibold">Preview on Motorcars:</span> {feature.seenOn.join(", ")}</p>
                    <p className="mt-1"><span className="font-semibold">Today:</span> {feature.today}</p>
                  </div>
                </div>
                <Sample />
              </div>
            </section>
          );
        })}

        <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center md:p-8">
          <div>
            <p className="text-xl font-extrabold">See the previews on real listings</p>
            <p className="text-primary-foreground/80">Open any car to see WaveChat, Argus and the seller trust record in place.</p>
          </div>
          <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/cars">Browse cars <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Moatwave;
