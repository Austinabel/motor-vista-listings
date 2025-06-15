
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, ChevronDown, LogOut, Edit, Heart, MessageSquare, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  // Fetch user profile to get the name
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  const getUserDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return user?.email || '';
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
    }
  };

  const carCategories = [
    { name: "Brand New", link: "/cars?type=brand-new" },
    { name: "Foreign Used Cars", link: "/cars?type=foreign-used" },
    { name: "Local Used Cars", link: "/cars?type=local-used" },
    { name: "Electric Cars", link: "/cars?category=electric", logo: "⚡" },
    { name: "Tricycles", link: "/cars?category=tricycles", logo: "🛺" },
    { name: "Trucks", link: "/cars?category=trucks", logo: "🚛" },
    { name: "Motorbikes", link: "/cars?category=motorbikes", logo: "🏍️" },
    { name: "Buses & Shuttles", link: "/cars?category=buses", logo: "🚌" },
  ];

  const carBrands = [
    { name: "Toyota", link: "/cars?brand=toyota", logo: "🚗" },
    { name: "Ford", link: "/cars?brand=ford", logo: "🚙" },
    { name: "Honda", link: "/cars?brand=honda", logo: "🚗" },
    { name: "Lexus", link: "/cars?brand=lexus", logo: "🏎️" },
    { name: "Mercedes Benz", link: "/cars?brand=mercedes", logo: "🚘" },
    { name: "BMW", link: "/cars?brand=bmw", logo: "🚗" },
    { name: "Acura", link: "/cars?brand=acura", logo: "🚙" },
    { name: "Innoson", link: "/cars?brand=innoson", logo: "🚐" },
    { name: "Nissan", link: "/cars?brand=nissan", logo: "🚗" },
  ];

  return (
    <nav className="fixed top-2 left-2 right-2 md:top-4 md:left-1/2 md:transform md:-translate-x-1/2 z-50 md:w-[95%] md:max-w-6xl">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl md:rounded-2xl border border-gray-200/50">
        <div className="px-3 md:px-6">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
              <span className="text-lg md:text-2xl font-bold text-gray-900">motorcars.ng</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Buy Car Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className={`flex items-center font-medium transition-colors ${
                  location.pathname === '/cars' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                }`}>
                  Buy Car
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu with Columns */}
                <div className={`absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform ${
                  isDropdownOpen 
                    ? 'opacity-100 translate-y-0 visible' 
                    : 'opacity-0 -translate-y-2 invisible'
                }`}>
                  <div className="py-2">
                    <div className="flex">
                      {/* Left Column - Vehicle Types */}
                      <div className="flex-1 border-r border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Vehicle Types</div>
                        {carCategories.map((category, index) => (
                          <Link 
                            key={index}
                            to={category.link} 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            {category.logo && (
                              <span className="w-6 h-6 mr-3 flex items-center justify-center bg-gray-100 rounded-full text-xs">
                                {category.logo}
                              </span>
                            )}
                            {category.name}
                          </Link>
                        ))}
                      </div>
                      
                      {/* Right Column - Popular Brands */}
                      <div className="flex-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Popular Brands</div>
                        {carBrands.map((brand, index) => (
                          <Link 
                            key={index}
                            to={brand.link} 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <span className="w-6 h-6 mr-3 flex items-center justify-center bg-gray-100 rounded-full text-xs">
                              {brand.logo}
                            </span>
                            {brand.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100">
                      <Link 
                        to="/cars" 
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-center"
                      >
                        View All Listings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/sell" 
                className={`font-medium transition-colors ${
                  isActiveLink('/sell') ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                }`}
              >
                Sell Your Car
              </Link>
              <Link 
                to="/buy-from-abroad" 
                className={`font-medium transition-colors ${
                  isActiveLink('/buy-from-abroad') ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                }`}
              >
                Buy From Abroad
              </Link>
              <Link 
                to="/dealers" 
                className={`font-medium transition-colors ${
                  isActiveLink('/dealers') ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                }`}
              >
                Dealers
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-32 truncate">{getUserDisplayName()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile/edit"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                      <Link
                        to="/profile/favorites"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Link>
                      <Link
                        to="/profile/messages"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                      <Link
                        to="/profile/boost-sales"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Boost Sales
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3 pt-4">
                <div className="space-y-2">
                  <Link 
                    to="/cars" 
                    className="block text-gray-700 hover:text-red-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Buy Car
                  </Link>
                  <div className="ml-4 space-y-2 max-h-48 overflow-y-auto">
                    {[...carCategories, ...carBrands].slice(0, 8).map((item, index) => (
                      <Link 
                        key={index} 
                        to={item.link} 
                        className="flex items-center text-sm text-gray-600 hover:text-red-600 py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.logo && (
                          <span className="w-4 h-4 mr-2 flex items-center justify-center bg-gray-100 rounded-full text-xs">
                            {item.logo}
                          </span>
                        )}
                        {item.name}
                      </Link>
                    ))}
                    <Link 
                      to="/cars" 
                      className="text-sm text-red-600 font-medium py-1 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All →
                    </Link>
                  </div>
                </div>
                <Link 
                  to="/sell" 
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sell Your Car
                </Link>
                <Link 
                  to="/buy-from-abroad" 
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Buy From Abroad
                </Link>
                <Link 
                  to="/dealers" 
                  className="text-gray-700 hover:text-red-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dealers
                </Link>
                
                <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                  {loading ? (
                    <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : user ? (
                    <>
                      <span className="text-sm text-gray-600 truncate py-1">{getUserDisplayName()}</span>
                      <Link 
                        to="/profile/edit" 
                        className="text-sm text-gray-600 hover:text-red-600 flex items-center py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                      <Link 
                        to="/profile/favorites" 
                        className="text-sm text-gray-600 hover:text-red-600 flex items-center py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Link>
                      <Link 
                        to="/profile/messages" 
                        className="text-sm text-gray-600 hover:text-red-600 flex items-center py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                      <Link 
                        to="/profile/boost-sales" 
                        className="text-sm text-gray-600 hover:text-red-600 flex items-center py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Boost Sales
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }} 
                        className="w-full justify-start mt-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 w-full">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
