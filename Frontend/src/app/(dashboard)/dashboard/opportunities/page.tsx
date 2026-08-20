"use client"

import { useState, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal, X, Plus } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeOpp, setActiveOpp] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", expected_revenue: 0, status: "draft", stage: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi('/admin/opportunities');
      setOpportunities(res.data);
    } catch (err) {
      console.error("Failed to load opportunities", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter(o => 
    o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      await fetchApi(`/admin/opportunities/${id}`, { method: 'DELETE' });
      setOpportunities(opportunities.filter(o => o.id !== id));
      setOpenDropdown(null);
    } catch (err) {
      alert("Failed to delete opportunity");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await fetchApi('/admin/opportunities', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      } else {
        await fetchApi(`/admin/opportunities/${activeOpp.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      }
      await loadOpportunities();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E90FF]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-white">Opportunities (Deal Flow)</h1>
          <span className="flex items-center justify-center bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold h-6 w-6 rounded-md">
            {opportunities.length}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search deals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#141416] border border-[#222222] text-sm text-slate-300 rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#333333] w-48 transition-all"
            />
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center bg-[#1E90FF] hover:bg-[#1C86EE] text-white text-sm font-medium rounded-md px-4 py-1.5 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Opportunity
          </button>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="mb-12 overflow-x-visible">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-[#222222]">
              <th className="pb-3 px-4 font-medium">Title</th>
              <th className="pb-3 px-4 font-medium">Company</th>
              <th className="pb-3 px-4 font-medium">Expected Revenue</th>
              <th className="pb-3 px-4 font-medium">Stage</th>
              <th className="pb-3 px-4 font-medium">Status</th>
              <th className="pb-3 px-4 font-medium">Created At</th>
              <th className="pb-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOpportunities.map((opp) => (
              <tr key={opp.id} className="border-b border-[#222222] hover:bg-[#141416]/50 transition-colors">
                <td className="py-4 px-4 text-slate-300 font-medium">{opp.title}</td>
                <td className="py-4 px-4 text-slate-400">{opp.companies?.company_name || "—"}</td>
                <td className="py-4 px-4 text-slate-400">${Number(opp.expected_revenue || 0).toLocaleString()}</td>
                <td className="py-4 px-4 text-slate-400">{opp.stage || "—"}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    opp.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 
                    opp.status === 'archived' ? 'bg-slate-500/10 text-slate-400' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {opp.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-400">{formatDate(opp.created_at)}</td>
                <td className="py-4 px-4 text-slate-500 text-right relative">
                  <button onClick={() => setOpenDropdown(openDropdown === opp.id ? null : opp.id)} className="hover:text-slate-300 p-1 rounded hover:bg-[#222222]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openDropdown === opp.id && (
                    <div className="absolute right-8 top-10 w-48 bg-[#141416] border border-[#222222] rounded-md shadow-lg z-50 overflow-hidden">
                      <button onClick={() => handleOpenEdit(opp)} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#222222] hover:text-white">Edit Opportunity</button>
                      <div className="border-t border-[#222222]"></div>
                      <button onClick={() => handleDelete(opp.id)} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#222222] hover:text-red-400">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOpportunities.length === 0 && <div className="text-center py-8 text-slate-500">No opportunities found.</div>}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <h3 className="text-lg font-semibold text-white">{modalMode === 'create' ? 'Add Opportunity' : 'Edit Opportunity'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Expected Revenue ($)</label>
                <input type="number" required min="0" value={form.expected_revenue} onChange={(e) => setForm({...form, expected_revenue: Number(e.target.value)})} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stage</label>
                <input type="text" value={form.stage} onChange={(e) => setForm({...form, stage: e.target.value})} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" placeholder="e.g. Due Diligence" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#222222]">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-[#1E90FF] text-white rounded-md hover:bg-[#1C86EE] transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : (modalMode === 'create' ? "Create" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
