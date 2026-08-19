const ApiError = require('../utils/ApiError');
const supabaseAdmin = require('../config/supabase.config');

// Supabase authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized: Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Verify token and get user from Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new ApiError(401, 'Unauthorized: Invalid token');
    }

    // Now that we have the authenticated user, fetch their profile to get their role.
    // Assuming you have a profiles table as per the Details.md roadmap.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new ApiError(401, 'Unauthorized: User profile not found');
    }

    if (profile.status === 'suspended') {
      throw new ApiError(403, 'Forbidden: Account is suspended');
    }

    // Attach user and profile to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      status: profile.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
