"use client"

import { useState, useEffect } from "react";
import { 
  Search, ChevronDown, MoreHorizontal, X, Plus, 
  Briefcase, Building2, DollarSign, Activity, FileText, 
  HelpCircle, Globe, ChevronRight, CheckCircle2, Star, ShieldAlert, Filter, Lock, Unlock, ShieldCheck, Download, User
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

type DetailTabType = 'identity' | 'financials' | 'funding' | 'qa' | 'documents';

const STAGE_OPTIONS = [
  "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Bootstrapped"
];

const getStartupDetails = (opp: any) => {
  const startups = opp?.companies?.profiles?.startups;
  if (!startups) return null;
  if (Array.isArray(startups)) return startups[0];
  return startups;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Skeleton components for loading state
const SkeletonCard = () => (
  <div className="bg-[#141416] border border-[#222222] rounded-xl p-6 flex flex-col justify-between animate-pulse">
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="h-4 w-16 bg-[#222222] rounded"></div>
        <div className="h-3 w-10 bg-[#222222] rounded"></div>
      </div>
      <div>
        <div className="h-5 w-3/4 bg-[#222222] rounded"></div>
        <div className="h-3 w-1/2 bg-[#222222] rounded mt-2"></div>
      </div>
      <div className="bg-[#0F0F12] p-3 rounded border border-[#222222] space-y-2">
        <div className="h-3 w-full bg-[#222222] rounded"></div>
        <div className="h-3 w-5/6 bg-[#222222] rounded"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#222222]/60 text-xs">
        <div className="space-y-1.5">
          <div className="h-2 w-1/2 bg-[#222222] rounded"></div>
          <div className="h-3.5 w-3/4 bg-[#222222] rounded"></div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-1/2 bg-[#222222] rounded"></div>
          <div className="h-3.5 w-1/2 bg-[#222222] rounded"></div>
        </div>
      </div>
    </div>
    <div className="pt-6">
      <div className="h-8 w-full bg-[#222222] rounded"></div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-4"><div className="h-4 w-32 bg-[#222222] rounded"></div></td>
    <td className="py-4 px-4"><div className="h-4 w-24 bg-[#222222] rounded"></div></td>
    <td className="py-4 px-4"><div className="h-4 w-20 bg-[#222222] rounded"></div></td>
    <td className="py-4 px-4"><div className="h-4 w-16 bg-[#222222] rounded"></div></td>
    <td className="py-4 px-4"><div className="h-6 w-16 bg-[#222222] rounded-full"></div></td>
    <td className="py-4 px-4"><div className="h-4 w-24 bg-[#222222] rounded"></div></td>
    <td className="py-4 px-4 text-right"><div className="h-4 w-8 bg-[#222222] rounded ml-auto"></div></td>
  </tr>
);

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  // Advanced Filter States
  const [stageFilter, setStageFilter] = useState("all");
  const [arrFilter, setArrFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = user?.role === 'investor' ? 6 : 10;

  // Admin/Startup Form Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeOpp, setActiveOpp] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", expected_revenue: 0, status: "draft", stage: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Investor Marketplace Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [isLoadingOppDetail, setIsLoadingOppDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTabType>('identity');
  const [hasRequestedPrivateAccess, setHasRequestedPrivateAccess] = useState<Record<string, boolean>>({});

  const selectedStartupDetails = getStartupDetails(selectedOpp);

  // Startup/Admin Deal Room Modal
  const [dealRoomModalOpen, setDealRoomModalOpen] = useState(false);
  const [dealRoomOpp, setDealRoomOpp] = useState<any>(null);
  const [dealRoomDocs, setDealRoomDocs] = useState<any[]>([]);
  const [investorUsers, setInvestorUsers] = useState<any[]>([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState("");
  const [newDoc, setNewDoc] = useState({ file_name: "", file_url: "", visibility: "public" });
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [isGrantingPermission, setIsGrantingPermission] = useState(false);

  const loadOpportunities = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await fetchApi('/opportunities');
      setOpportunities(res.data || []);
    } catch (err) {
      console.error("Failed to load opportunities", err);
      if (!silent) toast.error("Failed to load opportunities");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();

    // Poll silently for real-time updates every 5 seconds
    const interval = setInterval(() => {
      loadOpportunities(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, industryFilter, stageFilter, arrFilter, fundingFilter]);

  const filteredOpportunities = opportunities.filter(o => {
    const matchesSearch = o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.companies?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const companyIndustry = o.companies?.industry?.toLowerCase() || '';
    const matchesIndustry = industryFilter === 'all' || companyIndustry === industryFilter.toLowerCase();
    
    const startupDetails = getStartupDetails(o);
    
    // Stage Filter
    const startupStage = startupDetails?.stage?.toLowerCase() || '';
    const matchesStage = stageFilter === 'all' || startupStage === stageFilter.toLowerCase();
    
    // ARR Filter
    const startupARR = Number(startupDetails?.current_arr || 0);
    let matchesARR = true;
    if (arrFilter === '100k') {
      matchesARR = startupARR >= 100000;
    } else if (arrFilter === '500k') {
      matchesARR = startupARR >= 500000;
    } else if (arrFilter === '1m') {
      matchesARR = startupARR >= 1000000;
    }
    
    // Funding Filter
    const fundingSought = Number(startupDetails?.funding_sought || o.expected_revenue || 0);
    let matchesFunding = true;
    if (fundingFilter === 'under_1m') {
      matchesFunding = fundingSought < 1000000;
    } else if (fundingFilter === '1m_5m') {
      matchesFunding = fundingSought >= 1000000 && fundingSought <= 5000000;
    } else if (fundingFilter === 'over_5m') {
      matchesFunding = fundingSought > 5000000;
    }
    
    return matchesSearch && matchesIndustry && matchesStage && matchesARR && matchesFunding;
  });

  // Calculate paginated opportunities
  const totalItems = filteredOpportunities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOpportunities = filteredOpportunities.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenCreate = () => {
    setModalMode("create");
    setForm({ title: "", description: "", expected_revenue: 0, status: "draft", stage: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (opp: any) => {
    setModalMode("edit");
    setActiveOpp(opp);
    setForm({ 
      title: opp.title, 
      description: opp.description || "", 
      expected_revenue: opp.expected_revenue || 0,
      status: opp.status || "draft",
      stage: opp.stage || ""
    });
    setModalOpen(true);
    setOpenDropdown(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this placement opportunity?")) return;
    try {
      await fetchApi(`/opportunities/${id}`, { method: 'DELETE' });
      setOpportunities(opportunities.filter(o => o.id !== id));
      toast.success("Opportunity deleted");
      setOpenDropdown(null);
    } catch (err) {
      toast.error("Failed to delete opportunity");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await fetchApi('/opportunities', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        toast.success("Opportunity created successfully!");
      } else {
        await fetchApi(`/opportunities/${activeOpp.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
        toast.success("Opportunity updated successfully!");
      }
      await loadOpportunities();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Investor opens detailed view card
  const handleOpenMarketplaceDetail = async (oppId: string) => {
    try {
      setIsLoadingOppDetail(true);
      setDetailModalOpen(true);
      setActiveDetailTab('identity');
      
      const res = await fetchApi(`/opportunities/${oppId}`);
      setSelectedOpp(res.data);

      // Fetch documents for the opportunity
      const docsRes = await fetchApi(`/deal-room/opportunities/${oppId}/documents`);
      setSelectedOpp(prev => ({
        ...prev,
        documents: docsRes.data || []
      }));
    } catch (err) {
      toast.error("Failed to load startup details");
      setDetailModalOpen(false);
    } finally {
      setIsLoadingOppDetail(false);
    }
  };

  // Startup/Admin opens Deal Room management modal
  const handleOpenDealRoom = async (opp: any) => {
    setDealRoomOpp(opp);
    setDealRoomModalOpen(true);
    setOpenDropdown(null);
    setNewDoc({ file_name: "", file_url: "", visibility: "public" });
    setSelectedInvestorId("");

    try {
      const docsRes = await fetchApi(`/deal-room/opportunities/${opp.id}/documents`);
      setDealRoomDocs(docsRes.data || []);

      const invRes = await fetchApi('/deal-room/investors');
      setInvestorUsers(invRes.data || []);
    } catch (err) {
      console.error("Failed to load deal room assets", err);
      toast.error("Failed to load deal room files");
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.file_name || !newDoc.file_url) {
      toast.error("File name and URL are required");
      return;
    }

    try {
      setIsAddingDoc(true);
      await fetchApi(`/deal-room/opportunities/${dealRoomOpp.id}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          file_url: newDoc.file_url,
          file_type: newDoc.file_name, 
          visibility: newDoc.visibility
        })
      });

      toast.success("Document added to deal room successfully!");
      setNewDoc({ file_name: "", file_url: "", visibility: "public" });
      
      const docsRes = await fetchApi(`/deal-room/opportunities/${dealRoomOpp.id}/documents`);
      setDealRoomDocs(docsRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to add document");
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestorId) {
      toast.error("Please select an investor");
      return;
    }

    try {
      setIsGrantingPermission(true);
      await fetchApi(`/deal-room/opportunities/${dealRoomOpp.id}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ investor_id: selectedInvestorId })
      });

      toast.success("Access granted successfully to selected investor!");
      setSelectedInvestorId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to grant access");
    } finally {
      setIsGrantingPermission(false);
    }
  };

  const handleRequestPrivateAccess = (oppId: string) => {
    setHasRequestedPrivateAccess(prev => ({ ...prev, [oppId]: true }));
    toast.success("Access request sent! The startup founder and FRIMA team will review your profile credentials.");
  };

  const uniqueIndustries = Array.from(
    new Set(opportunities.map(o => o.companies?.industry).filter(Boolean))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans bg-[#0F0F12] text-slate-300 min-h-screen flex flex-col justify-between">
      
      <div className="space-y-8 flex-1">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-4 border-b border-[#222222]">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.role === 'investor' ? 'Startup Capital Placement Marketplace' : 'Capital Opportunities'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {user?.role === 'investor' 
                ? 'Browse live startup equity distributions, financials, and custom pitch credentials.' 
                : 'Configure placement proposals and deal room entries.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search deals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#141416] border border-[#222222] text-sm text-slate-300 rounded pl-9 pr-4 py-2 focus:outline-none focus:border-[#00D1D1] w-48 transition-all"
              />
            </div>

            {/* Industry Filter dropdown */}
            <div className="relative">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="bg-[#141416] border border-[#222222] text-sm text-slate-300 rounded px-3 py-2 focus:outline-none focus:border-[#00D1D1] capitalize cursor-pointer"
              >
                <option value="all">All Sectors</option>
                {uniqueIndustries.map((ind: any) => (
                  <option key={ind} value={ind}>{ind.replace('_', '/')}</option>
                ))}
              </select>
            </div>

            {/* Add deal button for Admin / Startup */}
            {user?.role !== 'investor' && (
              <button 
                onClick={handleOpenCreate}
                className="flex items-center bg-[#00D1D1] hover:bg-[#00B3B3] text-white text-xs font-semibold rounded px-4 py-2.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Placement
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* INVESTOR CARD-GRID MARKETPLACE                                 */}
        {/* ============================================================== */}
        {user?.role === 'investor' && (
          <>
            {/* Advanced Filter Bar for Investors */}
            <div className="flex flex-wrap items-center gap-6 bg-[#141416] border border-[#222222] p-5 rounded-xl mb-6 text-xs select-none animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                <Filter className="h-4 w-4 text-[#00D1D1]" />
                <span>Placement Filters:</span>
              </div>
              
              {/* Stage Filter */}
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Company Stage</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-[#0F0F12] border border-[#222222] text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#00D1D1] cursor-pointer min-w-[120px]"
                >
                  <option value="all">All Stages</option>
                  {STAGE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* ARR Filter */}
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">ARR Minimum</span>
                <select
                  value={arrFilter}
                  onChange={(e) => setArrFilter(e.target.value)}
                  className="bg-[#0F0F12] border border-[#222222] text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#00D1D1] cursor-pointer min-w-[120px]"
                >
                  <option value="all">Any Revenue</option>
                  <option value="100k">+$100,000 ARR</option>
                  <option value="500k">+$500,000 ARR</option>
                  <option value="1m">+$1,000,000 ARR</option>
                </select>
              </div>

              {/* Funding Sought Range Filter */}
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Funding Sought</span>
                <select
                  value={fundingFilter}
                  onChange={(e) => setFundingFilter(e.target.value)}
                  className="bg-[#0F0F12] border border-[#222222] text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#00D1D1] cursor-pointer min-w-[125px]"
                >
                  <option value="all">Any Funding</option>
                  <option value="under_1m">Under $1M</option>
                  <option value="1m_5m">$1M - $5M</option>
                  <option value="over_5m">Over $5M</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(industryFilter !== 'all' || stageFilter !== 'all' || arrFilter !== 'all' || fundingFilter !== 'all' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setIndustryFilter('all');
                    setStageFilter('all');
                    setArrFilter('all');
                    setFundingFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-[#00D1D1] hover:text-[#00B3B3] transition-colors pt-4 self-end cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Content Loading State vs Card Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedOpportunities.map((opp) => (
                    <div 
                      key={opp.id} 
                      className="bg-[#141416] border border-[#222222] rounded-xl p-6 flex flex-col justify-between hover:border-[#00D1D1]/40 transition-all duration-300 group hover:shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <span className="bg-[#00D1D1]/10 text-[#00D1D1] text-[10px] font-bold px-2 py-0.5 rounded capitalize border border-[#00D1D1]/20">
                            {opp.companies?.industry?.replace('_', '/') || "SaaS"}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Live</span>
                        </div>
                        
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-[#00D1D1] transition-colors line-clamp-1">{opp.title}</h3>
                          <p className="text-xs text-slate-400 font-semibold mt-1">{opp.companies?.company_name || "Axiomra Placement"}</p>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 bg-[#0F0F12] p-3 rounded border border-[#222222]">
                          {opp.description || "No description provided."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-[#222222]/60">
                          <div>
                            <span className="block text-[10px] text-slate-500">Placement Target</span>
                            <span className="font-bold text-white font-mono">${Number(opp.expected_revenue || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500">Stage / Maturity</span>
                            <span className="font-bold text-white capitalize">{opp.stage || "Seed"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button 
                          onClick={() => handleOpenMarketplaceDetail(opp.id)}
                          className="w-full flex items-center justify-center space-x-1 bg-[#00D1D1]/10 hover:bg-[#00D1D1] text-[#00D1D1] hover:text-white text-xs font-bold py-2 rounded transition-all cursor-pointer"
                        >
                          <span>View Deal Details</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredOpportunities.length === 0 && (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-[#222222] rounded-xl bg-[#141416]/20">
                    No live startup equity placements match your target sector filter.
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* STARTUP / ADMIN TABLE VIEW                                     */}
        {/* ============================================================== */}
        {user?.role !== 'investor' && (
          <div className="overflow-x-auto bg-[#141416] border border-[#222222] rounded-xl p-4">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-[#222222] select-none">
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Placement Title</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Company</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Target Target ($)</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Deal Stage</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Created At</th>
                  <th className="pb-3 px-4 font-semibold uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#222222]/50">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : (
                  paginatedOpportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-[#0F0F12]/40 transition-colors">
                      <td className="py-4 px-4 text-slate-200 font-semibold truncate max-w-[200px]">{opp.title}</td>
                      <td className="py-4 px-4 text-slate-400">{opp.companies?.company_name || "—"}</td>
                      <td className="py-4 px-4 text-slate-300 font-mono">${Number(opp.expected_revenue || 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-slate-400 capitalize">{opp.stage || "—"}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          opp.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          opp.status === 'archived' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {opp.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{formatDate(opp.created_at)}</td>
                      <td className="py-4 px-4 text-slate-500 text-right relative">
                        <button onClick={() => setOpenDropdown(openDropdown === opp.id ? null : opp.id)} className="hover:text-slate-300 p-1 rounded hover:bg-[#222222] cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openDropdown === opp.id && (
                          <div className="absolute right-8 top-10 w-48 bg-[#141416] border border-[#222222] rounded-md shadow-lg z-50 overflow-hidden text-left">
                            <button onClick={() => handleOpenEdit(opp)} className="block w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#222222] hover:text-white cursor-pointer font-medium">Edit placement</button>
                            <button onClick={() => handleOpenDealRoom(opp)} className="block w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#222222] hover:text-white cursor-pointer font-medium">Manage Deal Room</button>
                            <div className="border-t border-[#222222]"></div>
                            <button onClick={() => handleDelete(opp.id)} className="block w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-[#222222] hover:text-red-400 cursor-pointer font-medium">Delete placement</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {filteredOpportunities.length === 0 && !isLoading && (
              <div className="text-center py-12 text-slate-500">
                No placement opportunities listed yet. Click "Add Placement" to set up your first deal room.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* PAGINATION CONTROLS PANEL                                      */}
      {/* ============================================================== */}
      {filteredOpportunities.length > 0 && !isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#222222] pt-4 mt-6 text-xs text-slate-500 gap-4 select-none">
          <div>
            Showing <span className="font-semibold text-slate-300">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-300">{endIndex}</span> of{' '}
            <span className="font-semibold text-slate-300">{totalItems}</span> placement proposals
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-[#141416] border border-[#222222] px-3.5 py-1.5 rounded text-slate-300 hover:border-[#00D1D1] disabled:opacity-40 disabled:hover:border-[#222222] disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-slate-400">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-[#141416] border border-[#222222] px-3.5 py-1.5 rounded text-slate-300 hover:border-[#00D1D1] disabled:opacity-40 disabled:hover:border-[#222222] disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* INVESTOR MARKETPLACE DETAIL DIALOG (STEP TABS WITH DEAL ROOM)  */}
      {/* ============================================================== */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#222222]">
              <div>
                <h3 className="text-base font-bold text-white">{selectedOpp?.title || "Equity Placement proposal"}</h3>
                <p className="text-xs text-slate-400 mt-1 capitalize font-medium">
                  {selectedOpp?.companies?.company_name} • Sector: {selectedOpp?.companies?.industry?.replace('_', '/')}
                </p>
              </div>
              <button 
                onClick={() => { setDetailModalOpen(false); setSelectedOpp(null); }} 
                className="text-slate-500 hover:text-white p-1 hover:bg-[#222222] rounded transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingOppDetail ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1D1]"></div>
              </div>
            ) : selectedOpp ? (
              <>
                {/* Dynamic Step Tabs Bar */}
                <div className="flex border-b border-[#222222]/80 px-6 space-x-6 bg-[#18181B]/30 select-none overflow-x-auto scrollbar-none">
                  {([
                    { id: 'identity', label: 'Identity', icon: User },
                    { id: 'financials', label: 'Financials', icon: DollarSign },
                    { id: 'funding', label: 'Funding', icon: Building2 },
                    { id: 'qa', label: 'Public Q&A', icon: HelpCircle },
                    { id: 'documents', label: 'Deal Room', icon: FileText }
                  ] as { id: DetailTabType, label: string, icon: any }[]).map((tab) => {
                    const isActive = activeDetailTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`flex items-center space-x-1.5 pb-3 pt-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                          isActive 
                            ? "border-[#00D1D1] text-[#00D1D1]" 
                            : "border-transparent text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab content area */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
                  
                  {/* TAB 1: IDENTITY */}
                  {activeDetailTab === 'identity' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-4">
                        <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                          <User className="h-4 w-4" />
                          <span className="font-semibold text-white">Legal Company Identity</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Company Name</span>
                            <span className="text-xs font-semibold text-white block bg-[#141416] p-2.5 rounded border border-[#222222]">
                              {selectedOpp.companies?.company_name || "Startup Legal Name"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Industry Sector</span>
                            <span className="text-xs font-semibold text-white block bg-[#141416] p-2.5 rounded border border-[#222222] capitalize">
                              {selectedOpp.companies?.industry?.replace('_', '/') || "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Operational Stage</span>
                            <span className="text-xs font-semibold text-white block bg-[#141416] p-2.5 rounded border border-[#222222]">
                              {selectedOpp.companies?.stage || "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Deal Proposal Stage</span>
                            <span className="text-xs font-semibold text-white block bg-[#141416] p-2.5 rounded border border-[#222222] capitalize">
                              {selectedOpp.stage || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-3">
                        <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                          <FileText className="h-4 w-4" />
                          <span className="font-semibold text-white">Deal Room Pitch Description</span>
                        </div>
                        <p className="leading-relaxed text-slate-400 bg-[#141416] p-4 rounded border border-[#222222] whitespace-pre-wrap font-sans">
                          {selectedOpp.description || "No pitch description provided."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: FINANCIALS */}
                  {activeDetailTab === 'financials' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-4">
                        <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-white">Startup Financial Profile</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Current Annual Recurring Revenue (ARR)</span>
                            <span className="text-xs font-bold text-white block bg-[#141416] p-2.5 rounded border border-[#222222]">
                              {selectedStartupDetails?.current_arr 
                                ? `$${Number(selectedStartupDetails.current_arr).toLocaleString()}` 
                                : "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Last Year Revenue</span>
                            <span className="text-xs font-bold text-white block bg-[#141416] p-2.5 rounded border border-[#222222]">
                              {selectedStartupDetails?.last_year_revenue 
                                ? `$${Number(selectedStartupDetails.last_year_revenue).toLocaleString()}` 
                                : "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-3">
                        <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                          <Activity className="h-4 w-4" />
                          <span className="font-semibold text-white">Revenue Model & Pricing Strategy</span>
                        </div>
                        <p className="leading-relaxed text-slate-400 bg-[#141416] p-4 rounded border border-[#222222] whitespace-pre-wrap font-sans">
                          {selectedStartupDetails?.revenue_model || "No revenue model details specified."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FUNDING */}
                  {activeDetailTab === 'funding' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-4">
                        <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                          <Building2 className="h-4 w-4" />
                          <span className="font-semibold text-white">Funding Requirements</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Placement Funding Sought</span>
                            <span className="text-xs font-bold text-[#00D1D1] block bg-[#141416] p-2.5 rounded border border-[#00D1D1]/30 font-mono">
                              {selectedStartupDetails?.funding_sought 
                                ? `$${Number(selectedStartupDetails.funding_sought).toLocaleString()}` 
                                : `$${Number(selectedOpp.expected_revenue || 0).toLocaleString()}`}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 mb-1">Previous Capital Raised</span>
                            <span className="text-xs font-bold text-white block bg-[#141416] p-2.5 rounded border border-[#222222]">
                              {selectedStartupDetails?.previous_funding 
                                ? `$${Number(selectedStartupDetails.previous_funding).toLocaleString()}` 
                                : "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-3">
                        <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                          <FileText className="h-4 w-4" />
                          <span className="font-semibold text-white">Primary Use of Funds</span>
                        </div>
                        <p className="leading-relaxed text-slate-400 bg-[#141416] p-4 rounded border border-[#222222] whitespace-pre-wrap font-sans">
                          {selectedStartupDetails?.primary_use_of_funds || "No primary use of funds specified."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PUBLIC Q&A */}
                  {activeDetailTab === 'qa' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-4">
                        <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                          <HelpCircle className="h-4 w-4" />
                          <span className="font-semibold text-white">Custom Registration Q&A Responses</span>
                        </div>
                        
                        {selectedStartupDetails?.custom_qa && Object.keys(selectedStartupDetails.custom_qa).length > 0 ? (
                          <div className="space-y-4 pt-2">
                            {Object.entries(selectedStartupDetails.custom_qa).map(([question, answer]: [string, any], idx) => (
                              <div key={idx} className="bg-[#141416] p-4 rounded border border-[#222222] space-y-2">
                                <span className="block text-xs font-semibold text-white font-sans">Q: {question}</span>
                                <span className="block text-xs text-slate-400 leading-relaxed pl-4 border-l border-[#00D1D1]/40 whitespace-pre-wrap font-sans">
                                  {answer || "No response provided"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 py-4 text-center">No custom Q&A credentials submitted during registration.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: DEAL ROOM DOCUMENTS (INVESTOR SCREEN) */}
                  {activeDetailTab === 'documents' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Check if private deal room is unlocked */}
                      {(() => {
                        const hasPrivateAccess = (selectedOpp.documents || []).some((d: any) => d.visibility === 'granted_only') || hasRequestedPrivateAccess[selectedOpp.id];
                        return (
                          <>
                            {hasPrivateAccess ? (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center space-x-3 text-emerald-400">
                                <Unlock className="h-5 w-5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold block">Deal Room Access Unlocked</span>
                                  <span className="text-[10px] text-slate-400">Confidential files are listed below. Click to inspect deck attachments.</span>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-[#18181B] border border-[#222222] rounded-lg p-6 space-y-4 text-center max-w-lg mx-auto">
                                <Lock className="h-8 w-8 text-amber-500 mx-auto" />
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-white">Private Placements Deal Room Locked</h4>
                                  <p className="text-slate-400 leading-relaxed text-[11px] px-4">
                                    Confidential pitch files, tax returns, audits, and capitalization tables require startup authorizations before viewing.
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRequestPrivateAccess(selectedOpp.id)}
                                  className="mx-auto flex items-center space-x-1.5 bg-[#00D1D1] hover:bg-[#00B3B3] text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                                >
                                  <Unlock className="h-3.5 w-3.5" />
                                  <span>Request Private Access</span>
                                </button>
                              </div>
                            )}

                            {/* Files List */}
                            <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-5 space-y-4">
                              <div className="flex items-center space-x-2 text-[#00D1D1] pb-2 border-b border-[#222222]">
                                <FileText className="h-4 w-4" />
                                <span className="font-semibold text-white">Opportunity Files & Decks</span>
                              </div>
                              
                              {selectedOpp.documents && selectedOpp.documents.length > 0 ? (
                                <div className="divide-y divide-[#222222]/50">
                                  {selectedOpp.documents.map((doc: any) => (
                                    <div key={doc.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#141416]/30 px-2 rounded transition-colors">
                                      <div className="flex items-center space-x-2.5 truncate pr-4">
                                        <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                        <span className="font-medium text-white truncate">{doc.file_type || "Deal Document"}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                          doc.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        }`}>
                                          {doc.visibility}
                                        </span>
                                      </div>
                                      <a 
                                        href={doc.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 bg-[#222222] hover:bg-[#333333] hover:text-white px-2.5 py-1 rounded text-[10px] font-semibold text-slate-300 transition-colors cursor-pointer"
                                      >
                                        <Download className="h-3 w-3" />
                                        <span>Download</span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 text-slate-500">
                                  No public documents uploaded for this deal room.
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                </div>

                {/* Footer and Request Access Action */}
                <div className="p-4 border-t border-[#222222] bg-[#0F0F12] flex items-center justify-between">
                  <div className="flex items-center text-[10px] text-slate-500 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1.5" />
                    <span>Axiomra Verified Placement proposal</span>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success("Access request submitted! The startup has been notified and your profile details shared.");
                      setDetailModalOpen(false);
                      setSelectedOpp(null);
                    }}
                    className="flex items-center bg-[#00D1D1] hover:bg-[#00B3B3] text-white text-xs font-bold px-5 py-2 rounded transition-colors cursor-pointer"
                  >
                    <span>Request Access to Private Deal Room</span>
                  </button>
                </div>
              </>
            ) : null}

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STARTUP / ADMIN DEAL ROOM MANAGEMENT MODAL                    */}
      {/* ============================================================== */}
      {dealRoomModalOpen && dealRoomOpp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#18181B]/50">
              <div>
                <h3 className="text-sm font-bold text-white">Deal Room File Manager</h3>
                <p className="text-[10px] text-[#00D1D1] font-medium uppercase mt-0.5">{dealRoomOpp.title}</p>
              </div>
              <button onClick={() => setDealRoomModalOpen(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-[#222222] cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT SIDE: Documents List & Upload Form */}
              <div className="space-y-6">
                
                {/* Upload Form */}
                <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-4 space-y-4">
                  <h4 className="text-xs font-semibold text-white pb-2 border-b border-[#222222] flex items-center space-x-1.5">
                    <Plus className="h-4 w-4 text-[#00D1D1]" />
                    <span>Upload Diligence Document</span>
                  </h4>
                  <form onSubmit={handleAddDocument} className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Document Title / File Name</label>
                      <input 
                        type="text" 
                        required 
                        value={newDoc.file_name} 
                        onChange={(e) => setNewDoc({...newDoc, file_name: e.target.value})} 
                        placeholder="e.g. Q3 Financial Statement"
                        className="w-full bg-[#141416] border border-[#222222] text-slate-300 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#00D1D1]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Document Link / URL</label>
                      <input 
                        type="url" 
                        required 
                        value={newDoc.file_url} 
                        onChange={(e) => setNewDoc({...newDoc, file_url: e.target.value})} 
                        placeholder="e.g. https://axiomra.com/files/pitch.pdf"
                        className="w-full bg-[#141416] border border-[#222222] text-slate-300 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#00D1D1] font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Visibility Level</label>
                      <select 
                        value={newDoc.visibility} 
                        onChange={(e) => setNewDoc({...newDoc, visibility: e.target.value})} 
                        className="w-full bg-[#141416] border border-[#222222] text-slate-300 text-xs rounded px-3 py-2 focus:outline-none focus:border-[#00D1D1]"
                      >
                        <option value="public">Public (All verified Investors)</option>
                        <option value="granted_only">Granted Only (Locked by default)</option>
                        <option value="admin_only">Admin Only (Confidential operators only)</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isAddingDoc}
                      className="w-full flex items-center justify-center bg-[#00D1D1] hover:bg-[#00B3B3] text-white text-xs font-bold py-2 rounded transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isAddingDoc ? "Uploading..." : "Add File to Deal Room"}
                    </button>
                  </form>
                </div>

                {/* Uploaded Documents List */}
                <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-white pb-2 border-b border-[#222222] flex items-center space-x-1.5">
                    <FileText className="h-4 w-4 text-[#00D1D1]" />
                    <span>Uploaded Placement Files ({dealRoomDocs.length})</span>
                  </h4>
                  {dealRoomDocs.length > 0 ? (
                    <div className="divide-y divide-[#222222]/50 max-h-48 overflow-y-auto pr-1">
                      {dealRoomDocs.map((doc) => (
                        <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 truncate pr-3">
                            <FileText className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                            <span className="font-semibold text-slate-200 truncate">{doc.file_type}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              doc.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              doc.visibility === 'admin_only' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                              'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {doc.visibility}
                            </span>
                          </div>
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#00D1D1] hover:underline flex items-center"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No diligence files uploaded in this deal room yet.</p>
                  )}
                </div>

              </div>

              {/* RIGHT SIDE: Grant Permissions to Investors */}
              <div className="space-y-6">
                
                <div className="bg-[#0F0F12] border border-[#222222] rounded-lg p-4 space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white pb-2 border-b border-[#222222] flex items-center space-x-1.5">
                      <Unlock className="h-4 w-4 text-[#00D1D1]" />
                      <span>Grant Private Access Permissions</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-2 p-2.5 bg-[#141416] border border-[#222222] rounded">
                      Unlock locked documents (marked "Granted Only") for registered institutional investors. Select an active investor below.
                    </p>
                    
                    <form onSubmit={handleGrantPermission} className="space-y-3 mt-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Select Verified Investor</label>
                        <select 
                          value={selectedInvestorId} 
                          onChange={(e) => setSelectedInvestorId(e.target.value)}
                          className="w-full bg-[#141416] border border-[#222222] text-slate-300 text-xs rounded px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]"
                        >
                          <option value="">Select an investor...</option>
                          {investorUsers.map((inv) => (
                            <option key={inv.id} value={inv.id}>{inv.full_name} ({inv.phone || "No phone"})</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        disabled={isGrantingPermission}
                        className="w-full flex items-center justify-center bg-[#00D1D1] hover:bg-[#00B3B3] text-white text-xs font-bold py-2 rounded transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isGrantingPermission ? "Granting..." : "Grant Deal Room Access"}
                      </button>
                    </form>
                  </div>

                  <div className="pt-6 border-t border-[#222222] flex items-center text-[10px] text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-[#00D1D1] mr-1.5" />
                    <span>Access rules are strictly enforced by the backend API.</span>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-4 border-t border-[#222222] bg-[#0F0F12] flex justify-end">
              <button 
                onClick={() => setDealRoomModalOpen(false)} 
                className="bg-[#222222] hover:bg-[#333333] hover:text-white px-5 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD/EDIT PLACEMENT MODAL (ADMIN & STARTUPS)                   */}
      {/* ============================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <h3 className="text-sm font-bold text-white">{modalMode === 'create' ? 'Add Placement Opportunity' : 'Edit Placement Opportunity'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-[#222222] cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Proposal Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Placement Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={4} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Funding Sought ($)</label>
                  <input type="number" required min="0" value={form.expected_revenue} onChange={(e) => setForm({...form, expected_revenue: Number(e.target.value)})} className="w-full bg-[#0F0F12] border border-[#222222] text-[#00D1D1] text-sm font-semibold rounded px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stage</label>
                  <select 
                    value={form.stage} 
                    onChange={(e) => setForm({...form, stage: e.target.value})} 
                    className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]"
                  >
                    <option value="">Select stage</option>
                    {STAGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#00D1D1]">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#222222]">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-xs font-bold bg-[#00D1D1] hover:bg-[#00B3B3] text-white rounded transition-colors disabled:opacity-50 cursor-pointer">
                  {isSubmitting ? "Saving..." : (modalMode === 'create' ? "Publish Placement" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
