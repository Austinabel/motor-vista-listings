
import { Card } from "@/components/ui/card";

const partners = [
  { name: "Partner 1", logo: "🏢" },
  { name: "Partner 2", logo: "🏪" },
  { name: "Partner 3", logo: "🏬" },
  { name: "Partner 4", logo: "🏭" },
  { name: "Partner 5", logo: "🏘️" },
];

export const TrustedPartners = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">Trusted by Leading Partners</h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {partners.map((partner, index) => (
            <Card key={index} className="p-6 flex items-center justify-center min-w-[120px]">
              <div className="text-3xl">{partner.logo}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
