"use client"

import { useState, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal, ChevronUp, X, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingOpen, setIsPendingOpen] = useState(true);

  // Modal States
  const [editModal, setEditModal] = useState<{isOpen: boolean, user: any | null}>({ isOpen: false, user: null });
  const [passwordModal, setPasswordModal] = useState<{isOpen: boolean, userId: string | null}>({ isOpen: false, userId: null });
  
  // Form States
  const [editForm, setEditForm] = useState({ role: "", status: "" });
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const activeMembers = users.filter(u => u.status !== 'pending');
  const pendingInvites = users.filter(u => u.status === 'pending');

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
    try {
      await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
      setOpenDropdown(null);
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleOpenEdit = (u: any) => {
    setEditForm({ role: u.role, status: u.status });
    setEditModal({ isOpen: true, user: u });
    setOpenDropdown(null);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.user) return;
    try {
      setIsSubmitting(true);
      await fetchApi(`/admin/users/${editModal.user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });
      await loadUsers();
      setEditModal({ isOpen: false, user: null });
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModal.userId) return;
    try {
      setIsSubmitting(true);
      await fetchApi(`/admin/users/${passwordModal.userId}/password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
      });
      alert("Password updated successfully");
      setPasswordModal({ isOpen: false, userId: null });
      setNewPassword("");
    } catch (err) {
      alert("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickApprove = async (id: string, role: string) => {
    try {
      await fetchApi(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active', role }), // Keep current role, just activate
      });
      await loadUsers();
    } catch (err) {
      alert("Failed to approve user");
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
          <h1 className="text-2xl font-semibold text-white">Members</h1>
          <span className="flex items-center justify-center bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold h-6 w-6 rounded-md">
            {activeMembers.length}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-[#141416] border border-[#222222] text-sm text-slate-300 rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#333333] w-48"
            />
          </div>
          <button className="flex items-center space-x-2 bg-[#141416] border border-[#222222] hover:bg-[#222222] text-sm text-slate-300 rounded-md px-3 py-1.5 transition-colors">
            <span>Filters</span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          <button className="bg-[#1E90FF] hover:bg-[#1C86EE] text-white text-sm font-medium rounded-md px-4 py-1.5 transition-colors">
            Add member
          </button>
        </div>
      </div>

      {/* Active Members Table */}
      <div className="mb-12 overflow-x-visible">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-[#222222]">
              <th className="pb-3 px-4 font-medium flex items-center cursor-pointer hover:text-slate-300">
                Full name <ChevronDown className="ml-1 h-3 w-3" />
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Email <ChevronDown className="ml-1 h-3 w-3" /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Role <ChevronDown className="ml-1 h-3 w-3" /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Status <ChevronDown className="ml-1 h-3 w-3" /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Joining date <ChevronDown className="ml-1 h-3 w-3" /></div>
              </th>
              <th className="pb-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {activeMembers.map((member) => (
              <tr key={member.id} className="border-b border-[#222222] hover:bg-[#141416]/50 transition-colors">
                <td className="py-4 px-4 text-slate-300 flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-[#2A2A2D] flex items-center justify-center text-xs font-semibold text-[#1E90FF]">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span>{member.full_name}</span>
                </td>
                <td className="py-4 px-4 text-slate-300">{member.email}</td>
                <td className="py-4 px-4 text-slate-300 capitalize">{member.role}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    member.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-400">{formatDate(member.created_at)}</td>
                <td className="py-4 px-4 text-slate-500 text-right relative">
                  <button onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)} className="hover:text-slate-300 p-1 rounded hover:bg-[#222222]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openDropdown === member.id && (
                    <div className="absolute right-8 top-10 w-48 bg-[#141416] border border-[#222222] rounded-md shadow-lg z-50 overflow-hidden">
                      <button onClick={() => handleOpenEdit(member)} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#222222] hover:text-white">Edit User</button>
                      <button onClick={() => { setPasswordModal({ isOpen: true, userId: member.id }); setOpenDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#222222] hover:text-white">Change Password</button>
                      <div className="border-t border-[#222222]"></div>
                      <button onClick={() => handleDelete(member.id)} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#222222] hover:text-red-400">Delete User</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeMembers.length === 0 && <div className="text-center py-8 text-slate-500">No active members found.</div>}
      </div>

      {/* Pending Invites */}
      <div>
        <button 
          onClick={() => setIsPendingOpen(!isPendingOpen)}
          className="flex items-center justify-between w-full mb-4 group focus:outline-none"
        >
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-white">Pending invites</h2>
            <span className="flex items-center justify-center bg-[#F5A623]/10 text-[#F5A623] text-xs font-bold h-6 w-6 rounded-md">{pendingInvites.length}</span>
          </div>
          {isPendingOpen ? <ChevronUp className="h-5 w-5 text-slate-500 group-hover:text-white" /> : <ChevronDown className="h-5 w-5 text-slate-500 group-hover:text-white" />}
        </button>
        
        {isPendingOpen && (
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#141416]/50 transition-colors border border-transparent hover:border-[#222222]">
                <div className="flex items-center space-x-4 w-1/3">
                  <div className="h-8 w-8 rounded bg-[#2A2A2D] flex items-center justify-center text-xs font-semibold text-slate-400 flex-shrink-0">
                    {invite.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-300 truncate">{invite.full_name}</span>
                    <span className="text-xs text-slate-500 truncate">{invite.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-6 w-2/3">
                  <span className="bg-[#F5A623]/10 text-[#F5A623] text-xs font-medium px-2 py-0.5 rounded">Pending</span>
                  <div className="text-sm text-slate-300 capitalize min-w-[80px]">
                    {invite.role}
                  </div>
                  <button 
                    onClick={() => quickApprove(invite.id, invite.role)}
                    className="flex items-center space-x-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    <span>Approve</span>
                  </button>
                  <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === invite.id ? null : invite.id)} className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-[#222222]">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openDropdown === invite.id && (
                      <div className="absolute right-0 top-8 w-48 bg-[#141416] border border-[#222222] rounded-md shadow-lg z-50 overflow-hidden">
                        <button onClick={() => handleOpenEdit(invite)} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#222222] hover:text-white">Edit Request</button>
                        <div className="border-t border-[#222222]"></div>
                        <button onClick={() => handleDelete(invite.id)} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#222222] hover:text-red-400">Reject & Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {pendingInvites.length === 0 && <div className="text-sm text-slate-500 py-2">No pending invites.</div>}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <button onClick={() => setEditModal({isOpen: false, user: null})} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submitEdit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input type="text" disabled value={editModal.user.email} className="w-full bg-[#0F0F12] border border-[#222222] text-slate-500 text-sm rounded-md px-3 py-2 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                <select 
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]"
                >
                  <option value="member">Member</option>
                  <option value="startup">Startup</option>
                  <option value="investor">Investor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-[#222222]">
                <button type="button" onClick={() => setEditModal({isOpen: false, user: null})} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-[#1E90FF] text-white rounded-md hover:bg-[#1C86EE] transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <h3 className="text-lg font-semibold text-white">Change Password</h3>
              <button onClick={() => setPasswordModal({isOpen: false, userId: null})} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submitPassword} className="p-4 space-y-4">
              <p className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-md">Warning: You are forcing a password change. The user will be instantly logged out of active sessions.</p>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" 
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-[#222222]">
                <button type="button" onClick={() => setPasswordModal({isOpen: false, userId: null})} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50">
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
