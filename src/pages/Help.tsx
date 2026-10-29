
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Phone, Mail } from "lucide-react";

import { usePageMeta } from "@/hooks/usePageMeta";
const Help = () => {
  usePageMeta({ title: "Help centre" });
  const faqs = [
    {
      question: "How do I buy a car on Motorcars.ng?",
      answer: "Browse our car listings, filter by your preferences, contact the dealer directly through our platform, and arrange for inspection and purchase."
    },
    {
      question: "Are all dealers verified?",
      answer: "Yes, all dealers on our platform go through a thorough verification process including business registration, location verification, and background checks."
    },
    {
      question: "How do I sell my car?",
      answer: "You can list your car for free by filling out our sell form with your car details and photos. Our team will review and publish your listing."
    },
    {
      question: "What payment methods are accepted?",
      answer: "Payment methods vary by dealer. Most accept bank transfers, cash, and some offer financing options. Contact the dealer directly for payment details."
    },
    {
      question: "Do you offer car financing?",
      answer: "Many of our partner dealers offer financing options. Check with individual dealers for their financing terms and conditions."
    },
    {
      question: "How do I report a problem with a dealer?",
      answer: "Contact our customer support team immediately through phone, email, or live chat. We take all complaints seriously and investigate promptly."
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Help Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="text-center">
                  <HelpCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <CardTitle>FAQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">Find answers to commonly asked questions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <MessageCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <CardTitle>Live Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">Chat with our support team in real-time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <Phone className="h-12 w-12 text-red-600 mx-auto mb-2" />
                  <CardTitle>Phone Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">Call us at +234 800 MOTOR (66867)</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  If you couldn't find the answer you're looking for, our customer support team is here to help.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-red-600 mr-2" />
                    <span>+234 800 MOTOR (66867)</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-red-600 mr-2" />
                    <span>support@motorcars.ng</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Help;
