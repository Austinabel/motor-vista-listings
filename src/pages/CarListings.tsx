import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Filter, User, Building, LogIn } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  // Vehicle Types
  { id: "electric-cars", name: "Electric Cars", logo: "⚡", type: "vehicle_type" },
  { id: "tricycles", name: "Tricycles", logo: "🛺", type: "vehicle_type" },
  { id: "trucks", name: "Trucks", logo: "🚛", type: "vehicle_type" },
  { id: "motorbikes", name: "Motorbikes", logo: "🏍️", type: "vehicle_type" },
  { id: "buses-shuttles", name: "Buses & Shuttles", logo: "🚌", type: "vehicle_type" },
  
  // Car Brands - Match with BrandCarousel brands
  { id: "toyota", name: "Toyota", logo: "🚗", type: "brand" },
  { id: "honda", name: "Honda", logo: "🚗", type: "brand" },
  { id: "mercedes-benz", name: "Mercedes Benz", logo: "🚗", type: "brand" },
  { id: "bmw", name: "BMW", logo: "🚗", type: "brand" },
  { id: "audi", name: "Audi", logo: "🚗", type: "brand" },
  { id: "lexus", name: "Lexus", logo: "🚗", type: "brand" },
  { id: "nissan", name: "Nissan", logo: "🚗", type: "brand" },
  { id: "hyundai", name: "Hyundai", logo: "🚗", type: "brand" },
  { id: "ford", name: "Ford", logo: "🚗", type: "brand" },
  { id: "volkswagen", name: "Volkswagen", logo: "🚗", type: "brand" },
  { id: "peugeot", name: "Peugeot", logo: "🚗", type: "brand" },
  { id: "kia", name: "Kia", logo: "🚗", type: "brand" },
  { id: "innoson", name: "Innoson", logo: "🚗", type: "brand" },
  { id: "suzuki", name: "Suzuki", logo: "🚗", type: "brand" },
  { id: "tvs", name: "TVS", logo: "🚗", type: "brand" },
  { id: "acura", name: "Acura", logo: "🚗", type: "brand" },
  
  // Conditions
  { id: "brand-new", name: "Brand New", logo: "✨", type: "condition" },
  { id: "foreign-used", name: "Foreign Used", logo: "🌍", type: "condition" },
  { id: "local-used", name: "Local Used", logo: "🏠", type: "condition" },
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", 
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const carMakes = [
  "Acura", "Audi", "Bestune", "BMW", "Brilliance", "Buick", "Cadillac", 
  "Changan", "Chevrolet", "Chrysler", "Daihatsu", "Dodge", "Ford", "GAC", 
  "GMC", "Honda", "Hyundai", "Infiniti", "IVM", "Jeep", "Kia", "Land Rover", 
  "Lexus", "Lincoln", "Mazda", "Mercedes‑Benz", "Mini", "Mitsubishi", 
  "Nissan", "Opel", "Peugeot", "Pontiac", "Porsche", "Renault", "Rover", 
  "Saturn", "Scion", "Subaru", "Suzuki", "Toyota", "Volkswagen", "Volvo", "Others"
];

const CARS_PER_PAGE = 8;

