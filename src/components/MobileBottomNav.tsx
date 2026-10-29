import { Home, Search, Plus, User, LayoutDashboard, Store } from "lucide-react";
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

  // Messages stays reachable from the account menu in the top bar
  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Search,
      label: "Cars",
      path: "/cars",
    },
    {
      icon: Store,
      label: "Stands",
      path: "/dealers",
    },
    {
      icon: Plus,
      label: "Sell",
      path: "/sell",
    },
    {
      icon: isDealer ? LayoutDashboard : User,
      label: isDealer ? "Dashboard" : user ? "Profile" : "Log in",
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
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur safe-area-bottom"
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-1.5"
            >
              <span className={`rounded-xl p-2 transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className={`mt-0.5 text-[11px] font-semibold ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
