import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userData = req.body;

    // Validate required fields
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name
      },
      email_confirm: true // Auto-confirm email
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Insert into users table
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        username: userData.username,
        company: userData.company,
        role: userData.role,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        postal_code: userData.postal_code,
        country: userData.country,
        about_me: userData.about_me,
        website: userData.website,
        skills: userData.skills,
        avatar: userData.avatar
      }])
      .select()
      .single();

    if (userError) {
      console.error('User table error:', userError);
      // If user table insert fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: userError.message });
    }

    res.status(200).json({ user: userRecord });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 