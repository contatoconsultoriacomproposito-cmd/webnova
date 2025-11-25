import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from './constants';

// URL do seu projeto Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hticgfaflhxmbneswzvy.supabase.co';

// ATENÇÃO: Esta chave tem poder total sobre o banco de dados.
// Só deve ser usada no servidor (API Routes).
if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes('COLE_SUA')) {
    console.error("⚠️ ERRO CRÍTICO: Service Role Key não configurada em constants.ts. O Webhook não funcionará.");
}

export const supabaseAdmin = createClient(
  supabaseUrl, 
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
  }
);