import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';

export const listAllUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, startups(*), investors(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to fetch users: ${error.message}`);
  }

  return data;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, startups(*), investors(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new ApiError(500, `Failed to fetch user: ${error.message}`);
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

export const updateSubsidiary = async (id: string, updates: any) => {
  const { data, error } = await supabaseAdmin
    .from('subsidiaries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update subsidiary: ${error.message}`);
  }

  return data;
};

export const deleteSubsidiary = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('subsidiaries')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, `Failed to delete subsidiary: ${error.message}`);
  }

  return { success: true };
};

export const createUser = async (data: any) => {
  // 1. Create auth user (which cascades into public.profiles via trigger)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: data.role,
    }
  });

  if (authError || !authData.user) {
    throw new ApiError(500, `Failed to create user: ${authError?.message}`);
  }

  // 2. The trigger creates the profile, but we want to immediately update the status and role if it defaults differently
  await supabaseAdmin
    .from('profiles')
    .update({ status: data.status, role: data.role })
    .eq('id', authData.user.id);

  // 3. If role is startup, insert startup specifics
  if (data.role === 'startup') {
    const { error: startupError } = await supabaseAdmin
      .from('companies')
      .insert({
        profile_id: authData.user.id,
        company_name: data.full_name, // Fallback company name
        industry: data.industry,
      });

    if (startupError) {
      // If startup creation fails, we don't rollback the auth user in this simple setup,
      // but we throw an error so the admin knows.
      throw new ApiError(500, `User created, but failed to create company profile: ${startupError.message}`);
    }
  }

  return authData.user;
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

  // Provision in companies table if activating a startup
  if (updates.status === 'active' && data.role === 'startup') {
    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('profile_id', id)
      .maybeSingle();

    if (!existingCompany) {
      const { data: startupData } = await supabaseAdmin
        .from('startups')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      await supabaseAdmin
        .from('companies')
        .insert({
          profile_id: id,
          company_name: data.full_name || 'Startup Company',
          industry: startupData?.industry || null,
          stage: startupData?.stage || null,
          description: startupData?.description || null
        });
    }
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

export const listOpportunities = async () => {
  const { data, error } = await supabaseAdmin
    .from('opportunities')
    .select(`*, companies(company_name), subsidiaries(name)`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to fetch opportunities: ${error.message}`);
  }

  return data;
};

export const createOpportunity = async (data: any, createdBy: string) => {
  const { data: opp, error } = await supabaseAdmin
    .from('opportunities')
    .insert({ ...data, created_by: createdBy })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to create opportunity: ${error.message}`);
  }

  return opp;
};

export const updateOpportunity = async (id: string, updates: any) => {
  const { data, error } = await supabaseAdmin
    .from('opportunities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update opportunity: ${error.message}`);
  }

  return data;
};

export const deleteOpportunity = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('opportunities')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, `Failed to delete opportunity: ${error.message}`);
  }

  return { success: true };
};

export const getAdminStats = async () => {
  const [usersCount, subsCount, oppsCount, pendingCount] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subsidiaries').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('opportunities').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  return {
    totalUsers: usersCount.count || 0,
    totalSubsidiaries: subsCount.count || 0,
    totalOpportunities: oppsCount.count || 0,
    pendingInvites: pendingCount.count || 0
  };
};
