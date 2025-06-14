
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Car, Users, Building2, Star, Edit, Trash2, Eye, 
  CheckCircle, XCircle, Upload, Plus, Search, LogOut
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";

const Admin = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cars");

  // Move all useState hooks to the top before any conditional logic
  const [newCarData, setNewCarData] = useState({
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
    images: [] as File[],
  });

  // Platform data states
  const [platformCars, setPlatformCars] = useState([]);
  const [platformUsers, setPlatformUsers] = useState([]);
  const [platformDealers, setPlatformDealers] = useState([]);
  const [platformAds, setPlatformAds] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Fetch platform data when component loads
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    try {
      // Fetch real dealers from database
      const { data: dealersData, error: dealersError } = await supabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealersError) {
        console.error('Error fetching dealers:', dealersError);
        toast.error('Failed to fetch dealers data');
      } else {
        setPlatformDealers(dealersData || []);
      }
    } catch (error) {
      console.error('Error in fetchPlatformData:', error);
    }

    // Mock data for other sections (to be replaced with real data later)
    const cars = [
      { id: 1, make: "Toyota", model: "Camry", year: "2020", price: "₦8,500,000", condition: "Foreign Used", location: "Lagos", dealer: "Premium Auto Lagos", status: "active", views: 1250, createdAt: "2024-01-15" },
      { id: 2, make: "Honda", model: "Accord", year: "2019", price: "₦7,200,000", condition: "Foreign Used", location: "Abuja", dealer: "Royal Motors Abuja", status: "active", views: 890, createdAt: "2024-01-20" },
      { id: 3, make: "Mercedes", model: "C-Class", year: "2021", price: "₦15,000,000", condition: "Brand New", location: "Lagos", dealer: "Elite Car Center", status: "pending", views: 2100, createdAt: "2024-02-01" },
      { id: 4, make: "BMW", model: "X5", year: "2020", price: "₦18,500,000", condition: "Foreign Used", location: "Port Harcourt", dealer: "Luxury Auto Hub", status: "active", views: 1567, createdAt: "2024-01-25" },
      { id: 5, make: "Lexus", model: "RX350", year: "2019", price: "₦12,800,000", condition: "Foreign Used", location: "Abuja", dealer: "Crown Motors", status: "active", views: 1034, createdAt: "2024-02-05" },
    ];

    const users = [
      { id: 1, name: "John Doe", email: "john@example.com", type: "buyer", status: "active", joinDate: "2024-01-15", lastActive: "2024-06-10", totalPurchases: 2, favoriteListings: 15 },
      { id: 2, name: "Jane Smith", email: "jane@example.com", type: "seller", status: "active", joinDate: "2024-02-10", lastActive: "2024-06-12", totalSales: 5, activeListing: 3 },
      { id: 3, name: "Mike Johnson", email: "mike@example.com", type: "buyer", status: "suspended", joinDate: "2024-01-20", lastActive: "2024-06-01", totalPurchases: 0, favoriteListings: 8 },
      { id: 4, name: "Sarah Wilson", email: "sarah@example.com", type: "dealer", status: "active", joinDate: "2024-01-18", lastActive: "2024-06-13", dealership: "Premium Auto Lagos", totalSales: 45 },
      { id: 5, name: "David Brown", email: "david@example.com", type: "buyer", status: "active", joinDate: "2024-02-22", lastActive: "2024-06-11", totalPurchases: 1, favoriteListings: 22 },
    ];

    const ads = [
      { id: 1, title: "2020 Toyota Camry - Premium Condition", dealer: "Premium Auto Lagos", price: "₦8,500,000", status: "active", views: 1250, clicks: 89, startDate: "2024-06-01", endDate: "2024-06-30", type: "featured" },
      { id: 2, title: "2019 Honda Accord - Excellent Deal", dealer: "Royal Motors Abuja", price: "₦7,200,000", status: "active", views: 890, clicks: 67, startDate: "2024-06-05", endDate: "2024-07-05", type: "sponsored" },
      { id: 3, title: "2021 Mercedes C-Class - Luxury Edition", dealer: "Elite Car Center", price: "₦15,000,000", status: "pending", views: 2100, clicks: 145, startDate: "2024-06-10", endDate: "2024-07-10", type: "featured" },
      { id: 4, title: "BMW X5 2020 - SUV Special", dealer: "Luxury Auto Hub", price: "₦18,500,000", status: "expired", views: 1567, clicks: 112, startDate: "2024-05-15", endDate: "2024-06-14", type: "banner" },
      { id: 5, title: "Lexus RX350 - Family Perfect", dealer: "Crown Motors", price: "₦12,800,000", status: "active", views: 1034, clicks: 78, startDate: "2024-06-08", endDate: "2024-07-08", type: "featured" },
    ];

    setPlatformCars(cars);
    setPlatformUsers(users);
    setPlatformAds(ads);
  };

  const handleDealerStatusUpdate = async (dealerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('dealers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealerId);

      if (error) {
        console.error('Error updating dealer status:', error);
        toast.error('Failed to update dealer status');
      } else {
        toast.success(`Dealer ${newStatus} successfully`);
        fetchPlatformData(); // Refresh the data
      }
    } catch (error) {
      console.error('Error in handleDealerStatusUpdate:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/admin/login");
    }
  };

  // Show loading or redirect if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const carFeatures = [
    "Air Conditioning", "Power Steering", "Central Locking", "Electric Windows",
    "ABS", "Airbags", "Alloy Wheels", "Bluetooth", "GPS Navigation", "Sunroof",
    "Leather Seats", "Parking Sensors", "Reverse Camera", "Cruise Control"
  ];

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setNewCarData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    } else {
      setNewCarData(prev => ({
        ...prev,
        features: prev.features.filter(f => f !== feature)
      }));
    }
  };

  const handleSubmitNewCar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New car submitted:", newCarData);
    toast.success("Car listing added successfully!");
    // Reset form
    setNewCarData({
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
      features: [],
      images: [],
    });
  };

  const menuItems = [
    { id: "cars", title: "Cars", icon: Car },
    { id: "users", title: "Users", icon: Users },
    { id: "dealers", title: "Dealers", icon: Building2 },
    { id: "ads", title: "Ads & Features", icon: Star },
    { id: "add-car", title: "List Cars", icon: Plus },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "cars":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Car Listings Management ({platformCars.length} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Input placeholder="Search cars..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => setActiveTab("add-car")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Car
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformCars.map((car: any) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.make} {car.model}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{car.price}</TableCell>
                      <TableCell>{car.location}</TableCell>
                      <TableCell>{car.dealer}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            car.status === "active" ? "default" : 
                            car.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {car.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{car.views}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "users":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management ({platformUsers.length} total users)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Input placeholder="Search users..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === "active" ? "default" : "destructive"}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        {user.totalPurchases !== undefined && `${user.totalPurchases} purchases`}
                        {user.totalSales !== undefined && `${user.totalSales} sales`}
                        {user.favoriteListings !== undefined && `, ${user.favoriteListings} favorites`}
                        {user.activeListing !== undefined && `, ${user.activeListing} active`}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "dealers":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dealer Management ({platformDealers.length} dealers)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Input placeholder="Search dealers..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformDealers.map((dealer: any) => (
                    <TableRow key={dealer.id}>
                      <TableCell className="font-medium">{dealer.business_name}</TableCell>
                      <TableCell>{dealer.contact_name}</TableCell>
                      <TableCell>{dealer.email}</TableCell>
                      <TableCell>{dealer.phone}</TableCell>
                      <TableCell>{dealer.state}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            dealer.status === "verified" ? "default" : 
                            dealer.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {dealer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(dealer.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {dealer.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDealerStatusUpdate(dealer.id, "verified")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDealerStatusUpdate(dealer.id, "rejected")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "ads":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Ads & Featured Listings ({platformAds.length} campaigns)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Input placeholder="Search ads..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformAds.map((ad: any) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.dealer}</TableCell>
                      <TableCell>{ad.price}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ad.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            ad.status === "active" ? "default" : 
                            ad.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {ad.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{ad.views}</TableCell>
                      <TableCell>{ad.clicks}</TableCell>
                      <TableCell>{ad.startDate} - {ad.endDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "add-car":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Car Listing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitNewCar} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Select value={newCarData.make} onValueChange={(value) => setNewCarData(prev => ({ ...prev, make: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="honda">Honda</SelectItem>
                        <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                        <SelectItem value="bmw">BMW</SelectItem>
                        <SelectItem value="audi">Audi</SelectItem>
                        <SelectItem value="lexus">Lexus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input 
                      id="model" 
                      value={newCarData.model}
                      onChange={(e) => setNewCarData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Enter model" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Select value={newCarData.year} onValueChange={(value) => setNewCarData(prev => ({ ...prev, year: value }))}>
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
                      value={newCarData.mileage}
                      onChange={(e) => setNewCarData(prev => ({ ...prev, mileage: e.target.value }))}
                      placeholder="Enter mileage" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₦) *</Label>
                    <Input 
                      id="price" 
                      type="number"
                      value={newCarData.price}
                      onChange={(e) => setNewCarData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Enter price" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={newCarData.condition} onValueChange={(value) => setNewCarData(prev => ({ ...prev, condition: value }))}>
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
                    <Select value={newCarData.fuelType} onValueChange={(value) => setNewCarData(prev => ({ ...prev, fuelType: value }))}>
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
                    <Select value={newCarData.transmission} onValueChange={(value) => setNewCarData(prev => ({ ...prev, transmission: value }))}>
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
                      value={newCarData.color}
                      onChange={(e) => setNewCarData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Enter color" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Select value={newCarData.location} onValueChange={(value) => setNewCarData(prev => ({ ...prev, location: value }))}>
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
                    value={newCarData.description}
                    onChange={(e) => setNewCarData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the car's condition, history, and any additional details..."
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
                          checked={newCarData.features.includes(feature)}
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
                    <Button type="button" variant="outline" className="mt-2">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 px-8">
                    Add Car Listing
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-7 w-7" />
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                  <p className="text-muted-foreground">
                    Manage cars, users, dealers, and featured listings
                  </p>
                </div>
              </div>
            </div>
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
