
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I know if a dealer is verified?",
    answer: "All our dealers go through a strict verification process including business registration, location verification, and background checks. Verified dealers have a blue checkmark badge.",
  },
  {
    question: "Is there a warranty on used cars?",
    answer: "Many of our dealers offer warranties on their used cars. The warranty terms vary by dealer and vehicle. Check the individual listing for warranty information.",
  },
  {
    question: "Can I finance my car purchase?",
    answer: "Yes! We partner with several financial institutions to offer competitive car financing options. You can apply for financing directly through our platform.",
  },
  {
    question: "How do I sell my car on the platform?",
    answer: "If you're a dealer, simply register and verify your business account. Individual sellers can list through our partner dealers or use our selling assistance service.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept bank transfers, certified checks, and cash payments. For financed purchases, payments go directly to the lending institution.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
