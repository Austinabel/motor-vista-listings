import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Car, ChevronDown, Edit, Heart, LayoutDashboard, LogOut, MessageSquare, Search, Settings, User, Zap } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/components/wavechat/WaveChatNotifier";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationIcon } from "@/components/NotificationIcon";

// Category ids and make slugs are the ones CarListings understands via ?category=
const carCategories = [
  { name: "Brand new", link: "/cars?category=brand-new" },
  { name: "Tokunbo (foreign used)", link: "/cars?category=foreign-used" },
  { name: "Nigerian used", link: "/cars?category=local-used" },
  { name: "Electric & hybrid", link: "/cars?category=electric-cars" },
  { name: "Trucks & pickups", link: "/cars?category=trucks" },
  { name: "Buses & shuttles", link: "/cars?category=buses-shuttles" },
  { name: "Tricycles (Keke)", link: "/cars?category=tricycles" },
  { name: "Motorbikes", link: "/cars?category=motorbikes" },
];

const carBrands = [
  { name: "Toyota", link: "/cars?category=toyota" },
  { name: "Lexus", link: "/cars?category=lexus" },
  { name: "Honda", link: "/cars?category=honda" },
  { name: "Mercedes-Benz", link: "/cars?category=mercedes-benz" },
  { name: "Hyundai", link: "/cars?category=hyundai" },
  { name: "Kia", link: "/cars?category=kia" },
  { name: "Ford", link: "/cars?category=ford" },
  { name: "Nissan", link: "/cars?category=nissan" },
  { name: "BMW", link: "/cars?category=bmw" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? "bg-primary-foreground/10 text-gold" : "text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground"
  }`;

const BrandMark = () => (
  <Link to="/" className="flex items-center gap-3" aria-label="Motorcars home">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-lg font-black text-brand-dark">
      M
    </span>
    <span className="leading-none">
      <span className="block text-lg font-extrabold tracking-tight text-primary-foreground md:text-xl">Motorcars</span>
      <span className="block text-[11px] font-medium text-primary-foreground/60">Powered by Moatwave</span>
    </span>
  </Link>
);

export const Navigation = () => {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const unreadMessages = useUnreadMessages();
  const { toast } = useToast();
  const isDealer = user?.user_metadata?.user_type === "dealer";

  // Fetch user profile to get the name
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const getUserDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    }
    return user?.email || "";
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <User className="h-4 w-4" />
          <span className="max-w-24 truncate md:max-w-36">{getUserDisplayName()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{getUserDisplayName()}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isDealer && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/dealer/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {!isDealer && (
          <DropdownMenuItem asChild>
            <Link to="/my-listings"><Car className="mr-2 h-4 w-4" />My listings</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile/edit"><Edit className="mr-2 h-4 w-4" />Edit profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile/favorites"><Heart className="mr-2 h-4 w-4" />Saved cars</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/messages"><MessageSquare className="mr-2 h-4 w-4" />Messages</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile/boost-sales"><Zap className="mr-2 h-4 w-4" />Boost sales</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/settings"><Settings className="mr-2 h-4 w-4" />Account settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-brand-dark/95 backdrop-blur supports-[backdrop-filter]:bg-brand-dark/85">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-[72px] lg:px-8">
        <BrandMark />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 whitespace-nowrap lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-primary-foreground/10 ${
                location.pathname.startsWith("/cars") ? "text-gold" : "text-primary-foreground/85 hover:text-primary-foreground"
              }`}
            >
              Buy a car
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[440px] p-0">
              <div className="grid grid-cols-2">
                <div className="border-r p-2">
                  <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Vehicle types</DropdownMenuLabel>
                  {carCategories.map((category) => (
                    <DropdownMenuItem key={category.link} asChild>
                      <Link to={category.link}>{category.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="p-2">
                  <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Popular makes</DropdownMenuLabel>
                  {carBrands.map((brand) => (
                    <DropdownMenuItem key={brand.link} asChild>
                      <Link to={brand.link}>{brand.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator className="m-0" />
              <DropdownMenuItem asChild className="justify-center py-3 font-semibold text-primary">
                <Link to="/cars">View all cars</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavLink to="/dealers" className={navLinkClass}>Car stands</NavLink>
          <Link
            to="/#services"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Auto services
          </Link>
          <NavLink to="/sell" className={navLinkClass}>Sell your car</NavLink>
        </div>

        {/* Account area */}
        <div className="flex items-center gap-2">
          <Link
            to="/cars"
            aria-label="Search cars"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/85 transition hover:bg-primary-foreground/10 hover:text-primary-foreground lg:flex"
          >
            <Search className="h-5 w-5" />
          </Link>
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-primary-foreground/10" />
          ) : user ? (
            <>
              {unreadMessages > 0 && (
                <Link
                  to="/messages"
                  aria-label={`${unreadMessages} unread ${unreadMessages === 1 ? "message" : "messages"}`}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/85 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                </Link>
              )}
              <div className="text-primary-foreground [&_button:hover]:bg-primary-foreground/10 [&_button:hover]:text-primary-foreground">
                <NotificationIcon />
              </div>
              {userMenu}
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/login">
                  <User className="mr-2 h-4 w-4" />
                  Log in
                </Link>
              </Button>
              <Button asChild size="sm" className="hidden bg-gold text-gold-foreground hover:bg-gold/90 sm:inline-flex">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
