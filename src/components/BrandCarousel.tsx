
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const brands = [
  { name: "Toyota", logo: "🚗" },
  { name: "Honda", logo: "🚙" },
  { name: "Mercedes", logo: "🚐" },
  { name: "BMW", logo: "🚕" },
  { name: "Audi", logo: "🚘" },
  { name: "Lexus", logo: "🚗" },
  { name: "Nissan", logo: "🚙" },
  { name: "Hyundai", logo: "🚐" },
  { name: "Ford", logo: "🚗" },
  { name: "Volkswagen", logo: "🚙" },
  { name: "Peugeot", logo: "🚐" },
  { name: "Kia", logo: "🚕" },
];

export const BrandCarousel = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Brand</h2>
        <div className="relative">
          {/* Left scroll arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide mx-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {brands.map((brand) => (
              <Card key={brand.name} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0 min-w-[140px]">
                <div className="text-4xl mb-2">{brand.logo}</div>
                <h3 className="font-semibold">{brand.name}</h3>
              </Card>
            ))}
          </div>
          
          {/* Right scroll arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
