import { createClient } from '@supabase/supabase-js'
import { env } from './config/env-validator'

// Use validated environment configuration
const { url: supabaseUrl, anonKey: supabaseAnonKey } = env.supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
