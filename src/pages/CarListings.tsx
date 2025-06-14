
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Eye, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

const cars = [
  {
    id: 1,
    title: "2020 Toyota Camry LE",
    price: "₦15,500,000",
    location: "Lagos, Nigeria",
    mileage: "45,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2020,
    type: "brand-new",
    category: "toyota",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "2019 Honda Accord Sport",
    price: "₦13,200,000",
    location: "Abuja, Nigeria",
    mileage: "52,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2019,
    type: "foreign-used",
    category: "honda",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "2021 Mercedes C-Class",
    price: "₦28,900,000",
    location: "Port Harcourt, Nigeria",
    mileage: "28,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2021,
    type: "brand-new",
    category: "mercedes-benz",
    image: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    title: "2018 BMW 3 Series",
    price: "₦18,750,000",
    location: "Lagos, Nigeria",
    mileage: "68,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2018,
    type: "local-used",
    category: "bmw",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    title: "2022 Toyota Corolla",
    price: "₦12,500,000",
    location: "Kano, Nigeria",
    mileage: "15,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2022,
    type: "foreign-used",
    category: "toyota",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    title: "2017 Hyundai Elantra",
    price: "₦8,200,000",
    location: "Ibadan, Nigeria",
    mileage: "85,000 km",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2017,
    type: "local-used",
    category: "hyundai",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
  },
  {
    id: 7,
    title: "Tesla Model 3",
    price: "₦35,000,000",
    location: "Lagos, Nigeria",
    mileage: "12,000 km",
    fuel: "Electric",
    transmission: "Automatic",
    year: 2023,
    type: "brand-new",
    category: "electric-cars",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop",
  },
  {
    id: 8,
    title: "Ford Explorer 2020",
    price: "₦22,000,000",
    location: "Abuja, Nigeria",
    mileage: "35,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2020,
    type: "foreign-used",
    category: "ford",
    image: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&h=250&fit=crop",
  },
  {
    id: 9,
    title: "Lexus RX 350",
    price: "₦32,500,000",
    location: "Port Harcourt, Nigeria",
    mileage: "28,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2021,
    type: "brand-new",
    category: "lexus",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=250&fit=crop",
  },
  {
    id: 10,
    title: "Acura MDX 2019",
    price: "₦25,000,000",
    location: "Lagos, Nigeria",
    mileage: "42,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2019,
    type: "foreign-used",
    category: "acura",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop",
  },
  {
    id: 11,
    title: "Innoson IVM G40",
    price: "₦8,500,000",
    location: "Nnewi, Nigeria",
    mileage: "15,000 km",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2022,
    type: "brand-new",
    category: "innoson",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: 12,
    title: "Nissan Altima 2020",
    price: "₦14,000,000",
    location: "Kaduna, Nigeria",
    mileage: "38,000 km",
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2020,
    type: "foreign-used",
    category: "nissan",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop",
  },
  {
    id: 13,
    title: "Bajaj Tricycle RE",
    price: "₦1,800,000",
    location: "Kano, Nigeria",
    mileage: "5,000 km",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2023,
    type: "brand-new",
    category: "tricycles",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
  },
  {
    id: 14,
    title: "Honda CBR 600",
    price: "₦3,200,000",
    location: "Lagos, Nigeria",
    mileage: "8,000 km",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2022,
    type: "foreign-used",
    category: "motorbikes",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
  },
  {
    id: 15,
    title: "MAN Truck TGS",
    price: "₦45,000,000",
    location: "Lagos, Nigeria",
    mileage: "120,000 km",
    fuel: "Diesel",
    transmission: "Manual",
    year: 2019,
    type: "foreign-used",
    category: "trucks",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop",
  },
  {
    id: 16,
    title: "Toyota Hiace Bus",
    price: "₦18,500,000",
    location: "Abuja, Nigeria",
    mileage: "65,000 km",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2020,
    type: "foreign-used",
    category: "buses-shuttles",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop",
  },
];

