
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plane, Globe, Shield, Clock } from "lucide-react";
import { Footer } from "@/components/Footer";

const BuyFromAbroad = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-red-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Plane className="mx-auto mb-4 h-16 w-16" />
            <h1 className="text-4xl font-bold mb-4">Buy Cars From Abroad</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Get your dream car imported directly from USA, UK, Germany, and other countries. 
              We handle everything from purchase to delivery at your doorstep.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-red-600" />
              <h3 className="text-xl font-bold mb-2">Global Sourcing</h3>
              <p className="text-gray-600">Access to cars from USA, UK, Germany, Japan, and more</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-red-600" />
              <h3 className="text-xl font-bold mb-2">Verified Process</h3>
              <p className="text-gray-600">All cars are inspected and verified before shipping</p>
            </div>
            <div className="text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-red-600" />
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Average delivery time of 4-8 weeks to Nigeria</p>
            </div>
          </div>

          {/* Request Form */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Request Your Car Import</CardTitle>
              <p className="text-center text-gray-600">
                Fill out the form below and we'll get back to you within 24 hours with quotes
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Enter your full name" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" placeholder="+234 xxx xxx xxxx" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="location">Delivery Location *</Label>
                    <Input id="location" placeholder="City, State" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="carMake">Car Make *</Label>
                    <Input id="carMake" placeholder="e.g., Toyota, BMW, Mercedes" required />
                  </div>
                  <div>
                    <Label htmlFor="carModel">Car Model *</Label>
                    <Input id="carModel" placeholder="e.g., Camry, X5, C-Class" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="yearFrom">Year From</Label>
                    <Input id="yearFrom" placeholder="2018" />
                  </div>
                  <div>
                    <Label htmlFor="yearTo">Year To</Label>
                    <Input id="yearTo" placeholder="2023" />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget (₦)</Label>
                    <Input id="budget" placeholder="10,000,000" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="sourceCountry">Preferred Source Country</Label>
                    <select id="sourceCountry" className="w-full p-2 border rounded-md">
                      <option value="">Any Country</option>
                      <option value="usa">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="germany">Germany</option>
                      <option value="japan">Japan</option>
                      <option value="canada">Canada</option>
                      <option value="uae">UAE</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <select id="transmission" className="w-full p-2 border rounded-md">
                      <option value="">Any</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <select id="fuelType" className="w-full p-2 border rounded-md">
                      <option value="">Any</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="maxMileage">Maximum Mileage (km)</Label>
                    <Input id="maxMileage" placeholder="100,000" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specificRequests">Specific Requirements/Features</Label>
                  <Textarea 
                    id="specificRequests" 
                    placeholder="Any specific features, color preferences, or additional requirements..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="urgency">How urgent is this request?</Label>
                  <select id="urgency" className="w-full p-2 border rounded-md">
                    <option value="normal">Normal (4-8 weeks)</option>
                    <option value="urgent">Urgent (2-4 weeks)</option>
                    <option value="asap">ASAP (Rush order)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the <a href="#" className="text-red-600 hover:underline">Terms of Service</a> and understand that quotes are estimates subject to market conditions
                  </Label>
                </div>

                <div className="border-t pt-6">
                  <Button className="w-full bg-red-600 hover:bg-red-700 py-3 text-lg">
                    Submit Import Request
                  </Button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    We'll contact you within 24 hours with available options and pricing
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="font-bold mb-2">How long does the process take?</h3>
                <p className="text-gray-600 text-sm">Typically 4-8 weeks from order confirmation to delivery in Nigeria, depending on the source country and car availability.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">What's included in the service?</h3>
                <p className="text-gray-600 text-sm">Car sourcing, inspection, purchase, shipping, customs clearance, and delivery to your location.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Are there additional costs?</h3>
                <p className="text-gray-600 text-sm">Our quotes include all major costs. Minor additional fees may apply for special requests or expedited services.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">What if I'm not satisfied?</h3>
                <p className="text-gray-600 text-sm">We provide detailed inspection reports and photos before shipping. We work to ensure you're satisfied with your purchase.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BuyFromAbroad;
