"use client"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { 
  Users,
  Settings, 
  Building2,
  Globe,
  BarChart,
  Briefcase,
  LayoutDashboard,
  CreditCard,
  Download,
  Webhook,
  LogOut,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF]"></div>
      </div>
    );
  }

  const adminNav = [
    { name: "General", href: "/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/dashboard/users", icon: Users },
    { name: "Subsidiaries", href: "/dashboard/subsidiaries", icon: Building2 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const platformNav = [
    { name: "Network", href: "/dashboard/network", icon: Globe },
    { name: "Insights", href: "/dashboard/insights", icon: BarChart },
    { name: "Opportunities", href: "/dashboard/opportunities", icon: Briefcase },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0F0F12] text-slate-300 font-sans">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-[#141416] border-r border-[#222222]">
          
          <div className="p-4 border-b border-[#222222] flex items-center space-x-3">
            <Link href="/" className="p-1 hover:bg-[#2A2A2D] rounded-md transition-colors text-slate-400">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center">
              <div className="h-6 w-6 rounded bg-[#1E90FF] text-white flex items-center justify-center font-bold text-xs mr-2">
                {user.full_name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">Workspace settings</span>
                <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">{user.full_name}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto py-4">
            
            <div className="px-3 mb-2">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Administration</h3>
              <nav className="space-y-0.5">
                {adminNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive 
                          ? "bg-[#2A2A2D] text-white" 
                          : "text-slate-400 hover:bg-[#222222] hover:text-white"
                      }`}
                    >
                      <Icon className={`mr-3 h-4 w-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="px-3 mt-6">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform</h3>
              <nav className="space-y-0.5">
                {platformNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive 
                          ? "bg-[#2A2A2D] text-white" 
                          : "text-slate-400 hover:bg-[#222222] hover:text-white"
                      }`}
                    >
                      <Icon className={`mr-3 h-4 w-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
          </div>
          
          <div className="flex-shrink-0 border-t border-[#222222] p-4">
            <button 
              onClick={logout} 
              className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-[#2A2A2D] hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-slate-500 group-hover:text-slate-300" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between border-b border-[#222222] p-4 bg-[#141416]">
          <span className="text-lg font-bold text-white">Workspace</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-slate-400 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-[#222222] bg-[#141416] absolute z-50 w-full left-0 mt-[65px] h-full">
            <nav className="px-4 pt-4 pb-4 space-y-1">
              {adminNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-3 py-3 text-base font-medium rounded-md text-slate-300 hover:bg-[#222222] hover:text-white"
                >
                  <item.icon className="mr-4 h-5 w-5 text-slate-500" />
                  {item.name}
                </Link>
              ))}
              <div className="h-px bg-[#222222] my-4"></div>
              {platformNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-3 py-3 text-base font-medium rounded-md text-slate-300 hover:bg-[#222222] hover:text-white"
                >
                  <item.icon className="mr-4 h-5 w-5 text-slate-500" />
                  {item.name}
                </Link>
              ))}
              <div className="h-px bg-[#222222] my-4"></div>
              <button 
                onClick={logout}
                className="w-full flex items-center px-3 py-3 text-base font-medium rounded-md text-red-500 hover:bg-[#222222]"
              >
                <LogOut className="mr-4 h-5 w-5" />
                Sign out
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-[#0F0F12]">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
