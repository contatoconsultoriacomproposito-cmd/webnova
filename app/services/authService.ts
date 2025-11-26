import { supabase } from '../supabaseClient';
import { User, PlanType } from '../types';

// Função auxiliar para transformar os dados do banco no Tipo User do nosso app
const mapProfileToUser = (profile: any, authId: string, email: string): User => {
  
  // 1. TRADUÇÃO DO PLANO (A CORREÇÃO PRINCIPAL)
  // Se o banco retornar NULL (usuário novo), o App entende como NO_PLAN.
  // Se retornar uma string (ex: 'INSTITUTIONAL'), usamos ela.
  const roleFromDb = profile.role;
  const finalPlan = roleFromDb ? (roleFromDb as PlanType) : PlanType.NO_PLAN;

  return {
    id: authId,
    name: profile.full_name || 'Usuário',
    email: email,
    plan: finalPlan,
    planExpiry: profile.plan_expiry, // Pode vir nulo, sem problemas
    avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=0ea5e9&color=fff`,
    
    // Inicializa objetos opcionais com false/null para evitar erros de "undefined" no Dashboard
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
    // Se for VIP, ilimitado. Se não, usa o saldo do banco (padrão 3)
    supportTicketsRemaining: profile.vip_support_active ? 'unlimited' : (profile.support_balance !== undefined ? profile.support_balance : 3)
  };
};

export const loginWithGoogle = async () => {
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
    console.error('Erro ao buscar perfil ou perfil inexistente:', error);
    // Fallback de segurança: Retorna usuário básico com NO_PLAN
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