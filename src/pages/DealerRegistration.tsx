
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";

const states = [
  "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo"
];

const DealerRegistration = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DealerRegistration;
