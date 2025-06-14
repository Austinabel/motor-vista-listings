
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calculator } from "lucide-react";

const CarValuation = () => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "",
    location: ""
  });
  const [valuation, setValuation] = useState<number | null>(null);

  const handleValuation = () => {
    // Simple valuation logic (in real app, this would be more sophisticated)
    const baseValue = 10000000; // Base value in naira
    const yearFactor = (2024 - parseInt(formData.year)) * 500000;
    const mileageFactor = parseInt(formData.mileage) * 10;
    const conditionMultiplier = formData.condition === "excellent" ? 1.2 : 
                               formData.condition === "good" ? 1.0 : 0.8;
    
    const estimatedValue = (baseValue - yearFactor - mileageFactor) * conditionMultiplier;
    setValuation(Math.max(estimatedValue, 2000000));
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Calculator className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Car Valuation Tool</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get an instant estimate of your car's market value using our advanced valuation algorithm
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Make</Label>
                    <Select onValueChange={(value) => setFormData({...formData, make: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="honda">Honda</SelectItem>
                        <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                        <SelectItem value="bmw">BMW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input 
                      placeholder="Enter model"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Year</Label>
                    <Input 
                      type="number"
                      placeholder="2020"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Mileage (km)</Label>
                    <Input 
                      type="number"
                      placeholder="50000"
                      value={formData.mileage}
                      onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Condition</Label>
                  <Select onValueChange={(value) => setFormData({...formData, condition: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleValuation}
                >
                  Get Valuation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valuation Result</CardTitle>
              </CardHeader>
              <CardContent>
                {valuation ? (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-red-600 mb-4">
                      ₦{valuation.toLocaleString()}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Estimated market value for your {formData.make} {formData.model}
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Valuation Tips:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Regular maintenance increases value</li>
                        <li>• Complete service history is important</li>
                        <li>• Market conditions affect pricing</li>
                        <li>• Location impacts final selling price</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Fill in the vehicle information to get your valuation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CarValuation;
