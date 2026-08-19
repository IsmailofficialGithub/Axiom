"use client"

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { AlertCircle, CheckCircle2, Clock, Users, Building2, TrendingUp, DollarSign, Briefcase } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user.full_name}</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your account today.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center bg-[var(--card-bg)] px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className={`h-2 w-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-[var(--color-brand-emerald)]' : user.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">Account Status: {user.status}</span>
        </div>
      </div>

      {user.role === 'startup' && <StartupDashboard />}
      {user.role === 'investor' && <InvestorDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
}

// ==========================================
// STARTUP DASHBOARD
// ==========================================
function StartupDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApi('/users/profile')
      .then(data => setProfile(data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-emerald)]"></div></div>;
  }

  return (
    <div className="space-y-6">
      {user?.status === 'pending' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Your profile is under review</h4>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
              Our institutional team is currently vetting your application. You will be notified via email once your account is active and visible to investors.
            </p>
          </div>
        </div>
      )}

      {profile?.startup_profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center text-slate-500 mb-4">
              <TrendingUp className="h-5 w-5 mr-2 text-[var(--color-brand-emerald)]" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Current ARR</h3>
            </div>
            <p className="text-3xl font-bold">${Number(profile.startup_profile.current_arr).toLocaleString()}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center text-slate-500 mb-4">
              <DollarSign className="h-5 w-5 mr-2 text-[var(--color-brand-emerald)]" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Funding Sought</h3>
            </div>
            <p className="text-3xl font-bold">${Number(profile.startup_profile.funding_sought).toLocaleString()}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center text-slate-500 mb-4">
              <Building2 className="h-5 w-5 mr-2 text-[var(--color-brand-emerald)]" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Industry</h3>
            </div>
            <p className="text-xl font-bold capitalize">{profile.startup_profile.industry}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// INVESTOR DASHBOARD
// ==========================================
function InvestorDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      {user?.status === 'pending' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Your account is pending verification</h4>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
              We are currently verifying your institutional credentials. Deal flow access is restricted until approval.
            </p>
          </div>
        </div>
      )}

      {user?.status === 'active' && (
        <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-[var(--color-brand-emerald)]/10 text-[var(--color-brand-emerald)] rounded-full flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Deal Flow Generation</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            The algorithm is currently curating bespoke startup opportunities based on your investment focus. Check back soon.
          </p>
          <button className="px-6 py-2 bg-[var(--color-brand-emerald)] text-white font-medium rounded-md hover:bg-[var(--color-brand-emerald-hover)] transition-colors">
            View All Startups
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================
function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/users')
      .then(data => setUsers(data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-emerald)]"></div></div>;
  }

  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'active');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500">Total Users</h3>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500">Pending Reviews</h3>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-500">{pendingUsers.length}</p>
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500">Active Accounts</h3>
            <CheckCircle2 className="h-5 w-5 text-[var(--color-brand-emerald)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-brand-emerald)]">{activeUsers.length}</p>
        </div>
      </div>

      {/* Basic Table Scaffold */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {users.slice(0, 10).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{u.full_name}</td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 capitalize">{u.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      u.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[var(--color-brand-emerald)] hover:underline font-medium text-sm">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-slate-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
