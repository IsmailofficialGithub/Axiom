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
