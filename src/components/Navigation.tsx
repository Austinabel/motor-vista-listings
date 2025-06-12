
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50">
        <div className="px-6">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">motorcars.ng</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Buy Car Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center text-gray-700 hover:text-red-600 font-medium transition-colors">
                  Buy Car
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform ${
                  isDropdownOpen 
                    ? 'opacity-100 translate-y-0 visible' 
                    : 'opacity-0 -translate-y-2 invisible'
                }`}>
                  <div className="py-2">
                    <Link 
                      to="#" 
                      className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                    >
                      Brand New
                    </Link>
                    <Link 
                      to="#" 
                      className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                    >
                      Foreign Used Cars
                    </Link>
                    <Link 
                      to="#" 
                      className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                    >
                      Local Used Cars
                    </Link>
                    <Link 
                      to="#" 
                      className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium border-t border-gray-100"
                    >
                      Check All Listings
                    </Link>
                  </div>
                </div>
              </div>
              
              <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
                Sell Your Car
              </Link>
              <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
                Dealers
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Register
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <button className="text-gray-700 hover:text-red-600 font-medium text-left w-full">
                    Buy Car
                  </button>
                  <div className="ml-4 space-y-2">
                    <Link to="#" className="block text-sm text-gray-600 hover:text-red-600">
                      Brand New
                    </Link>
                    <Link to="#" className="block text-sm text-gray-600 hover:text-red-600">
                      Foreign Used Cars
                    </Link>
                    <Link to="#" className="block text-sm text-gray-600 hover:text-red-600">
                      Local Used Cars
                    </Link>
                    <Link to="#" className="block text-sm text-gray-600 hover:text-red-600">
                      Check All Listings
                    </Link>
                  </div>
                </div>
                <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
                  Sell Your Car
                </Link>
                <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
                  Dealers
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Register
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
