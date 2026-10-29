import { Link } from "react-router-dom";
import { Clock, HelpCircle, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { CONTACT } from "@/config/contact";

import { usePageMeta } from "@/hooks/usePageMeta";
// Only confirmed contact details are shown (see src/config/contact.ts).
// The previous form was never submitted anywhere, so email is the contact route.
const Contact = () => {
  usePageMeta({ title: "Contact", description: "Contact the Motorcars team about your account, a listing or registering your car stand." });
  const details = [
    { icon: Mail, label: "Email", value: CONTACT.supportEmail, href: `mailto:${CONTACT.supportEmail}` },
    CONTACT.phone && { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone}` },
    CONTACT.address && { icon: MapPin, label: "Office", value: CONTACT.address },
    CONTACT.hours && { icon: Clock, label: "Hours", value: CONTACT.hours },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-brand-dark text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Contact</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Talk to the Motorcars team</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Questions about your account, a listing, or registering your car stand. For a specific car, contact the
            seller from the listing page.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Reach us</h2>
          <ul className="mt-5 space-y-4">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-brand-dark">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                  {href ? (
                    <a href={href} className="font-semibold text-primary hover:underline">{value}</a>
                  ) : (
                    <p className="font-semibold">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-6 w-full rounded-xl">
            <a href={`mailto:${CONTACT.supportEmail}?subject=${encodeURIComponent("Motorcars enquiry")}`}>
              <Mail className="mr-2 h-4 w-4" />
              Send us an email
            </a>
          </Button>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">Before you write</h2>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">About a car:</span> use the contact buttons on the
              listing to reach the seller directly.
            </li>
            <li>
              <span className="font-semibold text-foreground">Registering a stand:</span> start from{" "}
              <Link to="/dealer-registration" className="font-semibold text-primary hover:underline">dealer registration</Link>.
            </li>
            <li>
              <span className="font-semibold text-foreground">A suspicious listing:</span> email us the listing link and
              what looks wrong.
            </li>
          </ul>
          <Button asChild variant="outline" size="lg" className="mt-6 w-full rounded-xl">
            <Link to="/help">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help centre
            </Link>
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
