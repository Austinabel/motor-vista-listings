import { Home, Search, Plus, User, LayoutDashboard, Store, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages, useWaveChatLive } from "@/components/wavechat/WaveChatNotifier";
import { WAVECHAT_PATH } from "@/lib/wavechat";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isDealer = user?.user_metadata?.user_type === 'dealer';
  const { live: waveChatLive } = useWaveChatLive();
  const unread = useUnreadMessages();

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // With WaveChat on, signed-in people get a Chats tab; otherwise messages stay in the account menu
  const navItems: { icon: typeof Home; label: string; path: string; badge?: number }[] = [
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
    ...(user && waveChatLive ? [{ icon: MessageSquare, label: "Chats", path: WAVECHAT_PATH, badge: unread }] : []),
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
  ].includes(location.pathname) || location.pathname.startsWith('/admin')
    // An open WaveChat conversation uses the whole screen, with its composer at the bottom
    || (location.pathname === WAVECHAT_PATH && new URLSearchParams(location.search).has('c'));

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
              <span className={`relative rounded-xl p-2 transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}>
                <Icon className="h-5 w-5" />
                {item.badge ? (
                  <span
                    aria-label={`${item.badge} unread`}
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
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
