import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { IdCard, Upload, Copy, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const states = [
  "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo"
];

const idCardTypes = [
  { value: "national_id", label: "National Identity Card" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "international_passport", label: "International Passport" },
  { value: "voters_card", label: "Voter's Card" }
];

const DealerRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
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
    idCardType: "",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPG or PNG)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      toast.success("Business image uploaded successfully");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getDetailedErrorMessage = (error: any) => {
    if (error.code === '23505') {
      // Unique constraint violation
      const constraint = error.details || error.message || '';
      
      if (constraint.includes('dealers_email_unique')) {
        return "This email address is already registered. Please use a different email address.";
      } else if (constraint.includes('dealers_phone_unique')) {
        return "This phone number is already registered. Please use a different phone number.";
      } else if (constraint.includes('dealers_cac_number_unique')) {
        return "This CAC registration number is already in our system. Please verify your CAC number or contact support.";
      } else {
        return "Some of the information you provided is already registered in our system. Please check your email, phone number, and CAC number.";
      }
    }
    
    // Other common error codes
    switch (error.code) {
      case '23502':
        return "Please fill in all required fields.";
      case '23514':
        return "Please check that all values are in the correct format.";
      default:
        return "Registration failed. Please check your information and try again.";
    }
  };

  const handleRegistrationSubmission = async () => {
    if (!user) {
      toast.error("You must be logged in to register as a dealer.");
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Upload ID card
      if (!idCardFile) {
        toast.error("ID card file is missing. Please upload it.");
        setIsSubmitting(false);
        return;
      }

      const fileExt = idCardFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dealer_documents')
        .upload(filePath, idCardFile);

      if (uploadError) {
        console.error('Error uploading ID card:', uploadError);
        toast.error(`There was an error uploading your ID card: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      // 2. Upload business image (optional)
      let imageUrl = null;
      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop();
        const imageName = `image_${Date.now()}.${imageExt}`;
        const imagePath = `${user.id}/${imageName}`;

        const { data: imageUploadData, error: imageUploadError } = await supabase.storage
          .from('dealer_documents')
          .upload(imagePath, imageFile);

        if (imageUploadError) {
          console.error('Error uploading business image:', imageUploadError);
          toast.error(`There was an error uploading your business image: ${imageUploadError.message}`);
        } else {
          // Get public URL for the image
          const { data: { publicUrl } } = supabase.storage
            .from('dealer_documents')
            .getPublicUrl(imageUploadData.path);
          imageUrl = publicUrl;
        }
      }
      
      const registrationData = {
        business_name: formData.businessName,
        contact_name: formData.contactName,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        address: formData.address,
        state: formData.state,
        year_established: formData.yearEstablished,
        cac_number: formData.cacNumber.toUpperCase().trim(),
        tax_id: formData.taxId?.trim() || null,
        description: formData.description,
        website: formData.website?.trim() || null,
        user_id: user.id,
        monthly_inventory: formData.monthlyInventory,
        id_card_type: formData.idCardType,
        id_card_number: formData.idCardNumber.trim(),
        payment_reference: paymentReference.trim(),
        payment_status: 'pending',
        status: 'pending',
        id_card_path: uploadData.path, // The path of the uploaded file
        image_url: imageUrl, // The public URL of the business image
      };

      console.log('Submitting registration data:', registrationData);

      const { data, error } = await supabase
        .from('dealers')
        .insert(registrationData)
        .select();

      if (error) {
        console.error('Registration error:', error);
        // To prevent orphaned file uploads, try to delete the file if DB insert fails
        await supabase.storage.from('dealer_documents').remove([filePath]);
        const errorMessage = getDetailedErrorMessage(error);
        toast.error(errorMessage);
      } else {
        console.log('Registration successful:', data);
        toast.success("Registration submitted successfully! We'll review your payment and application within 2-3 business days.");
        navigate("/");
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    // Basic validation
    const requiredFields = [
      { field: 'businessName', label: 'Business Name' },
      { field: 'contactName', label: 'Contact Name' },
      { field: 'email', label: 'Email' },
      { field: 'phone', label: 'Phone' },
      { field: 'address', label: 'Address' },
      { field: 'state', label: 'State' },
      { field: 'yearEstablished', label: 'Year Established' },
      { field: 'cacNumber', label: 'CAC Number' },
      { field: 'description', label: 'Business Description' },
      { field: 'monthlyInventory', label: 'Monthly Inventory' },
      { field: 'idCardType', label: 'ID Card Type' },
      { field: 'idCardNumber', label: 'ID Card Number' }
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        toast.error(`${label} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    // CAC number validation (basic)
    if (formData.cacNumber.length < 6) {
      toast.error("CAC number seems too short. Please verify your CAC registration number.");
      return false;
    }

    if (!idCardFile) {
      toast.error("Please upload your ID card");
      return false;
    }

    if (!imageFile) {
      toast.error("Please upload your business image");
      return false;
    }

    if (!paymentReference.trim()) {
      toast.error("Please enter your payment reference/transaction ID");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await handleRegistrationSubmission();
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
                <p className="text-3xl font-bold text-red-600">₦35,000 <span className="text-lg font-normal text-gray-600">per year</span></p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>✓ Verified dealer badge</li>
                  <li>✓ Unlimited car listings</li>
                  <li>✓ Featured dealer placement</li>
                  <li>✓ Direct customer contact</li>
                  <li>✓ Analytics dashboard</li>
                  <li>✓ 24/7 customer support</li>
                </ul>
              </div>

              
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Instructions
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Please transfer ₦35,000 to the account below and enter the transaction reference in the form:
                </p>
                <div className="bg-white p-4 rounded-lg border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Bank Name:</span>
                    <div className="flex items-center space-x-2">
                      <span>Opay</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard("Opay", "Bank name")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account Number:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">7066056267</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard("7066056267", "Account number")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account Name:</span>
                    <div className="flex items-center space-x-2">
                      <span>Motorcars</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard("Motorcars", "Account name")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Amount:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-red-600">₦35,000</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard("35000", "Amount")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  After making the payment, please enter the transaction reference/ID in the form below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold text-green-700 mb-4">Payment Confirmation</h3>
                  <div>
                    <Label htmlFor="paymentReference">Payment Reference/Transaction ID *</Label>
                    <Input 
                      id="paymentReference" 
                      placeholder="Enter your payment reference or transaction ID" 
                      required 
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter the reference number you received after making the payment
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                    <IdCard className="w-5 h-5 mr-2" />
                    ID Card Verification
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="idCardType">ID Card Type *</Label>
                      <Select value={formData.idCardType} onValueChange={(value) => handleInputChange('idCardType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID card type" />
                        </SelectTrigger>
                        <SelectContent>
                          {idCardTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="idCardNumber">ID Card Number *</Label>
                      <Input 
                        id="idCardNumber" 
                        placeholder="Enter your ID card number" 
                        required 
                        value={formData.idCardNumber}
                        onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
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
                      Upload clear image/scan of your selected ID document (PDF, JPG, PNG - Max 5MB)
                    </p>
                    {idCardFile && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {idCardFile.name} uploaded successfully
                      </p>
                    )}
                  </div>
                </div>

                
                <div className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-700 mb-4">Business Image *</h3>
                  <div>
                    <Label htmlFor="businessImage">Upload Business Logo or Photo *</Label>
                    <div className="relative">
                      <Input 
                        id="businessImage" 
                        type="file" 
                        accept=".jpg,.jpeg,.png" 
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                        required
                      />
                      <Upload className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload your business logo or a photo of your dealership (JPG, PNG - Max 5MB)
                    </p>
                    {imageFile && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {imageFile.name} uploaded successfully
                      </p>
                    )}
                  </div>
                </div>

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
                    <p className="text-lg font-semibold">Total: ₦35,000/year</p>
                    <p className="text-sm text-gray-600">Please complete payment before submitting</p>
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
