
import type { SupabaseClient } from '@supabase/supabase-js';

// In demo mode, the Supabase client is explicitly set to null.
// The application's services are designed to fall back to mock data when the client is null.
export const supabase: SupabaseClient | null = null;
