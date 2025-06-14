import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Upload, Car, Star, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SellYourCar = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    condition: "",
    fuelType: "",
    transmission: "",
    color: "",
    location: "",
    description: "",
    features: [] as string[],
    images: [] as File[],
  });

  const pricingPlans = [
    {
      id: "free",
      name: "Free Listing",
      price: "Free",
      duration: "30 days",
      listingPrice: 0,
      features: [
        "Basic listing visibility",
        "Up to 5 photos",
        "Standard support",
        "Basic contact form"
      ],
      icon: Car,
      color: "bg-gray-100 border-gray-300"
    },
    {
      id: "standard",
      name: "Standard Listing",
      price: "₦7,500",
      duration: "60 days",
      listingPrice: 7500,
      features: [
        "Enhanced visibility",
        "Up to 15 photos",
        "Priority support",
        "Advanced contact options",
        "Social media promotion"
      ],
      icon: Star,
      color: "bg-blue-50 border-blue-300"
    },
    {
      id: "featured",
      name: "Featured Listing",
      price: "₦35,000",
      duration: "90 days",
      listingPrice: 35000,
      features: [
        "Premium placement",
        "Unlimited photos",
        "24/7 priority support",
        "Featured badge",
        "Homepage visibility",
        "Social media boost",
        "Dedicated agent"
      ],
      icon: Crown,
      color: "bg-yellow-50 border-yellow-400"
    }
  ];

  const carFeatures = [
    "Air Conditioning", "Power Steering", "Central Locking", "Electric Windows",
    "ABS", "Airbags", "Alloy Wheels", "Bluetooth", "GPS Navigation", "Sunroof",
    "Leather Seats", "Parking Sensors", "Reverse Camera", "Cruise Control"
  ];

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter(f => f !== feature)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error("Please log in to list your car");
        navigate("/login");
        return;
      }

      // Validate required fields
      if (!formData.make || !formData.model || !formData.year || !formData.price || !formData.condition || !formData.location) {
        toast.error("Please fill in all required fields");
        return;
      }

      const selectedPlanDetails = pricingPlans.find(p => p.id === selectedPlan);
      const durationInDays = selectedPlan === "free" ? 30 : selectedPlan === "standard" ? 60 : 90;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationInDays);

      // Insert car listing
      const { data: listing, error: listingError } = await supabase
        .from('car_listings')
        .insert({
          user_id: user.id,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          mileage: formData.mileage || null,
          price: parseFloat(formData.price),
          condition: formData.condition,
          fuel_type: formData.fuelType || null,
          transmission: formData.transmission || null,
          color: formData.color || null,
          location: formData.location,
          description: formData.description || null,
          features: formData.features,
          listing_plan: selectedPlan,
          listing_price: selectedPlanDetails?.listingPrice || 0,
          listing_duration: durationInDays,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (listingError) {
        console.error('Listing error:', listingError);
        toast.error("Failed to create listing. Please try again.");
        return;
      }

      if (selectedPlan === "free") {
        toast.success("Your car listing has been submitted for review!");
        navigate("/");
      } else {
        toast.success(`Your ${selectedPlanDetails?.name} listing has been created and is pending payment processing.`);
        // Here you would typically redirect to payment processing
        navigate("/");
      }

    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Sell Your Car</h1>
          <p className="text-gray-600 text-lg">List your car and reach thousands of potential buyers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pricing Plans */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  {pricingPlans.map((plan) => (
                    <div key={plan.id} className={`p-4 rounded-lg border-2 ${plan.color} ${selectedPlan === plan.id ? 'ring-2 ring-red-500' : ''}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value={plan.id} id={plan.id} />
                        <plan.icon className="h-5 w-5" />
                        <Label htmlFor={plan.id} className="font-semibold">{plan.name}</Label>
                      </div>
                      <div className="ml-6">
                        <div className="text-2xl font-bold text-red-600 mb-1">{plan.price}</div>
                        <div className="text-sm text-gray-500 mb-3">Valid for {plan.duration}</div>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <Check className="h-3 w-3 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Car Listing Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Car Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="make">Make *</Label>
                      <Select value={formData.make} onValueChange={(value) => setFormData(prev => ({ ...prev, make: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="toyota">Toyota</SelectItem>
                          <SelectItem value="honda">Honda</SelectItem>
                          <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                          <SelectItem value="bmw">BMW</SelectItem>
                          <SelectItem value="audi">Audi</SelectItem>
                          <SelectItem value="lexus">Lexus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input 
                        id="model" 
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="Enter model" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <Input 
                        id="mileage" 
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                        placeholder="Enter mileage" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₦) *</Label>
                      <Input 
                        id="price" 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Enter price" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand-new">Brand New</SelectItem>
                          <SelectItem value="foreign-used">Foreign Used</SelectItem>
                          <SelectItem value="nigerian-used">Nigerian Used</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fuel-type">Fuel Type</Label>
                      <Select value={formData.fuelType} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transmission">Transmission</Label>
                      <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input 
                        id="color" 
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="Enter color" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lagos">Lagos</SelectItem>
                          <SelectItem value="abuja">Abuja</SelectItem>
                          <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
                          <SelectItem value="kano">Kano</SelectItem>
                          <SelectItem value="ibadan">Ibadan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your car's condition, history, and any additional details..."
                      rows={4}
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <Label>Features & Accessories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {carFeatures.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature}
                            checked={formData.features.includes(feature)}
                            onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                          />
                          <Label htmlFor={feature} className="text-sm">{feature}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>Upload Images</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                      <p className="text-sm text-gray-500">
                        {selectedPlan === "free" ? "Up to 5 images" : 
                         selectedPlan === "standard" ? "Up to 15 images" : "Unlimited images"}
                      </p>
                      <Button type="button" variant="outline" className="mt-2">
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <div>
                      <p className="text-lg font-semibold">
                        Total: {pricingPlans.find(p => p.id === selectedPlan)?.price}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pricingPlans.find(p => p.id === selectedPlan)?.duration} listing
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-red-600 hover:bg-red-700 px-8"
                      disabled={loading}
                    >
                      {loading ? "Creating Listing..." : 
                       selectedPlan === "free" ? "List Car for Free" : "Proceed to Payment"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellYourCar;
