import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Building } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return <footer className="bg-brand-dark text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-extrabold">Motorcars</p>
            <p className="mt-1 text-sm text-gold">Real Dealers. Real Cars. Live Stands.</p>
            <p className="mt-4 text-sm text-primary-foreground/70">
              Nigeria's automotive marketplace, connecting buyers with dealers, car stands and sellers.
            </p>
            <Button asChild className="mt-5 bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/dealer-registration">
                <Building className="mr-2 h-4 w-4" />
                Register your business
              </Link>
            </Button>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Buy and sell</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/cars" className="hover:text-primary-foreground">Browse cars</Link></li>
              <li><Link to="/dealers" className="hover:text-primary-foreground">Car stands and dealers</Link></li>
              <li><Link to="/sell" className="hover:text-primary-foreground">Sell your car</Link></li>
              <li><Link to="/buy-from-abroad" className="hover:text-primary-foreground">Buy from abroad</Link></li>
              <li><Link to="/about" className="hover:text-primary-foreground">About us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/help" className="hover:text-primary-foreground">Help centre</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground">Contact us</Link></li>
              <li><Link to="/terms" className="hover:text-primary-foreground">Terms of service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-foreground">Privacy policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+234 800 MOTOR (66867)</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" />support@motorcars.ng</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Lagos, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-primary-foreground/10 pt-6 text-sm text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Motorcars. All rights reserved.</p>
          <p>Powered by <span className="font-semibold text-primary-foreground/80">Moatwave</span></p>
        </div>
      </div>
    </footer>;
};