const categories = [
  { id: "electric-cars", name: "Electric Cars", logo: "⚡" },
  { id: "tricycles", name: "Tricycles", logo: "🛺" },
  { id: "trucks", name: "Trucks", logo: "🚛" },
  { id: "motorbikes", name: "Motorbikes", logo: "🏍️" },
  { id: "buses-shuttles", name: "Buses & Shuttles", logo: "🚌" },
  { id: "toyota", name: "Toyota", logo: "🚗" },
  { id: "ford", name: "Ford", logo: "🚙" },
  { id: "honda", name: "Honda", logo: "🚗" },
  { id: "lexus", name: "Lexus", logo: "🚗" },
  { id: "mercedes-benz", name: "Mercedes Benz", logo: "🚗" },
  { id: "bmw", name: "BMW", logo: "🚗" },
  { id: "acura", name: "Acura", logo: "🚗" },
  { id: "innoson", name: "Innoson", logo: "🚗" },
  { id: "nissan", name: "Nissan", logo: "🚗" },
];

const CARS_PER_PAGE = 8;

const CarListings = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedCars, setDisplayedCars] = useState(CARS_PER_PAGE);

  const filterCarsByType = (type: string) => {
    if (type === "all") return cars;
    return cars.filter(car => car.type === type);
  };

  const filterCarsByCategory = (cars: any[], category: string) => {
    if (!category) return cars;
    return cars.filter(car => car.category === category);
  };

  let filteredCars = filterCarsByType(selectedTab);
  filteredCars = filterCarsByCategory(filteredCars, selectedCategory);

  const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);
  const paginatedCars = filteredCars.slice(0, displayedCars);
  const hasMore = displayedCars < filteredCars.length;

  const handleLoadMore = () => {
    setDisplayedCars(prev => Math.min(prev + CARS_PER_PAGE, filteredCars.length));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setDisplayedCars(page * CARS_PER_PAGE);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Car Listings</h1>
              <p className="text-gray-600">{filteredCars.length} cars found</p>
            </div>
            <Button onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Listings</TabsTrigger>
              <TabsTrigger value="brand-new">Brand New</TabsTrigger>
              <TabsTrigger value="foreign-used">Foreign Used</TabsTrigger>
              <TabsTrigger value="local-used">Local Used</TabsTrigger>
            </TabsList>

            <div className="mb-8 mt-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedCategory("")}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className="rounded-full flex items-center gap-2"
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? "" : category.id)}
                  >
                    <span className="text-xs">{category.logo}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Filters</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="priceRange">Price Range (₦)</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="make">Make</Label>
                      <Input placeholder="Select make" />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input placeholder="Select model" />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <div className="flex gap-2">
                        <Input placeholder="From" />
                        <Input placeholder="To" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="transmission">Transmission</Label>
                      <Input placeholder="Any" />
                    </div>
                    <div>
                      <Label htmlFor="fuel">Fuel Type</Label>
                      <Input placeholder="Any" />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input placeholder="Location" />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Input placeholder="Any condition" />
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700">Apply Filters</Button>
                    <Button variant="outline" className="w-full">Reset Filters</Button>
                  </div>
                </Card>
              </div>

              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {paginatedCars.map((car) => (
                    <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                      <div className="relative">
                        <img src={car.image} alt={car.title} className="w-full h-40 object-cover" />
                        <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                            {car.type === "brand-new" ? "Brand New" : 
                             car.type === "foreign-used" ? "Foreign Used" : "Local Used"}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-bold text-sm mb-1 line-clamp-2">{car.title}</h3>
                        <p className="text-lg font-bold text-red-600 mb-1">{car.price}</p>
                        <p className="text-xs text-gray-600 mb-2">{car.location}</p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <span>{car.mileage}</span>
                          <span>{car.fuel} • {car.transmission}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <Link to={`/cars/${car.id}`} className="w-full">
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-xs">
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination and Load More */}
                <div className="mt-8 flex flex-col items-center gap-4">
                  {hasMore && (
                    <Button 
                      onClick={handleLoadMore}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Load More Cars
                    </Button>
                  )}
                  
                  {totalPages > 1 && (
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={currentPage === page ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CarListings;
