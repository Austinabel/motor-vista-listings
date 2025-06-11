
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, DollarSign, FileText, Shield } from "lucide-react";

const helpItems = [
  {
    icon: ShoppingCart,
    title: "Buying Help",
    description: "Get expert guidance on purchasing your next vehicle",
  },
  {
    icon: DollarSign,
    title: "Selling Help",
    description: "Maximize your car's value with our selling assistance",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Complete paperwork assistance for smooth transactions",
  },
  {
    icon: Shield,
    title: "Verification",
    description: "Verified dealers and authentic vehicle history",
  },
];

export const HelpIcons = () => {
  return (
    <section className="py-16 bg-red-600 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How We Help You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpItems.map((item, index) => (
            <Card key={index} className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <item.icon className="h-12 w-12 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm opacity-90">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
