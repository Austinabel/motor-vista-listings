
import { Card } from "@/components/ui/card";

const brands = [
  { name: "Toyota", logo: "🚗" },
  { name: "Honda", logo: "🚙" },
  { name: "Mercedes", logo: "🚐" },
  { name: "BMW", logo: "🚕" },
  { name: "Audi", logo: "🚘" },
  { name: "Lexus", logo: "🚗" },
  { name: "Nissan", logo: "🚙" },
  { name: "Hyundai", logo: "🚐" },
];

export const BrandCarousel = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Brand</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Card key={brand.name} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-2">{brand.logo}</div>
              <h3 className="font-semibold">{brand.name}</h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