const CarListings = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedCars, setDisplayedCars] = useState(CARS_PER_PAGE);
  const [carListings, setCarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    minMileage: "",
    maxMileage: "",
    transmission: "",
    fuelType: "",
    location: "",
    condition: ""
  });

  const clearAllFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      make: "",
      model: "",
      yearFrom: "",
      yearTo: "",
      minMileage: "",
      maxMileage: "",
      transmission: "",
      fuelType: "",
      location: "",
      condition: ""
    });
    setSelectedCategories([]);
    // Update URL to remove all parameters
    window.history.pushState({}, '', window.location.pathname);
    // Fetch all cars
    fetchCarListings();
  };

  useEffect(() => {
    fetchCarListings();
    
    // Check URL parameters for filters and categories
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle direct filter parameters from SearchFilters
    const makeParam = urlParams.get('make');
    const modelParam = urlParams.get('model');
    const conditionParam = urlParams.get('condition');
    const locationParam = urlParams.get('location');
    const minPriceParam = urlParams.get('minPrice');
    const maxPriceParam = urlParams.get('maxPrice');
    
    // Handle category parameters - support both 'category' and 'brand' params
    const categoryParam = urlParams.get('category');
    const brandParam = urlParams.get('brand');
    const typeParam = urlParams.get('type');
    const categoriesParam = urlParams.get('categories');
    
    // Set filters from URL parameters
    if (makeParam || modelParam || conditionParam || locationParam || minPriceParam || maxPriceParam) {
      setFilters(prev => ({
        ...prev,
        make: makeParam || '',
        model: modelParam || '',
        condition: conditionParam || '',
        location: locationParam || '',
        minPrice: minPriceParam || '',
        maxPrice: maxPriceParam || ''
      }));
    }
    
    // Handle category parameter - check if it's a brand/make or other category type
    if (categoryParam) {
      const brandCategories = ['toyota', 'honda', 'mercedes-benz', 'bmw', 'audi', 'lexus', 'nissan', 
                               'hyundai', 'ford', 'volkswagen', 'peugeot', 'kia', 'innoson', 'suzuki', 'tvs', 'acura'];
      
      // If category is a brand, convert to make filter
      if (brandCategories.includes(categoryParam.toLowerCase())) {
        const makeMap = {
          'toyota': 'Toyota',
          'honda': 'Honda',
          'mercedes-benz': 'Mercedes‑Benz',
          'bmw': 'BMW',
          'audi': 'Audi',
          'lexus': 'Lexus',
          'nissan': 'Nissan',
          'hyundai': 'Hyundai',
          'ford': 'Ford',
          'volkswagen': 'Volkswagen',
          'peugeot': 'Peugeot',
          'kia': 'Kia',
          'innoson': 'Innoson',
          'suzuki': 'Suzuki',
          'tvs': 'TVS',
          'acura': 'Acura'
        };
        setFilters(prev => ({
          ...prev,
          make: makeMap[categoryParam.toLowerCase()] || categoryParam
        }));
      } else {
        // Otherwise treat as a category (vehicle type, condition, etc.)
        setSelectedCategories([categoryParam]);
      }
    } else if (brandParam) {
      setSelectedCategories([brandParam]);
    } else if (typeParam) {
      setSelectedCategories([typeParam]);
    } else if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(','));
    }
  }, []);

  // Add live filtering effect
  useEffect(() => {
    setDisplayedCars(CARS_PER_PAGE);
    setCurrentPage(1);
  }, [filters, selectedCategories]);

  const fetchCarListings = async () => {
    try {
      setLoading(true);
      
      // Fetch car listings first - include pending_review for own listings
      const { data: listings, error: listingsError } = await supabase
        .from('car_listings')
        .select(`
          *,
          car_listing_images(image_url, is_primary)
        `)
        .or(`status.eq.active${user ? `,and(status.eq.pending_review,user_id.eq.${user.id})` : ''}`)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching car listings:', listingsError);
        toast.error('Failed to load car listings');
        return;
      }

      if (listingsError) {
        console.error('Error fetching car listings:', listingsError);
        toast.error('Failed to load car listings');
        return;
      }

      console.log('Raw listings data:', listings);

      // Get unique user IDs from listings  
      const userIds = [...new Set(listings?.map(listing => listing.user_id).filter(Boolean))];
      
      // Fetch all profiles at once for better efficiency with RLS
      let profiles = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, user_type, show_profile')
          .in('id', userIds);

        if (!profilesError) {
          profiles = profilesData || [];
        }
      }

      // Fetch dealer information
      const { data: dealersData } = await supabase.rpc('get_public_dealers');

      // Combine the data with enriched seller information
      const enrichedListings = (listings || []).map(listing => {
        const profile = profiles?.find(p => p.id === listing.user_id);
        let dealerInfo = null;
        
        // If seller is a dealer, find dealer information
        if (profile && profile.user_type === 'dealer') {
          const dealerData = dealersData?.find(dealer => 
            dealer.id === listing.user_id
          );

          if (dealerData) {
            dealerInfo = {
              id: dealerData.id, 
              business_name: dealerData.business_name
            };
          }
        }

        return {
          ...listing,
          profiles: profile,
          dealers: dealerInfo ? [dealerInfo] : []
        };
      });

      console.log('Enriched listings:', enrichedListings);
      setCarListings(enrichedListings);
    } catch (error) {
      console.error('Error in fetchCarListings:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getListedBy = (listing) => {
    if (listing.profiles?.user_type === 'dealer' && listing.dealers?.[0]) {
      return {
        type: 'dealer',
        name: listing.dealers[0].business_name,
        icon: <Building className="w-3 h-3 text-blue-600" />
      };
    } else if (listing.profiles) {
      // Check privacy settings
      const showProfile = listing.profiles.show_profile ?? true;
      
      if (!showProfile) {
        return {
          type: 'user',
          name: 'Private Seller',
          icon: <User className="w-3 h-3 text-gray-600" />
        };
      }
      
      const fullName = `${listing.profiles.first_name || ''} ${listing.profiles.last_name || ''}`.trim();
      return {
        type: 'user',
        name: fullName || 'Private Seller',
        icon: <User className="w-3 h-3 text-gray-600" />
      };
    }
    return {
      type: 'user',
      name: 'Private Seller',
      icon: <User className="w-3 h-3 text-gray-600" />
    };
  };

  const getCarImage = (listing) => {
    console.log('Getting car image for listing:', listing.id, 'Images:', listing.car_listing_images);
    const images = listing.car_listing_images || [];
    const primaryImage = images.find(img => img.is_primary)?.image_url;
    const imageUrl = primaryImage || images[0]?.image_url;
    
    console.log('Primary image:', primaryImage, 'First image:', images[0]?.image_url, 'Final URL:', imageUrl);
    
    // Check if it's a real uploaded image URL (not a placeholder)
    if (imageUrl && (
      imageUrl.startsWith('http') || 
      imageUrl.includes('supabase.co/storage') ||
      imageUrl.includes('car-listing-images') ||
      imageUrl.startsWith('/')
    ) && !imageUrl.includes('placeholder-image')) {
      console.log('Using real image:', imageUrl);
      return imageUrl;
    }
    
    // Return fallback image for placeholders or missing images
    console.log('Using fallback image for listing:', listing.id, 'because imageUrl was:', imageUrl);
    return "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop";
  };

  const getConditionLabel = (condition) => {
    switch(condition) {
      case 'brand_new': return 'Brand New';
      case 'foreign_used': return 'Foreign Used';
      case 'local_used': return 'Local Used';
      default: return condition;
    }
  };

  // Updated function to check if a car matches any of the selected categories
  const carMatchesCategories = (car, categories) => {
    if (!categories || categories.length === 0) return true;
    
    return categories.some(categoryId => {
      const make = car.make?.toLowerCase();
      const fuelType = car.fuel_type?.toLowerCase();
      const condition = car.condition?.toLowerCase();
      const model = car.model?.toLowerCase();
      
      switch(categoryId) {
        // Vehicle types - More comprehensive matching
        case 'electric-cars':
          return fuelType === 'electric' || fuelType === 'hybrid' || 
                 model?.includes('electric') || model?.includes('tesla') ||
                 model?.includes('ev') || model?.includes('e-') ||
                 make?.includes('tesla');
        case 'tricycles':
          return make?.includes('bajaj') || make?.includes('tvs') || make?.includes('piaggio') || 
                 model?.includes('tricycle') || model?.includes('keke') || model?.includes('tuk') ||
                 model?.includes('ape') || model?.includes('trike');
        case 'trucks':
          return make?.includes('man') || make?.includes('daf') || make?.includes('volvo') || 
                 make?.includes('scania') || make?.includes('iveco') || make?.includes('hino') ||
                 model?.includes('truck') || model?.includes('tipper') || model?.includes('trailer') ||
                 model?.includes('lorry') || model?.includes('pickup') || model?.includes('hilux') ||
                 model?.includes('tundra') || model?.includes('f-150') || model?.includes('ranger');
        case 'motorbikes':
          return make?.includes('honda') || make?.includes('yamaha') || make?.includes('suzuki') ||
                 make?.includes('kawasaki') || make?.includes('bajaj') || make?.includes('tvs') ||
                 make?.includes('ducati') || make?.includes('harley') ||
                 model?.includes('bike') || model?.includes('motorcycle') || model?.includes('cbr') ||
                 model?.includes('ninja') || model?.includes('pulsar') || model?.includes('sport');
        case 'buses-shuttles':
          return model?.includes('bus') || model?.includes('hiace') || model?.includes('coaster') ||
                 model?.includes('shuttle') || model?.includes('transit') || make?.includes('iveco') ||
                 model?.includes('sprinter') || model?.includes('crafter') ||
                 (make?.includes('toyota') && model?.includes('hiace'));
          
        // Conditions - Handle both database values and URL parameters
        case 'brand-new':
          return condition === 'brand_new' || condition === 'brand-new' || condition === 'new';
        case 'foreign-used':
          return condition === 'foreign_used' || condition === 'foreign-used' || condition === 'tokunbo';
        case 'local-used':
          return condition === 'local_used' || condition === 'local-used' || condition === 'nigerian_used';
          
        // Brands - More flexible and comprehensive matching
        case 'toyota':
          return make?.includes('toyota');
        case 'honda':
          return make?.includes('honda');
        case 'mercedes-benz':
          return make?.includes('mercedes') || make?.includes('benz') || make === 'mercedes‑benz';
        case 'bmw':
          return make?.includes('bmw');
        case 'audi':
          return make?.includes('audi');
        case 'lexus':
          return make?.includes('lexus');
        case 'nissan':
          return make?.includes('nissan');
        case 'hyundai':
          return make?.includes('hyundai');
        case 'ford':
          return make?.includes('ford');
        case 'volkswagen':
          return make?.includes('volkswagen') || make?.includes('vw');
        case 'peugeot':
          return make?.includes('peugeot');
        case 'kia':
          return make?.includes('kia');
        case 'innoson':
          return make?.includes('innoson');
        case 'suzuki':
          return make?.includes('suzuki');
        case 'tvs':
          return make?.includes('tvs');
        case 'acura':
          return make?.includes('acura');
        case 'chevrolet':
          return make?.includes('chevrolet') || make?.includes('chevy');
        case 'jeep':
          return make?.includes('jeep');
        case 'land-rover':
          return make?.includes('land rover') || make?.includes('landrover');
        case 'mitsubishi':
          return make?.includes('mitsubishi');
        case 'mazda':
          return make?.includes('mazda');
        case 'subaru':
          return make?.includes('subaru');
        case 'infiniti':
          return make?.includes('infiniti');
        case 'cadillac':
          return make?.includes('cadillac');
        case 'lincoln':
          return make?.includes('lincoln');
        case 'porsche':
          return make?.includes('porsche');
        case 'mini':
          return make?.includes('mini');
        case 'opel':
          return make?.includes('opel');
        case 'renault':
          return make?.includes('renault');
        case 'volvo':
          return make?.includes('volvo');
          
        default:
          return false;
      }
    });
  };

  const applyFilters = (cars) => {
    return cars.filter(car => {
      const price = parseFloat(car.price);
      const year = parseInt(car.year);
      
      if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;
      
      // Improved make matching - handle special characters and exact matches
      if (filters.make) {
        const filterMake = filters.make.toLowerCase();
        const carMake = car.make?.toLowerCase();
        
        // Handle Mercedes-Benz special case
        if (filterMake === 'mercedes‑benz' || filterMake === 'mercedes-benz') {
          if (!(carMake?.includes('mercedes') || carMake?.includes('benz'))) return false;
        } else {
          // Exact match or contains match
          if (!carMake?.includes(filterMake) && carMake !== filterMake) return false;
        }
      }
      
      if (filters.model && !car.model?.toLowerCase().includes(filters.model.toLowerCase())) return false;
      if (filters.yearFrom && year < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && year > parseInt(filters.yearTo)) return false;
      if (filters.transmission && car.transmission?.toLowerCase() !== filters.transmission.toLowerCase()) return false;
      if (filters.fuelType && car.fuel_type?.toLowerCase() !== filters.fuelType.toLowerCase()) return false;
      
      // Improved location matching
      if (filters.location) {
        const filterLocation = filters.location.toLowerCase();
        const carLocation = car.location?.toLowerCase();
        if (!carLocation?.includes(filterLocation)) return false;
      }
      
      // Improved condition matching - handle both formats
      if (filters.condition) {
        const filterCondition = filters.condition.toLowerCase();
        const carCondition = car.condition?.toLowerCase();
        
        // Handle condition variations
        if (filterCondition === 'brand_new' || filterCondition === 'brand-new') {
          if (!(carCondition === 'brand_new' || carCondition === 'brand-new' || carCondition === 'new')) return false;
        } else if (filterCondition === 'foreign_used' || filterCondition === 'foreign-used') {
          if (!(carCondition === 'foreign_used' || carCondition === 'foreign-used' || carCondition === 'tokunbo')) return false;
        } else if (filterCondition === 'local_used' || filterCondition === 'local-used') {
          if (!(carCondition === 'local_used' || carCondition === 'local-used' || carCondition === 'nigerian_used')) return false;
        } else {
          if (carCondition !== filterCondition) return false;
        }
      }
      
      return true;
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setDisplayedCars(CARS_PER_PAGE);
    setCurrentPage(1);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      const newCategories = isSelected 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      // Update URL to reflect selected categories
      const params = new URLSearchParams(window.location.search);
      if (newCategories.length > 0) {
        if (newCategories.length === 1) {
          params.set('category', newCategories[0]);
          params.delete('categories');
        } else {
          params.set('categories', newCategories.join(','));
          params.delete('category');
        }
      } else {
        params.delete('categories');
        params.delete('category');
      }
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      
      return newCategories;
    });
    setDisplayedCars(CARS_PER_PAGE);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      make: "",
      model: "",
      yearFrom: "",
      yearTo: "",
      minMileage: "",
      maxMileage: "",
      transmission: "",
      fuelType: "",
      location: "",
      condition: ""
    });
    setSelectedCategories([]);
    setDisplayedCars(CARS_PER_PAGE);
    setCurrentPage(1);
    
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Apply category and other filters
  let filteredCars = carMatchesCategories(carListings, selectedCategories) 
    ? carListings.filter(car => carMatchesCategories(car, selectedCategories))
    : carListings;
  filteredCars = applyFilters(filteredCars);
  
  // Get similar listings (for empty state) - show all cars if no matches
  const similarListings = filteredCars.length === 0 && (selectedCategories.length > 0 || Object.values(filters).some(f => f !== ''))
    ? carListings.slice(0, 8) // Show up to 8 random listings
    : [];
  
  // Get the active category name for display
  const getActiveCategoryName = () => {
    if (selectedCategories.length === 0) return null;
    const categoryId = selectedCategories[0];
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);
  const paginatedCars = filteredCars.slice(0, displayedCars);
  const hasMore = displayedCars < filteredCars.length;

  const handleLoadMore = () => {
    setDisplayedCars(prev => Math.min(prev + CARS_PER_PAGE, filteredCars.length));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setDisplayedCars(page * CARS_PER_PAGE);
  };

  // Group categories by type for better organization
  const categoryGroups = {
    vehicle_type: categories.filter(cat => cat.type === 'vehicle_type'),
    condition: categories.filter(cat => cat.type === 'condition'),
    brand: categories.filter(cat => cat.type === 'brand')
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading car listings...</div>
      </div>
    );
  }

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


          <div className="flex flex-col lg:flex-row gap-8">
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Filters</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="priceRange">Price Range (₦)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Min" 
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                      <Input 
                        placeholder="Max" 
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={filters.make}
                      onChange={(e) => handleFilterChange('make', e.target.value)}
                    >
                      <option value="">Select make</option>
                      {carMakes.map(make => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input 
                      placeholder="Select model" 
                      value={filters.model}
                      onChange={(e) => handleFilterChange('model', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="From" 
                        value={filters.yearFrom}
                        onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                      />
                      <Input 
                        placeholder="To" 
                        value={filters.yearTo}
                        onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={filters.transmission}
                      onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    >
                      <option value="">Any</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="fuel">Fuel Type</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={filters.fuelType}
                      onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    >
                      <option value="">Any</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location/State</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                      <option value="">All States</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={filters.condition}
                      onChange={(e) => handleFilterChange('condition', e.target.value)}
                    >
                      <option value="">Any condition</option>
                      <option value="brand_new">Brand New</option>
                      <option value="foreign_used">Foreign Used</option>
                      <option value="local_used">Local Used</option>
                    </select>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Apply Filters</Button>
                  <Button variant="outline" className="w-full" onClick={resetFilters}>Reset Filters</Button>
                </div>
              </Card>
            </div>

            <div className="lg:w-3/4">
              {paginatedCars.length === 0 ? (
                <div className="py-12">
                  <div className="text-center mb-8">
                    {getActiveCategoryName() ? (
                      <>
                        <h2 className="text-2xl font-bold mb-3">No {getActiveCategoryName()} Cars Listed Yet</h2>
                        <p className="text-gray-600 text-lg mb-4">We currently don't have any {getActiveCategoryName()} vehicles available.</p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold mb-3">No Cars Found</h2>
                        <p className="text-gray-600 text-lg mb-4">No car listings found matching your criteria.</p>
                      </>
                    )}
                    <Button onClick={resetFilters} className="bg-red-600 hover:bg-red-700">Clear Filters & View All Cars</Button>
                  </div>
                  
                  {similarListings.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-4 text-center">Similar Listings You Might Like</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {similarListings.map((car) => {
                          const listedBy = getListedBy(car);
                          return (
                            <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                              <div className="relative">
                                <img src={getCarImage(car)} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-40 object-cover" />
                                <FavoriteButton listingId={car.id} className="absolute top-2 right-2" />
                                <div className="absolute top-2 left-2">
                                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                    {getConditionLabel(car.condition)}
                                  </span>
                                </div>
                              </div>
                              <CardContent className="p-3">
                                <h3 className="font-bold text-sm mb-1 line-clamp-2">{car.year} {car.make} {car.model}</h3>
                                <p className="text-lg font-bold text-red-600 mb-1">₦{parseFloat(car.price).toLocaleString()}</p>
                                <p className="text-xs text-gray-600 mb-2">{car.location}</p>
                                <div className="grid grid-cols-1 gap-1 text-xs">
                                  {car.mileage && <span>{car.mileage}</span>}
                                  <span>{car.fuel_type || 'Petrol'} • {car.transmission || 'Automatic'}</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    {user ? (
                                      <>
                                        {listedBy.icon}
                                        <span className="text-xs text-gray-500 truncate">{listedBy.name}</span>
                                      </>
                                    ) : (
                                      <>
                                        <LogIn className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs text-blue-600 truncate">Sign in to see seller</span>
                                      </>
                                    )}
                                  </div>
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
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {paginatedCars.map((car) => {
                      const listedBy = getListedBy(car);
                      return (
                         <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                           <div className="relative">
                             <img src={getCarImage(car)} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-40 object-cover" />
                             <FavoriteButton listingId={car.id} className="absolute top-2 right-2" />
                             <div className="absolute top-2 left-2">
                               <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                 {getConditionLabel(car.condition)}
                               </span>
                               {user && car.user_id === user.id && car.status === 'pending_review' && (
                                 <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs ml-1">
                                   Pending Review
                                 </span>
                               )}
                             </div>
                           </div>
                          <CardContent className="p-3">
                            <h3 className="font-bold text-sm mb-1 line-clamp-2">{car.year} {car.make} {car.model}</h3>
                            <p className="text-lg font-bold text-red-600 mb-1">₦{parseFloat(car.price).toLocaleString()}</p>
                            <p className="text-xs text-gray-600 mb-2">{car.location}</p>
                            <div className="grid grid-cols-1 gap-1 text-xs">
                              {car.mileage && <span>{car.mileage}</span>}
                              <span>{car.fuel_type || 'Petrol'} • {car.transmission || 'Automatic'}</span>
                               <div className="flex items-center gap-1 mt-1">
                                 {user ? (
                                   <>
                                     {listedBy.icon}
                                     <span className="text-xs text-gray-500 truncate">{listedBy.name}</span>
                                   </>
                                 ) : (
                                   <>
                                     <LogIn className="w-3 h-3 text-blue-600" />
                                     <span className="text-xs text-blue-600 truncate">Sign in to see seller</span>
                                   </>
                                 )}
                               </div>
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
                      );
                    })}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CarListings;
