
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Building } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">Motorcars.ng</h3>
            <p className="text-gray-400 mb-4">
              Nigeria's most trusted car marketplace connecting buyers with verified dealers.
            </p>
            <div className="flex space-x-4 mb-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-red-400" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-red-400" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-red-400" />
            </div>
            <Link to="/dealer-registration">
              <Button className="bg-red-600 hover:bg-red-700">
                <Building className="mr-2 h-4 w-4" />
                Become a Dealer
              </Button>
            </Link>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/cars" className="hover:text-white">Browse Cars</Link></li>
              <li><Link to="/sell" className="hover:text-white">Sell Your Car</Link></li>
              <li><Link to="/dealers" className="hover:text-white">Find Dealers</Link></li>
              <li><Link to="/buy-from-abroad" className="hover:text-white">Buy From Abroad</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Get the latest car deals and news</p>
            <div className="flex">
              <Input placeholder="Your email" className="rounded-r-none" />
              <Button className="rounded-l-none bg-red-600 hover:bg-red-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 text-gray-400 mb-4 md:mb-0">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+234 800 MOTOR (66867)</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@motorcars.ng</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
            <p className="text-gray-400">© 2025 Motorcars.ng. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>;
};
