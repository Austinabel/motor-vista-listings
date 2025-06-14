
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const states = [
  "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo"
];

const DealerRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    yearEstablished: "",
    cacNumber: "",
    taxId: "",
    description: "",
    website: "",
    monthlyInventory: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('dealers')
        .insert({
          business_name: formData.businessName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          state: formData.state,
          year_established: formData.yearEstablished,
          cac_number: formData.cacNumber,
          tax_id: formData.taxId || null,
          description: formData.description,
          website: formData.website || null,
          monthly_inventory: formData.monthlyInventory,
        });

      if (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
          toast.error("Email already registered. Please use a different email address.");
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.success("Registration submitted successfully! We'll review your application and contact you within 2-3 business days.");
        navigate("/");
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input 
                      id="businessName" 
                      placeholder="Your dealership name" 
                      required 
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Person *</Label>
                    <Input 
                      id="contactName" 
                      placeholder="Full name" 
                      required 
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="business@example.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      placeholder="+234 xxx xxx xxxx" 
                      required 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Business Address *</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Complete business address" 
                    required 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <select 
                      id="state" 
                      className="w-full p-2 border rounded-md" 
                      required
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="established">Year Established *</Label>
                    <Input 
                      id="established" 
                      placeholder="2020" 
                      required 
                      value={formData.yearEstablished}
                      onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="cacNumber">CAC Registration Number *</Label>
                    <Input 
                      id="cacNumber" 
                      placeholder="RC123456" 
                      required 
                      value={formData.cacNumber}
                      onChange={(e) => handleInputChange('cacNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax Identification Number</Label>
                    <Input 
                      id="taxId" 
                      placeholder="TIN" 
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Tell us about your dealership, specializations, and services..."
                    required 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input 
                      id="website" 
                      placeholder="https://yourwebsite.com" 
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inventory">Average Monthly Inventory *</Label>
                    <Input 
                      id="inventory" 
                      placeholder="50" 
                      required 
                      value={formData.monthlyInventory}
                      onChange={(e) => handleInputChange('monthlyInventory', e.target.value)}
                    />
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
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
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
