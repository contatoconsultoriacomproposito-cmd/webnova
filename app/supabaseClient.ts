import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hticgfaflhxmbneswzvy.supabase.co';

// Chave Pública (Anon Key) - Agora configurada corretamente
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_MmmWdWPD2kBmeBd6xlUU0w_qygLE-Jh';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ AVISO: As credenciais do Supabase parecem estar incompletas. Verifique o arquivo supabaseClient.ts'
  );
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);