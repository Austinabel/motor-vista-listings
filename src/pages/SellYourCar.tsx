
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Upload, Car, Star, Crown, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ManualPaymentDetails } from "@/components/ManualPaymentDetails";

const SellYourCar = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [newListing, setNewListing] = useState<any>(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = selectedPlan === "free" ? 5 : selectedPlan === "standard" ? 15 : 50;
    
    if (files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed for ${selectedPlan} plan`);
      return;
    }
    
    setSelectedImages(files);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (listingId: string) => {
    if (selectedImages.length === 0) return;

    const uploadPromises = selectedImages.map(async (file, index) => {
      // For now, we'll just store a placeholder URL since we don't have storage bucket set up
      // In a real implementation, you'd upload to Supabase Storage first
      const imageUrl = `placeholder-image-${index + 1}.jpg`;
      
      const { error } = await supabase
        .from('car_listing_images')
        .insert({
          listing_id: listingId,
          image_url: imageUrl,
          is_primary: index === 0
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    });

    await Promise.all(uploadPromises);
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
        setLoading(false);
        return;
      }

      const selectedPlanDetails = pricingPlans.find(p => p.id === selectedPlan);
      const durationInDays = selectedPlan === "free" ? 30 : selectedPlan === "standard" ? 60 : 90;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationInDays);

      const listingStatus = selectedPlan === 'free' ? 'pending_review' : 'pending_payment';

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
          status: listingStatus
        })
        .select()
        .single();

      if (listingError) {
        console.error('Listing error:', listingError);
        toast.error("Failed to create listing. Please try again.");
        setLoading(false);
        return;
      }

      // Upload images
      if (selectedImages.length > 0) {
        await uploadImages(listing.id);
      }

      if (selectedPlan === "free") {
        toast.success("Your car listing has been submitted for review!");
        navigate("/");
      } else {
        setNewListing(listing);
        setStep('payment');
        toast.info(`Your ${selectedPlanDetails?.name} listing has been created.`);
      }

    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'payment' && newListing) {
    const planDetails = pricingPlans.find(p => p.id === newListing.listing_plan);
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center px-4">
        <ManualPaymentDetails
          listingId={newListing.id}
          planName={planDetails?.name || 'Listing'}
          price={planDetails?.listingPrice || 0}
          onPaymentSubmitted={() => setStep('success')}
        />
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center animate-fade-in">
          <CardHeader>
            <CardTitle>Success!</CardTitle>
            <CardDescription>Your payment information has been submitted.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your listing is now under review and will be activated once payment is confirmed. Thank you!</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => navigate('/')}>Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
                          <SelectItem value="acura">Acura</SelectItem>
                          <SelectItem value="audi">Audi</SelectItem>
                          <SelectItem value="bestune">Bestune</SelectItem>
                          <SelectItem value="bmw">BMW</SelectItem>
                          <SelectItem value="brilliance">Brilliance</SelectItem>
                          <SelectItem value="buick">Buick</SelectItem>
                          <SelectItem value="cadillac">Cadillac</SelectItem>
                          <SelectItem value="changan">Changan</SelectItem>
                          <SelectItem value="chevrolet">Chevrolet</SelectItem>
                          <SelectItem value="chrysler">Chrysler</SelectItem>
                          <SelectItem value="daihatsu">Daihatsu</SelectItem>
                          <SelectItem value="dodge">Dodge</SelectItem>
                          <SelectItem value="ford">Ford</SelectItem>
                          <SelectItem value="gac">GAC</SelectItem>
                          <SelectItem value="gmc">GMC</SelectItem>
                          <SelectItem value="honda">Honda</SelectItem>
                          <SelectItem value="hyundai">Hyundai</SelectItem>
                          <SelectItem value="infiniti">Infiniti</SelectItem>
                          <SelectItem value="ivm">IVM</SelectItem>
                          <SelectItem value="jeep">Jeep</SelectItem>
                          <SelectItem value="kia">Kia</SelectItem>
                          <SelectItem value="land-rover">Land Rover</SelectItem>
                          <SelectItem value="lexus">Lexus</SelectItem>
                          <SelectItem value="lincoln">Lincoln</SelectItem>
                          <SelectItem value="mazda">Mazda</SelectItem>
                          <SelectItem value="mercedes-benz">Mercedes‑Benz</SelectItem>
                          <SelectItem value="mini">Mini</SelectItem>
                          <SelectItem value="mitsubishi">Mitsubishi</SelectItem>
                          <SelectItem value="nissan">Nissan</SelectItem>
                          <SelectItem value="opel">Opel</SelectItem>
                          <SelectItem value="peugeot">Peugeot</SelectItem>
                          <SelectItem value="pontiac">Pontiac</SelectItem>
                          <SelectItem value="porsche">Porsche</SelectItem>
                          <SelectItem value="renault">Renault</SelectItem>
                          <SelectItem value="rover">Rover</SelectItem>
                          <SelectItem value="saturn">Saturn</SelectItem>
                          <SelectItem value="scion">Scion</SelectItem>
                          <SelectItem value="subaru">Subaru</SelectItem>
                          <SelectItem value="suzuki">Suzuki</SelectItem>
                          <SelectItem value="toyota">Toyota</SelectItem>
                          <SelectItem value="volkswagen">Volkswagen</SelectItem>
                          <SelectItem value="volvo">Volvo</SelectItem>
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
                      <p className="text-sm text-gray-500 mb-4">
                        {selectedPlan === "free" ? "Up to 5 images" : 
                         selectedPlan === "standard" ? "Up to 15 images" : "Unlimited images"}
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                        Choose Files
                      </Button>
                    </div>
                    
                    {/* Display selected images */}
                    {selectedImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">{selectedImages.length} image(s) selected:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedImages.map((file, index) => (
                            <div key={index} className="relative">
                              <Badge variant="secondary" className="pr-6">
                                {file.name}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
