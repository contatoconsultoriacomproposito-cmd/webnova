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
    avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=0ea5e9&color=fff`
  };
};

export const loginWithEmail = async (email: string) => {
  // Lógica de Redirecionamento Fixada (Hardcoded)
  // Isso garante que em produção sempre vá para a URL da Vercel, sem depender de variáveis de ambiente instáveis
  const PRODUCTION_URL = 'https://webnova-seven.vercel.app';
  let redirectTo = 'http://localhost:3000';

  // Se estiver rodando no navegador (Client Side)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Se NÃO for localhost, usa a URL de produção
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        redirectTo = PRODUCTION_URL;
    }
  }

  // Remove barra final se existir para evitar URLs duplas
  redirectTo = redirectTo.replace(/\/$/, '');

  // Login via Magic Link (Email sem senha)
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo, // Agora aponta explicitamente para https://webnova-seven.vercel.app em produção
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
    // Se tiver sessão mas não tiver perfil (erro raro), retorna null
    return null;
  }

  return mapProfileToUser(profile, session.user.id, session.user.email!);
};

export const logout = async () => {
  await supabase.auth.signOut();
};