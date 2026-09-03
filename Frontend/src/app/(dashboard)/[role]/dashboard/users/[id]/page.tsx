"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Check, X, Building2, DollarSign, 
  HelpCircle, Activity, FileText, User, Mail, Phone, Calendar, ShieldAlert 
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import toast from "react-hot-toast";

type TabType = 'identity' | 'financials' | 'funding' | 'public_info';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('identity');

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(`/admin/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user details", err);
      toast.error("Failed to load user details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await fetchApi(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active', role: user.role }),
      });
      toast.success("User approved successfully!");
      loadUserDetails();
    } catch (err) {
      toast.error("Failed to approve user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject and delete this registration request? This action cannot be undone.")) return;
    try {
      setIsSubmitting(true);
      await fetchApi(`/admin/users/${userId}`, { method: 'DELETE' });
      toast.success("Registration request rejected and user deleted.");
      router.push("/admin/dashboard/users");
    } catch (err) {
      toast.error("Failed to reject user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center bg-[#0F0F12]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1D1]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center bg-[#0F0F12] text-slate-400">
        <p className="mb-4">User not found or you don't have access.</p>
        <button onClick={() => router.push("/admin/dashboard/users")} className="text-[#00D1D1] hover:underline flex items-center justify-center mx-auto cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to members
        </button>
      </div>
    );
  }

  const startup = Array.isArray(user.startups) ? user.startups[0] : user.startups;
  const investor = Array.isArray(user.investors) ? user.investors[0] : user.investors;

  const tabs = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'funding', label: 'Funding', icon: Building2 },
    { id: 'public_info', label: 'Public Info', icon: HelpCircle },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 bg-[#0F0F12] min-h-screen text-slate-300 font-sans">
      
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <button 
          onClick={() => router.push("/admin/dashboard/users")} 
          className="flex items-center text-sm text-slate-400 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Members List
        </button>
        
        {/* Verification Status & Direct Actions */}
        {user.status === 'pending' && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-md font-medium border border-amber-500/20">
              Pending Verification
            </span>
            <button 
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex items-center space-x-1 text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-1.5 rounded border border-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject Request</span>
            </button>
            <button 
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex items-center space-x-1 text-xs font-semibold bg-[#00D1D1] hover:bg-[#00B3B3] text-white px-3.5 py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve Account</span>
            </button>
          </div>
        )}

        {user.status === 'active' && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-md font-medium border border-emerald-500/20">
              Active Member
            </span>
            <button 
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex items-center space-x-1 text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-1.5 rounded border border-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Delete User</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT PANEL: User Avatar & Quick Role Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-[#222222]">
              <div className="h-16 w-16 rounded-full bg-[#2A2A2D] flex items-center justify-center text-xl font-bold text-[#00D1D1] mb-4">
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold text-white truncate w-full">{user.full_name}</h2>
              <span className="text-xs text-slate-500 mt-1 capitalize font-medium">{user.role}</span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-[10px] text-slate-500">Contact Email</span>
                <span className="text-slate-300 font-medium break-all">{user.email}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">Contact Phone</span>
                <span className="text-slate-300 font-medium">{user.phone || "Not provided"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">Submitted On</span>
                <span className="text-slate-300 font-medium">{formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Tabbed Data View */}
        <div className="lg:col-span-3 space-y-6">
          
          {user.role === 'startup' && (
            <>
              {/* Step Tabs Navigation */}
              <div className="flex border-b border-[#222222] space-x-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center space-x-2 pb-4 text-sm font-semibold border-b-2 transition-all cursor-pointer focus:outline-none ${
                        isActive 
                          ? "border-[#00D1D1] text-[#00D1D1]" 
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB PANEL 1: Identity */}
              {activeTab === 'identity' && (
                <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 pb-4 border-b border-[#222222]">
                    <User className="h-5 w-5 text-[#00D1D1]" />
                    <h3 className="text-base font-semibold text-white">Identity Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Company / Legal Name</span>
                      <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222]">
                        {user.full_name}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Email Address</span>
                      <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222] break-all">
                        {user.email}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Industry / Sector</span>
                      <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222] capitalize">
                        {startup?.industry || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Funding Stage</span>
                      <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222] capitalize">
                        {startup?.stage || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB PANEL 2: Financials */}
              {activeTab === 'financials' && (
                <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 pb-4 border-b border-[#222222]">
                    <DollarSign className="h-5 w-5 text-[#00D1D1]" />
                    <h3 className="text-base font-semibold text-white">Financial Profile</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Current ARR</span>
                      <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222]">
                        {startup?.current_arr ? `$${Number(startup.current_arr).toLocaleString()}` : "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Last Year Revenue</span>
                      <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222]">
                        {startup?.last_year_revenue ? `$${Number(startup.last_year_revenue).toLocaleString()}` : "Not specified"}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="block text-xs text-slate-500 mb-1">Revenue Model & Mechanics</span>
                      <p className="text-sm text-slate-400 bg-[#0F0F12] p-4 rounded border border-[#222222] leading-relaxed whitespace-pre-wrap">
                        {startup?.revenue_model || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB PANEL 3: Funding */}
              {activeTab === 'funding' && (
                <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 pb-4 border-b border-[#222222]">
                    <Building2 className="h-5 w-5 text-[#00D1D1]" />
                    <h3 className="text-base font-semibold text-white">Funding Requirements</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Funding Sought</span>
                      <span className="text-sm font-semibold text-[#00D1D1] block bg-[#0F0F12] p-2.5 rounded border border-[#222222] font-mono">
                        {startup?.funding_sought ? `$${Number(startup.funding_sought).toLocaleString()}` : "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Previous Funding Raised</span>
                      <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222]">
                        {startup?.previous_funding ? `$${Number(startup.previous_funding).toLocaleString()}` : "Not specified"}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="block text-xs text-slate-500 mb-1">Primary Use of Funds</span>
                      <p className="text-sm text-slate-400 bg-[#0F0F12] p-4 rounded border border-[#222222] leading-relaxed whitespace-pre-wrap">
                        {startup?.primary_use_of_funds || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB PANEL 4: Public Info */}
              {activeTab === 'public_info' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Company Description */}
                  <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-[#222222]">
                      <FileText className="h-5 w-5 text-[#00D1D1]" />
                      <h3 className="text-base font-semibold text-white">Company Description</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed bg-[#0F0F12] p-4 rounded border border-[#222222] whitespace-pre-wrap">
                      {startup?.description || "No description provided."}
                    </p>
                  </div>

                  {/* Custom Q&A responses */}
                  <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6">
                    <div className="flex items-center space-x-2 pb-4 border-b border-[#222222]">
                      <HelpCircle className="h-5 w-5 text-[#00D1D1]" />
                      <h3 className="text-base font-semibold text-white">Custom Registration Q&A</h3>
                    </div>

                    {startup?.custom_qa && Object.keys(startup.custom_qa).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(startup.custom_qa).map(([question, answer]: [string, any], idx) => (
                          <div key={idx} className="bg-[#0F0F12] p-4 rounded-lg border border-[#222222] space-y-2">
                            <span className="block text-xs font-semibold text-white">Q: {question}</span>
                            <span className="block text-sm text-slate-400 leading-relaxed pl-4 border-l border-[#00D1D1]/40 whitespace-pre-wrap">
                              {answer || "No response provided"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No custom Q&A responses submitted during registration.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Simple Preferences tab layout for investors */}
          {user.role === 'investor' && (
            <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 pb-4 border-b border-[#222222]">
                <Activity className="h-5 w-5 text-[#00D1D1]" />
                <h3 className="text-base font-semibold text-white">Investor Profile & Preferences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Minimum Investment Ticket</span>
                  <span className="text-sm font-semibold text-white block bg-[#0F0F12] p-2.5 rounded border border-[#222222]">
                    {investor?.investment_min ? `$${Number(investor.investment_min).toLocaleString()}` : "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Maximum Investment Ticket</span>
                  <span className="text-sm font-semibold text-[#00D1D1] block bg-[#0F0F12] p-2.5 rounded border border-[#222222]">
                    {investor?.investment_max ? `$${Number(investor.investment_max).toLocaleString()}` : "Not specified"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="block text-xs text-slate-500 mb-2">Preferred Industries</span>
                <div className="flex flex-wrap gap-2">
                  {investor?.preferred_industries && investor.preferred_industries.length > 0 ? (
                    investor.preferred_industries.map((ind: string, idx: number) => (
                      <span key={idx} className="bg-[#00D1D1]/10 text-[#00D1D1] text-xs font-semibold px-3 py-1 rounded capitalize border border-[#00D1D1]/20">
                        {ind}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">None specified</span>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
