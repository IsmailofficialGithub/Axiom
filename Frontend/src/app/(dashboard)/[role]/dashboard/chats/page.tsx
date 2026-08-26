"use client"

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { 
  MessageSquare, Plus, Send, Info, X, User, 
  Building2, Calendar, DollarSign, Activity, FileText,
  Shield, Ban, Pause, Play, Lock, ShieldAlert, Trash2
} from "lucide-react";

export default function ChatsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // Loading states
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [roomForm, setRoomForm] = useState({
    name: "",
    investor_id: "",
    startup_id: ""
  });

  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const handleUpdateSetting = async (key: string, value: any) => {
    if (!selectedRoom) return;
    try {
      setIsUpdatingSettings(true);
      const updatedSettings = {
        [key]: value
      };
      
      const res = await fetchApi(`/chats/${selectedRoom.id}/settings`, {
        method: 'PATCH',
        body: JSON.stringify(updatedSettings)
      });
      
      // Update selected room state
      setSelectedRoom(res.data);
      
      // Update rooms list state so it syncs up
      setRooms(prevRooms => prevRooms.map(r => r.id === selectedRoom.id ? { ...r, ...res.data } : r));
    } catch (err: any) {
      alert(err.message || "Failed to update chat settings");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const isChatPaused = selectedRoom?.status === 'paused';
  const isAdminOnly = selectedRoom?.admin_only;
  const isStartupBlocked = selectedRoom?.is_startup_blocked;
  const isInvestorBlocked = selectedRoom?.is_investor_blocked;

  const isCurrentUserBlocked = () => {
    if (!selectedRoom || !user) return false;
    
    // Admins are never blocked by moderation settings
    if (user.role === 'admin') return false;
    
    if (isChatPaused) return true;
    if (isAdminOnly) return true;
    
    if (user.role === 'startup' && isStartupBlocked) return true;
    if (user.role === 'investor' && isInvestorBlocked) return true;
    
    return false;
  };

  const getBlockedReason = () => {
    if (!selectedRoom || !user) return "";
    if (user.role === 'admin') return "";

    if (isChatPaused) {
      return "This conversation is temporarily paused by the admin.";
    }
    if (isAdminOnly) {
      return "This chat is currently in admin-only mode.";
    }
    if (user.role === 'startup' && isStartupBlocked) {
      return "You have been blocked from sending messages in this chat.";
    }
    if (user.role === 'investor' && isInvestorBlocked) {
      return "You have been blocked from sending messages in this chat.";
    }
    return "";
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Rooms
  const loadRooms = async () => {
    try {
      setIsRoomsLoading(true);
      const res = await fetchApi('/chats');
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to load chat rooms", err);
    } finally {
      setIsRoomsLoading(false);
    }
  };

  // Load Messages for a specific room
  const loadMessages = async (roomId: string, silent = false) => {
    if (!silent) setIsMessagesLoading(true);
    try {
      const res = await fetchApi(`/chats/${roomId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      if (!silent) setIsMessagesLoading(false);
    }
  };

  // Fetch Users for Admin Modal
  const loadUsersForAdmin = async () => {
    try {
      const res = await fetchApi('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  useEffect(() => {
    loadRooms();
    if (user?.role === 'admin') {
      loadUsersForAdmin();
    }
  }, [user]);

  // Polling for new messages in selected room
  useEffect(() => {
    if (!selectedRoom) return;

    loadMessages(selectedRoom.id);

    const interval = setInterval(() => {
      loadMessages(selectedRoom.id, true);
    }, 1500); // 1.5s poll rate

    return () => clearInterval(interval);
  }, [selectedRoom]);

  // Handle Room Selection
  const handleSelectRoom = async (room: any) => {
    try {
      setIsMessagesLoading(true);
      const res = await fetchApi(`/chats/${room.id}`);
      setSelectedRoom(res.data);
    } catch (err) {
      console.error("Failed to load room details", err);
      alert("Failed to load room details");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      room_id: selectedRoom.id,
      sender_id: user!.id,
      message: messageText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetchApi(`/chats/${selectedRoom.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: messageText }),
      });
      loadMessages(selectedRoom.id, true);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  // Create Chat Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await fetchApi('/chats', {
        method: 'POST',
        body: JSON.stringify(roomForm)
      });
      setIsModalOpen(false);
      setRoomForm({ name: "", investor_id: "", startup_id: "" });
      loadRooms();
    } catch (err: any) {
      alert(err.message || "Failed to create chat room");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Room (Admin only)
  const handleDeleteRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat room? This will permanently erase all messages.")) return;

    try {
      await fetchApi(`/chats/${roomId}`, { method: 'DELETE' });
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
        setMessages([]);
      }
      loadRooms();
    } catch (err) {
      alert("Failed to delete chat room");
    }
  };
  // Delete Message (Admin only)
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await fetchApi(`/chats/messages/${messageId}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      alert("Failed to delete message");
    }
  };

  const getSenderName = (senderId: string) => {
    if (senderId === user?.id) return "You";
    if (senderId === selectedRoom?.admin_id) return selectedRoom?.admin?.full_name || "Admin";
    if (senderId === selectedRoom?.investor_id) return selectedRoom?.investor?.full_name || "Investor";
    if (senderId === selectedRoom?.startup_id) return selectedRoom?.startup?.full_name || "Startup";
    return "User";
  };

  const getSenderInitial = (senderId: string) => {
    const name = getSenderName(senderId);
    return name.charAt(0).toUpperCase();
  };

  const getStartupCompany = () => {
    return selectedRoom?.startup?.company;
  };

  const getStartupFinances = () => {
    const company = getStartupCompany();
    return company?.startups?.[0];
  };

  const formatCurrency = (val: any) => {
    if (!val) return "Not specified";
    return `$${Number(val).toLocaleString()}`;
  };

  // Filtering users for creation dropdowns
  const investors = users.filter(u => u.role === 'investor' && u.status === 'active');
  const startups = users.filter(u => u.role === 'startup' && u.status === 'active');

  return (
    <div className="flex h-[calc(100vh-65px)] md:h-screen w-full bg-[#0F0F12] text-slate-300 overflow-hidden font-sans">
      
      {/* 1. Left Sidebar: Rooms List */}
      <div className="w-80 border-r border-[#222222] bg-[#141416] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-[#1E90FF]" />
            <h2 className="text-base font-semibold text-white">Common Area</h2>
          </div>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 bg-[#1E90FF] hover:bg-[#1C86EE] text-white rounded-md transition-colors cursor-pointer"
              title="Create Chat Room"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isRoomsLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E90FF]"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No chat rooms found.
            </div>
          ) : (
            rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-[#2A2A2D] border-l-4 border-[#1E90FF] text-white" 
                      : "hover:bg-[#222222] hover:text-white"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-semibold truncate">{room.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {room.startup?.company?.company_name || room.startup?.full_name || "Startup"} &amp; {room.investor?.full_name || "Investor"}
                    </p>
                  </div>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => handleDeleteRoom(room.id, e)}
                      className="p-1 text-slate-500 hover:text-red-500 rounded transition-colors"
                      title="Delete Room"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Middle Panel: Messages pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F12]">
        {selectedRoom ? (
          <>
            {/* Active Room Title */}
            <div className="p-4 border-b border-[#222222] bg-[#141416] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedRoom.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Participants: {selectedRoom.admin?.full_name || "Admin"} (Admin) • {selectedRoom.investor?.full_name || "Investor"} (Investor) • {selectedRoom.startup?.company?.company_name || selectedRoom.startup?.full_name || "Startup"} (Startup)
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isMessagesLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E90FF]"></div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === user?.id;
                  const senderRole = msg.sender_id === selectedRoom.admin_id ? 'admin' : (msg.sender_id === selectedRoom.investor_id ? 'investor' : 'startup');
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex items-start space-x-3 max-w-xl group ${isOwnMessage ? "ml-auto flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isOwnMessage 
                          ? "bg-[#1E90FF]/20 text-[#1E90FF]" 
                          : senderRole === 'admin' 
                            ? "bg-amber-500/20 text-amber-500" 
                            : senderRole === 'investor'
                              ? "bg-purple-500/20 text-purple-500"
                              : "bg-emerald-500/20 text-emerald-500"
                      }`}>
                        {getSenderInitial(msg.sender_id)}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={`text-[10px] text-slate-500 mb-0.5 ${isOwnMessage ? "text-right" : ""}`}>
                          {getSenderName(msg.sender_id)}
                        </span>
                        <div className={`p-3 rounded-xl text-sm leading-relaxed break-words ${
                          isOwnMessage 
                            ? "bg-[#1E90FF] text-white rounded-tr-none" 
                            : "bg-[#141416] border border-[#222222] text-slate-300 rounded-tl-none"
                        }`}>
                          {msg.message}
                        </div>
                        <span className={`text-[9px] text-slate-600 mt-1 ${isOwnMessage ? "text-right" : ""}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer self-center flex-shrink-0"
                          title="Delete message"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {isCurrentUserBlocked() && (
              <div className="mx-4 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-xs text-red-400">
                <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500 animate-pulse" />
                <span>{getBlockedReason()}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#141416] border-t border-[#222222] flex items-center space-x-2 flex-shrink-0">
              <input 
                type="text" 
                placeholder={isCurrentUserBlocked() ? getBlockedReason() : "Type your message here..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isCurrentUserBlocked()}
                className="flex-1 bg-[#0F0F12] border border-[#222222] rounded-md px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#1E90FF] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || isCurrentUserBlocked()}
                className="p-2.5 bg-[#1E90FF] hover:bg-[#1C86EE] text-white rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-center text-slate-500">
            <MessageSquare className="h-16 w-16 text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-400">No Chat Selected</h3>
            <p className="text-sm mt-1 max-w-sm">
              Select a room from the sidebar to view startup details and begin messaging in real-time.
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Panel: Startup Details Pane (Visible only for admin & investor when room selected) */}
      {selectedRoom && (user?.role === 'admin' || user?.role === 'investor') && (
        <div className="w-80 border-l border-[#222222] bg-[#141416] flex flex-col flex-shrink-0 overflow-y-auto p-4 space-y-6">
          <div className="flex items-center space-x-2 border-b border-[#222222] pb-3">
            <Building2 className="h-5 w-5 text-[#00D1D1]" />
            <h3 className="text-sm font-semibold text-white">Startup Details</h3>
          </div>

          {getStartupCompany() ? (
            <div className="space-y-5 text-sm">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Company Name</span>
                <span className="text-white font-medium text-base mt-0.5 block">{getStartupCompany()?.company_name}</span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Industry / Sector</span>
                <span className="text-slate-300 font-medium block capitalize mt-0.5">{getStartupCompany()?.industry || "Not specified"}</span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Funding Stage</span>
                <span className="text-[#00D1D1] bg-[#00D1D1]/10 px-2 py-0.5 rounded text-xs mt-1 inline-block capitalize font-medium border border-[#00D1D1]/20">
                  {getStartupCompany()?.stage || "Not specified"}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <DollarSign className="h-3 w-3 mr-0.5" /> Expected Funding sought
                </span>
                <span className="text-white font-mono mt-0.5 block font-semibold">
                  {formatCurrency(getStartupFinances()?.funding_sought)}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <Activity className="h-3 w-3 mr-0.5" /> Current ARR
                </span>
                <span className="text-white font-mono mt-0.5 block">
                  {formatCurrency(getStartupFinances()?.current_arr)}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <FileText className="h-3 w-3 mr-0.5" /> Description
                </span>
                <p className="text-slate-400 mt-1 leading-relaxed bg-[#0F0F12] p-3 rounded border border-[#222222] text-xs max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {getStartupCompany()?.description || "No description provided."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500 bg-[#0F0F12] border border-[#222222] rounded-lg">
              Startup details not onboarded yet.
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="space-y-4 border-t border-[#222222] pt-6">
              <div className="flex items-center space-x-2 border-b border-[#222222] pb-3">
                <Shield className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-white">Moderation Controls</h3>
              </div>
              
              <div className="space-y-3.5">
                {/* 1. Pause Conversation */}
                <div className="bg-[#1C1C1E] border border-[#2D2D30] rounded-xl p-3.5 transition-all hover:border-[#1E90FF]/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Pause className={`h-4 w-4 ${isChatPaused ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold text-white">Pause Room</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isChatPaused ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {isChatPaused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3">Stops message flow for both startup and investor.</p>
                  <button
                    type="button"
                    disabled={isUpdatingSettings}
                    onClick={() => handleUpdateSetting('status', isChatPaused ? 'active' : 'paused')}
                    className={`w-full py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isChatPaused 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {isChatPaused ? 'Resume Room' : 'Pause Room'}
                  </button>
                </div>

                {/* 2. Admin Only Mode */}
                <div className="bg-[#1C1C1E] border border-[#2D2D30] rounded-xl p-3.5 transition-all hover:border-[#1E90FF]/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Lock className={`h-4 w-4 ${isAdminOnly ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold text-white">Admin-Only</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isAdminOnly ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {isAdminOnly ? 'Enabled' : 'Off'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3">Only administrators can send messages.</p>
                  <button
                    type="button"
                    disabled={isUpdatingSettings}
                    onClick={() => handleUpdateSetting('admin_only', !isAdminOnly)}
                    className={`w-full py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isAdminOnly 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-[#1E90FF] hover:bg-[#1C86EE] text-white'
                    }`}
                  >
                    {isAdminOnly ? 'Disable Admin-Only' : 'Enable Admin-Only'}
                  </button>
                </div>

                {/* 3. Block Startup */}
                <div className="bg-[#1C1C1E] border border-[#2D2D30] rounded-xl p-3.5 transition-all hover:border-[#1E90FF]/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Ban className={`h-4 w-4 ${isStartupBlocked ? 'text-red-500' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold text-white truncate">Block Startup</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                      isStartupBlocked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {isStartupBlocked ? 'Blocked' : 'Allowed'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3 truncate">
                    Restrict {selectedRoom.startup?.full_name || 'Startup'} from messaging.
                  </p>
                  <button
                    type="button"
                    disabled={isUpdatingSettings}
                    onClick={() => handleUpdateSetting('is_startup_blocked', !isStartupBlocked)}
                    className={`w-full py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isStartupBlocked 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isStartupBlocked ? 'Unblock Startup' : 'Block Startup'}
                  </button>
                </div>

                {/* 4. Block Investor */}
                <div className="bg-[#1C1C1E] border border-[#2D2D30] rounded-xl p-3.5 transition-all hover:border-[#1E90FF]/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Ban className={`h-4 w-4 ${isInvestorBlocked ? 'text-red-500' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold text-white truncate">Block Investor</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                      isInvestorBlocked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {isInvestorBlocked ? 'Blocked' : 'Allowed'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3 truncate">
                    Restrict {selectedRoom.investor?.full_name || 'Investor'} from messaging.
                  </p>
                  <button
                    type="button"
                    disabled={isUpdatingSettings}
                    onClick={() => handleUpdateSetting('is_investor_blocked', !isInvestorBlocked)}
                    className={`w-full py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isInvestorBlocked 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isInvestorBlocked ? 'Unblock Investor' : 'Block Investor'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Modal: Create Chat Room */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#222222] rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#222222]">
              <h3 className="text-base font-semibold text-white">Create Common Area Room</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateRoom} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Room Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. HealthTech Match room"
                  value={roomForm.name} 
                  onChange={(e) => setRoomForm({...roomForm, name: e.target.value})} 
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#1E90FF]" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Investor</label>
                <select 
                  required
                  value={roomForm.investor_id}
                  onChange={(e) => setRoomForm({...roomForm, investor_id: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#1E90FF]"
                >
                  <option value="" disabled>Select an active investor...</option>
                  {investors.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Startup</label>
                <select 
                  required
                  value={roomForm.startup_id}
                  onChange={(e) => setRoomForm({...roomForm, startup_id: e.target.value})}
                  className="w-full bg-[#0F0F12] border border-[#222222] text-slate-300 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#1E90FF]"
                >
                  <option value="" disabled>Select an active startup...</option>
                  {startups.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.startups?.[0]?.company_name || u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#222222]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-[#1E90FF] text-white rounded-md hover:bg-[#1C86EE] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
