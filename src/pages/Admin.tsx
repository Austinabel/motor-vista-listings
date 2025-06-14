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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Car, Users, Building2, Star, Edit, Trash2, Eye, 
  CheckCircle, XCircle, Upload, Plus, Search, LogOut
} from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [user, loading, navigate]);

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
    // Handle form submission
  };

  // Sample data
  const cars = [
    { id: 1, make: "Toyota", model: "Camry", year: "2020", price: "₦8,500,000", status: "pending", dealer: "Premium Auto" },
    { id: 2, make: "Honda", model: "Accord", year: "2019", price: "₦7,200,000", status: "verified", dealer: "Royal Motors" },
    { id: 3, make: "Mercedes", model: "C-Class", year: "2021", price: "₦15,000,000", status: "rejected", dealer: "Elite Cars" },
  ];

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", type: "buyer", status: "active", joinDate: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", type: "seller", status: "active", joinDate: "2024-02-10" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", type: "buyer", status: "suspended", joinDate: "2024-01-20" },
  ];

  const dealers = [
    { id: 1, name: "Premium Auto Lagos", location: "Lagos", cars: 45, status: "verified", rating: 4.8 },
    { id: 2, name: "Royal Motors Abuja", location: "Abuja", cars: 32, status: "pending", rating: 4.9 },
    { id: 3, name: "Elite Car Center", location: "Port Harcourt", cars: 28, status: "verified", rating: 4.7 },
  ];

  const featuredAds = [
    { id: 1, title: "2020 Toyota Camry", dealer: "Premium Auto", price: "₦8,500,000", status: "active", views: 1250 },
    { id: 2, title: "2019 Honda Accord", dealer: "Royal Motors", price: "₦7,200,000", status: "pending", views: 890 },
    { id: 3, title: "2021 Mercedes C-Class", dealer: "Elite Cars", price: "₦15,000,000", status: "expired", views: 2100 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">Manage cars, users, dealers, and featured listings</p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="cars" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="ads">Ads & Features</TabsTrigger>
            <TabsTrigger value="add-car">List Cars</TabsTrigger>
          </TabsList>

          {/* Cars Management */}
          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Car Listings Management
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
                  <Button className="bg-red-600 hover:bg-red-700">
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
                      <TableHead>Dealer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">{car.make} {car.model}</TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{car.price}</TableCell>
                        <TableCell>{car.dealer}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              car.status === "verified" ? "default" : 
                              car.status === "pending" ? "secondary" : "destructive"
                            }
                          >
                            {car.status}
                          </Badge>
                        </TableCell>
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
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
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
          </TabsContent>

          {/* Dealers Management */}
          <TabsContent value="dealers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dealer Management
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
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Cars</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">{dealer.name}</TableCell>
                        <TableCell>{dealer.location}</TableCell>
                        <TableCell>{dealer.cars}</TableCell>
                        <TableCell>{dealer.rating} ⭐</TableCell>
                        <TableCell>
                          <Badge 
                            variant={dealer.status === "verified" ? "default" : "secondary"}
                          >
                            {dealer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
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
          </TabsContent>

          {/* Ads & Featured Listings */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Ads & Featured Listings
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
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featuredAds.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>{ad.dealer}</TableCell>
                        <TableCell>{ad.price}</TableCell>
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
          </TabsContent>

          {/* List Cars Form */}
          <TabsContent value="add-car">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
