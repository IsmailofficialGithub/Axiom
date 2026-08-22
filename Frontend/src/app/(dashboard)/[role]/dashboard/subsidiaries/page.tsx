"use client"

import { useState, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal, X, Plus } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SubsidiariesPage() {
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeSub, setActiveSub] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const loadSubsidiaries = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi('/admin/subsidiaries');
      setSubsidiaries(res.data);
    } catch (err) {
      console.error("Failed to load subsidiaries", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubsidiaries();
  }, []);

  const filteredSubsidiaries = subsidiaries.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setModalMode("create");
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (sub: any) => {
    setModalMode("edit");
    setActiveSub(sub);
    setForm({ name: sub.name, description: sub.description || "" });
    setModalOpen(true);
    setOpenDropdown(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subsidiary?")) return;
    try {
      await fetchApi(`/admin/subsidiaries/${id}`, { method: 'DELETE' });
      setSubsidiaries(subsidiaries.filter(s => s.id !== id));
      setOpenDropdown(null);
    } catch (err) {
      alert("Failed to delete subsidiary");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === "create") {
        await fetchApi('/admin/subsidiaries', {
          method: 'POST',
          body: JSON.stringify({ ...form, country: 'Global' }), // country required by schema
        });
      } else {
        await fetchApi(`/admin/subsidiaries/${activeSub.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      }
      await loadSubsidiaries();
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
          <h1 className="text-2xl font-semibold text-white">Subsidiaries</h1>
          <span className="flex items-center justify-center bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold h-6 w-6 rounded-md">
            {subsidiaries.length}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search subsidiaries..." 
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
            Add Subsidiary
          </button>
        </div>
      </div>

      {/* Subsidiaries Table */}
      <div className="mb-12 overflow-x-visible">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-[#222222]">
              <th className="pb-3 px-4 font-medium">Name</th>
              <th className="pb-3 px-4 font-medium">Description</th>
              <th className="pb-3 px-4 font-medium">Created At</th>
              <th className="pb-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredSubsidiaries.map((sub) => (
              <tr key={sub.id} className="border-b border-[#222222] hover:bg-[#141416]/50 transition-colors">
                <td className="py-4 px-4 text-slate-300 font-medium">{sub.name}</td>
                <td className="py-4 px-4 text-slate-400 max-w-[300px] truncate">{sub.description || "—"}</td>
                <td className="py-4 px-4 text-slate-400">{formatDate(sub.created_at)}</td>
                <td className="py-4 px-4 text-slate-500 text-right relative">
                  <button onClick={() => setOpenDropdown(openDropdown === sub.id ? null : sub.id)} className="hover:text-slate-300 p-1 rounded hover:bg-[#222222]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openDropdown === sub.id && (
                    <div className="absolute right-8 top-10 w-48 bg-[#141416] border border-[#222222] rounded-md shadow-lg z-50 overflow-hidden">
                      <button onClick={() => handleOpenEdit(sub)} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#222222] hover:text-white">Edit Subsidiary</button>
                      <div className="border-t border-[#222222]"></div>
                      <button onClick={() => handleDelete(sub.id)} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#222222] hover:text-red-400">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubsidiaries.length === 0 && <div className="text-center py-8 text-slate-500">No subsidiaries found.</div>}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <h3 className="text-lg font-semibold text-white">{modalMode === 'create' ? 'Add Subsidiary' : 'Edit Subsidiary'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                <input 
                  type="text" 
                  required 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})} 
                  rows={3}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" 
                />
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
