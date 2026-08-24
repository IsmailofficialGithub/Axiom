"use client"

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
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
  ArrowLeft,
  MessageSquare
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, isAdminImpersonating, stopImpersonating } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const routeRole = params?.role;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (routeRole && user.role !== routeRole) {
        router.replace(`/${user.role}/dashboard`);
      }
    }
  }, [user, isLoading, routeRole, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D1D1]"></div>
      </div>
    );
  }

  const getNavItems = () => {
    const role = user?.role || 'startup';
    if (role === 'admin') {
      return [
        { name: "General", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Members", href: "/admin/dashboard/users", icon: Users },
        { name: "Subsidiaries", href: "/admin/dashboard/subsidiaries", icon: Building2 },
        { name: "Opportunities", href: "/admin/dashboard/opportunities", icon: Briefcase },
        { name: "Common Area", href: "/admin/dashboard/chats", icon: MessageSquare },
        { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
      ];
    } else if (role === 'investor') {
      return [
        { name: "General", href: "/investor/dashboard", icon: LayoutDashboard },
        { name: "Marketplace", href: "/investor/dashboard/opportunities", icon: Briefcase },
        { name: "Network", href: "/investor/dashboard/network", icon: Globe },
        { name: "Insights", href: "/investor/dashboard/insights", icon: BarChart },
        { name: "Common Area", href: "/investor/dashboard/chats", icon: MessageSquare },
        { name: "Settings", href: "/investor/dashboard/settings", icon: Settings },
      ];
    } else { // startup
      return [
        { name: "General", href: "/startup/dashboard", icon: LayoutDashboard },
        { name: "My Opportunities", href: "/startup/dashboard/opportunities", icon: Briefcase },
        { name: "Common Area", href: "/startup/dashboard/chats", icon: MessageSquare },
        { name: "Settings", href: "/startup/dashboard/settings", icon: Settings },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F0F12] text-slate-300 font-sans">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0 transition-all duration-300">
        <div className={`flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "w-16" : "w-64"} bg-[#141416] border-r border-[#222222] overflow-hidden`}>
          
          <div className={`p-4 border-b border-[#222222] flex ${isSidebarCollapsed ? "flex-col items-center space-y-3 justify-center" : "items-center space-x-3"}`}>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="p-1 hover:bg-[#2A2A2D] rounded-md transition-colors text-slate-400 focus:outline-none cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ArrowLeft className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
            <div className="flex items-center">
              <div className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                <img src="/logo-icon.png" alt="Axiomra Icon" className="h-5 w-auto" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col ml-2 transition-opacity duration-300 opacity-100">
                  <span className="text-sm font-semibold text-white leading-tight">Axiomra Portal</span>
                  <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">{user.full_name}</span>
                </div>
              )}
            </div>
          </div>
 
          <div className="flex-1 flex flex-col overflow-y-auto py-4">
            <div className="px-3 mb-2">
              {!isSidebarCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 transition-opacity duration-300">Navigation</h3>
              )}
              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center ${isSidebarCollapsed ? "justify-center px-2 py-2" : "px-3 py-2"} text-sm font-medium rounded-md transition-colors ${
                        isActive 
                          ? "bg-[#2A2A2D] text-[#00D1D1]" 
                          : "text-slate-400 hover:bg-[#222222] hover:text-white"
                      }`}
                      title={isSidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={`${isSidebarCollapsed ? "" : "mr-3"} h-4 w-4 flex-shrink-0 ${isActive ? "text-[#00D1D1]" : "text-slate-500 group-hover:text-slate-300"}`} />
                      {!isSidebarCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          
          <div className="flex-shrink-0 border-t border-[#222222] p-4">
            <button 
              onClick={logout} 
              className={`group flex w-full items-center ${isSidebarCollapsed ? "justify-center px-2 py-2" : "px-3 py-2"} text-sm font-medium rounded-md text-slate-400 hover:bg-[#2A2A2D] hover:text-white transition-colors cursor-pointer`}
              title={isSidebarCollapsed ? "Sign out" : undefined}
            >
              <LogOut className={`${isSidebarCollapsed ? "" : "mr-3"} h-4 w-4 flex-shrink-0 text-slate-500 group-hover:text-slate-300`} />
              {!isSidebarCollapsed && <span className="transition-opacity duration-300">Sign out</span>}
            </button>
          </div>
        </div>
      </div>
 
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Impersonation Banner */}
        {isAdminImpersonating && (
          <div className="bg-[#1E90FF]/15 border-b border-[#1E90FF]/30 px-4 py-2 flex items-center justify-between text-xs sm:text-sm text-slate-300 z-50">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#1E90FF] animate-pulse"></span>
              <span>Impersonating user: <strong className="text-white">{user?.full_name}</strong> ({user?.email})</span>
            </div>
            <button 
              onClick={stopImpersonating}
              className="bg-[#1E90FF] hover:bg-[#1C86EE] text-white px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              Return to Admin
            </button>
          </div>
        )}

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between border-b border-[#222222] p-4 bg-[#141416]">
          <span className="text-lg font-bold text-white">Axiomra Portal</span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-slate-400 focus:outline-none cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
 
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-[#222222] bg-[#141416] absolute z-50 w-full left-0 mt-[65px] h-full">
            <nav className="px-4 pt-4 pb-4 space-y-1">
              {navItems.map((item) => (
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
                className="w-full flex items-center px-3 py-3 text-base font-medium rounded-md text-red-500 hover:bg-[#222222] cursor-pointer"
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
