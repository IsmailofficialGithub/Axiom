-- ==========================================
-- Chat Moderation Schema Updates
-- ==========================================

ALTER TABLE chat_rooms
ADD COLUMN status TEXT DEFAULT 'active', -- 'active' or 'paused'
ADD COLUMN admin_only BOOLEAN DEFAULT false,
ADD COLUMN is_startup_blocked BOOLEAN DEFAULT false,
ADD COLUMN is_investor_blocked BOOLEAN DEFAULT false;
