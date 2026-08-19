import supabaseAdmin from '../../config/supabase.config.js';
import ApiError from '../../utils/ApiError.js';

export const registerUser = async (data: any) => {
  const { email, password, full_name, phone, role } = data;

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new ApiError(409, 'User with this email already exists');
    }
    throw new ApiError(400, authError.message);
  }

  const userId = authData.user.id;

  // 2. Insert into profiles table
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      role,
      full_name,
      phone,
      status: 'pending', // Institutional accounts require vetting before activation
    });

  if (profileError) {
    // Rollback auth user creation if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new ApiError(500, `Failed to create profile: ${profileError.message}`);
  }

  // 3. Insert into startups table if role is startup
  if (role === 'startup' && data.startup_profile) {
    const { error: startupError } = await supabaseAdmin
      .from('startups')
      .insert({
        id: userId,
        ...data.startup_profile
      });

    if (startupError) {
      // Rollback auth user and profile if startup creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new ApiError(500, `Failed to create startup profile: ${startupError.message}`);
    }
  }

  return {
    user: {
      id: userId,
      email,
      role,
      full_name,
    },
    message: 'User registered successfully. Proceed to login.',
  };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  // 1. Attempt login via Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const userId = authData.user.id;

  // 2. Fetch the user's profile to get their role and status
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, status, full_name')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new ApiError(404, 'User profile not found');
  }

  if (profile.status === 'pending') {
    throw new ApiError(403, 'Your account is pending review by the admin team.');
  }

  if (profile.status === 'suspended') {
    throw new ApiError(403, 'Account is suspended');
  }

  return {
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token,
    user: {
      id: userId,
      email: authData.user.email,
      role: profile.role,
      full_name: profile.full_name,
      status: profile.status,
    },
  };
};
