
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

export const SearchFilters = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">Find Your Perfect Car</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input id="make" placeholder="Select make" />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="Select model" />
            </div>
            <div>
              <Label htmlFor="price">Price Range</Label>
              <Input id="price" placeholder="Any price" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="location" placeholder="Location" className="pl-10" />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
