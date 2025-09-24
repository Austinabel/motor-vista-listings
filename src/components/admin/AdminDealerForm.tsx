import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building, Plus } from "lucide-react";

const states = [
  "Lagos", "FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Edo", "Delta", "Anambra", "Imo",
  "Abia", "Adamawa", "Akwa Ibom", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Ebonyi", "Ekiti", "Enugu", "Gombe", "Jigawa", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Plateau", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

interface AdminDealerFormProps {
  onDealerCreated: () => void;
}

export const AdminDealerForm = ({ onDealerCreated }: AdminDealerFormProps) => {
  const [loading, setLoading] = useState(false);
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

  const validateForm = () => {
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
      { field: 'monthlyInventory', label: 'Monthly Inventory' }
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

    // Phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
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
      const dealerData = {
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
        monthly_inventory: formData.monthlyInventory,
        admin_created: true, // This will trigger auto-approval
        user_id: null, // Admin-created dealers don't have associated user accounts initially
        id_card_type: null,
        id_card_number: null,
        payment_reference: "ADMIN_CREATED",
      };

      const { data, error } = await supabase
        .from('dealers')
        .insert(dealerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating dealer:', error);
        if (error.code === '23505') {
          toast.error("A dealer with this email, phone, or CAC number already exists.");
        } else {
          toast.error("Failed to create dealer. Please try again.");
        }
      } else {
        toast.success("Dealer created and auto-approved successfully!");
        // Reset form
        setFormData({
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
        onDealerCreated();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Add New Dealer (Admin)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Enter business name"
                required
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contactName">Contact Person *</Label>
              <Input
                id="contactName"
                placeholder="Enter contact person name"
                required
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="yearEstablished">Year Established *</Label>
              <Input
                id="yearEstablished"
                placeholder="e.g., 2015"
                required
                value={formData.yearEstablished}
                onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cacNumber">CAC Registration Number *</Label>
              <Input
                id="cacNumber"
                placeholder="Enter CAC number"
                required
                value={formData.cacNumber}
                onChange={(e) => handleInputChange('cacNumber', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID (TIN)</Label>
              <Input
                id="taxId"
                placeholder="Enter tax identification number"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="monthlyInventory">Average Monthly Inventory *</Label>
              <Select value={formData.monthlyInventory} onValueChange={(value) => handleInputChange('monthlyInventory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inventory range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 cars</SelectItem>
                  <SelectItem value="11-25">11-25 cars</SelectItem>
                  <SelectItem value="26-50">26-50 cars</SelectItem>
                  <SelectItem value="51-100">51-100 cars</SelectItem>
                  <SelectItem value="100+">100+ cars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter complete business address"
              required
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Business Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the business and what makes it unique"
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Creating Dealer..." : "Create Dealer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};