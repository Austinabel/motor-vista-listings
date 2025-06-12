
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Star, Filter, Shield, Mail, Building, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dealers = [
  {
    id: 1,
    name: "Premium Auto Lagos",
    location: "Victoria Island, Lagos",
    state: "Lagos",
    phone: "+234 801 234 5678",
    email: "info@premiumauto.ng",
    rating: 4.8,
    totalCars: 45,
    established: "2015",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 2,
    name: "Royal Motors Abuja",
    location: "Wuse 2, Abuja",
    state: "FCT",
    phone: "+234 802 345 6789",
    email: "info@royalmotors.ng",
    rating: 4.9,
    totalCars: 32,
    established: "2018",
    image: "https://images.unsplash.com/photo-1562141961-f1e70c7d2ac6?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 3,
    name: "Elite Car Center",
    location: "GRA, Port Harcourt",
    state: "Rivers",
    phone: "+234 803 456 7890",
    email: "info@elitecar.ng",
    rating: 4.7,
    totalCars: 28,
    established: "2016",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 4,
    name: "Luxury Auto Hub",
    location: "Ikeja, Lagos",
    state: "Lagos",
    phone: "+234 804 567 8901",
    email: "info@luxuryauto.ng",
    rating: 4.6,
    totalCars: 38,
    established: "2017",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=200&fit=crop",
    verified: true,
  },
];

const states = [
  "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo"
];

const Dealers = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const filteredDealers = selectedState 
    ? dealers.filter(dealer => dealer.state === selectedState)
    : dealers;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="browse">Browse Dealers</TabsTrigger>
            <TabsTrigger value="register">Become a Dealer</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Car Dealers</h1>
                <p className="text-gray-600">{filteredDealers.length} verified dealers found</p>
              </div>
              <Button onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Filters</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="location">Location/State</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                      >
                        <option value="">All States</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="rating">Minimum Rating</Label>
                      <Input placeholder="4.0" />
                    </div>
                    <div>
                      <Label htmlFor="established">Established Year</Label>
                      <Input placeholder="2015" />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Min Cars in Stock</Label>
                      <Input placeholder="20" />
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700">Apply Filters</Button>
                    <Button variant="outline" className="w-full">Reset Filters</Button>
                  </div>
                </Card>
              </div>

              {/* Dealers Grid */}
              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDealers.map((dealer) => (
                    <Card key={dealer.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="relative">
                        <img 
                          src={dealer.image} 
                          alt={dealer.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {dealer.verified && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2">{dealer.name}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{dealer.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{dealer.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{dealer.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Since {dealer.established}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                              <span>{dealer.rating}</span>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {dealer.totalCars} cars
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1 bg-red-600 hover:bg-red-700">
                            View Profile
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Become a Verified Dealer</CardTitle>
                <p className="text-center text-gray-600">
                  Join our platform and reach thousands of potential customers
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-xl font-bold text-red-700 mb-2">Dealer Subscription</h3>
                  <p className="text-3xl font-bold text-red-600">₦150,000 <span className="text-lg font-normal text-gray-600">per year</span></p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>✓ Verified dealer badge</li>
                    <li>✓ Unlimited car listings</li>
                    <li>✓ Featured dealer placement</li>
                    <li>✓ Direct customer contact</li>
                    <li>✓ Analytics dashboard</li>
                    <li>✓ 24/7 customer support</li>
                  </ul>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input id="businessName" placeholder="Your dealership name" required />
                    </div>
                    <div>
                      <Label htmlFor="contactName">Contact Person *</Label>
                      <Input id="contactName" placeholder="Full name" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="business@example.com" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" placeholder="+234 xxx xxx xxxx" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Business Address *</Label>
                    <Textarea id="address" placeholder="Complete business address" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <select id="state" className="w-full p-2 border rounded-md" required>
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="established">Year Established *</Label>
                      <Input id="established" placeholder="2020" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cacNumber">CAC Registration Number *</Label>
                      <Input id="cacNumber" placeholder="RC123456" required />
                    </div>
                    <div>
                      <Label htmlFor="taxId">Tax Identification Number</Label>
                      <Input id="taxId" placeholder="TIN" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Tell us about your dealership, specializations, and services..."
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input id="website" placeholder="https://yourwebsite.com" />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Average Monthly Inventory *</Label>
                      <Input id="inventory" placeholder="50" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="documents">Supporting Documents</Label>
                    <Input id="documents" type="file" multiple accept=".pdf,.jpg,.png" />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload CAC certificate, Tax clearance, business license (PDF, JPG, PNG)
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the <a href="#" className="text-red-600 hover:underline">Terms of Service</a> and 
                      <a href="#" className="text-red-600 hover:underline ml-1">Privacy Policy</a>
                    </Label>
                  </div>

                  <div className="border-t pt-6">
                    <div className="text-center mb-4">
                      <p className="text-lg font-semibold">Total: ₦150,000/year</p>
                      <p className="text-sm text-gray-600">Payment will be processed after verification</p>
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700 py-3">
                      Submit Application
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dealers;
