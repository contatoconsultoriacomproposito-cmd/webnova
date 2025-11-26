import { supabase } from '../supabaseClient';
import { User, PlanType } from '../types';

// Função auxiliar para transformar os dados do banco no Tipo User do nosso app
const mapProfileToUser = (profile: any, authId: string, email: string): User => {
  return {
    id: authId,
    name: profile.full_name || 'Usuário',
    email: email,
    // CORREÇÃO (Problemas 1 e 2): Se o perfil não tiver role, OU se o role for
    // o valor padrão 'INSTITUCIONAL' (que ainda não foi pago), forçamos para NO_PLAN.
    plan: (!profile.role || profile.role === PlanType.INSTITUTIONAL) // Usei PlanType.INSTITUTIONAL, conforme types.ts
        ? PlanType.INSTITUTIONAL
        : (profile.role as PlanType),
    planExpiry: profile.plan_expiry, // Agora pode vir nulo
    avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=0ea5e9&color=fff`,
    
    // Novos campos de serviço (inicializados como false/null se não existirem)
    hosting: {
        active: profile.hosting_active || false,
        expiryDate: profile.hosting_expiry,
        planYears: profile.hosting_plan_years
    },
    domain: {
        active: profile.domain_active || false,
        expiryDate: profile.domain_expiry,
        domainName: profile.domain_name
    },
    vipSupport: {
        active: profile.vip_support_active || false,
        expiryDate: profile.vip_support_expiry,
    },
    supportTicketsRemaining: profile.vip_support_active ? 'unlimited' : (profile.support_balance || 3)
  };
};

export const loginWithGoogle = async () => {
    // Usa a origem atual do navegador (localhost ou vercel) dinamicamente
    let redirectTo = 'http://localhost:3000';
    if (typeof window !== 'undefined') {
      redirectTo = window.location.origin;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectTo,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });
    return { data, error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Erro ao buscar perfil:', error);
    // Fallback para usuário básico com NO_PLAN
    return {
        id: session.user.id,
        name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Usuário',
        email: session.user.email!,
        plan: PlanType.NO_PLAN,
        avatarUrl: session.user.user_metadata.avatar_url
    };
  }

  return mapProfileToUser(profile, session.user.id, session.user.email!);
};

export const logout = async () => {
  await supabase.auth.signOut();
};