"use client"

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { 
  MessageSquare, Plus, Send, Info, X, User, 
  Building2, Calendar, DollarSign, Activity, FileText 
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
                      className={`flex items-start space-x-3 max-w-xl ${isOwnMessage ? "ml-auto flex-row-reverse space-x-reverse" : ""}`}
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
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#141416] border-t border-[#222222] flex items-center space-x-2 flex-shrink-0">
              <input 
                type="text" 
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-[#0F0F12] border border-[#222222] rounded-md px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#1E90FF]"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
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
