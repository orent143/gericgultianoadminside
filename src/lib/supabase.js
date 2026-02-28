import { createClient } from '@supabase/supabase-js'

// Client-side Supabase instance — uses Vite env variables available at build time.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase