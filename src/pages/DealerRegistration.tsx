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
import { IdCard, Upload } from "lucide-react";

const states = [
  "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo"
];

const DealerRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
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
    idCardNumber: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid ID card (JPG, PNG, or PDF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setIdCardFile(file);
      toast.success("ID card uploaded successfully");
    }
  };

  const initiateFlutterwavePayment = () => {
    setIsProcessingPayment(true);
    
    // Flutterwave payment configuration
    const paymentData = {
      public_key: "FLWPUBK_TEST-your-public-key-here", // Replace with your actual public key
      tx_ref: `dealer_reg_${Date.now()}`,
      amount: 150000,
      currency: "NGN",
      payment_options: "card,mobilemoney,ussd,banktransfer",
      customer: {
        email: formData.email,
        phone_number: formData.phone,
        name: formData.contactName,
      },
      customizations: {
        title: "Dealer Registration Fee",
        description: "Annual dealer registration and verification fee",
        logo: "",
      },
      callback: (response: any) => {
        console.log("Payment response:", response);
        if (response.status === "successful") {
          handleRegistrationSubmission(response.transaction_id);
        } else {
          toast.error("Payment failed. Please try again.");
          setIsProcessingPayment(false);
        }
      },
      onclose: () => {
        toast.info("Payment window closed");
        setIsProcessingPayment(false);
      },
    };

    // Initialize Flutterwave payment
    // @ts-ignore
    window.FlutterwaveCheckout(paymentData);
  };

  const handleRegistrationSubmission = async (transactionId?: string) => {
    try {
      const registrationData = {
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
        id_card_number: formData.idCardNumber,
        payment_reference: transactionId || null,
        payment_status: transactionId ? 'completed' : 'pending',
      };

      const { error } = await supabase
        .from('dealers')
        .insert(registrationData);

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
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.idCardNumber) {
      toast.error("Please enter your ID card number");
      return;
    }
    
    if (!idCardFile) {
      toast.error("Please upload your ID card");
      return;
    }

    setIsSubmitting(true);
    
    // Check if Flutterwave is loaded
    // @ts-ignore
    if (typeof window.FlutterwaveCheckout === 'undefined') {
      toast.error("Payment system not loaded. Please refresh the page.");
      setIsSubmitting(false);
      return;
    }

    // Initiate payment
    initiateFlutterwavePayment();
  };

  return (
    <>
      {/* Flutterwave Script */}
      <script src="https://checkout.flutterwave.com/v3.js"></script>
      
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
                {/* ID Card Verification Section */}
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                    <IdCard className="w-5 h-5 mr-2" />
                    ID Card Verification
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="idCardNumber">ID Card Number *</Label>
                      <Input 
                        id="idCardNumber" 
                        placeholder="Enter your National ID, Driver's License, or Passport number" 
                        required 
                        value={formData.idCardNumber}
                        onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="idCardUpload">Upload ID Card *</Label>
                      <div className="relative">
                        <Input 
                          id="idCardUpload" 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png" 
                          required
                          onChange={handleIdCardUpload}
                          className="cursor-pointer"
                        />
                        <Upload className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload clear image/scan of your National ID, Driver's License, or International Passport (PDF, JPG, PNG - Max 5MB)
                      </p>
                      {idCardFile && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {idCardFile.name} uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Existing form fields */}
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

                {/* Payment Section */}
                <div className="border-t pt-6">
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200 mb-6">
                    <h3 className="text-lg font-bold text-green-700 mb-2">Secure Payment via Flutterwave</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your payment is processed securely through Flutterwave. We accept all major payment methods.
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>✓ Card Payments</span>
                      <span>✓ Bank Transfer</span>
                      <span>✓ Mobile Money</span>
                      <span>✓ USSD</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-lg font-semibold">Total: ₦150,000/year</p>
                    <p className="text-sm text-gray-600">Secure payment processed via Flutterwave</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 py-3"
                    disabled={isSubmitting || isProcessingPayment}
                  >
                    {isProcessingPayment ? "Processing Payment..." : isSubmitting ? "Submitting..." : "Pay ₦150,000 & Submit Application"}
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
