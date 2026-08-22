import { User as SupabaseUser } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: 'admin' | 'investor' | 'startup';
        status: 'active' | 'suspended' | 'pending';
      };
    }
  }
}
