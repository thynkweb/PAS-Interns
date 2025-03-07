import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Test the connection and policies
export async function testSupabaseConnection() {
  try {
    // Test auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    // Test basic queries
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    if (usersError) throw usersError;

    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

// Add better error handling
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error.message?.includes('JWTExpired')) {
    supabase.auth.signOut();
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }

  if (error.message?.includes('not found')) {
    return 'Resource not found';
  }

  if (error.message?.includes('permission denied')) {
    return 'Permission denied. Please check your access rights.';
  }

  return 'An error occurred. Please try again.';
}