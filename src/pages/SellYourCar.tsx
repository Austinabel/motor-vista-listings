import { useState, useEffect } from "react";
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
import { useDealer } from "@/contexts/DealerContext";
import { DealerRegistrationBanner } from "@/components/DealerRegistrationBanner";
import { useAuth } from "@/contexts/AuthContext";

const SellYourCar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dealerInfo, isDealer, loading: dealerLoading } = useDealer();

  // UI / form state
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [newListing, setNewListing] = useState<any>(null);
  const [listingPlansEnabled, setListingPlansEnabled] = useState(false);

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
    state: "",
    area: "",
    location: "",
    description: "",
    features: [] as string[],
  });

  const carMakes = [
    "Acura","Audi","Bestune","BMW","Brilliance","Buick","Cadillac",
    "Changan","Chevrolet","Chrysler","Daihatsu","Dodge","Ford","GAC",
    "GMC","Honda","Hyundai","Infiniti","IVM","Jeep","Kia","Land Rover",
    "Lexus","Lincoln","Mazda","Mercedes-Benz","Mini","Mitsubishi",
    "Nissan","Opel","Peugeot","Pontiac","Porsche","Renault","Rover",
    "Saturn","Scion","Subaru","Suzuki","Toyota","Volkswagen","Volvo","Others"
  ];

  const carModels: { [key: string]: string[] } = {
    "Toyota": ["Camry","Corolla","RAV4","Highlander","Prius","Sienna","Tacoma","Tundra","4Runner","Yaris","Avalon","Venza","Others"],
    "Honda": ["Accord","Civic","CR-V","Pilot","Odyssey","Fit","HR-V","Passport","Ridgeline","Insight","Others"],
    "Mercedes-Benz": ["C-Class","E-Class","S-Class","GLC","GLE","GLS","A-Class","CLA","GLA","ML-Class","G-Class","Others"],
    "BMW": ["3 Series","5 Series","7 Series","X3","X5","X7","i3","i8","Z4","X1","2 Series","Others"],
    "Audi": ["A3","A4","A6","A8","Q3","Q5","Q7","Q8","TT","R8","Others"],
    "Lexus": ["ES","IS","LS","RX","GX","LX","NX","UX","LC","RC","Others"],
    "Nissan": ["Altima","Sentra","Rogue","Pathfinder","Murano","Frontier","Titan","Armada","Versa","Maxima","Others"],
    "Hyundai": ["Elantra","Sonata","Santa Fe","Tucson","Accent","Genesis","Veloster","Palisade","Kona","Others"],
    "Ford": ["F-150","Mustang","Explorer","Escape","Focus","Fusion","Edge","Expedition","Ranger","Bronco","Others"],
    "Volkswagen": ["Jetta","Passat","Golf","Tiguan","Atlas","Arteon","Beetle","Touareg","Others"],
    "Kia": ["Optima","Forte","Sorento","Sportage","Soul","Stinger","Telluride","Rio","Sedona","Others"],
    "Chevrolet": ["Silverado","Malibu","Equinox","Traverse","Camaro","Corvette","Tahoe","Suburban","Others"],
    "Acura": ["TLX","ILX","RDX","MDX","NSX","Others"],
    "Infiniti": ["Q50","Q60","QX50","QX60","QX80","Others"],
    "Jeep": ["Wrangler","Grand Cherokee","Cherokee","Compass","Renegade","Gladiator","Others"],
    "Land Rover": ["Range Rover","Discovery","Defender","Evoque","Velar","Others"],
    "Mazda": ["Mazda3","Mazda6","CX-3","CX-5","CX-9","MX-5 Miata","Others"],
    "Mitsubishi": ["Outlander","Eclipse Cross","Mirage","Pajero","Lancer","Others"],
    "Subaru": ["Outback","Forester","Impreza","Legacy","Ascent","Crosstrek","WRX","Others"],
    "Peugeot": ["208","308","508","2008","3008","5008","Others"],
    "Porsche": ["911","Cayenne","Macan","Panamera","Taycan","Others"],
    "Volvo": ["XC90","XC60","XC40","S60","S90","V60","Others"],
    "Others": ["Other Model"]
  };

  const stateAreas: { [key: string]: string[] } = {
    'Abia': ['Aba','Umuahia','Arochukwu','Ohafia','Bende'],
    'Adamawa': ['Yola','Mubi','Numan','Jimeta','Ganye'],
    'Akwa Ibom': ['Uyo','Eket','Ikot Ekpene','Oron','Abak'],
    'Anambra': ['Awka','Onitsha','Nnewi','Ekwulobia','Agulu'],
    'Bauchi': ['Bauchi','Azare','Misau','Jama\'are','Katagum'],
    'Bayelsa': ['Yenagoa','Brass','Sagbama','Nembe','Ogbia'],
    'Benue': ['Makurdi','Gboko','Otukpo','Katsina-Ala','Vandeikya'],
    'Borno': ['Maiduguri','Biu','Bama','Dikwa','Gubio'],
    'Cross River': ['Calabar','Ugep','Obudu','Ogoja','Ikom'],
    'Delta': ['Asaba','Warri','Sapele','Ughelli','Agbor'],
    'Ebonyi': ['Abakaliki','Afikpo','Onueke','Ezza','Ikwo'],
    'Edo': ['Benin City','Auchi','Ekpoma','Uromi','Igarra'],
    'Ekiti': ['Ado-Ekiti','Ikere','Oye','Ijero','Ikole'],
    'Enugu': ['Enugu','Nsukka','Oji River','Agbani','Awgu'],
    'FCT': ['Abuja','Gwagwalada','Kuje','Kwali','Bwari'],
    'Gombe': ['Gombe','Billiri','Kaltungo','Dukku','Bajoga'],
    'Imo': ['Owerri','Orlu','Okigwe','Mbaise','Ngor Okpala'],
    'Jigawa': ['Dutse','Hadejia','Kazaure','Ringim','Birnin Kudu'],
    'Kaduna': ['Kaduna','Zaria','Kafanchan','Kagoro','Saminaka'],
    'Kano': ['Kano','Wudil','Gwarzo','Rano','Karaye'],
    'Katsina': ['Katsina','Daura','Funtua','Malumfashi','Dutsin-Ma'],
    'Kebbi': ['Birnin Kebbi','Argungu','Yauri','Zuru','Bagudo'],
    'Kogi': ['Lokoja','Okene','Kabba','Anyigba','Idah'],
    'Kwara': ['Ilorin','Offa','Omu-Aran','Lafiagi','Esie'],
    'Lagos': ['Lagos Island','Ikeja','Surulere','Yaba','Victoria Island','Ikoyi','Lekki','Ajah','Alaba','Mushin'],
    'Nasarawa': ['Lafia','Keffi','Akwanga','Nasarawa','Doma'],
    'Niger': ['Minna','Bida','Kontagora','Suleja','New Bussa'],
    'Ogun': ['Abeokuta','Sagamu','Ijebu Ode','Ota','Ilaro'],
    'Ondo': ['Akure','Ondo','Owo','Ikare','Okitipupa'],
    'Osun': ['Osogbo','Ile-Ife','Ilesa','Ede','Iwo'],
    'Oyo': ['Ibadan','Ogbomoso','Oyo','Iseyin','Saki'],
    'Plateau': ['Jos','Bukuru','Pankshin','Shendam','Mangu'],
    'Rivers': ['Port Harcourt','Obio-Akpor','Okrika','Bonny','Degema'],
    'Sokoto': ['Sokoto','Tambuwal','Gwadabawa','Bodinga','Yabo'],
    'Taraba': ['Jalingo','Wukari','Bali','Gembu','Serti'],
    'Yobe': ['Damaturu','Potiskum','Gashua','Nguru','Geidam'],
    'Zamfara': ['Gusau','Kaura Namoda','Talata Mafara','Bukkuyum','Anka']
  };

  const pricingPlans = [
    {
      id: "free",
      name: "Free Listing",
      price: "Free",
      duration: "30 days",
      listingPrice: 0,
      features: ["Basic listing visibility","Up to 5 photos","Standard support","Basic contact form"],
      icon: Car,
      color: "bg-gray-100 border-gray-300"
    },
    {
      id: "standard",
      name: "Standard Listing",
      price: "₦7,500",
      duration: "60 days",
      listingPrice: 7500,
      features: ["Enhanced visibility","Up to 20 photos","Priority support","Advanced contact options","Social media promotion"],
      icon: Star,
      color: "bg-blue-50 border-blue-300"
    },
    {
      id: "featured",
      name: "Featured Listing",
      price: "₦35,000",
      duration: "90 days",
      listingPrice: 35000,
      features: ["Premium placement","Up to 20 photos","24/7 priority support","Featured badge","Homepage visibility","Social media boost","Dedicated agent"],
      icon: Crown,
      color: "bg-yellow-50 border-yellow-400"
    }
  ];

  const carFeatures = [
    "Air Conditioning","Power Steering","Central Locking","Electric Windows",
    "ABS","Airbags","Alloy Wheels","Bluetooth","GPS Navigation","Sunroof",
    "Leather Seats","Parking Sensors","Reverse Camera","Cruise Control"
  ];

  useEffect(() => {
    const checkListingPlansStatus = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'listing_plans_enabled')
        .single();

      if (!error && data) {
        setListingPlansEnabled(data.value === 'true' || data.value === true);
      }
    };
    checkListingPlansStatus();
  }, []);

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

  const getMaxImagesForPlan = (planId: string) => {
    if (!listingPlansEnabled) return 5;
    switch(planId) {
      case "free": return 5;
      case "standard": return 20;
      case "featured": return 100; // effectively 'unlimited' for UI
      default: return 5;
    }
  };

  // Handle image selection & previews
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = getMaxImagesForPlan(selectedPlan);

    if (selectedImages.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed for the ${selectedPlan} plan`);
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...files]);
    setSelectedImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    // revoke objectURL
    const url = selectedImagePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setSelectedImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload selectedImages to storage and return array of public URLs
  const uploadImagesToStorage = async (listingId: string, userId: string) : Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const [index, file] of selectedImages.entries()) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${listingId}/${Date.now()}-${index}.${fileExt}`;

        // upload file
        const { error: uploadError } = await supabase.storage
          .from('car-listing-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file to storage:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // get public url
        const { data: urlData } = supabase.storage
          .from('car-listing-images')
          .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl;
        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        } else {
          console.warn('No public URL returned for', fileName);
        }
      } catch (err) {
        console.error('Upload exception', err);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auth & dealer checks
      if (!user) {
        toast.error("Please log in to list your car");
        navigate("/login");
        setLoading(false);
        return;
      }
      if (!isDealer || !dealerInfo || dealerInfo.status !== 'verified') {
        toast.error("You must be a verified dealer to list cars. Please complete your registration.");
        navigate("/dealer-registration");
        setLoading(false);
        return;
      }

      // Basic validation
      if (!formData.make || !formData.model || !formData.year || !formData.price || !formData.condition || !formData.state || !formData.area) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Compose location if not manually set
      const location = `${formData.area}, ${formData.state}`;

      const selectedPlanDetails = pricingPlans.find(p => p.id === selectedPlan);
      const durationInDays = listingPlansEnabled ? (selectedPlan === "free" ? 30 : selectedPlan === "standard" ? 60 : 90) : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationInDays);

      const listingStatus = (!listingPlansEnabled || selectedPlan === 'free') ? 'pending_review' : 'pending_payment';

      // 1) Insert the car listing WITHOUT images (we need listing.id for file paths)
      const { data: createdListing, error: listingError } = await supabase
        .from('car_listings')
        .insert({
          user_id: user.id,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          mileage: formData.mileage || null,
          price: parseFloat(String(formData.price)),
          condition: formData.condition,
          fuel_type: formData.fuelType || null,
          transmission: formData.transmission || null,
          color: formData.color || null,
          location: location,
          description: formData.description || null,
          features: formData.features,
          listing_plan: listingPlansEnabled ? selectedPlan : 'free',
          listing_price: listingPlansEnabled ? (selectedPlanDetails?.listingPrice || 0) : 0,
          listing_duration: durationInDays,
          expires_at: expiresAt.toISOString(),
          status: listingStatus
        })
        .select()
        .single();

      if (listingError || !createdListing) {
        console.error('Listing insert error:', listingError);
        toast.error("Failed to create listing. Please try again.");
        setLoading(false);
        return;
      }

      // 2) Upload selected images to storage and collect public URLs
      if (selectedImages.length > 0) {
        const uploadedUrls = await uploadImagesToStorage(createdListing.id, user.id);

        if (uploadedUrls.length > 0) {
          // 3) Insert images into car_listing_images table
          const imageRecords = uploadedUrls.map((url, index) => ({
            listing_id: createdListing.id,
            image_url: url,
            is_primary: index === 0 // First image is primary
          }));

          const { error: imageInsertError } = await supabase
            .from('car_listing_images')
            .insert(imageRecords);

          if (imageInsertError) {
            console.error('Error saving images to database:', imageInsertError);
            toast.error('Failed to attach images to the listing');
          }
        }
      }

      // Success: either go to payment or finish
      if (!listingPlansEnabled || selectedPlan === "free") {
        toast.success("Your car listing has been submitted for review!");
        navigate("/");
      } else {
        setNewListing(createdListing);
        setStep('payment');
        toast.info(`Your ${selectedPlanDetails?.name} listing has been created. Proceed to payment.`);
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Payment and success UX
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

  // Show loading state while checking dealer status
  if (dealerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
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

        {user && (!isDealer || dealerInfo?.status !== 'verified') && (
          <DealerRegistrationBanner dealerStatus={dealerInfo?.status || null} />
        )}

        <div className={`grid grid-cols-1 ${listingPlansEnabled ? 'lg:grid-cols-3' : ''} gap-8`}>
          {listingPlansEnabled && (
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
          )}

          <div className={listingPlansEnabled ? 'lg:col-span-2' : ''}>
            <Card>
              <CardHeader>
                <CardTitle>Car Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="make">Make *</Label>
                      <Select value={formData.make} onValueChange={handleMakeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          {carMakes.map((make) => (
                            <SelectItem key={make.toLowerCase()} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Select
                        value={formData.model}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                        disabled={!formData.make}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.make ? "Select model" : "Select make first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.make && carModels[formData.make] ?
                            carModels[formData.make].map((model) => (
                              <SelectItem key={model.toLowerCase()} value={model}>{model}</SelectItem>
                            )) :
                            <SelectItem value="other">Other</SelectItem>
                          }
                        </SelectContent>
                      </Select>
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
                      <Input id="mileage" type="number" value={formData.mileage} onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))} placeholder="Enter mileage" />
                    </div>

                    <div>
                      <Label htmlFor="price">Price (₦) *</Label>
                      <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="Enter price" required />
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
                      <Input id="color" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} placeholder="Enter color" />
                    </div>

                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value, area: '' }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(stateAreas).map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="area">Area *</Label>
                      <Select value={formData.area} onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))} disabled={!formData.state}>
                        <SelectTrigger>
                          <SelectValue placeholder={formData.state ? "Select area" : "Select state first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.state && stateAreas[formData.state]?.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      {/* spacer */}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your car's condition, history, and any additional details..." rows={4} />
                  </div>

                  <div>
                    <Label>Features & Accessories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {carFeatures.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox id={feature} checked={formData.features.includes(feature)} onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)} />
                          <Label htmlFor={feature} className="text-sm">{feature}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Upload Images</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {selectedPlan === "free" ? "Up to 5 images" :
                          selectedPlan === "standard" ? "Up to 20 images" : "Unlimited images"}
                      </p>

                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                      <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>Choose Files</Button>
                    </div>

                    {selectedImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">{selectedImages.length} image(s) selected:</p>
                        <div className="flex gap-2 overflow-x-auto py-2">
                          {selectedImagePreviews.map((src, idx) => (
                            <div key={idx} className="relative w-28 h-20 flex-shrink-0">
                              <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover rounded" />
                              <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {listingPlansEnabled && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Listing Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div>Plan: <span className="font-medium">{pricingPlans.find(p => p.id === selectedPlan)?.name}</span></div>
                        <div>Price: <span className="font-medium">{pricingPlans.find(p => p.id === selectedPlan)?.price}</span></div>
                        <div>Duration: <span className="font-medium">{pricingPlans.find(p => p.id === selectedPlan)?.duration}</span></div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-6 bg-red-600 hover:bg-red-700" disabled={loading}>
                    {loading ? "Creating listing..." :
                      (!listingPlansEnabled || selectedPlan === "free") ? "Submit Free Listing" :
                      `Proceed to Payment (${pricingPlans.find(p => p.id === selectedPlan)?.price})`}
                  </Button>
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
