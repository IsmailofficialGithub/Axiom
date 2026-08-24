import supabaseAdmin, { supabaseAuth } from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';

export const listAllUsers = async () => {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*, startups(*), investors(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to fetch users: ${error.message}`);
  }

  try {
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (!authError && authUsers) {
      const emailMap = new Map(authUsers.map(u => [u.id, u.email]));
      return profiles.map(profile => ({
        ...profile,
        email: emailMap.get(profile.id) || null
      }));
    }
  } catch (err) {
    console.error("Failed to fetch auth emails", err);
  }

  return profiles;
};

export const getUserById = async (id: string) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*, startups(*), investors(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new ApiError(500, `Failed to fetch user: ${error.message}`);
  }

  try {
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (!authError && authUser) {
      return {
        ...profile,
        email: authUser.email
      };
    }
  } catch (err) {
    console.error("Failed to fetch auth user email", err);
  }

  return profile;
};

export const impersonateUser = async (id: string) => {
  // 1. Fetch target user profile (with merged email)
  const profile = await getUserById(id);
  if (!profile) {
    throw new ApiError(404, 'User profile not found');
  }

  if (profile.status === 'suspended') {
    throw new ApiError(403, 'Cannot impersonate a suspended user');
  }

  if (!profile.email) {
    throw new ApiError(400, 'User email not found in authentication system');
  }

  // 2. Generate a magiclink as admin
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: profile.email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new ApiError(500, `Failed to generate login link: ${linkError?.message || 'Token not found'}`);
  }

  // 3. Verify OTP using the hashed token to get a session
  const { data: verifyData, error: verifyError } = await supabaseAuth.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  });

  if (verifyError || !verifyData.session || !verifyData.user) {
    throw new ApiError(500, `Failed to establish session: ${verifyError?.message || 'Session not established'}`);
  }

  return {
    access_token: verifyData.session.access_token,
    refresh_token: verifyData.session.refresh_token,
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      status: profile.status,
    },
  };
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

  // Provision in companies and opportunities tables if activating a startup
  if (updates.status === 'active' && data.role === 'startup') {
    const { data: startupData } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    let { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('profile_id', id)
      .maybeSingle();

    if (!existingCompany) {
      const { data: newCompany, error: insertErr } = await supabaseAdmin
        .from('companies')
        .insert({
          profile_id: id,
          company_name: data.full_name || 'Startup Company',
          industry: startupData?.industry || null,
          stage: startupData?.stage || null,
          description: 'Axiomra registered startup portfolio company.'
        })
        .select()
        .single();

      if (!insertErr && newCompany) {
        existingCompany = newCompany;
      }
    }

    const companyId = existingCompany?.id;
    if (companyId) {
      const { data: existingOpp } = await supabaseAdmin
        .from('opportunities')
        .select('id')
        .eq('company_id', companyId)
        .maybeSingle();

      if (!existingOpp) {
        await supabaseAdmin
          .from('opportunities')
          .insert({
            company_id: companyId,
            title: `${data.full_name || 'Startup'} Capital Placement`,
            category: startupData?.industry || 'SaaS',
            description: 'Live capital placement opportunity on Axiomra.',
            expected_revenue: startupData?.funding_sought || 0,
            stage: startupData?.stage || 'Seed',
            status: 'published', // Auto-publish to make it immediately viewable in the marketplace!
            created_by: id // Assign the startup user's ID
          });
      }
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
