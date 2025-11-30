// Assumindo que este caminho de importação resolveu o problema de estrutura:
import { supabase } from '../app/supabaseClient';
import { User, PlanType } from '../app/types';

// Convert Supabase DB profile to our App User type
// ✅ CORREÇÃO CRÍTICA AQUI: Mapeando os dados reais da compra
const mapProfileToUser = (profile: any, authId: string, email: string): User => {
  return {
    id: authId,
    name: profile.full_name || 'Usuário',
    email: email,
    plan: (profile.role as PlanType) || PlanType.INSTITUTIONAL,
    // 🟢 CORREÇÃO: Usando a data REAL do banco de dados (que o Webhook atualizou)
    planExpiry: profile.plan_expiry, 
    avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=0ea5e9&color=fff`,

    // ✅ NOVOS DADOS MAPEADOS: Estes campos são essenciais para mostrar o status na tela
    hosting: profile.hosting,
    domain: profile.domain,
    vipSupport: profile.vipSupport,
    paidTraffic: profile.paidTraffic,
    supportTicketsRemaining: profile.supportTicketsRemaining,
  };
};

export const loginWithEmail = async (email: string) => {
  // Magic Link Login
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Creates user if not exists
      data: {
        full_name: email.split('@')[0], // Default name
        avatar_url: '',
      }
    }
  });
  return { data, error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;

  // Fetch extra profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
        id, 
        full_name, 
        email, 
        avatar_url, 
        role,
        created_at,
        hosting,                
        domain,                 
        vipSupport,             
        paidTraffic,            
        plan_expiry,            
        supportTicketsRemaining 
        `) // ✅ Query que busca todos os dados necessários
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return mapProfileToUser(profile, session.user.id, session.user.email!);
};

export const logout = async () => {
  await supabase.auth.signOut();
};