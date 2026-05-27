import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vmvftrdgvedwbhxfdibx.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdmZ0cmRndmVkd2JoeGZkaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTI3MzYsImV4cCI6MjA5NTQyODczNn0.Smkx3lRfz5PFCXncCeQZJslWcKdObIslfyA4w0ljHiM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
