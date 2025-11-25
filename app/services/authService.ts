import { supabase } from '../supabaseClient';
import { User, PlanType } from '../types';

// Função auxiliar para transformar os dados do banco no Tipo User do nosso app
const mapProfileToUser = (profile: any, authId: string, email: string): User => {
  return {
    id: authId,
    name: profile.full_name || 'Usuário',
    email: email,
    plan: (profile.role as PlanType) || PlanType.INSTITUTIONAL,
    planExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), 
    avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=0ea5e9&color=fff`,
    
    // Novos campos de serviço (inicializados como false/null se não existirem)
    // Em um cenário real, estas colunas devem existir na tabela 'profiles' ou em tabelas relacionadas
    hosting: {
        active: profile.hosting_active || false,
        expiryDate: profile.hosting_expiry,
    },
    domain: {
        active: profile.domain_active || false,
        expiryDate: profile.domain_expiry,
    },
    vipSupport: {
        active: profile.vip_support_active || false,
        expiryDate: profile.vip_support_expiry,
    },
    // Se vipSupport.active for true, mostra ilimitado, senão mostra o saldo (default 3)
    supportTicketsRemaining: profile.vip_support_active ? 'unlimited' : (profile.support_balance || 3)
  };
};

export const loginWithEmail = async (email: string) => {
  // URL FIXADA DA VERCEL PARA PRODUÇÃO
  const redirectTo = 'https://webnova-seven.vercel.app';

  // Login via Magic Link (Email sem senha)
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo, 
      shouldCreateUser: true,
      data: {
        full_name: email.split('@')[0],
        avatar_url: '',
      }
    }
  });
  return { data, error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  // 1. Pega a sessão ativa
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;

  // 2. Busca os dados extras na tabela 'profiles'
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  return mapProfileToUser(profile, session.user.id, session.user.email!);
};

export const logout = async () => {
  await supabase.auth.signOut();
};