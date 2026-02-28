import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin.from('users').select('*')
  res.status(200).json({ data, error })
}