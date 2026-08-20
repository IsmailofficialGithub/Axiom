"use client"

import { useState } from "react";
import { Search, ChevronDown, MoreHorizontal, ChevronUp } from "lucide-react";

export default function UsersPage() {
  const [isPendingOpen, setIsPendingOpen] = useState(true);

  const activeMembers = [
    { id: 1, name: "Muhammad Aryan Afridi", display: "aryan", email: "aryan@trackese.com", role: "Member", auth: "Email", date: "Aug 20, 2026", initial: "A" },
    { id: 2, name: "Hassan Raza Khan Tareen", display: "hassan", email: "hassan@trackese.com", role: "Member", auth: "Email", date: "Aug 20, 2026", initial: "H", img: true },
    { id: 3, name: "Talha", display: "talha", email: "talha@trackese.com", role: "Member", auth: "Email", date: "Aug 20, 2026", initial: "T", img: true },
    { id: 4, name: "Ismail Abbasi", display: "ismail", email: "ismail@trackese.com", role: "Member", auth: "Email", date: "Aug 19, 2026", initial: "I" },
    { id: 5, name: "Muhammad Furqan", display: "furqan", email: "furqan@trackese.com", role: "Admin", auth: "Email", date: "Aug 19, 2026", initial: "F" },
    { id: 6, name: "Trackese Admin", display: "no-reply", email: "no-reply@trackese.com", role: "Admin", auth: "Email", date: "Aug 19, 2026", initial: "T", img: true },
  ];

  const pendingInvites = [
    { id: 1, email: "umar@trackese.com", role: "Member", initial: "U" },
    { id: 2, email: "tajdar@trackese.com", role: "Member", initial: "T" },
    { id: 3, email: "abdullah@trackese.com", role: "Member", initial: "A" },
    { id: 4, email: "rafia@trackese.com", role: "Admin", initial: "R" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-white">Members</h1>
          <span className="flex items-center justify-center bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold h-6 w-6 rounded-md">6</span>
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
      <div className="mb-12 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-[#222222]">
              <th className="pb-3 px-4 font-medium flex items-center cursor-pointer hover:text-slate-300">
                Full name <ChevronDown className="ml-1 h-3 w-3" />
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Display name <ChevronDown className="ml-1 h-3 w-3" /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Email <ChevronDown className="ml-1 h-3 w-3" /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Role <ChevronDown className="ml-1 h-3 w-3" /></div>
              </th>
              <th className="pb-3 px-4 font-medium cursor-pointer hover:text-slate-300">
                <div className="flex items-center">Authentication <ChevronDown className="ml-1 h-3 w-3" /></div>
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
                  {member.img ? (
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt="avatar" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#2A2A2D] flex items-center justify-center text-xs font-semibold text-slate-400">
                      {member.initial}
                    </div>
                  )}
                  <span>{member.name}</span>
                </td>
                <td className="py-4 px-4 text-slate-300">{member.display}</td>
                <td className="py-4 px-4 text-slate-300">{member.email}</td>
                <td className="py-4 px-4 text-slate-300">
                  <div className="flex items-center cursor-pointer hover:text-white">
                    {member.role} <ChevronDown className="ml-1 h-3 w-3 text-slate-500" />
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-400">{member.auth}</td>
                <td className="py-4 px-4 text-slate-400">{member.date}</td>
                <td className="py-4 px-4 text-slate-500 text-right">
                  <button className="hover:text-slate-300"><MoreHorizontal className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Invites */}
      <div>
        <button 
          onClick={() => setIsPendingOpen(!isPendingOpen)}
          className="flex items-center justify-between w-full mb-4 group focus:outline-none"
        >
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-white">Pending invites</h2>
            <span className="flex items-center justify-center bg-[#1E90FF]/20 text-[#1E90FF] text-xs font-bold h-6 w-6 rounded-md">11</span>
          </div>
          {isPendingOpen ? <ChevronUp className="h-5 w-5 text-slate-500 group-hover:text-white" /> : <ChevronDown className="h-5 w-5 text-slate-500 group-hover:text-white" />}
        </button>
        
        {isPendingOpen && (
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#141416]/50 transition-colors">
                <div className="flex items-center space-x-4 w-1/3">
                  <div className="h-8 w-8 rounded bg-[#2A2A2D] flex items-center justify-center text-xs font-semibold text-slate-400 flex-shrink-0">
                    {invite.initial}
                  </div>
                  <span className="text-sm text-slate-300 truncate">{invite.email}</span>
                </div>
                
                <div className="flex items-center justify-end space-x-8 w-1/3">
                  <span className="bg-[#F5A623]/10 text-[#F5A623] text-xs font-medium px-2 py-0.5 rounded">Pending</span>
                  <div className="flex items-center text-sm text-slate-300 cursor-pointer hover:text-white">
                    {invite.role} <ChevronDown className="ml-1 h-3 w-3 text-slate-500" />
                  </div>
                  <button className="text-slate-500 hover:text-slate-300"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
