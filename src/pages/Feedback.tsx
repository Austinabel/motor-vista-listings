import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { CONTACT } from "@/config/contact";

// The previous page displayed invented feedback and never saved what users wrote.
// Until feedback is stored, it is sent by email so nothing a user writes is lost.
const Feedback = () => (
  <div className="min-h-screen bg-background">
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark text-gold">
        <MessageSquareHeart className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-4xl font-extrabold">Tell us what you think</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Something confusing, broken or missing? We read every message and use it to decide what to build next.
      </p>
      <Button asChild size="lg" className="mt-8 rounded-xl">
        <a href={`mailto:${CONTACT.supportEmail}?subject=${encodeURIComponent("Motorcars feedback")}`}>
          Email your feedback
        </a>
      </Button>
      <p className="mt-3 text-sm text-muted-foreground">Opens your email app, addressed to {CONTACT.supportEmail}</p>
    </section>
    <Footer />
  </div>
);

export default Feedback;
