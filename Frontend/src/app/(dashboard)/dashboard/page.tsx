"use client"

import { useState, useEffect } from "react";
import { Users, Building2, Briefcase, UserPlus } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubsidiaries: 0,
    totalOpportunities: 0,
    pendingInvites: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchApi('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalUsers.toString(),
      icon: <Users className="h-6 w-6 text-[#1E90FF]" />,
      bgColor: "bg-[#1E90FF]/10",
      description: "Active platform users"
    },
    {
      title: "Subsidiaries",
      value: stats.totalSubsidiaries.toString(),
      icon: <Building2 className="h-6 w-6 text-emerald-500" />,
      bgColor: "bg-emerald-500/10",
      description: "Managed subsidiaries"
    },
    {
      title: "Opportunities",
      value: stats.totalOpportunities.toString(),
      icon: <Briefcase className="h-6 w-6 text-purple-500" />,
      bgColor: "bg-purple-500/10",
      description: "Active deals in pipeline"
    },
    {
      title: "Pending KYC",
      value: stats.pendingInvites.toString(),
      icon: <UserPlus className="h-6 w-6 text-amber-500" />,
      bgColor: "bg-amber-500/10",
      description: "Requires approval"
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome to the FRIMA Admin Portal.</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E90FF]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-[#141416] border border-[#222222] rounded-xl p-6 transition-all hover:border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-300 mb-1">{stat.title}</p>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder for future charts or activity feed */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#141416] border border-[#222222] rounded-xl p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Analytics Chart Placeholder</p>
        </div>
        <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Recent Activity Placeholder</p>
        </div>
      </div>
    </div>
  );
}
