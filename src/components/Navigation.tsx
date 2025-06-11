
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">MotorVista</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/cars" className="text-gray-700 hover:text-red-600 font-medium">
              Browse Cars
            </Link>
            <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
              Sell Your Car
            </Link>
            <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
              Dealers
            </Link>
            <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </Button>
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
              <Link to="/cars" className="text-gray-700 hover:text-red-600 font-medium">
                Browse Cars
              </Link>
              <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
                Sell Your Car
              </Link>
              <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
                Dealers
              </Link>
              <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
                About
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
    </nav>
  );
};
