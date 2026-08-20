"use client"

import { useState, useEffect } from "react";
import { User, Lock, Mail, Phone, Shield } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, login } = useAuth(); // Assuming login context handles user state update
  
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProfileSubmitting(true);
      const res = await fetchApi('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      });
      alert("Profile updated successfully!");
      // Ideally update auth context here, but reloading works for now
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (passwordForm.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsPasswordSubmitting(true);
      await fetchApi('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ password: passwordForm.password }),
      });
      alert("Password updated successfully!");
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err: any) {
      alert(err.message || "Failed to update password");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-[#141416] border border-[#222222] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#222222] flex items-center space-x-3">
            <User className="h-5 w-5 text-[#1E90FF]" />
            <h2 className="text-lg font-medium text-white">Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[#0F0F12]/50 border border-[#222222] text-slate-500 text-sm rounded-md px-3 py-2 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#1E90FF]" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                <div className="flex items-center h-[38px] px-3 bg-[#0F0F12]/50 border border-[#222222] text-slate-500 text-sm rounded-md capitalize">
                  {user?.role}
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isProfileSubmitting}
                className="px-4 py-2 text-sm font-medium bg-[#1E90FF] text-white rounded-md hover:bg-[#1C86EE] transition-colors disabled:opacity-50"
              >
                {isProfileSubmitting ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-[#141416] border border-[#222222] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#222222] flex items-center space-x-3">
            <Lock className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-medium text-white">Security & Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isPasswordSubmitting}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {isPasswordSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
