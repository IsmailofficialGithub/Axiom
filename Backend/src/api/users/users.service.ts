import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';

export const onboardUser = async (userId: string, role: string, data: any) => {
  if (role === 'investor') {
    const { investment_min, investment_max, preferred_industries } = data;
    
    const { data: investorData, error } = await supabaseAdmin
      .from('investors')
      .insert({
        profile_id: userId,
        investment_min,
        investment_max,
        preferred_industries,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new ApiError(409, 'User is already onboarded as an investor');
      throw new ApiError(500, `Failed to onboard investor: ${error.message}`);
    }
    return investorData;
  }

  if (role === 'startup') {
    const { company_name, industry, description, website, stage } = data;

    const { data: startupData, error } = await supabaseAdmin
      .from('companies')
      .insert({
        profile_id: userId,
        company_name,
        industry,
        description,
        website,
        stage,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new ApiError(409, 'User is already onboarded as a startup');
      throw new ApiError(500, `Failed to onboard startup: ${error.message}`);
    }
    return startupData;
  }

  throw new ApiError(400, 'Invalid role for onboarding');
};

export const getUserProfile = async (userId: string, role: string) => {
  // Base profile query
  let query = supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: profile, error: profileError } = await query;
  
  if (profileError || !profile) {
    throw new ApiError(404, 'Profile not found');
  }

  let details = null;

  if (role === 'investor') {
    const { data } = await supabaseAdmin
      .from('investors')
      .select('*')
      .eq('profile_id', userId)
      .single();
    details = data;
  } else if (role === 'startup') {
    const { data } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('profile_id', userId)
      .single();
    details = data;
  }

  return {
    profile,
    details: details || null, // Null if they haven't onboarded yet
  };
};
