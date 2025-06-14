
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const brands = [
  { name: "Toyota", logo: "🚗", category: "toyota" },
  { name: "Honda", logo: "🚙", category: "honda" },
  { name: "Mercedes", logo: "🚐", category: "mercedes-benz" },
  { name: "BMW", logo: "🚕", category: "bmw" },
  { name: "Audi", logo: "🚘", category: "audi" },
  { name: "Lexus", logo: "🚗", category: "lexus" },
  { name: "Nissan", logo: "🚙", category: "nissan" },
  { name: "Hyundai", logo: "🚐", category: "hyundai" },
  { name: "Ford", logo: "🚗", category: "ford" },
  { name: "Volkswagen", logo: "🚙", category: "volkswagen" },
  { name: "Peugeot", logo: "🚐", category: "peugeot" },
  { name: "Kia", logo: "🚕", category: "kia" },
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
    <section className="py-16" style={{ backgroundColor: '#FDE4C3' }}>
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
              <Link key={brand.name} to={`/cars?category=${brand.category}`}>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex-shrink-0 min-w-[140px]">
                  <div className="text-4xl mb-2">{brand.logo}</div>
                  <h3 className="font-semibold">{brand.name}</h3>
                </Card>
              </Link>
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
