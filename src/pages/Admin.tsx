
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  CheckCircle, 
  X, 
  Search, 
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Car,
  Users,
  Building2,
  Star,
  AlertTriangle
} from "lucide-react";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for demonstration
  const mockCars = [
    { id: 1, title: "2020 Toyota Camry", dealer: "Premium Auto Lagos", status: "pending", price: "₦15,500,000", verified: false },
    { id: 2, title: "2019 Honda Accord", dealer: "Capital Motors", status: "approved", price: "₦13,200,000", verified: true },
    { id: 3, title: "2021 Mercedes C-Class", dealer: "Elite Car Gallery", status: "rejected", price: "₦28,900,000", verified: false },
  ];

  const mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "buyer", status: "active", joinDate: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "seller", status: "suspended", joinDate: "2024-02-10" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "buyer", status: "active", joinDate: "2024-03-05" },
  ];

  const mockDealers = [
    { id: 1, name: "Premium Auto Lagos", contact: "contact@premiumauto.com", location: "Lagos", verified: true, totalCars: 45, rating: 4.8 },
    { id: 2, name: "New Motors Abuja", contact: "info@newmotors.com", location: "Abuja", verified: false, totalCars: 23, rating: 4.2 },
    { id: 3, name: "Elite Car Gallery", contact: "sales@elitecar.com", location: "Port Harcourt", verified: true, totalCars: 28, rating: 4.9 },
  ];

  const mockAds = [
    { id: 1, title: "Premium Toyota Camry Sale", advertiser: "Premium Auto Lagos", type: "featured", status: "active", budget: "₦50,000" },
    { id: 2, title: "Honda Accord Special Offer", advertiser: "Capital Motors", type: "sponsored", status: "pending", budget: "₦30,000" },
    { id: 3, title: "Luxury Mercedes Collection", advertiser: "Elite Car Gallery", type: "banner", status: "rejected", budget: "₦75,000" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage cars, users, dealers, and advertisements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cars</p>
                  <p className="text-2xl font-bold">1,245</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">3,567</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Dealers</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cars" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
            <TabsTrigger value="ads">Ads & Features</TabsTrigger>
            <TabsTrigger value="listings">List Cars</TabsTrigger>
          </TabsList>

          {/* Cars Management */}
          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <CardTitle>Car Listings Management</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cars..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car Details</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">{car.title}</TableCell>
                        <TableCell>{car.dealer}</TableCell>
                        <TableCell>{car.price}</TableCell>
                        <TableCell>{getStatusBadge(car.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <X className="h-4 w-4" />
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
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-8" />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
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
                <CardTitle>Dealer Management</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search dealers..." className="pl-8" />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Cars</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">{dealer.name}</TableCell>
                        <TableCell>{dealer.contact}</TableCell>
                        <TableCell>{dealer.location}</TableCell>
                        <TableCell>{dealer.totalCars}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {dealer.rating}
                          </div>
                        </TableCell>
                        <TableCell>
                          {dealer.verified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
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
                <CardTitle>Advertisements & Featured Listings</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search ads..." className="pl-8" />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Title</TableHead>
                      <TableHead>Advertiser</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAds.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>{ad.advertiser}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ad.type}</Badge>
                        </TableCell>
                        <TableCell>{ad.budget}</TableCell>
                        <TableCell>{getStatusBadge(ad.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
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

          {/* List Cars */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Add New Car Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Car Make</label>
                      <Input placeholder="e.g., Toyota" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Car Model</label>
                      <Input placeholder="e.g., Camry" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Year</label>
                      <Input placeholder="e.g., 2020" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <Input placeholder="e.g., ₦15,500,000" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Mileage</label>
                      <Input placeholder="e.g., 45,000 km" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Fuel Type</label>
                      <Input placeholder="e.g., Petrol" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Transmission</label>
                      <Input placeholder="e.g., Automatic" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <Input placeholder="e.g., Lagos, Nigeria" />
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="w-full md:w-auto">Add Car Listing</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
