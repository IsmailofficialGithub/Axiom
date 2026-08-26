import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';

export const createChatRoom = async (name: string, adminId: string, investorId: string, startupId: string) => {
  // 1. Validate Investor profile
  const { data: investorProfile, error: invError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', investorId)
    .single();

  if (invError || !investorProfile || investorProfile.role !== 'investor') {
    throw new ApiError(400, 'Selected user is not a valid investor');
  }

  // 2. Validate Startup profile
  const { data: startupProfile, error: startupError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', startupId)
    .single();

  if (startupError || !startupProfile || startupProfile.role !== 'startup') {
    throw new ApiError(400, 'Selected user is not a valid startup');
  }

  // 3. Create room
  const { data: room, error: roomError } = await supabaseAdmin
    .from('chat_rooms')
    .insert({
      name,
      admin_id: adminId,
      investor_id: investorId,
      startup_id: startupId
    })
    .select()
    .single();

  if (roomError) {
    throw new ApiError(500, `Failed to create chat room: ${roomError.message}`);
  }

  return room;
};

export const listChatRoomsForUser = async (userId: string, role: string) => {
  let query = supabaseAdmin.from('chat_rooms').select('*');

  if (role === 'investor') {
    query = query.eq('investor_id', userId);
  } else if (role === 'startup') {
    query = query.eq('startup_id', userId);
  } else if (role !== 'admin') {
    throw new ApiError(403, 'Unauthorized role for accessing chat rooms');
  }

  const { data: rooms, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to list chat rooms: ${error.message}`);
  }

  if (!rooms || rooms.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(rooms.flatMap(r => [r.admin_id, r.investor_id, r.startup_id])));
  
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, status')
    .in('id', userIds);

  const { data: companies } = await supabaseAdmin
    .from('companies')
    .select('*')
    .in('profile_id', userIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
  const companyMap = new Map(companies?.map(c => [c.profile_id, c]) || []);

  const authUsersMap = new Map();
  try {
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (!authError && authUsers) {
      authUsers.forEach(u => authUsersMap.set(u.id, u.email));
    }
  } catch (err) {
    console.error("Failed to fetch auth users for chat", err);
  }

  return rooms.map(room => {
    const admin = profileMap.get(room.admin_id);
    const investor = profileMap.get(room.investor_id);
    const startup = profileMap.get(room.startup_id);
    const company = companyMap.get(room.startup_id);

    return {
      ...room,
      admin: admin ? { ...admin, email: authUsersMap.get(room.admin_id) || null } : null,
      investor: investor ? { ...investor, email: authUsersMap.get(room.investor_id) || null } : null,
      startup: startup ? { 
        ...startup, 
        email: authUsersMap.get(room.startup_id) || null,
        company
      } : null
    };
  });
};

export const getChatRoomById = async (id: string, userId: string, role: string) => {
  const { data: room, error } = await supabaseAdmin
    .from('chat_rooms')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !room) {
    throw new ApiError(404, 'Chat room not found');
  }

  // Authorization check
  const isParticipant = room.admin_id === userId || room.investor_id === userId || room.startup_id === userId;
  if (!isParticipant && role !== 'admin') {
    throw new ApiError(403, 'You are not a participant of this chat room');
  }

  // Fetch participant profiles
  const participantIds = [room.admin_id, room.investor_id, room.startup_id];
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, status')
    .in('id', participantIds);

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('profile_id', room.startup_id)
    .maybeSingle();

  const { data: startupDetail } = await supabaseAdmin
    .from('startups')
    .select('*')
    .eq('id', room.startup_id)
    .maybeSingle();

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  const authUsersMap = new Map();
  try {
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (!authError && authUsers) {
      authUsers.forEach(u => authUsersMap.set(u.id, u.email));
    }
  } catch (err) {
    console.error("Failed to fetch auth users for chat", err);
  }

  const admin = profileMap.get(room.admin_id);
  const investor = profileMap.get(room.investor_id);
  const startup = profileMap.get(room.startup_id);

  return {
    ...room,
    admin: admin ? { ...admin, email: authUsersMap.get(room.admin_id) || null } : null,
    investor: investor ? { ...investor, email: authUsersMap.get(room.investor_id) || null } : null,
    startup: startup ? { 
      ...startup, 
      email: authUsersMap.get(room.startup_id) || null,
      company: company ? {
        ...company,
        startups: startupDetail ? [startupDetail] : []
      } : null
    } : null
  };
};

export const deleteChatRoom = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('chat_rooms')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, `Failed to delete chat room: ${error.message}`);
  }

  return { success: true };
};

export const listMessages = async (roomId: string, userId: string, role: string) => {
  // Check authorization
  await getChatRoomById(roomId, userId, role);

  const { data: messages, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new ApiError(500, `Failed to fetch messages: ${error.message}`);
  }

  return messages;
};

export const postMessage = async (roomId: string, senderId: string, role: string, message: string) => {
  // Check authorization and get room settings
  const room = await getChatRoomById(roomId, senderId, role);

  // Apply moderation rules
  if (room.status === 'paused' && role !== 'admin') {
    throw new ApiError(403, 'This conversation is temporarily paused');
  }

  if (room.admin_only && role !== 'admin') {
    throw new ApiError(403, 'This chat is in admin-only mode');
  }

  if (room.is_startup_blocked && role === 'startup') {
    throw new ApiError(403, 'You have been temporarily blocked from messaging in this chat');
  }

  if (room.is_investor_blocked && role === 'investor') {
    throw new ApiError(403, 'You have been temporarily blocked from messaging in this chat');
  }

  const { data: msg, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      message
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to send message: ${error.message}`);
  }

  return msg;
};

export const updateChatSettings = async (roomId: string, adminId: string, settings: any) => {
  // First verify room exists and user is the admin of it
  const { data: room, error: fetchError } = await supabaseAdmin
    .from('chat_rooms')
    .select('admin_id')
    .eq('id', roomId)
    .single();

  if (fetchError || !room) {
    throw new ApiError(404, 'Chat room not found');
  }

  if (room.admin_id !== adminId) {
    // Only the assigned admin can update settings for their chat room
    throw new ApiError(403, 'Only the admin of this room can update its settings');
  }

  const { data: updatedRoom, error } = await supabaseAdmin
    .from('chat_rooms')
    .update(settings)
    .eq('id', roomId)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update chat settings: ${error.message}`);
  }

  return updatedRoom;
};

export const deleteChatMessage = async (messageId: string) => {
  const { error } = await supabaseAdmin
    .from('chat_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    throw new ApiError(500, `Failed to delete chat message: ${error.message}`);
  }

  return { success: true };
};

