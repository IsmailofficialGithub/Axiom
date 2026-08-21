import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';

export const createOpportunity = async (userId: string, data: any) => {
  // 1. Fetch the user's company (startups must have onboarded to create deals)
  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .select('id, subsidiary_id')
    .eq('profile_id', userId)
    .single();

  if (companyError || !company) {
    throw new ApiError(403, 'You must complete startup onboarding before creating opportunities');
  }

  // 2. Insert the opportunity
  const { data: opportunity, error: oppError } = await supabaseAdmin
    .from('opportunities')
    .insert({
      ...data,
      company_id: company.id,
      subsidiary_id: company.subsidiary_id,
      created_by: userId,
    })
    .select()
    .single();

  if (oppError) {
    throw new ApiError(500, `Failed to create opportunity: ${oppError.message}`);
  }

  return opportunity;
};

export const listOpportunities = async (userRole: string, userId: string, filters: any = {}) => {
  let query = supabaseAdmin
    .from('opportunities')
    .select(`
      *, 
      companies (
        company_name, 
        industry, 
        profiles (
          startups (
            stage, 
            current_arr, 
            funding_sought
          )
        )
      )
    `);

  // Investors can only see published opportunities
  if (userRole === 'investor') {
    query = query.eq('status', 'published');
  } 
  // Startups can only see their own opportunities
  else if (userRole === 'startup') {
    query = query.eq('created_by', userId);
  }
  // Admins can see all, apply no role-based filter

  // Apply extra filters if provided (e.g. category)
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to fetch opportunities: ${error.message}`);
  }

  return data;
};

export const getOpportunityById = async (id: string, userRole: string, userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('opportunities')
    .select(`
      *,
      companies (
        *,
        profiles (
          *,
          startups (*)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Opportunity not found');
  }

  // Investors can only view if published
  if (userRole === 'investor' && data.status !== 'published') {
    throw new ApiError(403, 'This opportunity is not published');
  }
  // Startups can only view their own
  if (userRole === 'startup' && data.created_by !== userId) {
    throw new ApiError(403, 'You do not have permission to view this opportunity');
  }

  return data;
};

export const updateOpportunity = async (id: string, userId: string, userRole: string, data: any) => {
  // First ensure they own it (unless admin)
  if (userRole !== 'admin') {
    const { data: existing, error: existError } = await supabaseAdmin
      .from('opportunities')
      .select('created_by')
      .eq('id', id)
      .single();

    if (existError || !existing) throw new ApiError(404, 'Opportunity not found');
    if (existing.created_by !== userId) throw new ApiError(403, 'You can only update your own opportunities');
  }

  const { data: updated, error } = await supabaseAdmin
    .from('opportunities')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update opportunity: ${error.message}`);
  }

  return updated;
};
