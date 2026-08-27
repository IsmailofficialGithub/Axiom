import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';
import { anonymizeText } from '../opportunities/opportunities.service.js';
// Helper to verify a user owns an opportunity
const verifyOpportunityOwnership = async (userId, userRole, opportunityId) => {
    if (userRole === 'admin')
        return true;
    const { data, error } = await supabaseAdmin
        .from('opportunities')
        .select('created_by')
        .eq('id', opportunityId)
        .single();
    if (error || !data)
        throw new ApiError(404, 'Opportunity not found');
    if (data.created_by !== userId)
        throw new ApiError(403, 'You do not have permission to manage this deal room');
    return true;
};
export const addDocument = async (userId, userRole, opportunityId, data) => {
    await verifyOpportunityOwnership(userId, userRole, opportunityId);
    const { data: document, error } = await supabaseAdmin
        .from('deal_room_documents')
        .insert({
        opportunity_id: opportunityId,
        file_url: data.file_url,
        file_type: data.file_type,
        visibility: data.visibility,
    })
        .select()
        .single();
    if (error) {
        throw new ApiError(500, `Failed to add document: ${error.message}`);
    }
    return document;
};
export const listDocuments = async (opportunityId, userRole, userId) => {
    // If Startup or Admin, just fetch all documents for this opportunity
    if (userRole === 'startup' || userRole === 'admin') {
        // Note: We could verify ownership for startups here as well, 
        // but the DB handles viewing logic. Still, let's enforce ownership for startups.
        if (userRole === 'startup')
            await verifyOpportunityOwnership(userId, userRole, opportunityId);
        const { data, error } = await supabaseAdmin
            .from('deal_room_documents')
            .select('*')
            .eq('opportunity_id', opportunityId);
        if (error)
            throw new ApiError(500, 'Failed to list documents');
        return data;
    }
    // If Investor, complex check:
    // 1. Fetch public documents
    // 2. Fetch granted_only documents IF they have a permission row
    if (userRole === 'investor') {
        // First, verify the opportunity is published (investors shouldn't see draft deal rooms)
        const { data: opp, error: oppErr } = await supabaseAdmin
            .from('opportunities')
            .select('status')
            .eq('id', opportunityId)
            .single();
        if (oppErr || !opp || opp.status !== 'published') {
            throw new ApiError(403, 'Opportunity is not published');
        }
        // Check if investor has explicit permission
        const { data: permission } = await supabaseAdmin
            .from('deal_room_permissions')
            .select('id')
            .eq('opportunity_id', opportunityId)
            .eq('investor_id', userId)
            .single();
        let query = supabaseAdmin
            .from('deal_room_documents')
            .select('*')
            .eq('opportunity_id', opportunityId);
        if (permission) {
            // Investor has access: show public AND granted_only
            query = query.in('visibility', ['public', 'granted_only']);
        }
        else {
            // No explicit access: show only public
            query = query.eq('visibility', 'public');
        }
        const { data, error } = await query;
        if (error)
            throw new ApiError(500, 'Failed to list documents');
        if (data && data.length > 0) {
            const { data: oppCompany } = await supabaseAdmin
                .from('opportunities')
                .select('company_id, companies (company_name, id)')
                .eq('id', opportunityId)
                .single();
            if (oppCompany?.companies) {
                const realName = oppCompany.companies.company_name;
                const anonName = `Startup #${oppCompany.companies.id.substring(0, 8)}`;
                data.forEach((doc) => {
                    doc.file_type = anonymizeText(doc.file_type, realName, anonName);
                });
            }
        }
        return data;
    }
    throw new ApiError(403, 'Unauthorized access to deal room');
};
export const grantAccess = async (userId, userRole, opportunityId, investorId) => {
    await verifyOpportunityOwnership(userId, userRole, opportunityId);
    const { data, error } = await supabaseAdmin
        .from('deal_room_permissions')
        .insert({
        opportunity_id: opportunityId,
        investor_id: investorId,
        granted_by: userId,
    })
        .select()
        .single();
    if (error) {
        if (error.code === '23505')
            throw new ApiError(409, 'Investor already has access');
        throw new ApiError(500, `Failed to grant access: ${error.message}`);
    }
    return data;
};
export const listActiveInvestors = async () => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, phone')
        .eq('role', 'investor')
        .eq('status', 'active');
    if (error) {
        throw new ApiError(500, `Failed to fetch active investors: ${error.message}`);
    }
    return data;
};
