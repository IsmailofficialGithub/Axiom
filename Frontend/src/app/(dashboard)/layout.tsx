"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Users,
  Briefcase,
  Building2,
  Menu,
  X
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-brand-emerald)]"></div>
      </div>
    );
  }

  const getNavigation = () => {
    const baseNav = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ];

    if (user.role === "admin") {
      baseNav.push({ name: "User Management", href: "/dashboard/users", icon: Users });
      baseNav.push({ name: "Subsidiaries", href: "/dashboard/subsidiaries", icon: Building2 });
    } else if (user.role === "investor") {
      baseNav.push({ name: "Deal Flow", href: "/dashboard/deals", icon: Briefcase });
    } else if (user.role === "startup") {
      baseNav.push({ name: "Company Profile", href: "/dashboard/profile", icon: Building2 });
    }

    baseNav.push({ name: "Settings", href: "/dashboard/settings", icon: Settings });
    return baseNav;
  };

  const navigation = getNavigation();

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--background)]">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-[var(--card-bg)]">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--color-brand-emerald)]"
                  >
                    <Icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-[var(--color-brand-emerald)]" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="inline-block h-9 w-9 rounded-full bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] flex items-center justify-center font-bold uppercase">
                    {user.full_name.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                    {user.full_name}
                  </p>
                  <p className="text-xs font-medium text-slate-500 capitalize">
                    {user.role} {user.status === 'pending' ? '(Pending)' : ''}
                  </p>
                </div>
                <button 
                  onClick={logout} 
                  className="ml-auto p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 bg-[var(--card-bg)]">
          <span className="text-lg font-bold">Dashboard</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-slate-500 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-[var(--card-bg)]">
            <nav className="px-4 pt-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Icon className="mr-4 h-5 w-5 text-slate-400" />
                    {item.name}
                  </Link>
                );
              })}
              <button 
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-base font-medium rounded-md text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LogOut className="mr-4 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
