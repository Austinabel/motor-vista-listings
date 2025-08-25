import { Home, Search, Plus, Heart, User, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isDealer = user?.user_metadata?.user_type === 'dealer';

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Search,
      label: "Browse",
      path: "/cars",
    },
    {
      icon: Plus,
      label: "Sell",
      path: "/sell",
    },
    {
      icon: Heart,
      label: "Favorites",
      path: user ? "/profile/favorites" : "/login",
    },
    {
      icon: isDealer ? LayoutDashboard : User,
      label: isDealer ? "Dashboard" : "Profile",
      path: user ? (isDealer ? "/dealer/dashboard" : "/profile/edit") : "/login",
    },
  ];

  // Hide bottom nav on auth pages and admin pages
  const shouldHideBottomNav = [
    '/login', '/register', '/forgot-password', 
    '/admin', '/admin/login', '/admin/register'
  ].includes(location.pathname) || location.pathname.startsWith('/admin');

  if (shouldHideBottomNav) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 transition-colors"
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-red-100 text-red-600 scale-110' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors ${
                isActive ? 'text-red-600' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};