
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Shield, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const tools = [
  {
    icon: Calculator,
    title: "Car Valuation",
    description: "Get instant market value for your vehicle",
    color: "bg-blue-600",
    link: "/car-valuation",
  },
  {
    icon: Shield,
    title: "Insurance",
    description: "Compare and get the best insurance deals",
    color: "bg-green-600",
    link: "/insurance",
  },
  {
    icon: CreditCard,
    title: "Finance",
    description: "Easy car financing options available",
    color: "bg-purple-600",
    link: "/financing",
  },
];

export const ToolsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Helpful Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className={`inline-flex p-4 rounded-full ${tool.color} text-white mb-4`}>
                  <tool.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">{tool.title}</h3>
                <p className="text-gray-600 mb-6">{tool.description}</p>
                <Link to={tool.link}>
                  <Button variant="outline">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
