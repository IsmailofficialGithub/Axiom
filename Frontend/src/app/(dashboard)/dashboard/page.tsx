"use client"

import { useState, useEffect } from "react";
import { 
  Users, Building2, Briefcase, UserPlus, 
  DollarSign, Activity, Compass, Settings, 
  Layers, ShieldCheck, ArrowRight, Star
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubsidiaries: 0,
    totalOpportunities: 0,
    pendingInvites: 0
  });
  const [investorDetails, setInvestorDetails] = useState<any>(null);
  const [startupDetails, setStartupDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        if (user.role === 'admin') {
          const res = await fetchApi('/admin/stats');
          setStats(res.data);
        } else {
          // Load my user profile details (investor limits or startup stats)
          const res = await fetchApi('/users/profile');
          if (user.role === 'investor') {
            setInvestorDetails(res.details);
          } else if (user.role === 'startup') {
            setStartupDetails(res.details);
          }
          
          // Load opportunities count for marketplace preview
          const oppsRes = await fetchApi('/opportunities');
          setStats(prev => ({
            ...prev,
            totalOpportunities: oppsRes.data?.length || 0
          }));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1D1]"></div>
      </div>
    );
  }

  // =======================
  // ADMIN VIEW
  // =======================
  if (user?.role === 'admin') {
    const statCards = [
      {
        title: "Total Members",
        value: stats.totalUsers.toString(),
        icon: <Users className="h-5 w-5 text-[#00D1D1]" />,
        bgColor: "bg-[#00D1D1]/10",
        description: "Active platform users"
      },
      {
        title: "Subsidiaries",
        value: stats.totalSubsidiaries.toString(),
        icon: <Building2 className="h-5 w-5 text-emerald-500" />,
        bgColor: "bg-emerald-500/10",
        description: "Managed subsidiaries"
      },
      {
        title: "Opportunities",
        value: stats.totalOpportunities.toString(),
        icon: <Briefcase className="h-5 w-5 text-purple-500" />,
        bgColor: "bg-purple-500/10",
        description: "Active deals in pipeline"
      },
      {
        title: "Pending KYC",
        value: stats.pendingInvites.toString(),
        icon: <UserPlus className="h-5 w-5 text-amber-500" />,
        bgColor: "bg-amber-500/10",
        description: "Requires approval"
      }
    ];

    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, {user.full_name}. Here is the platform operational status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-[#141416] border border-[#222222] rounded-xl p-6 transition-all hover:border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-semibold text-slate-300 mb-1">{stat.title}</p>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#141416] border border-[#222222] rounded-xl p-6 min-h-[300px] flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white">System Analytics</h3>
            <div className="flex-1 flex items-center justify-center border border-dashed border-[#222222] rounded-lg mt-4 text-slate-500 text-xs">
              Real-time activity logs and chart indicators will display here.
            </div>
          </div>
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 min-h-[300px] flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
            <div className="flex-1 flex items-center justify-center border border-dashed border-[#222222] rounded-lg mt-4 text-slate-500 text-xs text-center p-4">
              Go to "Members" page to view pending investor and startup registrations.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================
  // INVESTOR VIEW
  // =======================
  if (user?.role === 'investor') {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-white">Investor Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Access institutional private placements and deal rooms.</p>
          </div>
          <Link 
            href="/dashboard/opportunities" 
            className="flex items-center space-x-2 text-xs font-semibold bg-[#00D1D1] hover:bg-[#00B3B3] text-white px-4 py-2 rounded-lg transition-colors w-fit"
          >
            <span>Browse Startup Marketplace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-slate-400">
              <DollarSign className="h-5 w-5 text-[#00D1D1]" />
              <span className="text-sm font-semibold text-white">Target Ticket Min</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {investorDetails?.investment_min ? `$${Number(investorDetails.investment_min).toLocaleString()}` : "$0"}
            </p>
            <p className="text-xs text-slate-500">Minimum investment amount preference</p>
          </div>

          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-slate-400">
              <Activity className="h-5 w-5 text-[#00D1D1]" />
              <span className="text-sm font-semibold text-white">Target Ticket Max</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {investorDetails?.investment_max ? `$${Number(investorDetails.investment_max).toLocaleString()}` : "No Limit"}
            </p>
            <p className="text-xs text-slate-500">Maximum investment capacity preference</p>
          </div>

          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-slate-400">
              <Compass className="h-5 w-5 text-[#00D1D1]" />
              <span className="text-sm font-semibold text-white">Marketplace Deals</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalOpportunities}</p>
            <p className="text-xs text-slate-500">Startup placement opportunities live</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target Industries */}
          <div className="lg:col-span-2 bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
              <h3 className="text-sm font-semibold text-white">Your Preferred Sectors</h3>
              <Link href="/dashboard/settings" className="text-xs text-[#00D1D1] hover:underline flex items-center">
                <Settings className="h-3 w-3 mr-1" /> Edit Preferences
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {investorDetails?.preferred_industries && investorDetails.preferred_industries.length > 0 ? (
                investorDetails.preferred_industries.map((ind: string, idx: number) => (
                  <span key={idx} className="bg-[#00D1D1]/10 text-[#00D1D1] text-xs font-semibold px-3 py-1.5 rounded-full capitalize border border-[#00D1D1]/20">
                    {ind}
                  </span>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm w-full">
                  You haven't specified any preferred sectors. Go to Settings to configure them!
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Axiomra Access Guide</h3>
            <ul className="text-xs text-slate-400 space-y-3">
              <li className="flex items-start">
                <ShieldCheck className="h-4 w-4 text-[#00D1D1] mr-2 flex-shrink-0 mt-0.5" />
                <span>Verify startup placements live in the **Marketplace** tab.</span>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="h-4 w-4 text-[#00D1D1] mr-2 flex-shrink-0 mt-0.5" />
                <span>Request access to private deal rooms and pitch decks directly.</span>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="h-4 w-4 text-[#00D1D1] mr-2 flex-shrink-0 mt-0.5" />
                <span>Keep your investment preferences updated in **Settings** to receive matching deals.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // =======================
  // STARTUP VIEW
  // =======================
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Startup Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Manage deal rooms, documents, and pitch details.</p>
        </div>
        <Link 
          href="/dashboard/opportunities" 
          className="flex items-center space-x-2 text-xs font-semibold bg-[#00D1D1] hover:bg-[#00B3B3] text-white px-4 py-2 rounded-lg transition-colors w-fit"
        >
          <span>Manage Pitch Decks</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
            <Building2 className="h-5 w-5" />
            <h3 className="text-sm font-semibold text-white">Startup Profile summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <span className="block text-xs text-slate-500">Legal Name</span>
              <span className="font-semibold text-white">{user?.full_name}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Funding Stage</span>
              <span className="font-semibold text-white capitalize">{startupDetails?.stage || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Sector</span>
              <span className="font-semibold text-white capitalize">{startupDetails?.industry || "Not specified"}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-500">ARR</span>
              <span className="font-semibold text-white">{startupDetails?.current_arr ? `$${Number(startupDetails.current_arr).toLocaleString()}` : "Not specified"}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
              <Layers className="h-5 w-5" />
              <h3 className="text-sm font-semibold text-white">Onboarding Checklist</h3>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 mt-3">
              <li className="flex items-center text-emerald-500 font-medium">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <span>Verification review complete (Profile Activated)</span>
              </li>
              <li className="flex items-center">
                <input type="checkbox" checked={stats.totalOpportunities > 0} readOnly className="mr-2.5 rounded border-[#222222]" />
                <span>Publish your first Capital Placement Deal Room</span>
              </li>
            </ul>
          </div>
          <Link href="/dashboard/settings" className="text-xs text-[#00D1D1] hover:underline flex items-center pt-2">
            <Settings className="h-3.5 w-3.5 mr-1" /> Edit Profile & Pitch Data
          </Link>
        </div>
      </div>
    </div>
  );
}
