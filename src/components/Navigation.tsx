
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
