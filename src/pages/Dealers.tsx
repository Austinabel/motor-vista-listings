import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Star, Filter, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

const dealers = [
  {
    id: 1,
    name: "Premium Auto Lagos",
    location: "Victoria Island, Lagos",
    state: "Lagos",
    phone: "+234 801 234 5678",
    email: "info@premiumauto.ng",
    rating: 4.8,
    totalCars: 45,
    established: "2015",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 2,
    name: "Royal Motors Abuja",
    location: "Wuse 2, Abuja",
    state: "FCT",
    phone: "+234 802 345 6789",
    email: "info@royalmotors.ng",
    rating: 4.9,
    totalCars: 32,
    established: "2018",
    image: "https://images.unsplash.com/photo-1562141961-f1e70c7d2ac6?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 3,
    name: "Elite Car Center",
    location: "GRA, Port Harcourt",
    state: "Rivers",
    phone: "+234 803 456 7890",
    email: "info@elitecar.ng",
    rating: 4.7,
    totalCars: 28,
    established: "2016",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 4,
    name: "Luxury Auto Hub",
    location: "Ikeja, Lagos",
    state: "Lagos",
    phone: "+234 804 567 8901",
    email: "info@luxuryauto.ng",
    rating: 4.6,
    totalCars: 38,
    established: "2017",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 5,
    name: "Metro Car Sales",
    location: "Surulere, Lagos",
    state: "Lagos",
    phone: "+234 805 678 9012",
    email: "info@metro.ng",
    rating: 4.5,
    totalCars: 25,
    established: "2019",
    image: "https://images.unsplash.com/photo-1517524206127-6d22353d8482?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 6,
    name: "Crown Motors",
    location: "Kaduna",
    state: "Kaduna",
    phone: "+234 806 789 0123",
    email: "info@crown.ng",
    rating: 4.8,
    totalCars: 31,
    established: "2016",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 7,
    name: "Diamond Auto",
    location: "Enugu",
    state: "Enugu",
    phone: "+234 807 890 1234",
    email: "info@diamond.ng",
    rating: 4.7,
    totalCars: 22,
    established: "2018",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 8,
    name: "Golden Gate Motors",
    location: "Ilorin",
    state: "Kwara",
    phone: "+234 808 901 2345",
    email: "info@golden.ng",
    rating: 4.6,
    totalCars: 29,
    established: "2017",
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 9,
    name: "Apex Auto Sales",
    location: "Onitsha, Anambra",
    state: "Anambra",
    phone: "+234 809 012 3456",
    email: "info@apex.ng",
    rating: 4.4,
    totalCars: 33,
    established: "2020",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 10,
    name: "Star Motors",
    location: "Benin City, Edo",
    state: "Edo",
    phone: "+234 810 123 4567",
    email: "info@star.ng",
    rating: 4.5,
    totalCars: 27,
    established: "2019",
    image: "https://images.unsplash.com/photo-1562141961-f1e70c7d2ac6?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 11,
    name: "Unity Car Mart",
    location: "Warri, Delta",
    state: "Delta",
    phone: "+234 811 234 5678",
    email: "info@unity.ng",
    rating: 4.3,
    totalCars: 24,
    established: "2021",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
    verified: true,
  },
  {
    id: 12,
    name: "Excellence Motors",
    location: "Owerri, Imo",
    state: "Imo",
    phone: "+234 812 345 6789",
    email: "info@excellence.ng",
    rating: 4.6,
    totalCars: 30,
    established: "2018",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=200&fit=crop",
    verified: true,
  },
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const DEALERS_PER_PAGE = 8;

const Dealers = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedDealers, setDisplayedDealers] = useState(DEALERS_PER_PAGE);

  const filteredDealers = selectedState 
    ? dealers.filter(dealer => dealer.state === selectedState)
    : dealers;

  const totalPages = Math.ceil(filteredDealers.length / DEALERS_PER_PAGE);
  const paginatedDealers = filteredDealers.slice(0, displayedDealers);
  const hasMore = displayedDealers < filteredDealers.length;

  const handleLoadMore = () => {
    setDisplayedDealers(prev => Math.min(prev + DEALERS_PER_PAGE, filteredDealers.length));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setDisplayedDealers(page * DEALERS_PER_PAGE);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Car Dealers</h1>
              <p className="text-gray-600">{filteredDealers.length} verified dealers found</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Filters</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location/State</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">All States</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="rating">Minimum Rating</Label>
                    <Input placeholder="4.0" />
                  </div>
                  <div>
                    <Label htmlFor="established">Established Year</Label>
                    <Input placeholder="2015" />
                  </div>
                  <div>
                    <Label htmlFor="inventory">Min Cars in Stock</Label>
                    <Input placeholder="20" />
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Apply Filters</Button>
                  <Button variant="outline" className="w-full">Reset Filters</Button>
                </div>
              </Card>
            </div>

            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedDealers.map((dealer) => (
                  <Card key={dealer.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
                    <div className="relative">
                      <img 
                        src={dealer.image} 
                        alt={dealer.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      {dealer.verified && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2">{dealer.name}</h3>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{dealer.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                            <span>{dealer.rating}</span>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {dealer.totalCars} cars
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-3">
                        <Link to={`/dealer/${dealer.id}`} className="flex-1">
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-xs py-1">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
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
                    Load More Dealers
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dealers;
