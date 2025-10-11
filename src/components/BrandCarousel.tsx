
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const brands = [
  { name: "Toyota", displayName: "Toyota", logo: "/lovable-uploads/d49dd33e-5468-4b54-9b5b-3eec1aca920b.png" },
  { name: "Honda", displayName: "Honda", logo: "/lovable-uploads/79a65471-83c9-4031-a90e-98c709b6bad3.png" },
  { name: "Mercedes‑Benz", displayName: "Mercedes", logo: "/lovable-uploads/97aaac92-9fdc-47e4-b122-489f9c56e961.png" },
  { name: "BMW", displayName: "BMW", logo: "/lovable-uploads/c314a3e8-3bb7-4b66-b810-bd2239e1a525.png" },
  { name: "Audi", displayName: "Audi", logo: "/lovable-uploads/087252cd-5dcf-470d-b026-42653d7c4368.png" },
  { name: "Lexus", displayName: "Lexus", logo: "/lovable-uploads/554f272d-906e-4747-a23a-746fbbabcff2.png" },
  { name: "Nissan", displayName: "Nissan", logo: "/lovable-uploads/ccfa7639-b973-439d-820f-75c3113bcb8c.png" },
  { name: "Hyundai", displayName: "Hyundai", logo: "/lovable-uploads/39ae951c-b5b7-4e95-ac27-4cb3855d72ec.png" },
  { name: "Ford", displayName: "Ford", logo: "/lovable-uploads/e5138f58-2ca5-40fc-8c7a-7c255b1826c3.png" },
  { name: "Volkswagen", displayName: "Volkswagen", logo: "/lovable-uploads/128717c6-02b7-4803-884e-e691e915e37d.png" },
  { name: "Peugeot", displayName: "Peugeot", logo: "/lovable-uploads/5918e91e-c4eb-4696-8b7f-bc623715aabf.png" },
  { name: "Kia", displayName: "Kia", logo: "/lovable-uploads/791a836f-b8ff-4c5b-98e8-269a886da868.png" },
  { name: "Innoson", displayName: "Innoson", logo: "/lovable-uploads/826e6a5e-7dce-4d9f-83b8-d78721e0112d.png" },
  { name: "Suzuki", displayName: "Suzuki", logo: "/lovable-uploads/8bb6fd5d-877c-44c3-ad02-70f54b9f77a9.png" },
  { name: "TVS", displayName: "TVS", logo: "/lovable-uploads/a978cc74-ff62-4e77-909e-9c428cab037d.png" },
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
              <Link key={brand.name} to={`/cars?make=${brand.name}`}>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex-shrink-0 min-w-[140px]">
                  <div className="h-12 mb-2 flex items-center justify-center">
                    {brand.logo.startsWith('/') ? (
                      <img 
                        src={brand.logo} 
                        alt={`${brand.displayName} logo`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-4xl">{brand.logo}</span>
                    )}
                  </div>
                  <h3 className="font-semibold">{brand.displayName}</h3>
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
