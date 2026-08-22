"use client"

import { useState, useEffect } from "react";
import { User, Lock, Mail, Phone, Shield, DollarSign, Activity, Compass, FileText, Building2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const AVAILABLE_INDUSTRIES = [
  "saas", "fintech", "ai_ml", "healthcare", "biotech", 
  "energy", "cleantech", "web3", "e_commerce", "consumer", 
  "hardware", "deeptech", "other"
];

const STAGE_OPTIONS = [
  "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Bootstrapped"
];

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Investor specific details
  const [investorForm, setInvestorForm] = useState({
    investment_min: "",
    investment_max: "",
    preferred_industries: [] as string[]
  });
  
  // Startup specific details
  const [startupForm, setStartupForm] = useState({
    industry: "",
    stage: "",
    current_arr: "",
    last_year_revenue: "",
    revenue_model: "",
    funding_sought: "",
    primary_use_of_funds: "",
    previous_funding: "",
    description: ""
  });

  const [isDetailsSubmitting, setIsDetailsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const loadPreferences = async () => {
    try {
      setIsLoadingDetails(true);
      const res = await fetchApi('/users/profile');
      
      if (res.profile) {
        setProfileForm({
          full_name: res.profile.full_name || "",
          phone: res.profile.phone || ""
        });
      }

      if (user?.role === 'investor' && res.details) {
        setInvestorForm({
          investment_min: res.details.investment_min?.toString() || "",
          investment_max: res.details.investment_max?.toString() || "",
          preferred_industries: res.details.preferred_industries || []
        });
      }

      if (user?.role === 'startup' && res.details) {
        setStartupForm({
          industry: res.details.industry || "",
          stage: res.details.stage || "",
          current_arr: res.details.current_arr?.toString() || "",
          last_year_revenue: res.details.last_year_revenue?.toString() || "",
          revenue_model: res.details.revenue_model || "",
          funding_sought: res.details.funding_sought?.toString() || "",
          primary_use_of_funds: res.details.primary_use_of_funds || "",
          previous_funding: res.details.previous_funding?.toString() || "",
          description: res.details.description || ""
        });
      }
    } catch (err) {
      console.error("Failed to load settings details", err);
      toast.error("Failed to load details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProfileSubmitting(true);
      await fetchApi('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      });
      toast.success("Profile basic information updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsDetailsSubmitting(true);
      const bodyPayload = user?.role === 'investor' ? investorForm : startupForm;
      await fetchApi('/users/profile/details', {
        method: 'PATCH',
        body: JSON.stringify(bodyPayload),
      });
      toast.success("Institutional preferences updated successfully!");
      loadPreferences();
    } catch (err: any) {
      toast.error(err.message || "Failed to update preferences");
    } finally {
      setIsDetailsSubmitting(false);
    }
  };

  const handleIndustryToggle = (ind: string) => {
    setInvestorForm(prev => {
      const current = prev.preferred_industries;
      if (current.includes(ind)) {
        return { ...prev, preferred_industries: current.filter(x => x !== ind) };
      } else {
        return { ...prev, preferred_industries: [...current, ind] };
      }
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsPasswordSubmitting(true);
      await fetchApi('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ password: passwordForm.password }),
      });
      toast.success("Password updated successfully!");
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1D1]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 font-sans bg-[#0F0F12] text-slate-300 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account profile and institutional parameters.</p>
      </div>

      <div className="space-y-8">
        
        {/* Profile Settings */}
        <div className="bg-[#141416] border border-[#222222] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#222222] flex items-center space-x-3 bg-[#18181B]/50">
            <User className="h-5 w-5 text-[#00D1D1]" />
            <h2 className="text-lg font-semibold text-white">Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Company / Legal Name</label>
                <input 
                  type="text" 
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[#0F0F12]/50 border border-[#222222] text-slate-500 text-sm rounded-md px-3 py-2.5 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role Type</label>
                <div className="flex items-center h-[42px] px-3 bg-[#0F0F12]/50 border border-[#222222] text-slate-500 text-sm rounded-md capitalize font-medium">
                  {user?.role}
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isProfileSubmitting}
                className="px-4 py-2 text-xs font-bold bg-[#00D1D1] hover:bg-[#00B3B3] text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isProfileSubmitting ? "Saving..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>

        {/* ROLE SPECIFIC PREFERENCES */}

        {/* Investor Preferences Card */}
        {user?.role === 'investor' && (
          <div className="bg-[#141416] border border-[#222222] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#222222] flex items-center space-x-3 bg-[#18181B]/50">
              <Activity className="h-5 w-5 text-[#00D1D1]" />
              <h2 className="text-lg font-semibold text-white">Investment Preferences & Limits</h2>
            </div>
            
            <form onSubmit={handleDetailsSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Minimum Investment Ticket ($)</label>
                  <input 
                    type="number" 
                    value={investorForm.investment_min}
                    onChange={(e) => setInvestorForm({...investorForm, investment_min: e.target.value})}
                    placeholder="e.g. 50000"
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Maximum Investment Ticket ($)</label>
                  <input 
                    type="number" 
                    value={investorForm.investment_max}
                    onChange={(e) => setInvestorForm({...investorForm, investment_max: e.target.value})}
                    placeholder="e.g. 1000000"
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Target Industries & Sectors</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-[#0F0F12] p-4 rounded-lg border border-[#222222]">
                  {AVAILABLE_INDUSTRIES.map((ind) => {
                    const checked = investorForm.preferred_industries.includes(ind);
                    return (
                      <label key={ind} className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer hover:text-white select-none capitalize">
                        <input 
                          type="checkbox" 
                          checked={checked} 
                          onChange={() => handleIndustryToggle(ind)}
                          className="rounded border-[#222222] text-[#00D1D1] focus:ring-[#00D1D1]" 
                        />
                        <span>{ind.replace('_', '/')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isDetailsSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-[#00D1D1] hover:bg-[#00B3B3] text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDetailsSubmitting ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Startup Specific Details Card */}
        {user?.role === 'startup' && (
          <div className="bg-[#141416] border border-[#222222] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#222222] flex items-center space-x-3 bg-[#18181B]/50">
              <Building2 className="h-5 w-5 text-[#00D1D1]" />
              <h2 className="text-lg font-semibold text-white">Startup Profile & Financial Metrics</h2>
            </div>
            
            <form onSubmit={handleDetailsSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Industry / Sector</label>
                  <select 
                    value={startupForm.industry}
                    onChange={(e) => setStartupForm({...startupForm, industry: e.target.value})}
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1] capitalize"
                  >
                    <option value="">Select industry</option>
                    {AVAILABLE_INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind.replace('_', '/')}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Funding Stage</label>
                  <select 
                    value={startupForm.stage}
                    onChange={(e) => setStartupForm({...startupForm, stage: e.target.value})}
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]"
                  >
                    <option value="">Select stage</option>
                    {STAGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Current ARR ($)</label>
                  <input 
                    type="number" 
                    value={startupForm.current_arr}
                    onChange={(e) => setStartupForm({...startupForm, current_arr: e.target.value})}
                    placeholder="e.g. 250000"
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Last Year Revenue ($)</label>
                  <input 
                    type="number" 
                    value={startupForm.last_year_revenue}
                    onChange={(e) => setStartupForm({...startupForm, last_year_revenue: e.target.value})}
                    placeholder="e.g. 150000"
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Funding Sought ($)</label>
                  <input 
                    type="number" 
                    value={startupForm.funding_sought}
                    onChange={(e) => setStartupForm({...startupForm, funding_sought: e.target.value})}
                    placeholder="e.g. 1500000"
                    className="w-full bg-[#0F0F12] border border-[#222222] text-[#00D1D1] text-sm font-semibold rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Previous Funding ($)</label>
                  <input 
                    type="number" 
                    value={startupForm.previous_funding}
                    onChange={(e) => setStartupForm({...startupForm, previous_funding: e.target.value})}
                    placeholder="e.g. 300000"
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Company Description</label>
                  <textarea 
                    rows={4}
                    value={startupForm.description}
                    onChange={(e) => setStartupForm({...startupForm, description: e.target.value})}
                    placeholder="Describe your company product and mission..."
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Revenue Model</label>
                  <textarea 
                    rows={2}
                    value={startupForm.revenue_model}
                    onChange={(e) => setStartupForm({...startupForm, revenue_model: e.target.value})}
                    placeholder="e.g. B2B Enterprise SaaS subscriptions..."
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Primary Use of Funds</label>
                  <textarea 
                    rows={2}
                    value={startupForm.primary_use_of_funds}
                    onChange={(e) => setStartupForm({...startupForm, primary_use_of_funds: e.target.value})}
                    placeholder="e.g. 50% Engineering scale, 30% Marketing, 20% Operations..."
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isDetailsSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-[#00D1D1] hover:bg-[#00B3B3] text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDetailsSubmitting ? "Saving..." : "Save Metrics"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Settings */}
        <div className="bg-[#141416] border border-[#222222] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#222222] flex items-center space-x-3 bg-[#18181B]/50">
            <Lock className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-white">Security & Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isPasswordSubmitting}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPasswordSubmitting ? "Updating..." : "Update Account Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
