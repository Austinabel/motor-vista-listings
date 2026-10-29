import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { CONTACT } from "@/config/contact";
import { usePageMeta } from "@/hooks/usePageMeta";

// Answers describe what Motorcars actually does today; update them when the product changes.
const FAQS = [
  {
    question: "How do I buy a car on Motorcars?",
    answer:
      "Search or browse the cars for sale, open a listing to see its photos and details, then contact the seller from the listing. Arrange to see the car and its papers in person before you pay anything. Motorcars does not handle payment or delivery.",
  },
  {
    question: "Are dealers checked?",
    answer:
      "Before a dealer or car stand appears on Motorcars, our team reviews the business registration (CAC) number and the owner's ID document they submit. That review does not check individual cars, so always inspect a car yourself before paying.",
  },
  {
    question: "Are the car details checked?",
    answer:
      "No. Specifications, condition and mileage are provided by the seller. Every listing says so. Ask the seller questions and inspect the car before you decide.",
  },
  {
    question: "How do I sell my car?",
    answer:
      "Create an account, then fill in the sell form with your car's details and photos. Listings are reviewed by our team before they appear in search.",
  },
  {
    question: "How do I pay for a car?",
    answer:
      "You agree payment directly with the seller. Never pay before you have seen the car and its documents in person, and be wary of anyone who asks for a deposit to hold a car you have not seen.",
  },
  {
    question: "Does Motorcars offer financing or insurance?",
    answer: "Not yet. Some dealers offer their own payment plans; ask them directly.",
  },
  {
    question: "How do I report a suspicious listing or seller?",
    answer: `Email ${CONTACT.supportEmail} with the listing link and what looks wrong. We review every report.`,
  },
];

const Help = () => {
  usePageMeta({ title: "Help centre" });
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-brand-dark text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Help centre</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">How can we help?</h1>
          <p className="mt-3 text-lg text-primary-foreground/80">Answers about buying, selling and staying safe on Motorcars.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border bg-card p-2 shadow-sm sm:p-4">
          <Accordion type="single" collapsible>
            {FAQS.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="px-3 text-left text-base font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="px-3 text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center">
          <div>
            <p className="text-xl font-extrabold">Still need help?</p>
            <p className="text-primary-foreground/80">Email us and we'll get back to you.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
              <a href={`mailto:${CONTACT.supportEmail}`}><Mail className="mr-2 h-4 w-4" />{CONTACT.supportEmail}</a>
            </Button>
            <Button asChild variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/contact">Contact page</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Help;
