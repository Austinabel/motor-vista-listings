import { Link } from "react-router-dom";
import { ClipboardCheck, MessageCircle, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";

// No statistics or superlatives here: only claims the product can stand behind.
const PRINCIPLES = [
  { icon: Store, title: "Real businesses", text: "Dealers and car stands are reviewed by our team before they appear on Motorcars." },
  { icon: MessageCircle, title: "Direct contact", text: "Buyers talk to the seller themselves, about the car in the listing." },
  { icon: ClipboardCheck, title: "Honest listings", text: "Seller-provided details are labelled as such, and availability is never shown as confirmed unless the seller confirmed it." },
  { icon: Tag, title: "Open to sellers", text: "Private sellers and dealers can both list cars, with photos and their own price." },
];

const About = () => {
  usePageMeta({ title: "About Motorcars" });
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-brand-dark text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">About</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Real Dealers. Real Cars. Live Stands.</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Motorcars is a Nigerian car marketplace. We help buyers find cars from dealers, car stands and private sellers,
            see who is selling, and contact them directly. Motorcars is powered by Moatwave.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-extrabold">How we work</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border bg-card p-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-dark text-gold"><Icon className="h-5 w-5" /></span>
              <p className="mt-4 text-lg font-bold">{title}</p>
              <p className="mt-1 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">What we don't do</h2>
          <p className="mt-2 text-muted-foreground">
            Motorcars does not inspect cars, hold payments or deliver vehicles. Agree the sale with the seller, and see the car
            and its documents in person before you pay.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-xl"><Link to="/cars">Browse cars</Link></Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl"><Link to="/dealer-registration">Register your business</Link></Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
