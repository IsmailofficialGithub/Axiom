import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';

export const listAllUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to fetch users: ${error.message}`);
  }

  return data;
};

export const listSubsidiaries = async () => {
  const { data, error } = await supabaseAdmin
    .from('subsidiaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to fetch subsidiaries: ${error.message}`);
  }

  return data;
};

export const createSubsidiary = async (data: any) => {
  const { data: subsidiary, error } = await supabaseAdmin
    .from('subsidiaries')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to create subsidiary: ${error.message}`);
  }

  return subsidiary;
};

export const updateUser = async (id: string, updates: any) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update user: ${error.message}`);
  }

  return data;
};

export const deleteUser = async (id: string) => {
  // Deleting from Auth cascades to public.profiles via foreign key constraint
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    throw new ApiError(500, `Failed to delete user: ${error.message}`);
  }

  return { success: true };
};

export const updateUserPassword = async (id: string, password: string) => {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, { password });

  if (error) {
    throw new ApiError(500, `Failed to update password: ${error.message}`);
  }

  return data.user;
};
