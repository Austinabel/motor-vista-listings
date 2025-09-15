import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Fuel, Gauge, Settings, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("car_listings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching car:", error);
          toast.error("Could not load car details");
        } else {
          setCar(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading car details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 font-bold">Car not found</p>
        <Link to="/cars">
          <Button className="mt-4 bg-red-600 hover:bg-red-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Link to="/cars">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Car Images */}
          <div>
            {car.images && car.images.length > 0 ? (
              <div className="space-y-4">
                <img
                  src={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="grid grid-cols-4 gap-2">
                  {car.images.slice(1).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Car ${index + 2}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600"
                alt="Car placeholder"
                className="w-full h-80 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Car Details */}
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {car.year} {car.make} {car.model}
            </h1>
            <p className="text-xl text-red-600 font-bold mb-4">
              ₦{parseFloat(car.price).toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                Year: {car.year}
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-gray-600" />
                Mileage: {car.mileage || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-gray-600" />
                Fuel: {car.fuel_type}
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-600" />
                Transmission: {car.transmission}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                Location: {car.location}
              </div>
              <div className="flex items-center gap-2">
                Condition: {car.condition}
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold text-lg mb-2">Description</h2>
                <p className="text-gray-700">{car.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
