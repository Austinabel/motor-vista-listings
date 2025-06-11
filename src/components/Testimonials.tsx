
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Adebayo Johnson",
    rating: 5,
    comment: "Excellent service! Found my dream car within a week. Highly recommended!",
    location: "Lagos",
  },
  {
    name: "Fatima Abdullahi",
    rating: 5,
    comment: "Professional dealers and smooth transaction process. Very satisfied!",
    location: "Abuja",
  },
  {
    name: "Chinedu Okafor",
    rating: 5,
    comment: "Great platform with verified dealers. Bought my car with confidence.",
    location: "Port Harcourt",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
