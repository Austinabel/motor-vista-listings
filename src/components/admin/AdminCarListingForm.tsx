import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Car, Plus, Upload, X } from "lucide-react";

interface AdminCarListingFormProps {
  onListingCreated: () => void;
}

export const AdminCarListingForm = ({ onListingCreated }: AdminCarListingFormProps) => {
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    dealerId: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    condition: "",
    fuelType: "",
    transmission: "",
    color: "",
    state: "",
    area: "",
    description: "",
    features: [] as string[],
  });

  const carMakes = [
    "Acura","Audi","BMW","Chevrolet","Ford","Honda","Hyundai","Kia","Lexus",
    "Mercedes-Benz","Nissan","Peugeot","Toyota","Volkswagen","Others"
  ];

  const carModels: { [key: string]: string[] } = {
    "Toyota": ["Camry","Corolla","RAV4","Highlander","Prius","Sienna","Others"],
    "Honda": ["Accord","Civic","CR-V","Pilot","Odyssey","Fit","Others"],
    "Mercedes-Benz": ["C-Class","E-Class","S-Class","GLC","GLE","GLS","Others"],
    "BMW": ["3 Series","5 Series","7 Series","X3","X5","X7","Others"],
    "Others": ["Other Model"]
  };

  const stateAreas: { [key: string]: string[] } = {
    'Lagos': ['Lagos Island','Ikeja','Surulere','Yaba','Victoria Island','Ikoyi','Lekki','Ajah'],
    'FCT': ['Abuja','Gwagwalada','Kuje','Kwali','Bwari'],
    'Rivers': ['Port Harcourt','Obio-Akpor','Okrika','Bonny','Degema'],
    'Kano': ['Kano','Wudil','Gwarzo','Rano','Karaye'],
    'Oyo': ['Ibadan','Ogbomoso','Oyo','Iseyin','Saki'],
  };

  const carFeatures = [
    "Air Conditioning","Power Steering","Central Locking","Electric Windows",
    "ABS","Airbags","Alloy Wheels","Bluetooth","GPS Navigation","Sunroof",
    "Leather Seats","Parking Sensors","Reverse Camera","Cruise Control"
  ];

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('id, business_name, contact_name')
        .eq('status', 'verified')
        .order('business_name');

      if (error) {
        console.error('Error fetching dealers:', error);
        toast.error('Failed to load dealers');
      } else {
        setDealers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchDealers:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMakeChange = (value: string) => {
    setFormData(prev => ({ ...prev, make: value, model: "" }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, features: [...prev.features, feature] }));
    } else {
      setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > 20) {
      toast.error("Maximum 20 images allowed");
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...files]);
    setSelectedImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    const url = selectedImagePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setSelectedImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToStorage = async (listingId: string): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const [index, file] of selectedImages.entries()) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `admin/${listingId}/${Date.now()}-${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('car-listing-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('car-listing-images')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (err) {
        console.error('Upload exception:', err);
      }
    }

    return uploadedUrls;
  };

  const validateForm = () => {
    const requiredFields = ['dealerId', 'make', 'model', 'year', 'price', 'condition', 'state', 'area'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    if (selectedImages.length === 0) {
      toast.error("Please upload at least one image");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const selectedDealer = dealers.find(d => d.id === formData.dealerId);
      const location = `${formData.area}, ${formData.state}`;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // Admin listings get 90 days

      // Create the car listing
      const { data: createdListing, error: listingError } = await supabase
        .from('car_listings')
        .insert({
          user_id: selectedDealer?.user_id || null, // Link to dealer's user if available
          make: formData.make,
          model: formData.model,
          year: formData.year,
          mileage: formData.mileage || null,
          price: parseFloat(formData.price),
          condition: formData.condition,
          fuel_type: formData.fuelType || null,
          transmission: formData.transmission || null,
          color: formData.color || null,
          location: location,
          description: formData.description || null,
          features: formData.features,
          listing_plan: 'featured', // Admin listings are featured by default
          listing_price: 0, // No cost for admin listings
          listing_duration: 90,
          expires_at: expiresAt.toISOString(),
          admin_created: true, // This will trigger auto-approval
        })
        .select()
        .single();

      if (listingError || !createdListing) {
        console.error('Listing creation error:', listingError);
        toast.error("Failed to create listing. Please try again.");
        setLoading(false);
        return;
      }

      // Upload images
      const uploadedUrls = await uploadImagesToStorage(createdListing.id);

      if (uploadedUrls.length > 0) {
        const imageRecords = uploadedUrls.map((url, index) => ({
          listing_id: createdListing.id,
          image_url: url,
          is_primary: index === 0
        }));

        const { error: imageInsertError } = await supabase
          .from('car_listing_images')
          .insert(imageRecords);

        if (imageInsertError) {
          console.error('Error saving images:', imageInsertError);
          toast.error('Failed to attach images to the listing');
        }
      }

      toast.success("Car listing created and auto-approved successfully!");
      
      // Reset form
      setFormData({
        dealerId: "",
        make: "",
        model: "",
        year: "",
        mileage: "",
        price: "",
        condition: "",
        fuelType: "",
        transmission: "",
        color: "",
        state: "",
        area: "",
        description: "",
        features: [],
      });
      setSelectedImages([]);
      setSelectedImagePreviews([]);
      onListingCreated();
      
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          Add New Car Listing (Admin)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dealer Selection */}
          <div>
            <Label htmlFor="dealerId">Select Dealer *</Label>
            <Select value={formData.dealerId} onValueChange={(value) => handleInputChange('dealerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a verified dealer" />
              </SelectTrigger>
              <SelectContent>
                {dealers.map((dealer) => (
                  <SelectItem key={dealer.id} value={dealer.id}>
                    {dealer.business_name} ({dealer.contact_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Car Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Select value={formData.make} onValueChange={handleMakeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {carMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(carModels[formData.make] || []).map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                placeholder="e.g., 2020"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="price">Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 5000000"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="fairly used">Fairly Used</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                placeholder="e.g., 50000"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(stateAreas).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area">Area *</Label>
              <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {(stateAreas[formData.state] || []).map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label htmlFor="images">Car Images *</Label>
            <div className="mt-2 space-y-4">
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              {selectedImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the car's condition, history, and any special features"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
              {carFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={formData.features.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                  />
                  <Label htmlFor={feature} className="text-sm">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Creating Listing..." : "Create Car Listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};