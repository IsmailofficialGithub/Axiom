import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';
export const onboardUser = async (userId, role, data) => {
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
            if (error.code === '23505')
                throw new ApiError(409, 'User is already onboarded as an investor');
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
            if (error.code === '23505')
                throw new ApiError(409, 'User is already onboarded as a startup');
            throw new ApiError(500, `Failed to onboard startup: ${error.message}`);
        }
        return startupData;
    }
    throw new ApiError(400, 'Invalid role for onboarding');
};
export const getUserProfile = async (userId, role) => {
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
    }
    else if (role === 'startup') {
        const { data } = await supabaseAdmin
            .from('startups')
            .select('*')
            .eq('id', userId)
            .single();
        details = data;
    }
    return {
        profile,
        details: details || null, // Null if they haven't onboarded yet
    };
};
export const updateUserProfileDetails = async (userId, role, data) => {
    if (role === 'investor') {
        const { investment_min, investment_max, preferred_industries } = data;
        const { data: existing } = await supabaseAdmin
            .from('investors')
            .select('*')
            .eq('profile_id', userId)
            .maybeSingle();
        const investorFields = {
            investment_min: investment_min !== undefined && investment_min !== "" ? Number(investment_min) : null,
            investment_max: investment_max !== undefined && investment_max !== "" ? Number(investment_max) : null,
            preferred_industries: preferred_industries || [],
        };
        if (!existing) {
            const { data: newInvestor, error: insertError } = await supabaseAdmin
                .from('investors')
                .insert({
                profile_id: userId,
                ...investorFields
            })
                .select()
                .single();
            if (insertError)
                throw new ApiError(500, `Failed to initialize investor preferences: ${insertError.message}`);
            return newInvestor;
        }
        const { data: updatedInvestor, error: updateError } = await supabaseAdmin
            .from('investors')
            .update(investorFields)
            .eq('profile_id', userId)
            .select()
            .single();
        if (updateError)
            throw new ApiError(500, `Failed to update investor preferences: ${updateError.message}`);
        return updatedInvestor;
    }
    if (role === 'startup') {
        const { industry, stage, current_arr, last_year_revenue, revenue_model, funding_sought, primary_use_of_funds, previous_funding, custom_qa, description } = data;
        const { data: existing } = await supabaseAdmin
            .from('startups')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        const startupFields = {
            industry,
            stage,
            current_arr: current_arr !== undefined && current_arr !== "" ? Number(current_arr) : null,
            last_year_revenue: last_year_revenue !== undefined && last_year_revenue !== "" ? Number(last_year_revenue) : null,
            revenue_model,
            funding_sought: funding_sought !== undefined && funding_sought !== "" ? Number(funding_sought) : null,
            primary_use_of_funds,
            previous_funding: previous_funding !== undefined && previous_funding !== "" ? Number(previous_funding) : null,
            custom_qa,
            description
        };
        if (!existing) {
            const { data: newStartup, error: insertError } = await supabaseAdmin
                .from('startups')
                .insert({
                id: userId,
                ...startupFields
            })
                .select()
                .single();
            if (insertError)
                throw new ApiError(500, `Failed to initialize startup profile: ${insertError.message}`);
            return newStartup;
        }
        const { data: updatedStartup, error: updateError } = await supabaseAdmin
            .from('startups')
            .update(startupFields)
            .eq('id', userId)
            .select()
            .single();
        if (updateError)
            throw new ApiError(500, `Failed to update startup profile: ${updateError.message}`);
        // Sync to companies table so opportunities work correctly
        const { data: existingCompany } = await supabaseAdmin
            .from('companies')
            .select('id')
            .eq('profile_id', userId)
            .maybeSingle();
        const { data: profileData } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .maybeSingle();
        const companyFields = {
            company_name: profileData?.full_name || 'Startup Company',
            industry,
            stage,
            description
        };
        if (!existingCompany) {
            await supabaseAdmin
                .from('companies')
                .insert({
                profile_id: userId,
                ...companyFields
            });
        }
        else {
            await supabaseAdmin
                .from('companies')
                .update(companyFields)
                .eq('profile_id', userId);
        }
        return updatedStartup;
    }
    throw new ApiError(400, 'Invalid role for updating profile details');
};
